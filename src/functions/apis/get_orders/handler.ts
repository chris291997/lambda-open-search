
import { Responses } from './responses';
import { GetOrderAction } from './action';
import { APIHttpResponse } from '../../../libs/Contracts/APIHttpResponse';
import { HttpResponse } from '../../../libs/Contracts/HttpResponse';
import { ApiGatewayEvent } from '../../../libs/Contracts/ApiGatewayEvent';
import { API_RESPONSE, THROW_API_ERROR } from '../../../libs/Response';
import { GetOrderRequest } from './request';
import Validate from './validate';


export async function execute(event: ApiGatewayEvent): Promise<APIHttpResponse> {
    try {

        /**
         * Use this validate if validating an object from event.body
         * const request: GetOrderRequest = Validate(JSON.parse(event.body));
         */
       
        //for database connnections
        const action = new GetOrderAction();
        const workOrderId = event.queryStringParameters?.workOrderId ?? '';
        const decodedWorkOrderId = decodeURIComponent(workOrderId);

        console.log('encoded workOrderId', workOrderId);
        console.log('decoded workOrderId', decodedWorkOrderId);

        const id = event.queryStringParameters?.id ?? '';
        const firstName = event.queryStringParameters?.firstName ?? '';
        const lastName = event.queryStringParameters?.lastName ?? '';
        const bulkOrderId = event.queryStringParameters?.bulkOrderId ?? '';
        const projectId = event.queryStringParameters?.projectId ?? '';
        const projectName = event.queryStringParameters?.projectName ?? '';
        const tenantId = event.queryStringParameters?.tenantId ?? '';
        const resourceType = event.queryStringParameters?.resourceType ?? '';

        const data = await action.execute(decodedWorkOrderId, id, firstName, lastName, bulkOrderId, projectId, projectName, tenantId, resourceType);

        return API_RESPONSE({
            ...Responses.STATUS_200,
            ...data,
        });
    } catch (error) {
        return THROW_API_ERROR(error as HttpResponse);
    } 
}
