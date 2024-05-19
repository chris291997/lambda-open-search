import { TYPES } from '../default';

module.exports.default = {
    publicGetNotificationRequest: {
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
    },
};
