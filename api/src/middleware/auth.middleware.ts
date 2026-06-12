import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { verifyAccessToken } from '../lib/jwt_token'
import { error } from '../utils/response'

export const authMiddleware: MiddlewareHandler =
async (c, next) => {
const token =
    getCookie(c, 'accessToken')

if (!token) {
    return error(
    c,
    'Unauthorized',
    401,
    )
}

try {
    const payload =
    await verifyAccessToken(
        token,
        c.env.JWT_ACCESS_SECRET,
    )

    c.set(
    'userId',
    payload.userId,
    )

    await next()
} catch {
    return error(
    c,
    'Unauthorized',
    401,
    )
}
}