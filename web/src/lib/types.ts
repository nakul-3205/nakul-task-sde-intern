export type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'rating'

export interface Question {
  id: string
  survey_id: string
  type: QuestionType
  label: string
  options: string | string[]
  required: number
  position: number
}

export interface Survey {
  id: string
  user_id?: string
  title: string
  description: string
  slug: string
  brand_color: string
  brand_logo_url: string
  created_at: string
  updated_at: string
}

export interface SurveyWithQuestions extends Survey {
  questions: Question[]
}

export interface SurveyResponse {
  id: string
  survey_id: string
  submitted_at: string
  answers: {
    id: string
    question_id: string
    value: string
    question_label: string
    question_type: QuestionType
  }[]
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: 'Short text',
  long_text: 'Long text',
  multiple_choice: 'Multiple choice',
  rating: 'Rating (1–5)',
}

export function parseOptions(opts: string | string[] | undefined): string[] {
  if (!opts) return []
  if (Array.isArray(opts)) return opts
  try { const v = JSON.parse(opts); return Array.isArray(v) ? v : [] } catch { return [] }
}
