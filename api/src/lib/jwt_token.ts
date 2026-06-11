import { SignJWT, jwtVerify } from 'jose'

export type TokenPayload = {
userId: string
}

export const signAccessToken = async (
userId: string,
secret: string,
) => {
return await new SignJWT({ userId })
.setProtectedHeader({ alg: 'HS256' })
.setExpirationTime('15m')
.sign(new TextEncoder().encode(secret))
}

export const signRefreshToken = async (
userId: string,
secret: string,
) => {
    
return await new SignJWT({ userId })
.setProtectedHeader({ alg: 'HS256' })
.setExpirationTime('7d')
.sign(new TextEncoder().encode(secret))
}

export const verifyAccessToken = async (
token: string,
secret: string,
): Promise<TokenPayload> => {
const { payload } = await jwtVerify(
token,
new TextEncoder().encode(secret),
)

return payload as TokenPayload
}

export const verifyRefreshToken = async (
token: string,
secret: string,
): Promise<TokenPayload> => {
const { payload } = await jwtVerify(
token,
new TextEncoder().encode(secret),
)

return payload as TokenPayload
}