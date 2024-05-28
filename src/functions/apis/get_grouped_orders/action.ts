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
    groupByField?: string,
  ): Promise<{ response: object; page: number; count?: number; total?: number; }> {
    try {
      const must: any[] = [];
      const filter: any[] = [];
      
      const pageNumber = Number(page);
      const days = Number(age);
      const limitNumber = Number(limit);

      if (workOrderId) must.push({ term: { '_id': workOrderId } });
      if (bulkOrderId) must.push({ match: { 'bulkOrderId': bulkOrderId } });
      if (projectId) must.push({ match: { 'projectId': projectId } });
      if (tenantId) must.push({ match: { 'tenantId': tenantId } });

      if (projectName) filter.push({ match: { 'projectName': projectName } });
      if (resourceType) filter.push({ match: { 'type': resourceType } });
      if (firstName) filter.push({ match: { 'patient.firstName': firstName } });
      if (lastName) filter.push({ match: { 'patient.lastName': lastName } });
      if (memberId) filter.push({ match: { 'patient.memberId': memberId } });

      let query: any = {};
      // Only include query part if groupByField is not specified
      if (!groupByField) {
        query.size = limitNumber; // Limit the number of documents
        query.from = (pageNumber - 1) * limitNumber; // Pagination

        if (days !== 0) {
          const dateThreshold = moment().subtract(days, 'days').toISOString();
          filter.push({
            range: {
              'createDateTime': {
                gte: dateThreshold
              }
            }
          });
        }
  
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
      }

      if (groupByField) {
        query.size = 0;
        if (groupByField === 'provider') {
          query.aggs = {
            group_by_provider: {
              terms: {
                script: {
                  source: `
                    if (params['_source'].containsKey('identifiers')) {
                      def identifiers = params['_source']['identifiers'];
                      def providerId = null;
                      def providerGroupName = null;
                      for (int i = 0; i < identifiers.length; ++i) {
                        if (identifiers[i]['type'] == 'providerId') {
                          providerId = identifiers[i]['value'];
                        }
                        if (identifiers[i]['type'] == 'providerGroupName') {
                          providerGroupName = identifiers[i]['value'];
                        }
                      }
                      return providerId != null ? providerId + ' (' + providerGroupName + ')' : null;
                    }
                    return null;
                  `,
                  lang: "painless"
                },
                size: limitNumber * pageNumber
              }
            }
          };
        } else {
          query.aggs = {
            group_by: {
              terms: {
                field: groupByField,
                size: limitNumber * pageNumber
              },
            },
          };
        }
      }

      console.log("Constructed Search Query:", JSON.stringify(query, null, 2));

      const response = await client.search({
        index: 'orders',
        body: query,
      });
      const body = response.body.hits;

      if (groupByField && response.body.aggregations && response.body.aggregations.group_by_provider) {
        const allBuckets = response.body.aggregations.group_by_provider.buckets.map((bucket: { key: string; doc_count: number; }) => {
          const key = bucket.key;
          const startIndex = key.indexOf('(');
          const endIndex = key.indexOf(')');
          const providerName = key.substring(startIndex + 1, endIndex).trim();
          const providerId = key.substring(0, startIndex).trim();
          return {
            response : {
              providerName,
              doc_count: bucket.doc_count,
              providerId
            }
          };
        });
      
        return {
          response: allBuckets,
          page: pageNumber,
          count: allBuckets.length,
          total: body.total.value,
        }
      } 

      return {
        response: body.hits,
        page: pageNumber,
        count: body.hits.length,
        total: body.total.value,
      }
    } catch (error) {
      throw new Error(`Error querying OpenSearch: ${error}`);
    }
  }
}
