import { joi } from '../../../libs/Joi';
import { Validation } from '../../../libs/Validation';
import { GetGroupedOrderRequest } from './request';

export default (request: GetGroupedOrderRequest): GetGroupedOrderRequest => {
    const schema = joi
        .object({
            sample: joi.string(),
        })
        .required();

    const validate = new Validation<GetGroupedOrderRequest>(schema);
    return validate.validate(request);
};
