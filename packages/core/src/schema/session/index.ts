import { IncomingMessage, ServerResponse } from 'http';
import * as cookie from 'cookie';
import Iron from '@hapi/iron';
// uid-safe is what express-session uses so let's just use it
import { sync as uid } from 'uid-safe';
import {CreateContext, SessionContext, SessionStore, SessionStoreFunction, SessionStrategy} from "../types";
import {JSONValue} from "../types/utils";
import {extractSessionToken} from "../../api/common/extract-auth-token";
import {Request, Response} from "express";
// import {
//     SessionStrategy,
//     JSONValue,
//     SessionStoreFunction,
//     SessionContext,
//     CreateContext,
// } from '../types';

function generateSessionId() {
    return uid(24);
}

const TOKEN_NAME = 'pickerCc-session';
const MAX_AGE = 60 * 60 * 8; // 8 hours

// should we also accept httpOnly?
type StatelessSessionsOptions = {
    /**
     * Secret used by https://github.com/hapijs/iron for encapsulating data. Must be at least 32 characters long
     */
    secret: string;
    /**
     * Iron seal options for customizing the key derivation algorithm used to generate encryption and integrity verification keys as well as the algorithms and salt sizes used.
     * See https://hapi.dev/module/iron/api/?v=6.0.0#options for available options.
     *
     * @default Iron.defaults
     */
    ironOptions?: Iron.SealOptions;
    /**
     * Specifies the number (in seconds) to be the value for the `Max-Age`
     * `Set-Cookie` attribute.
     *
     * @default 60 * 60 * 8 // 8 hours
     */
    maxAge?: number;
    /**
     * Specifies the boolean value for the [`Secure` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.5).
     *
     * *Note* be careful when setting this to `true`, as compliant clients will
     * not send the cookie back to the server in the future if the browser does
     * not have an HTTPS connection.
     *
     * @default process.env.NODE_ENV === 'production'
     */
    secure?: boolean;
    /**
     * Specifies the value for the [`Path` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.4).
     *
     * @default '/'
     */
    path?: string;
    /**
     * Specifies the domain for the [`Domain` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.3)
     *
     * @default current domain
     */
    domain?: string;
    /**
     * Specifies the boolean or string to be the value for the [`SameSite` `Set-Cookie` attribute](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.2.7).
     *
     * @default 'lax'
     */
    sameSite?: true | false | 'lax' | 'strict' | 'none';
};

export function statelessSessions<T>({
                                         secret,
                                         maxAge = MAX_AGE,
                                         path = '/',
                                         secure = process.env.NODE_ENV === 'production',
                                         ironOptions = Iron.defaults,
                                         domain,
                                         sameSite = 'lax',
                                     }: StatelessSessionsOptions): SessionStrategy<T> {
    if (!secret) {
        throw new Error('You must specify a session secret to use sessions');
    }
    if (secret.length < 32) {
        throw new Error('The session secret must be at least 32 characters long');
    }
    return {
        async get({ req }) {
            // const sessionToken = extractSessionToken(req, this.configService.authOptions.tokenMethod);
            // @ts-ignore
            // const authHeader = req.get('Authorization');
            // if (authHeader) {
            //     const matches = authHeader.trim().match(/^bearer\s(.+)$/i);
            //     if (matches) {
            //         return matches[1];
            //     }
            // }
            // console.log(authHeader)
            const cookies = cookie.parse(req.headers.cookie || '');
            const bearer = req.headers.authorization?.replace('Bearer ', '');
            const token = bearer || cookies[TOKEN_NAME];
            if (!token) return;
            try {
                return await Iron.unseal(token, secret, ironOptions);
            } catch (err) {}
        },
        async end({ res }) {

            res.setHeader(
                'Set-Cookie',
                cookie.serialize(TOKEN_NAME, '', {
                    maxAge: 0,
                    expires: new Date(),
                    httpOnly: true,
                    secure,
                    path,
                    sameSite,
                    domain,
                })
            );
        },
        // Token 在这里生成
        async start({ res, data }) {
            // 将对象序列化、加密和签名为协议字符串
            // 参数
            // object - 数据被密封
            // password - 字符串、缓冲区或对象
            // options - 用于自定义密钥派生算法对象
            // 返回
            // 密封的字符串
            const sealedData = await Iron.seal(data, secret, { ...ironOptions, ttl: maxAge * 1000 });

            res.setHeader(
                'Set-Cookie',
                cookie.serialize(TOKEN_NAME, sealedData, {
                    maxAge,
                    expires: new Date(Date.now() + maxAge * 1000),
                    httpOnly: true,
                    secure,
                    path,
                    sameSite,
                    domain,
                })
            );

            return sealedData;
        },
    };

}

export function storedSessions({
                                   store: storeOption,
                                   maxAge = MAX_AGE,
                                   ...statelessSessionsOptions
                               }: { store: SessionStoreFunction } & StatelessSessionsOptions): SessionStrategy<JSONValue> {
    let { get, start, end } = statelessSessions({ ...statelessSessionsOptions, maxAge });
    let store = typeof storeOption === 'function' ? storeOption({ maxAge }) : storeOption;
    let isConnected = false;
    return {
        async get({ req, createContext }) {
            const data = (await get({ req, createContext })) as { sessionId: string } | undefined;
            const sessionId = data?.sessionId;
            if (typeof sessionId === 'string') {
                if (!isConnected) {
                    await store.connect?.();
                    isConnected = true;
                }
                return store.get(sessionId);
            }
        },
        async start({ res, data, createContext }) {
            let sessionId = generateSessionId();
            if (!isConnected) {
                await store.connect?.();
                isConnected = true;
            }
            await store.set(sessionId, data);
            return start?.({ res, data: { sessionId }, createContext }) || '';
        },
        async end({ req, res, createContext }) {
            const data = (await get({ req, createContext })) as { sessionId: string } | undefined;
            const sessionId = data?.sessionId;
            if (typeof sessionId === 'string') {
                if (!isConnected) {
                    await store.connect?.();
                    isConnected = true;
                }
                await store.delete(sessionId);
            }
            await end?.({ req, res, createContext });
        },
        async disconnect() {
            if (isConnected) {
                await store.disconnect?.();
                isConnected = false;
            }
        },
    };
}

/**
 * This is the function createSystem uses to implement the session strategy provided
 */
export async function createSessionContext<T>(
    sessionStrategy: SessionStrategy<T>,
    req: IncomingMessage,
    res: ServerResponse,
    createContext: CreateContext
): Promise<SessionContext<T>> {
    const sessionStore = await sessionStrategy.get({req, createContext})
    return {
        session: sessionStore,
        startSession: (data: T) => sessionStrategy.start({ res, data, createContext }),
        endSession: () => sessionStrategy.end({ req, res, createContext }),
    };
}
