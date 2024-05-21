import { retrieve } from './Kms';

const API_SECRET: string = process.env.API_SECRET ?? '';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Logger } from './Logger';
import { ApiTokenExpiredError } from './Errors/ApiTokenExpiredError';
import { ApiTokenInvalidError } from './Errors/ApiTokenInvalidError';
import { ApiTokenError } from './Errors/ApiTokenError';

export class JWT {
    static async generateToken<R extends string | object>(data: R, expiresIn = '1h'): Promise<string> {
        const key = await retrieve(API_SECRET, 'API_SECRET');
        return jwt.sign(data, key, {
            expiresIn,
        });
    }

    static async verifyToken(token: string): Promise<JwtPayload | null> {
        try {
            return jwt.verify(token.replace(/^Bearer\s/, ''), await retrieve(API_SECRET, 'API_SECRET')) as JwtPayload;
        } catch (error: any) {
            Logger.error('JWT.getData', { error });

            switch (error.name) {
                case 'TokenExpiredError':
                    throw new ApiTokenExpiredError();
                case 'JsonWebTokenError':
                    throw new ApiTokenInvalidError();
                default:
                    throw new ApiTokenError();
            }
        }
    }
}
