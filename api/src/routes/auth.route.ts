import { Hono } from 'hono'

import {
createUser,
loginUser,
refreshAccessToken,
logoutUser,
} from '../controllers/auth.controller'

import { success, error } from '../utils/response'

import { authMiddleware } from '../middleware/auth.middleware'

import type {
Bindings,
Variables,
} from '../types'


const authRouter =
new Hono<{
Bindings: Bindings
Variables: Variables
}>()

authRouter.post(
'/signup',
async (c) => {
try {
const body =
    await c.req.json()

const user =
    await createUser(
    c.env,
    body,
    )

return success(
    c,
    user,
    201,
)
} catch (err) {
return error(
    c,
    (err as Error).message,
    400,
)
}
},
)

authRouter.post(
'/login',
async (c) => {
    try {
    const body =
        await c.req.json()

    const tokens =
        await loginUser(
        c.env,
        body,
        )

    return success(
        c,
        tokens,
    )
    } catch (err) {
    return error(
        c,
        (err as Error).message,
        401,
    )
    }
},
)
authRouter.post(
'/refresh',
async (c) => {
    try {
    const body =
        await c.req.json()

    const result =
        await refreshAccessToken(
        c.env,
        body.refreshToken,
        )

    return success(
        c,
        result,
    )
    } catch (err) {
    return error(
        c,
        (err as Error).message,
        401,
    )
    }
},
)

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