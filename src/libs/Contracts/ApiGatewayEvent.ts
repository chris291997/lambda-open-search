interface Headers {
    Authorization?: string;
}

export interface RequestContextContent {
    user_id?: string;
    session_id?: string;
    user_type?: string;
    token_type?: string;
    claims?: claimsContent;
}

export interface claimsContent {
    type: string;
    user_id: string;
    user_type: string;
    iat: number;
    exp: number;
}

interface RequestContext {
    authorizer: RequestContextContent;
    identity?: {
        sourceIp: string;
    };
}

export interface ApiGatewayEvent {
    source?: string;
    headers?: Headers;
    body: string;
    queryStringParameters?: {
        [key: string]: string;
    };
    pathParameters?: {
        [key: string]: string;
    };
    requestContext?: RequestContext;
}

export interface Event {
    source?: string;
    methodArn: string;
    authorizationToken: string;
}
