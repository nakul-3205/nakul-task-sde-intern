import { Hono } from 'hono'

import {
createUser,
loginUser,
refreshAccessToken,
logoutUser,
} from '../controllers/auth.controller'

import { success, error } from '../utils/response'

import { authMiddleware } from '../middleware/auth.middleware'
import { setCookie, deleteCookie,getCookie } from 'hono/cookie'

import type {
Bindings,
Variables,
} from '../types'


const authRouter =
new Hono<{
Bindings: Bindings
Variables: Variables
}>()

authRouter.post('/signup', async (c) => {
try {
    const body = await c.req.json()

    const tokens = await createUser(
    c.env,
    body,
    )

    setCookie(c, 'accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
    maxAge: 60 * 15,
    })

    setCookie(c, 'refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    })

    return success(
    c,
    {
        message: 'Account created',
    },
    201,
    )
} catch (err) {
    return error(
    c,
    (err as Error).message,
    400,
    )
}
})

authRouter.post('/login', async (c) => {
    try {
    const body = await c.req.json()

    const tokens = await loginUser(
    c.env,
    body,
    )

    setCookie(c, 'accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        maxAge: 60 * 15,
    })

    setCookie(c, 'refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
})

    return success(c, {
        message: 'Login successful',
    })
    } catch (err) {
    return error(
        c,
        (err as Error).message,
        401,
    )
    }
})
authRouter.post('/refresh', async (c) => {
try {
    const refreshToken =getCookie(c, 'refreshToken')

    if (!refreshToken) {
    return error(
        c,
        'Missing refresh token',
        401,
    )
    }

    const result =await refreshAccessToken(
        c.env,
        refreshToken,
    )

    setCookie(
    c,
    'accessToken',
    result.accessToken,
    {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        maxAge: 60 * 15,
    },
    )

    return success(c, {
    message: 'Token refreshed',
    })
} catch (err) {
    return error(
    c,
    (err as Error).message,
    401,
    )
}
})

authRouter.post(
'/logout',
authMiddleware,
async (c) => {
    const userId =
    c.get('userId')

    await logoutUser(
    c.env,
    userId,
    )
    deleteCookie(c, 'accessToken')
    deleteCookie(c, 'refreshToken')

    return success(
    c,
    {
        message:
        'Logged out successfully',
    },
    )
},
)
authRouter.get(
'/me',
authMiddleware,
async (c) => {
    return success(c, {
    userId:
        c.get('userId'),
    })
},
)

export default authRouter