
import { v4 } from 'uuid';
import * as faker from 'faker';

import { client } from './src/libs/DynamoDB';
import { CreateTableInput } from 'aws-sdk/clients/dynamodb';
import { Logger } from './src/libs/Logger';
import { DynamoUserModel } from './src/models/DynamoUserModel';
import { GSI, LSI } from './src/repositories/DynamoRepository';
import { DynamoNotesRepository } from './src/repositories/DynamoNotesRepository';
import { DynamoNotesModel } from './src/models/DynamoNotesModel';
import { DynamoUserRepository } from './src/repositories/DynamoUserRepository';
const TABLE_NAME = process.env.TABLE_NAME ?? '';

async function migrate() {
    const table: CreateTableInput = {
        TableName: TABLE_NAME,
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
        },
        AttributeDefinitions: [
            {
                AttributeName: 'lookup_key',
                AttributeType: 'S',
            },
            {
                AttributeName: 'reference_key',
                AttributeType: 'S',
            },
            {
                AttributeName: 'id',
                AttributeType: 'S',
            },
            {
                AttributeName: 'created_at',
                AttributeType: 'S',
            },
        ],
        KeySchema: [
            {
                AttributeName: 'lookup_key',
                KeyType: 'HASH',
            },
            {
                AttributeName: 'reference_key',
                KeyType: 'RANGE',
            },
        ],
        LocalSecondaryIndexes: [
            {
                IndexName: LSI.ID_INDEX,
                KeySchema: [
                    {
                        AttributeName: 'lookup_key',
                        KeyType: 'HASH',
                    },
                    {
                        AttributeName: 'id',
                        KeyType: 'RANGE',
                    },
                ],
                Projection: {
                    ProjectionType: 'ALL',
                },
            },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: GSI.CREATED_AT_INDEX,
                KeySchema: [
                    {
                        AttributeName: 'reference_key',
                        KeyType: 'HASH',
                    },
                    {
                        AttributeName: 'created_at',
                        KeyType: 'RANGE',
                    },
                ],
                Projection: {
                    ProjectionType: 'ALL',
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1,
                },
            },
        ],
    };

    try {
        await client.createTable(table).promise();
        //! FOR SINGLE TABLE DESIGN 
         // SEEDERS //
         const dynamoUserRepository = new DynamoUserRepository();

         for(let i=0; i<15; i++){
            const user = new DynamoUserModel();
            user.email = faker.internet.email();
            user.name = faker.name.firstName();
            // user.mobile = '09568621776';
            user.mobile = `09${faker.datatype.number(999999999).toString().padStart(9, '0')}`;
            user.password = faker.random.word(); //! or faker.random.alphaNumeric(15);
            user.user_id = v4();
            await dynamoUserRepository.create(user);
         }

         const dynamoNotesRepository = new DynamoNotesRepository();
         
         for(let i=0; i<15; i++){
            const notes = new DynamoNotesModel();
            notes.name = faker.internet.email();
            notes.title = faker.internet.email();
            notes.content = faker.name.firstName();
            notes.status = faker.name.firstName();
            // user.mobile = '09568621776';
            notes.note_id = v4();
            await dynamoNotesRepository.create(notes);
         }



        Logger.info('Migration: ', 'Success');
    } catch (error) {
        Logger.info('Migration: ', 'Failed');
        Logger.error('DynamoDB.Migration', {
            error,
        });
    }
}

migrate().then();
