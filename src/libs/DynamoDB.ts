import DynamoDB from 'aws-sdk/clients/dynamodb';
import * as AWS from 'aws-sdk';
import { DataMapper } from '@aws/dynamodb-data-mapper';

let client: DynamoDB;

if (process.env.STAGE === 'local') {
  client = new DynamoDB({
    apiVersion: '2012-08-10',
    region: process.env.REGION,
    endpoint: process.env.LOCAL_DYNAMODB ?? 'http://localhost:8000/',
  });
} else {
  client = new DynamoDB({
    apiVersion: '2012-08-10',
    region: process.env.REGION,
  });
}

const mapper = new DataMapper({ client });
const docClient = new AWS.DynamoDB.DocumentClient({ service: client });

export { mapper, client, docClient };