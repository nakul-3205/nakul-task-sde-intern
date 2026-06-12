import type { Bindings } from "../types";
import type { CreateSurveyInput, UpdateSurveyInput } from '../types/surverys/types'
import { makeSlug, getOwnedSurvey } from '../lib/survery_helper'

//list all surveys
export const listSurveys = async (env: Bindings, userId: string) => {
        const { results } = await env.DB
        .prepare('SELECT * FROM surveys WHERE user_id = ? ORDER BY created_at DESC')
        .bind(userId)
        .all()
    
        return results
}

//create a survey
export const createSurvey = async (
    env: Bindings,
    userId: string,
    input: CreateSurveyInput,
) => {
        if (!input.title?.trim()) {
        throw new Error('Title is required')
        }
    
        const id = crypto.randomUUID()
        const slug = makeSlug(input.title)
    
        await env.DB
        .prepare('INSERT INTO surveys (id, user_id, title, slug) VALUES (?, ?, ?, ?)')
        .bind(id, userId, input.title.trim(), slug)
        .run()
    
        const survey = await env.DB.prepare('SELECT * FROM surveys WHERE id = ?').bind(id).first()
        return survey
}

//get one survey
export const getSurvey = async (env: Bindings, surveyId: string, userId: string) => {
    const survey = await getOwnedSurvey(env, surveyId, userId)
    if (!survey) throw new Error('Survey not found')

        const { results: questions } = await env.DB
        .prepare('SELECT * FROM questions WHERE survey_id = ? ORDER BY position ASC')
        .bind(surveyId)
        .all()
    
        return { ...survey, questions }
}

//Update survey
export const updateSurvey = async (
    env: Bindings,
    surveyId: string,
    userId: string,
    input: UpdateSurveyInput,
    ) => {
    const survey = await getOwnedSurvey(env, surveyId, userId)
    if (!survey) throw new Error('Survey not found')

    await env.DB
        .prepare(`
        UPDATE surveys SET
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            brand_color = COALESCE(?, brand_color),
            brand_logo_url = COALESCE(?, brand_logo_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `)
        .bind(
        input.title ?? null,
        input.description ?? null,
        input.brand_color ?? null,
        input.brand_logo_url ?? null,
        surveyId,
        )
        .run()

    const updated = await env.DB.prepare('SELECT * FROM surveys WHERE id = ?').bind(surveyId).first()
    return updated
}

//delete survey
export const deleteSurvey = async (env: Bindings, surveyId: string, userId: string) => {
    const survey = await getOwnedSurvey(env, surveyId, userId)
    if (!survey) throw new Error('Survey not found')

        await env.DB.batch([
        env.DB.prepare(
            'DELETE FROM answers WHERE response_id IN (SELECT id FROM responses WHERE survey_id = ?)',
        ).bind(surveyId),
        env.DB.prepare('DELETE FROM responses WHERE survey_id = ?').bind(surveyId),
        env.DB.prepare('DELETE FROM questions WHERE survey_id = ?').bind(surveyId),
        env.DB.prepare('DELETE FROM surveys WHERE id = ?').bind(surveyId),
        ])
    
        return { success: true }
}

