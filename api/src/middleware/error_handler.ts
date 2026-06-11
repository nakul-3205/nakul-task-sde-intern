import type { Context } from 'hono'
import { logger } from '../utils/logger'
import { error } from '../utils/response'

export const errorHandler = (
err: Error,
c: Context,
) => {
logger.error('Unhandled error', {
message: err.message,
stack: err.stack,
path: c.req.path,
method: c.req.method,
})

return error(c, 'Internal Server Error', 500)
}