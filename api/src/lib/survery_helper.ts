import type { Bindings } from '../types'
import type { Survey } from '../types/surverys/types'

//(slug + random suffix) 
export const makeSlug = (title: string): string => {
    const base = title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 32)

    const suffix = crypto.randomUUID().slice(0, 6)
    return `${base}-${suffix}`
    }


export const getOwnedSurvey = async (
    env: Bindings,
    surveyId: string,
    userId: string,
    ): Promise<Survey | null> => {
    const survey = await env.DB
        .prepare('SELECT * FROM surveys WHERE id = ? AND user_id = ?')
        .bind(surveyId, userId)
        .first<Survey>()

    return survey ?? null
}