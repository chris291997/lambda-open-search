import { GetGroupedOrdersAction } from './action';
import { APIHttpResponse } from '../../../libs/Contracts/APIHttpResponse';
import { HttpResponse } from '../../../libs/Contracts/HttpResponse';
import { ApiGatewayEvent } from '../../../libs/Contracts/ApiGatewayEvent';
import { API_RESPONSE, THROW_API_ERROR } from '../../../libs/Response';
import { Responses } from './responses';
import { OpenSearchClientService } from '../../../services/opensearch-client-service';
import { OpenSearchQueryBuilder } from '../../../helper/opensearch-query-builder';

export async function execute(event: ApiGatewayEvent): Promise<APIHttpResponse> {
    try {
        const clientService = OpenSearchClientService.getInstance();
        const queryBuilder = new OpenSearchQueryBuilder();
        const action = new GetGroupedOrdersAction(clientService, queryBuilder);

        const workOrderId = event.queryStringParameters?.workOrderId ?? '';
        const decodedWorkOrderId = decodeURIComponent(workOrderId);
        const memberId = event.queryStringParameters?.memberId ?? '';
        const firstName = event.queryStringParameters?.firstName ?? '';
        const lastName = event.queryStringParameters?.lastName ?? '';
        const bulkOrderId = event.queryStringParameters?.bulkOrderId ?? '';
        const projectId = event.queryStringParameters?.projectId ?? '';
        const projectName = event.queryStringParameters?.projectName ?? '';
        const tenantId = event.queryStringParameters?.tenantId ?? '';
        const resourceType = event.queryStringParameters?.resourceType ?? '';
        const pointer = event.queryStringParameters?.pointer ?? '';
        const limit = event.queryStringParameters?.limit ?? '';
        const age = event.queryStringParameters?.age ?? '';
        const groupByField = event.queryStringParameters?.groupByField ?? '';
        const chaseId = event.queryStringParameters?.chaseId ?? '';

        const data = await action.execute(
            pointer,
            limit,
            age,
            decodedWorkOrderId,
            memberId,
            firstName,
            lastName,
            bulkOrderId,
            projectId,
            projectName,
            tenantId,
            resourceType,
            groupByField,
            chaseId,
        );

        return API_RESPONSE({
            ...Responses.STATUS_200,
            ...data,
        });
    } catch (error) {
        return THROW_API_ERROR(error as HttpResponse);
    }
}
