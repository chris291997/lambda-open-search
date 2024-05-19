import { TYPES } from '../default';

module.exports.default = {
    publicMessageUsRequest: {
        fullName: {
            type: TYPES.string,
            description: 'first_name',
        },
        phoneNumber: {
            type: TYPES.string,
            description: 'mobile',
        },
        email: {
            type: TYPES.string,
            description: 'email',
        },
        company: {
            type: TYPES.string,
            description: 'compnay name',
        },
        message: {
            type: TYPES.string,
            description: 'message of guest',
        },
    },
};
