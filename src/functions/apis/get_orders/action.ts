import moment from 'moment-timezone';
import { OpenSearchClientService } from '../../../services/opensearch-client-service';
import { ChasesMapper } from './adaptor/mappers/chase-mapper';
import { OpenSearchQueryBuilder } from '../../../helper/opensearch-query-builder';

export class GetOrderAction {
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
        chaseId?: string,
    ): Promise<{ response: object; page: number; count: number; total: number }> {
        try {
            const pageNumber = Number(pointer);
            const days = Number(age);
            const limitNumber = Number(limit);

            const client = this.clientService.getClient();
            const INDEX = this.clientService.getIndex();

            if (workOrderId) this.queryBuilder.addMustTerm('_id', workOrderId);
            if (chaseId) this.queryBuilder.addMustTerm('id', chaseId);

            if (bulkOrderId) this.queryBuilder.addMustMatch('bulkOrderId', bulkOrderId);
            if (projectId) this.queryBuilder.addMustMatch('projectId', projectId);
            if (tenantId) this.queryBuilder.addMustMatch('tenantId', tenantId);

            if (projectName) this.queryBuilder.addFilterMatch('projectName', projectName);
            if (resourceType) this.queryBuilder.addFilterMatch('type', resourceType);
            if (firstName) this.queryBuilder.addFilterMatch('patient.firstName', firstName);
            if (lastName) this.queryBuilder.addFilterMatch('patient.lastName', lastName);
            if (memberId) this.queryBuilder.addFilterMatch('patient.memberId', memberId);

            if (days !== 0) {
                const dateThreshold = moment().subtract(days, 'days').toISOString();
                this.queryBuilder.addFilterRange('createDateTime', dateThreshold);
            }

            const query = this.queryBuilder
                .setSize(limitNumber)
                .setFrom((pageNumber - 1) * limitNumber)
                .setSort('providerProfile.name', 'asc')
                .build();

            const response = await client.search({
                index: INDEX,
                body: query,
            });

            if (response.body.hits.total.value === 0) {
                console.warn('No documents found matching the search criteria.');
                return { response: {}, page: pageNumber, count: 0, total: 0 };
            }

            const total = response.body.hits.total.value;
            const data = response.body.hits.hits.map((hit: any) => hit._source);

            // Check if the id is missing in some documents
            const missingIds = data.filter((doc: any) => !doc.id);
            if (missingIds.length > 0) {
                console.warn(`${missingIds.length} document(s) found with missing id.`);
            }

            // Map the response data to ChaseExcerptV2 objects
            const mappedResponse = ChasesMapper.mapArray(data);

            return { response: mappedResponse, page: pageNumber, count: data.length, total: total };
        } catch (error) {
            throw new Error(`Error querying OpenSearch: ${error}`);
        }
    }
}
