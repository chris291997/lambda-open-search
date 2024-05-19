import axios from 'axios';
import { DynamoPaginationInfo } from "../../../repositories/DynamoRepository";

interface Response {
  data: any;
}

// OpenSearch endpoint
const OPENSEARCH_URL = 'https://search-datahub-sandbox-vlcytbmhugnp2a6yoegu4mfhde.us-west-2.es.amazonaws.com/orders/_search';

// Replace with your OpenSearch URL
// Retrieve OpenSearch credentials from environment variables
const OPENSEARCH_USERNAME = 'master';
const OPENSEARCH_PASSWORD = 'f8#W!AuSj7Dze!';

export class UserListDynamoAction {
  async execute(): Promise<Response> {
    try {
      const query = {
        query: {
          bool: {
            must: [
              {
                match: {
                  'providerProfile.address.city': 'LOS ANGELES',
                },
              },
            ],
          },
        },
      };

      // Encode credentials for basic authentication
      const auth = Buffer.from(`${OPENSEARCH_USERNAME}:${OPENSEARCH_PASSWORD}`).toString('base64');

      // Make the request to OpenSearch with basic authentication
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