export type Bindings = {
DB: D1Database
KV: KVNamespace

JWT_ACCESS_SECRET: string
JWT_REFRESH_SECRET: string
}

export type Variables = {
userId: string
validatedBody: unknown
}