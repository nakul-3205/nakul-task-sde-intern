import type { Bindings } from '../types'
import type { CreateQuestionInput, UpdateQuestionInput } from '../types/surverys/types'
import { getOwnedSurvey } from '../lib/survery_helper'


//add a question
export const addQuestion = async (
    env: Bindings,
    surveyId: string,
    userId: string,
    input: CreateQuestionInput,
    ) => {
        const survey = await getOwnedSurvey(env, surveyId, userId)
        if (!survey) throw new Error('Survey not found')
    
        if (!input.label?.trim()) throw new Error('Question label is required')
    
        const validTypes = ['short_text', 'long_text', 'multiple_choice', 'rating']
        if (!validTypes.includes(input.type)) throw new Error('Invalid question type')
    
        // Find current max position so this question goes at the end
        const maxRow = await env.DB
        .prepare('SELECT COALESCE(MAX(position), -1) AS max_pos FROM questions WHERE survey_id = ?')
        .bind(surveyId)
        .first<{ max_pos: number }>()
    
        const nextPosition = (maxRow?.max_pos ?? -1) + 1
        const id = crypto.randomUUID()
    
        await env.DB
        .prepare(`
            INSERT INTO questions (id, survey_id, type, label, options, required, position)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
            id,
            surveyId,
            input.type,
            input.label.trim(),
            JSON.stringify(input.options ?? []),
            input.required ? 1 : 0,
            nextPosition,
        )
        .run()
    
        const question = await env.DB.prepare('SELECT * FROM questions WHERE id = ?').bind(id).first()
        return question
}

//update a question
export const updateQuestion = async (
    env: Bindings,
    questionId: string,
    userId: string,
    input: UpdateQuestionInput,
    ) => {
        const owned = await env.DB
        .prepare(`
            SELECT q.id FROM questions q
            JOIN surveys s ON q.survey_id = s.id
            WHERE q.id = ? AND s.user_id = ?
        `)
        .bind(questionId, userId)
        .first()
    
        if (!owned) throw new Error('Question not found')
    
        await env.DB
        .prepare(`
            UPDATE questions SET
            label = COALESCE(?, label),
            options = COALESCE(?, options),
            required = COALESCE(?, required)
            WHERE id = ?
        `)
        .bind(
            input.label ?? null,
            input.options !== undefined ? JSON.stringify(input.options) : null,
            input.required !== undefined ? (input.required ? 1 : 0) : null,
            questionId,
        )
        .run()
    
        const updated = await env.DB.prepare('SELECT * FROM questions WHERE id = ?').bind(questionId).first()
        return updated
    }

//delete a question
export const deleteQuestion = async (env: Bindings, questionId: string, userId: string) => {
        const owned = await env.DB
        .prepare(`
        SELECT q.id FROM questions q
        JOIN surveys s ON q.survey_id = s.id
        WHERE q.id = ? AND s.user_id = ?
        `)
        .bind(questionId, userId)
        .first()
    
    if (!owned) throw new Error('Question not found')
    
    await env.DB.prepare('DELETE FROM questions WHERE id = ?').bind(questionId).run()
    return { success: true }
}


//reorderquestion
export const reorderQuestions = async (
    env: Bindings,
    surveyId: string,
    userId: string,
    order: string[],
) => {
    const survey = await getOwnedSurvey(env, surveyId, userId)
    if (!survey) throw new Error('Survey not found')

    if (!Array.isArray(order) || order.length === 0) {
        throw new Error('order must be a non-empty array of question IDs')
    }

    const { results: existing } = await env.DB
        .prepare('SELECT id FROM questions WHERE survey_id = ?')
        .bind(surveyId)
        .all<{ id: string }>()
    
    const existingIds = new Set(existing.map((q) => q.id))
    const orderIds = new Set(order)


    const sameSize = existingIds.size === orderIds.size
    const allMatch = order.every((id) => existingIds.has(id))

    if (!sameSize || !allMatch) {
        throw new Error('order must contain exactly the question IDs belonging to this survey')
    }

    await env.DB.batch(
      order.map((questionId, index) =>
        env.DB
          .prepare('UPDATE questions SET position = ? WHERE id = ? AND survey_id = ?')
          .bind(index, questionId, surveyId),
      ),
    )
  
    return { success: true }
  
}