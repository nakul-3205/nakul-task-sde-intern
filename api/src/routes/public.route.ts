import { Hono } from 'hono'

import { getPublicSurvey, submitResponse } from '../controllers/public.controller'
import { success, error } from '../utils/response'

import type { Bindings, Variables } from '../types'

const publicRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>()


publicRouter.get('/s/:slug', async (c) => {
try {
const survey = await getPublicSurvey(c.env, c.req.param('slug'))
return success(c, survey)
} catch (err) {
return error(c, (err as Error).message, 404)
}
})

publicRouter.post('/s/:slug/respond', async (c) => {
try {
const body = await c.req.json()
const result = await submitResponse(c.env, c.req.param('slug'), body)
return success(c, result, 201)
} catch (err) {
return error(c, (err as Error).message, 400)
}
})

export default publicRouter