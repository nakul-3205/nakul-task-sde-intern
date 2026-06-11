

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogEntry = {
level: LogLevel
message: string
timestamp: string
[key: string]: unknown
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
debug: 0,
info:  1,
warn:  2,
error: 3,
}

// Set to 'debug' during dev, 'info' in production
const MIN_LEVEL: LogLevel = 'debug'

function write(level: LogLevel, message: string, data?: Record<string, unknown>): void {
if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[MIN_LEVEL]) return

const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
}

const line = JSON.stringify(entry)

// Use the right console method so Cloudflare colours them correctly
if (level === 'error') console.error(line)
else if (level === 'warn') console.warn(line)
else console.log(line)
}

// Base logger
export const logger = {
debug: (msg: string, data?: Record<string, unknown>) => write('debug', msg, data),
info:  (msg: string, data?: Record<string, unknown>) => write('info',  msg, data),
warn:  (msg: string, data?: Record<string, unknown>) => write('warn',  msg, data),
error: (msg: string, data?: Record<string, unknown>) => write('error', msg, data),

// Returns a child logger with context pre-bound.
// Usage: const log = logger.child({ requestId, route: 'auth/login' })
child(context: Record<string, unknown>) {
    return {
    debug: (msg: string, data?: Record<string, unknown>) => write('debug', msg, { ...context, ...data }),
    info:  (msg: string, data?: Record<string, unknown>) => write('info',  msg, { ...context, ...data }),
    warn:  (msg: string, data?: Record<string, unknown>) => write('warn',  msg, { ...context, ...data }),
    error: (msg: string, data?: Record<string, unknown>) => write('error', msg, { ...context, ...data }),
    }
},
}