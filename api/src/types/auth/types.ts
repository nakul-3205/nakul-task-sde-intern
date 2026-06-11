export type User = {
    id: string
    email: string
    password_hash: string
    created_at: string
}

export type CreateUserInput = {
    email: string
    password: string
}

export type LoginInput = {
    email: string
    password: string
}