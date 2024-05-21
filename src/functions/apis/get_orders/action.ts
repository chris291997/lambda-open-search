import { Client } from '@opensearch-project/opensearch';
interface Response {
  data: any;
}
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
    workOrderId?: string,
    id?: string,
    firstName?: string,
    lastName?: string,
    bulkOrderId?: string,
    projectId?: string,
    projectName?: string,
    tenantId?: string,
    resourceType?: string
  ): Promise<object> {
     try {
      const must: any[] = [];
      // Add term queries for index fields
      if (workOrderId) must.push({ term: { '_id': workOrderId } });

      // Add match queries for other fields under _source index
      if (bulkOrderId) must.push({ match: { 'bulkOrderId': bulkOrderId } });
      if (projectId) must.push({ match: { 'projectId': projectId } });
      if (projectName) must.push({ match: { 'projectName': projectName } });
      if (tenantId) must.push({ match: { 'tenantId': tenantId } });
      if (resourceType) must.push({ match: { 'type': resourceType } });

      // Use multi_match for firstName and lastName if both are provided
      if (firstName && lastName) {
        must.push({
          multi_match: {
            query: `${firstName} ${lastName}`,
            fields: ['patient.firstName', 'patient.lastName']
          }
        });
      } else {
        if (firstName) must.push({ match: { 'patient.firstName': firstName } });
        if (lastName) must.push({ match: { 'patient.lastName': lastName } });
      }
      if (id) must.push({ match: { 'patient.id': id } });

      const queryWithParameters = { query: { bool: { must: must } } };
      
      // Constructing the query object
      const query: any = must.length > 0 ? queryWithParameters : { query: { match_all: {} } };
      
      // Make the request to OpenSearch with basic authentication
      const response = await client.search({
        index: 'orders',
        body: query,
      });
      
      return response.body;

    } catch (error) {
      throw new Error(`Error querying OpenSearch: ${error}`);
    }
  }
}
