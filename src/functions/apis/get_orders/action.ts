import { Client } from '@opensearch-project/opensearch';
import moment from 'moment';

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
    page: string,
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
  ): Promise<{ response: object; page: number; count: number; total: number; }> {
    try {
      const must: any[] = [];
      const filter: any[] = [];
          
      const pageNumber = Number(page);
      const days = Number(age);
      const limitNumber = Number(limit);
      // Add term queries for index fields
      if (workOrderId) must.push({ term: { '_id': workOrderId } });
      if (bulkOrderId) must.push({ match: { 'bulkOrderId': bulkOrderId } });
      if (projectId) must.push({ match: { 'projectId': projectId } });
      if (tenantId) must.push({ match: { 'tenantId': tenantId } });

      if (projectName) filter.push({ match: { 'projectName': projectName } });
      if (resourceType) filter.push({ match: { 'type': resourceType } });
      if (firstName) filter.push({ match: { 'patient.firstName': firstName } });
      if (lastName) filter.push({ match: { 'patient.lastName': lastName } });
      if (memberId) filter.push({ match: { 'patient.memberId': memberId } });
      console.log(age)
      // Calculate date for age filtering
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
        size: limitNumber, // Limit the number of documents
        from: (pageNumber - 1) * limitNumber, // Pagination
      };

      if (must.length > 0 || filter.length > 0) {
        query.query = {
          bool: {}
        };

        if (must.length > 0) {
          query.query.bool.must = must;
        }

        if (filter.length > 0) {
          query.query.bool.filter = filter;
        }
      } else {
        query.query = { match_all: {} };
      }
      console.log("Constructed Search Query:", JSON.stringify(query, null, 2));

      const response = await client.search({
        index: 'orders',
        body: query,
      });

      // Handle empty response
      if (response.body.hits.total.value === 0) {
        console.warn('No documents found matching the search criteria.');
        return { response: {}, page: pageNumber, count: 0, total: 0 };
      }

      const total = response.body.hits.total.value;
      const data = response.body.hits.hits.map((hit: any) => hit._source);
      const providerGroups: { [key: string]: any[] } = {};

      // Group documents by providerGroupName
      data.forEach((doc: any) => {
        const providerGroupName = doc.identifiers.find((id: any) => id.type === 'providerGroupName')?.value || 'Unknown Group';
        if (!providerGroups[providerGroupName]) {
          providerGroups[providerGroupName] = [];
        }
        providerGroups[providerGroupName].push(doc);
      });

      return { response: providerGroups, page: pageNumber, count: data.length, total: total };
    } catch (error) {
      throw new Error(`Error querying OpenSearch: ${error}`);
    }
  }
}
