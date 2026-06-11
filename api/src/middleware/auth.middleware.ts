import type { MiddlewareHandler } from 'hono'
import { error } from '../utils/response'
import { verifyAccessToken } from '../lib/jwt_token'

export const authMiddleware: MiddlewareHandler = async (
c,
next,
) => {
const authHeader =
    c.req.header('Authorization')

if (!authHeader) {
    return error(
    c,
    'Authorization header missing',
    401,
    )
}

const token =
    authHeader.replace(
    'Bearer ',
    '',
    )

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