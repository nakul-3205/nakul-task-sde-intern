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


app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type', 'Authorization'] }))
app.use('*', loggerMiddleware)

app.onError(errorHandler)

app.get('/api/health', (c) =>
  c.json({
    status: 'ok',
  }),
)

app.route('/auth',authRouter,)
app.route('/surveys', surveyRouter)
app.route('/', questionRouter)   
app.route('/', publicRouter)


app.onError(errorHandler)


export default app


// wrangler dev --env-file .env