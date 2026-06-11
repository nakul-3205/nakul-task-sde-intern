import { Hono } from 'hono'

import authRouter from './routes/auth.route'

import { loggerMiddleware } from './middleware/request-logger'

import { errorHandler } from './middleware/error_handler'

import type {
  Bindings,
  Variables,
} from './types'

const app =
  new Hono<{
    Bindings: Bindings
    Variables: Variables
  }>()

app.use('*', loggerMiddleware)

app.onError(errorHandler)

app.get('/api/health', (c) =>
  c.json({
    status: 'ok',
  }),
)

app.route(
  '/auth',
  authRouter,
)
app.onError(errorHandler)


export default app