export type Survey = {
id: string
user_id: string
title: string
description: string
slug: string
brand_color: string
brand_logo_url: string
created_at: string
updated_at: string
}

export type Question = {
id: string
survey_id: string
type: 'short_text' | 'long_text' | 'multiple_choice' | 'rating'
label: string
options: string   
required: number  
position: number
}

export type SurveyResponse = {
id: string
survey_id: string
submitted_at: string
}

export type Answer = {
id: string
response_id: string
question_id: string
value: string
}

export type CreateSurveyInput = {
title: string
}

export type UpdateSurveyInput = {
title?: string
description?: string
brand_color?: string
brand_logo_url?: string
}

export type CreateQuestionInput = {
type: Question['type']
label: string
options?: string[]
required?: boolean
}

export type UpdateQuestionInput = {
label?: string
options?: string[]
required?: boolean
}

export type SubmitResponseInput = {
answers: { question_id: string; value: string }[]
}