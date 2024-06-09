import moment from 'moment';
import { ChasesMapper } from './adaptor/chase-mapper';
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { fromSSO } from '@aws-sdk/credential-provider-sso';

const OPENSEARCH_URL = 'https://2748nxgmdn832y3synoj.us-west-2.aoss.amazonaws.com';

// Load credentials using AWS profile
const loadSSOCredentials = async () => {
  try {
    const ssoCredentials = await fromSSO({ profile: 'NonProdDevPowerUserAccessPS_534874177660' })();
    return ssoCredentials;
  } catch (error) {
    console.error('Error loading SSO credentials:', error);
    throw error;
  }
};
const credentials = loadSSOCredentials();
const client = new Client({
  node: OPENSEARCH_URL,
  ...AwsSigv4Signer({
    region: 'us-west-2',
    service: 'aoss',
    getCredentials: () => Promise.resolve(credentials),
  }),
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
    chaseId?: string,

  ): Promise<{ response: object; pointer: number; count?: number; total?: number; }> { //
    try {

      try {
       
    
        // Sample function to test the client connection
        const testConnection = async () => {
          try {
            const response = await client.ping();
            console.log('Connected to OpenSearch:', response);
          } catch (error) {
            console.error('Error connecting to OpenSearch:', error);
          }
        };
    
        await testConnection();
    
        // Rest of your GetOrderAction code...
      } catch (error) {
        console.error('Error initializing OpenSearch client:', error);
      }



      const must: any[] = [];
      const filter: any[] = [];
      
      const pageNumber = Number(pointer);
      const days = Number(age);
      const limitNumber = Number(limit);

      if (workOrderId) must.push({ term: { '_id': workOrderId } });
      if (bulkOrderId) must.push({ match: { 'bulkOrderId': bulkOrderId } });
      if (projectId) must.push({ match: { 'projectId': projectId } });
      if (tenantId) must.push({ match: { 'tenantId': tenantId } });
      if (chaseId) must.push({ term: { 'id': chaseId } });

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
              },
              aggs: {
                top_hits: {
                  top_hits: {
                    size: 1
                  }
                }
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
              },
              aggs: {
                top_hits: {
                  top_hits: {
                    size: 1
                  }
                }
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
                }
              },
              aggs: {
                top_hits: {
                  top_hits: {
                    size: 1
                  }
                }
              }
            }
          };
        }
      }

      console.log("Constructed Search Query:", JSON.stringify(query, null, 2));

      const response = await client.search({
        index: 'orders',
        body: query,
      });

      if (groupByField && response.body.aggregations) {
        let allBuckets;

        if (groupByField === 'provider' && response.body.aggregations.group_by_provider) {
          allBuckets = response.body.aggregations.group_by_provider.buckets.map((bucket: { key: string; doc_count: number; top_hits:any; }) => {
            const key = bucket.key;
            const providerNameRegex = /\[(.*?)\](.*)/;
            const match = providerNameRegex.exec(key);
            const source = bucket.top_hits.hits.hits[0]._source;
            const identifiers = source.identifiers;
            const doctorIdObject = identifiers.find((identifier: { type: string; }) => identifier.type === 'doctorId');
            const doctorId = doctorIdObject ? doctorIdObject.value : null;
            const tin = source.practitioner?.tin ?? source.originalPractitioner?.tin ?? "";
            const orgUnitName = source.orgUnitName ?? "";
            const projectName = source.projectName ?? "";
            
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
              tin,
              doctorId,
              providerId,
              providerName,
              orgUnitName,
              projectName,
              doc_count: bucket.doc_count,
            };
          });
        } else if (groupByField === 'project' && response.body.aggregations.group_by_project) {
          allBuckets = response.body.aggregations.group_by_project.buckets.map((bucket: { key: string; doc_count: number; top_hits:any }) => {
            const source = bucket.top_hits.hits.hits[0]._source;
            const orgUnitName = source.orgUnitName ?? "";
            const provider = bucket.top_hits.hits.hits[0]._source.providerProfile;
            const identifiers = source.identifiers;
            const doctorIdObject = identifiers.find((identifier: { type: string; }) => identifier.type === 'doctorId');
            const doctorId = doctorIdObject ? doctorIdObject.value : null;
            const tin = source.practitioner?.tin ?? source.originalPractitioner?.tin ?? "";
            return {
              tin,
              doctorId,
              providerId: provider.id,
              providerName: provider.name,
              projectName: bucket.key,
              orgUnitName,
              doc_count: bucket.doc_count,
            };
          });
        } else if (groupByField === 'tin' && response.body.aggregations.group_by_tin) {
            allBuckets = response.body.aggregations.group_by_tin.buckets.map((bucket: { key: string; doc_count: number; top_hits:any }) => {
            const source = bucket.top_hits.hits.hits[0]._source;
            const identifiers = source.identifiers;
            const doctorIdObject = identifiers.find((identifier: { type: string; }) => identifier.type === 'doctorId');
            const doctorId = doctorIdObject ? doctorIdObject.value : null;
            const provider = bucket.top_hits.hits.hits[0]._source.providerProfile;
            const projectName = source.projectName ?? "";
            const orgUnitName = source.orgUnitName ?? "";

            console.log(doctorId)
            return {
              tin: bucket.key,
              doctorId,
              providerId: provider.id,
              providerName: provider.name,
              projectName,
              orgUnitName,
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
      const data = body.hits.map((hit: any) => hit._source);
      const mappedResponse = ChasesMapper.mapArray(data);
      console.log(mappedResponse);
      return {
        response: mappedResponse,
        pointer: pageNumber,
        count: body.hits.length,
        total: body.total.value,
      };
    } catch (error) {
      throw new Error(`Error querying OpenSearch: ${error}`);
    }
  }
}
