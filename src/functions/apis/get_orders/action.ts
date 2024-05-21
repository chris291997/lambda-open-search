import axios from 'axios';

interface Response {
  data: any;
}

export class GetOrderAction {
  async execute(id?: string, firstName?: string, lastName?: string, bulkOrderId?: string, projectId?: string, projectName?: string, workOrderId?: string, tenantId?: string, type?: string): Promise<Response> {

    try {
      // Constructing the query object dynamically based on provided parameters
      const query: any = {
        query: {
          bool: {
            must: [],
          },
        },
      };

      if (id) {
        query.query.bool.must.push({ term: { _id : id} });
      }
      if (firstName) {
        query.query.bool.must.push({ match: { 'patient.firstName': firstName } });
      }
      if (lastName) {
        query.query.bool.must.push({ match: { 'patient.lastName': lastName } });
      }
      if (bulkOrderId) {
        query.query.bool.must.push({ term: { 'bulkOrderId': bulkOrderId } });
      }
      if (projectId) {
        query.query.bool.must.push({ term: { 'projectId': projectId } });
      }
      if (projectName) {
        query.query.bool.must.push({ term: { 'projectName': projectName } });
      }
      if (workOrderId) {
        query.query.bool.must.push({ term: { 'workOrderId': workOrderId } });
      }
      if (tenantId) {
        query.query.bool.must.push({ term: { 'tenantId': tenantId } });
      }
      if (type) {
        query.query.bool.must.push({ term: { 'type': type } });
      }

      // Encode credentials for basic authentication
      const OPENSEARCH_USERNAME = 'master';
      const OPENSEARCH_PASSWORD = 'f8#W!AuSj7Dze!';
      const auth = Buffer.from(`${OPENSEARCH_USERNAME}:${OPENSEARCH_PASSWORD}`).toString('base64');

      // Make the request to OpenSearch with basic authentication
      const OPENSEARCH_URL = 'https://search-datahub-sandbox-vlcytbmhugnp2a6yoegu4mfhde.us-west-2.es.amazonaws.com/orders/_search';
      const response = await axios.post(OPENSEARCH_URL, query, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
      });

      return { data: response.data };
    } catch (error) {
      throw new Error(`Error querying OpenSearch: ${error}`);
    }
  }
}
