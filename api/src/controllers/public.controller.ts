import type { Bindings } from '../types'
import type { SubmitResponseInput } from '../types/surverys/types'

//Get a survey by slug
export const getPublicSurvey = async (env: Bindings, slug: string) => {
    const survey = await env.DB
    .prepare('SELECT * FROM surveys WHERE slug = ?')
    .bind(slug)
    .first<Record<string, unknown>>()

if (!survey) throw new Error('Survey not found')

    const { results: questions } = await env.DB
    .prepare('SELECT * FROM questions WHERE survey_id = ? ORDER BY position ASC')
    .bind(survey.id)
    .all()


    const { user_id, ...publicFields } = survey

    return { ...publicFields, questions }
}

export const submitResponse = async (
  env: Bindings,
  slug: string,
  input: SubmitResponseInput,
) => {
    const survey = await env.DB
    .prepare('SELECT id FROM surveys WHERE slug = ?')
    .bind(slug)
    .first<{ id: string }>()

    if (!survey) throw new Error('Survey not found')

    if (!input.answers || input.answers.length === 0) {
        throw new Error('At least one answer is required')
    }

    const responseId = crypto.randomUUID()    

    await env.DB
        .prepare('INSERT INTO responses (id, survey_id) VALUES (?, ?)')
        .bind(responseId, survey.id)
        .run()

    await env.DB.batch(
        input.answers.map((a) =>
        env.DB
            .prepare('INSERT INTO answers (id, response_id, question_id, value) VALUES (?, ?, ?, ?)')
            .bind(crypto.randomUUID(), responseId, a.question_id, a.value),
        ),
    )

    return { success: true, response_id: responseId }
}