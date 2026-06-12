import { Hono } from 'hono'

import {
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
} from '../controllers/question.controller'

import { success, error } from '../utils/response'
import { authMiddleware } from '../middleware/auth.middleware'

import type { Bindings, Variables } from '../types'

const questionRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>()

questionRouter.use('*', authMiddleware)

questionRouter.post('/surveys/:surveyId/questions', async (c) => {
    try {
        const body = await c.req.json()
        const question = await addQuestion(c.env, c.req.param('surveyId'), c.get('userId'), body)
        return success(c, question, 201)
    } catch (err) {
        return error(c, (err as Error).message, 400)
    }
})

questionRouter.put('/questions/:id', async (c) => {
    try {
        const body = await c.req.json()
        const question = await updateQuestion(c.env, c.req.param('id'), c.get('userId'), body)
        return success(c, question)
    } catch (err) {
    return error(c, (err as Error).message, 404)
}
})

questionRouter.delete('/questions/:id', async (c) => {
    try {
        const result = await deleteQuestion(c.env, c.req.param('id'), c.get('userId'))
        return success(c, result)
    } catch (err) {
        return error(c, (err as Error).message, 404)
}
})

questionRouter.put('/surveys/:surveyId/questions/reorder', async (c) => {
    try {
        const body = await c.req.json<{ order: string[] }>()
        const result = await reorderQuestions(c.env, c.req.param('surveyId'), c.get('userId'), body.order)
        return success(c, result)
    } catch (err) {
        return error(c, (err as Error).message, 400)
}
})

export default questionRouter