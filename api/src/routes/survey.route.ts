import { Hono } from 'hono'

import {
    listSurveys,
    createSurvey,
    getSurvey,
    updateSurvey,
    deleteSurvey,
} from '../controllers/survery.controller'

import { success, error } from '../utils/response'
import { authMiddleware } from '../middleware/auth.middleware'

import type { Bindings, Variables } from '../types'

const surveyRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>()

surveyRouter.use('*', authMiddleware)

surveyRouter.get('/', async (c) => {
try {
    const surveys = await listSurveys(c.env, c.get('userId'))
    return success(c, surveys)
} catch (err) {
    return error(c, (err as Error).message, 400)
}
})

surveyRouter.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const survey = await createSurvey(c.env, c.get('userId'), body)
    return success(c, survey, 201)
  } catch (err) {
    return error(c, (err as Error).message, 400)
  }
})

surveyRouter.get('/:id', async (c) => {
  try {
    const survey = await getSurvey(c.env, c.req.param('id'), c.get('userId'))
    return success(c, survey)
  } catch (err) {
    return error(c, (err as Error).message, 404)
  }
})

surveyRouter.put('/:id', async (c) => {
    try {
        const body = await c.req.json()
        const survey = await updateSurvey(c.env, c.req.param('id'), c.get('userId'), body)
        return success(c, survey)
    } catch (err) {
        return error(c, (err as Error).message, 404)
    }
})

surveyRouter.delete('/:id', async (c) => {
    try {
        const result = await deleteSurvey(c.env, c.req.param('id'), c.get('userId'))
        return success(c, result)
    } catch (err) {
        return error(c, (err as Error).message, 404)
    }
})

export default surveyRouter