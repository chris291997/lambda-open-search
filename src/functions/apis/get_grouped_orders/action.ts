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
  ): Promise<{ response: object; pointer: number; count?: number; total?: number; }> {
    try {
      const must: any[] = [];
      const filter: any[] = [];
      
      const pageNumber = Number(pointer);
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
        query.from = pageNumber * limitNumber - limitNumber; // Pagination

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
          query.size = pageNumber * limitNumber;
          query.from = (pageNumber - 1) * limitNumber;
          query.sort = [{ 'id': 'asc' }]; // Sorting by id.keyword in ascending order
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
                    def providerName = doc.containsKey('providerProfile.name') ? doc['providerProfile.name'].toString() : null;
                    def providerId = doc.containsKey('providerProfile.id') ? doc['providerProfile.id'].value : null;
                    def key = providerName + (providerId != null ? providerId : "");
                    return key;
                  `,
                  lang: "painless"
                },
                order: {
                  _key: "asc"
                },
                size: limitNumber * pageNumber
              }
            }
          };
        } else if (groupByField === 'project') {
          query.aggs = {
            group_by_project: {
              terms: {
                script: {
                  source: `
                  def projectName = doc.containsKey('projectName') && doc['projectName'].size() > 0 ? doc['projectName'].value : null;
                  return projectName;
                  `,
                  lang: "painless"
                },  // Use keyword subfield for aggregation
                order: {
                  _key: "asc"  // Sort by key (project name) in ascending order
                },
                size: limitNumber * pageNumber
              }
            }
          };
        } else if (groupByField === 'tin') {
          query.aggs = {
            group_by_tin: {
              terms: {
                script: {
                  source: `
                  def tin = doc.containsKey('practitioner.tin') && doc['practitioner.tin'].size() > 0 ? doc['practitioner.tin'].value : null;
                  return tin;
                  `,
                  lang: "painless"
                },
                order: {
                  _key: "asc"
                },
                size: limitNumber * pageNumber
              }
            }
          };
        }
      }

      console.log("Constructed Search Query:", JSON.stringify(query, null, 2));

      const response = await client.search({
        index: 'new_orders_v3',
        body: query,
      });

      if (groupByField && response.body.aggregations) {
        let allBuckets;

        if (groupByField === 'provider' && response.body.aggregations.group_by_provider) {
          allBuckets = response.body.aggregations.group_by_provider.buckets.map((bucket: { key: any; doc_count: any; }) => {
            const key = bucket.key;
            const providerNameRegex = /\[(.*?)\](.*)/;
            const match = providerNameRegex.exec(key);
          
            let providerName;
            let providerId;
          
            if (match) {
              providerName = match[1];
              providerId = match[2];
            } else {
              providerName = key;
              providerId = null;
            }
          
            return {
              providerName,
              providerId,
              doc_count: bucket.doc_count,
            };
          });
        } else if (groupByField === 'project' && response.body.aggregations.group_by_project) {
          allBuckets = response.body.aggregations.group_by_project.buckets.map((bucket: { key: any; doc_count: any; }) => {
            return {
              projectName: bucket.key,
              doc_count: bucket.doc_count,
            };
          });
        } else if (groupByField === 'tin' && response.body.aggregations.group_by_tin) {
          allBuckets = response.body.aggregations.group_by_tin.buckets.map((bucket: { key: any; doc_count: any; }) => {
            return {
              tin: bucket.key,
              doc_count: bucket.doc_count,
            };
          });
        }
      
        return {
          response: allBuckets,
          pointer: pageNumber,
          count: allBuckets.length,
          total: response.body.hits.total.value,  // Use hits.total.value for total
        };
      }

      const body = response.body.hits;
      return {
        response: body.hits,
        pointer: pageNumber,
        count: body.hits.length,
        total: body.total.value,
      };
    } catch (error) {
      throw new Error(`Error querying OpenSearch: ${error}`);
    }
  }
}
