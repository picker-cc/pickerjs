import { Request } from 'express';


/**
 * 从 cookie 或 Authorization header 获取会话令牌，取决于配置的 tokenMethod。
 * 可以拓展 token 的方法，比如除 bearer 外的 cookie
 * 根据配置的 tokenMethod，从 cookie 或 Authorization header 中获取会话令牌。
 */
export function extractSessionToken(
    req: Request,
    tokenMethod: string,
): string | undefined {
    const tokenFromCookie = getFromCookie(req);
    const tokenFromHeader = getFromHeader(req);
    // 需要安装 cookie-session
    if (tokenMethod === 'cookie') {
        return tokenFromCookie;
    } else if (tokenMethod === 'bearer') {
        return tokenFromHeader
    }
    if (tokenMethod.includes('cookie') && tokenFromCookie) {
        return tokenFromCookie
    }
    if (tokenMethod.includes('bearer') && tokenFromHeader) {
        return tokenFromHeader
    }
}
function getFromCookie(req: Request): string | undefined {
    if (req.session && req.session.token) {
        return req.session.token;
    }
}

function getFromHeader(req: Request): string | undefined {
    const authHeader = req.get('Authorization');
    if (authHeader) {
        const matches = authHeader.trim().match(/^bearer\s(.+)$/i);
        if (matches) {
            return matches[1];
        }
    }
}
