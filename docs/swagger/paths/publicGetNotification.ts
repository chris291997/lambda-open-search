import { TAGS_NAMES } from '../config';
import { METHODS } from '../default';
import { LANGUAGE } from '../language';
import * as faker from 'faker';

const key = 'qa/public/getNotifications';
const method = METHODS.post;
const tag = TAGS_NAMES.RESOURCES;
const summary = 'get notification API';
const parameters = {
    body: {
        schema: 'publicGetNotificationRequest',
        example: {
            fullName: faker.name.firstName() + ' ' + faker.name.lastName(),
            phoneNumber: '09' + faker.datatype.number(999999999).toString().padStart(9, '0'),
            email: faker.internet.email(),
        },
    },
};
const responses = {
    422: {
        description: LANGUAGE.RESPONSES.DEFAULT['422'],
        schema: 'Response422',
        example: {
            code: 422,
            message: 'Parameter error: Please provide required parameter',
            errors: {
                // Sample 422 error messages
            },
        },
    },
    409: {
        description: LANGUAGE.RESPONSES.DEFAULT['409'],
        schema: 'Response409',
        examples: {
            EmailExist: {
                value: {
                    code: 2,
                    message: 'Email already exists',
                },
            },
        },
    },
    201: {
        description: LANGUAGE.RESPONSES.DEFAULT['201'],
        schema: 'publicGetNotificationResponse',
        example: {
            code: 201,
            message: 'Data successfully saved',
            // data: [
            //     {
            //         mobile: '09' + faker.datatype.number(999999999).toString().padStart(9, '0'),
            //         first_name: faker.name.firstName(),
            //         last_name: faker.name.lastName(),
            //         email: faker.internet.email(),
            //         uuid: faker.datatype.uuid(),
            //     },
            // ],
        },
    },
};

module.exports.default = {
    key,
    method,
    tag,
    summary,
    parameters,
    responses,
};
