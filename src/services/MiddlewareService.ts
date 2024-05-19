import { RequestContextContent } from '../libs/Contracts/ApiGatewayEvent';
import { ApiTokenInvalidError } from '../libs/Errors/ApiTokenInvalidError';
import { DynamoUserRepository } from '../repositories/DynamoUserRepository';

export enum Effect {
    ALLOW = 'Allow',
    DENY = 'Deny',
}

export interface Statement {
    Action: string;
    Effect: string;
    Resource: string;
}

export interface PolicyDocument {
    Version: string;
    Statement: Statement[];
}

export interface Policy {
    principalId: string;
    policyDocument: PolicyDocument;
    context: RequestContextContent;
}

export const generatePolicy = (
    id: string,
    effect: Effect,
    resource: string,
    user_id?: string,
    session_id?: string,
): Policy => {
    return {
        principalId: id,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
        context: {
            user_id,
            session_id,
        },
    };
};

export interface Event {
    methodArn: string;
    authorizationToken: string;
}

export interface Context {
    awsRequestId?: string;
}

export interface TokenData {
    type: string;
    user_id: string;
}

interface UserResult {
    user_id: string;
}

export class MiddlewareService {
    private dynamoUserRepository: DynamoUserRepository;

    constructor() {
        this.dynamoUserRepository = new DynamoUserRepository();
    }
    async checkUserUsingJWT(user_id: string): Promise<UserResult> {
        const userExist = await this.dynamoUserRepository.getUserInfo(user_id);

        // If user doesn't exist, throw access denied
        if (!userExist) {
            throw new ApiTokenInvalidError();
        }

        return {
            user_id,
        };
    }
}
