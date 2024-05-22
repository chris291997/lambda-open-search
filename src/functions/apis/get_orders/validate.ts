import { joi } from '../../../libs/Joi';
import { Validation } from '../../../libs/Validation';
import { GetOrderRequest } from './request';

export default (request: GetOrderRequest): GetOrderRequest => {
    const schema = joi
        .object({
            sample: joi.string().required().max(50),
        })
        .required();

    const validate = new Validation<GetOrderRequest>(schema);
    return validate.validate(request);
};
