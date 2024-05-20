
import { Responses } from './responses';
import { UserListDynamoAction } from './action';
import { PaginationQuery } from '../../../helper/HttpHelper';
import { APIHttpResponse } from '../../../libs/Contracts/APIHttpResponse';
import { HttpResponse } from '../../../libs/Contracts/HttpResponse';
import { ApiGatewayEvent } from '../../../libs/Contracts/ApiGatewayEvent';
import { API_RESPONSE, THROW_API_ERROR } from '../../../libs/Response';


interface QueryStringParameters extends PaginationQuery {
    sort_value: string;
}

export async function execute(event: ApiGatewayEvent): Promise<APIHttpResponse> {
    try {
        const action = new UserListDynamoAction();
        const data = await action.execute();
        // HttpRequestHelper.extractDynamoPagination<QueryStringParameters>(
        //     <QueryStringParameters>event.queryStringParameters,
        // ),
        return API_RESPONSE({
            ...Responses.STATUS_200,
            data,
        });
    } catch (error) {
        return THROW_API_ERROR(error as HttpResponse);
    } 
}
