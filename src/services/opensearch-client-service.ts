import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { fromSSO } from '@aws-sdk/credential-provider-sso';
import AWS, { Credentials } from 'aws-sdk';

export class OpenSearchClientService {
  private static instance: OpenSearchClientService;
  private client: Client;
  private INDEX: string;

  private constructor() {
    if (process.env.STAGE === 'dev') {
        const OPENSEARCH_URL = 'https://search-datahub-sandbox-vlcytbmhugnp2a6yoegu4mfhde.us-west-2.es.amazonaws.com';
        const OPENSEARCH_USERNAME = 'master';
        const OPENSEARCH_PASSWORD = 'f8#W!AuSj7Dze!';
        this.client = new Client({
            node: OPENSEARCH_URL,
            auth: {
                username: OPENSEARCH_USERNAME,
                password: OPENSEARCH_PASSWORD,
            },
        });
        this.INDEX = 'new_orders_v3';
    } else if(process.env.STAGE === 'local'){
        const OPENSEARCH_URL = 'https://2748nxgmdn832y3synoj.us-west-2.aoss.amazonaws.com';
        //TODO: load credentials using lambda
    
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
        this.client = new Client({
            node: OPENSEARCH_URL,
            ...AwsSigv4Signer({
                region: 'us-west-2',
                service: 'aoss',
                getCredentials: () => Promise.resolve(credentials),
            }),
        });
        this.INDEX = 'orders';
    } else {
      const OPENSEARCH_URL = 'https://2748nxgmdn832y3synoj.us-west-2.aoss.amazonaws.com';
      this.client = new Client({
        node: OPENSEARCH_URL,
        ...AwsSigv4Signer({
          region: 'us-west-2',
          service: 'aoss',
          getCredentials: () => {
            return new Promise<Credentials>((resolve, reject) => {
              const credentials = AWS.config.credentials;
              if (!credentials) {
                reject(new Error('AWS credentials not found.'));
              } else {
                resolve(credentials as Credentials);
              }
            });
          },
        }),
      });
      // this.client = new Client({
      //   node: OPENSEARCH_URL,
      //   ...AwsSigv4Signer({
      //     region: 'us-west-2',
      //     service: 'aoss',
      //     getCredentials: () => Promise.resolve(AWS.config.credentials!),
      //   }),
      // });

        this.INDEX = 'orders';
      
    }
  }

  public static getInstance(): OpenSearchClientService {
    if (!OpenSearchClientService.instance) {
      OpenSearchClientService.instance = new OpenSearchClientService();
    }
    return OpenSearchClientService.instance;
  }

  public getClient(): Client {
    return this.client;
  }

  public getIndex(): string {
    return this.INDEX;
  }
}