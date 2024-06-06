import { Client } from '@opensearch-project/opensearch';
import moment from 'moment';
import { ChasesMapper } from './adaptor/chase-mapper';

const OPENSEARCH_URL = 'https://search-datahub-sandbox-vlcytbmhugnp2a6yoegu4mfhde.us-west-2.es.amazonaws.com';
const OPENSEARCH_USERNAME = 'master';
const OPENSEARCH_PASSWORD = 'f8#W!AuSj7Dze!';

const client = new Client({
  node: OPENSEARCH_URL,
  auth: {
    username: OPENSEARCH_USERNAME,
    password: OPENSEARCH_PASSWORD,
  },
});

export class GetOrderAction {
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
  ): Promise<{ response: object; page: number; count: number; total: number; }> {
    try {
      const pageNumber = Number(pointer);
      const days = Number(age);
      const limitNumber = Number(limit);

      const must: any[] = [];
      const filter: any[] = [];
      if (workOrderId) must.push({ term: { '_id': workOrderId } });
      if (chaseId) must.push({ term: { 'id': chaseId } });
      if (bulkOrderId) must.push({ match: { 'bulkOrderId': bulkOrderId } });
      if (projectId) must.push({ match: { 'projectId': projectId } });
      if (tenantId) must.push({ match: { 'tenantId': tenantId } });

      if (projectName) filter.push({ match: { 'projectName': projectName } });
      if (resourceType) filter.push({ match: { 'type': resourceType } });
      if (firstName) filter.push({ match: { 'patient.firstName': firstName } });
      if (lastName) filter.push({ match: { 'patient.lastName': lastName } });
      if (memberId) filter.push({ match: { 'patient.memberId': memberId } });

      if (days !== 0) {
        const dateThreshold = moment().subtract(age, 'days').toISOString();
        filter.push({
          range: {
            'createDateTime': {
              gte: dateThreshold
            }
          }
        });
      }

      let query: any = {
        size: pageNumber * limitNumber,
        from: (pageNumber - 1) * limitNumber,
        sort: [{ 'id': 'asc' }] // Sorting by id.keyword in ascending order
      };

      if (must.length > 0 || filter.length > 0) {
        query.query = {
          bool: {
            must,
            filter
          }
        };
      } else {
        query.query = { match_all: {} };
      }

      const response = await client.search({
        index: 'new_orders_v3',
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
