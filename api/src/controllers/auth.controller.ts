//auth business logic 
//the auth has been made drastcially simple based on email + password and no 2fa , cause of less time .
import type { Bindings } from "../types"
import { hashPassword,comparePassword } from "../lib/password_service"
import { signAccessToken,signRefreshToken,verifyAccessToken,verifyRefreshToken } from "../lib/jwt_token"
import type { User,CreateUserInput,LoginInput } from "../types/auth/types"


export const createUser = async (
env: Bindings,
input: CreateUserInput,
) =>{
const existing = await env.DB
.prepare(
'SELECT id FROM users WHERE email = ?',
)
.bind(input.email)
.first()

if (existing) {
throw new Error('User already exists')
}

const passwordHash = await hashPassword(
input.password,
)
const userId = crypto.randomUUID()


const accessToken =await signAccessToken(
userId,
env.JWT_ACCESS_SECRET,
)

const refreshToken =await signRefreshToken(
userId,
env.JWT_REFRESH_SECRET,
)
await env.KV.put(
`refresh:${userId}`,
refreshToken,
{
expirationTtl:
7 * 24 * 60 * 60,
},
)
await env.DB
.prepare(
`
INSERT INTO users (
id,
email,
password_hash
)
VALUES (?, ?, ?)
`,
)
.bind(
userId,
input.email,
passwordHash,
)
.run()
return {
accessToken,
refreshToken,
}


}


export const loginUser = async (
env: Bindings,
input: LoginInput,
) => {

const user = await env.DB
.prepare(
`
SELECT *
FROM users
WHERE email = ?
`,
)
.bind(input.email)
.first<User>()
if (!user) {
throw new Error(
'Invalid credentials',
)
}

const validPassword =
await comparePassword(
input.password,
user.password_hash,
)

if (!validPassword) {
throw new Error(
'Invalid credentials',
)
}

const accessToken =await signAccessToken(
user.id,
env.JWT_ACCESS_SECRET,
)

const refreshToken =await signRefreshToken(
user.id,
env.JWT_REFRESH_SECRET,
)
await env.KV.put(
`refresh:${user.id}`,
refreshToken,
{
expirationTtl:
7 * 24 * 60 * 60,
},
)
return {
accessToken,
refreshToken,
}

}

export const refreshAccessToken =
async (
env: Bindings,
refreshToken: string,
) => {

const payload =await verifyRefreshToken(
refreshToken,
env.JWT_REFRESH_SECRET,
)

const stored =
await env.KV.get(
`refresh:${payload.userId}`,
)

if (
!stored ||
stored !== refreshToken
) {
throw new Error(
    'Invalid refresh token',
)
}
const accessToken = await signAccessToken(
payload.userId,
env.JWT_ACCESS_SECRET,
)
return {
accessToken,
}


}


export const logoutUser =
async (
env: Bindings,
userId: string,
) => {
await env.KV.delete(
    `refresh:${userId}`,
    )
    return {
    success: true,
    }

}

// eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxNDgzODVkNS01ZTAyLTRhZGMtYTljYy01MjM3OTYwZmQyYjAiLCJleHAiOjE3ODExODM2MzR9.33BRy9ymKTQ0Wo7Ymk27m4FRVoLIYADz1gv7xPi39DM
