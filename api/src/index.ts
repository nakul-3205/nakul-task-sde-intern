import { Hono } from 'hono'
import authRouter from './routes/auth.route'
import { loggerMiddleware } from './middleware/request-logger'
import { errorHandler } from './middleware/error_handler'
import { cors } from 'hono/cors'
import type {
  Bindings,
  Variables,
} from './types'
import surveyRouter from './routes/survey.route'
import questionRouter from './routes/question.routes'
import publicRouter from './routes/public.route'

const app =
  new Hono<{
    Bindings: Bindings
    Variables: Variables
  }>()

  app.use(
    '*',
    cors({
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      credentials: true,
      allowMethods: [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'OPTIONS',
      ],
      allowHeaders: [
        'Content-Type',
      ],
    }),
  )
  app.use('*', loggerMiddleware)
app.onError(errorHandler)

app.get('/api/health', (c) =>
  c.json({
    status: 'ok',
  }),
)
app.route('/', publicRouter)

app.route('/auth',authRouter,)
app.route('/surveys', surveyRouter)
app.route('/', questionRouter)   




export default app


// wrangler dev --env-file .env