import moment from 'moment-timezone';
import { ChasesMapper } from './adaptor/mappers/chase-mapper';
import { OpenSearchClientService } from '../../../services/opensearch-client-service';
import { OpenSearchQueryBuilder } from '../../../helper/opensearch-query-builder';
import { GroupByFieldEnum } from '../../../helper/groupByField-enum';


export class GetGroupedOrdersAction {
    private clientService: OpenSearchClientService;
    private queryBuilder: OpenSearchQueryBuilder;

    constructor(clientService: OpenSearchClientService, queryBuilder: OpenSearchQueryBuilder) {
        this.clientService = clientService;
        this.queryBuilder = queryBuilder;
    }

    async execute(
        pointer: string,
        limit: string,
        age: string,
        workOrderId?: string,
        memberId?: string,
        firstName?: string,
        lastName?: string,
        bulkOrderId?: string,
        projectId?: string,
        projectName?: string,
        tenantId?: string,
        resourceType?: string,
        groupByField?: string,
        chaseId?: string,
    ): Promise<{ response: object; pointer: number; count?: number; total?: number }> {
        try {
            this.setQueryFilters(workOrderId, memberId, firstName, lastName, bulkOrderId, projectId, projectName, tenantId, resourceType, chaseId);

            const pageNumber = Number(pointer);
            const days = Number(age);
            const limitNumber = Number(limit);

            if (!groupByField) {
                /**
                 * NOT IDEAL PAGINATION -> pageNumber * limitNumber RETURNS all the data which may hit the JSON limit response of an API
                 * IDEAL PAGINATION -> (pageNumber - 1) * limitNumber
                 */
                this.queryBuilder.setSize(limitNumber).setFrom((pageNumber - 1) * limitNumber);
                if (days !== 0) {
                    const dateThreshold = moment().subtract(days, 'days').toISOString();
                    this.queryBuilder.addFilterRange('createDateTime', dateThreshold);
                }
            } else {
                this.queryBuilder.setAggregation(groupByField, limitNumber, pageNumber);
            }

            const query = this.queryBuilder.build();
            console.log('Constructed Search Query:', JSON.stringify(query, null, 2));

            const response = await this.clientService.getClient().search({
                index: this.clientService.getIndex(),
                body: query,
            });

            if (groupByField && response.body.aggregations) {
                return this.handleGroupedResponse(response, groupByField, pageNumber);
            } else {
                return this.handleUngroupedResponse(response, pageNumber);
            }
        } catch (error) {
            throw new Error(`Error querying OpenSearch: ${error}`);
        }
    }

    private setQueryFilters(
        workOrderId?: string,
        memberId?: string,
        firstName?: string,
        lastName?: string,
        bulkOrderId?: string,
        projectId?: string,
        projectName?: string,
        tenantId?: string,
        resourceType?: string,
        chaseId?: string,
    ): void {
        if (workOrderId) this.queryBuilder.addMustTerm('_id', workOrderId);
        if (bulkOrderId) this.queryBuilder.addMustMatch('bulkOrderId', bulkOrderId);
        if (projectId) this.queryBuilder.addMustMatch('projectId', projectId);
        if (tenantId) this.queryBuilder.addMustMatch('tenantId', tenantId);
        if (chaseId) this.queryBuilder.addMustTerm('id', chaseId);
        if (projectName) this.queryBuilder.addFilterMatch('projectName', projectName);
        if (resourceType) this.queryBuilder.addFilterMatch('type', resourceType);
        if (firstName) this.queryBuilder.addFilterMatch('patient.firstName', firstName);
        if (lastName) this.queryBuilder.addFilterMatch('patient.lastName', lastName);
        if (memberId) this.queryBuilder.addFilterMatch('patient.memberId', memberId);
    }

    private handleGroupedResponse(response: any, groupByField: string, pageNumber: number): { response: object; pointer: number; count: number; total: number } {
        let allBuckets: any[] = [];

        if (groupByField === GroupByFieldEnum.PROVIDER) {
            allBuckets = this.mapProviderBuckets(response.body.aggregations.group_by_provider?.buckets || []);
        } else if (groupByField === GroupByFieldEnum.PROJECT) {
            allBuckets = this.mapProjectBuckets(response.body.aggregations.group_by_project?.buckets || []);
        } else if (groupByField === GroupByFieldEnum.TIN) {
            allBuckets = this.mapTinBuckets(response.body.aggregations.group_by_tin?.buckets || []);
        }

        return {
            response: allBuckets,
            pointer: pageNumber,
            count: allBuckets.length,
            total: response.body.hits.total.value,
        };
    }

    private handleUngroupedResponse(response: any, pageNumber: number): { response: object; pointer: number; count: number; total: number } {
        const body = response.body.hits;
        const data = body.hits.map((hit: any) => hit._source);
        const mappedResponse = ChasesMapper.mapArray(data);
        console.log(mappedResponse);
        return {
            response: mappedResponse,
            pointer: pageNumber,
            count: body.hits.length,
            total: body.total.value,
        };
    }

    private mapProviderBuckets(buckets: any[]): any[] {
        return buckets.map((bucket: { key: string; doc_count: number; top_hits: any }) => {
            const source = bucket.top_hits.hits.hits[0]._source;
            const identifiers = source.identifiers;
            const doctorIdObject = identifiers.find((identifier: { type: string }) => identifier.type === 'doctorId');
            const doctorId = doctorIdObject ? doctorIdObject.value : null;
            const tin = source.practitioner?.tin ?? source.originalPractitioner?.tin ?? '';
            const orgUnitName = source.orgUnitName ?? '';
            const projectName = source.projectName ?? '';
            const projectId = source.projectId ?? '';

            const providerNameRegex = /\[(.*?)\](.*)/;
            const match = providerNameRegex.exec(bucket.key);
            const providerName = match ? match[1] : bucket.key;
            const providerId = match ? match[2] : null;

            return {
                tin,
                doctorId,
                facility: providerName,
                providerId,
                providerName,
                orgUnitName,
                projectId,
                projectName,
                docCount: bucket.doc_count,
            };
        });
    }

    private mapProjectBuckets(buckets: any[]): any[] {
        return buckets.map((bucket: { key: string; doc_count: number; top_hits: any }) => {
            const source = bucket.top_hits.hits.hits[0]._source;
            const identifiers = source.identifiers;
            const doctorIdObject = identifiers.find((identifier: { type: string }) => identifier.type === 'doctorId');
            const doctorId = doctorIdObject ? doctorIdObject.value : null;
            const tin = source.practitioner?.tin ?? source.originalPractitioner?.tin ?? '';
            const provider = source.providerProfile;
            const orgUnitName = source.orgUnitName ?? '';
            const projectId = source.projectId ?? '';

            return {
                tin,
                doctorId,
                facility: provider.name,
                providerId: provider.id,
                providerName: provider.name,
                projectId,
                projectName: bucket.key,
                orgUnitName,
                docCount: bucket.doc_count,
            };
        });
    }

    private mapTinBuckets(buckets: any[]): any[] {
        return buckets.map((bucket: { key: string; doc_count: number; top_hits: any }) => {
            const source = bucket.top_hits.hits.hits[0]._source;
            const identifiers = source.identifiers;
            const doctorIdObject = identifiers.find((identifier: { type: string }) => identifier.type === 'doctorId');
            const doctorId = doctorIdObject ? doctorIdObject.value : null;
            const provider = source.providerProfile;
            const projectName = source.projectName ?? '';
            const orgUnitName = source.orgUnitName ?? '';
            const projectId = source.projectId ?? '';

            return {
                tin: bucket.key,
                doctorId,
                facility: provider.name,
                providerId: provider.id,
                providerName: provider.name,
                projectName,
                projectId,
                orgUnitName,
                docCount: bucket.doc_count,
            };
        });
    }
}
