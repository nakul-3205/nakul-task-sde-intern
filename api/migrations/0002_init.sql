CREATE TABLE surveys (
  id             TEXT    PRIMARY KEY,
  user_id        TEXT    NOT NULL REFERENCES users(id),
  title          TEXT    NOT NULL DEFAULT 'Untitled Survey',
  description    TEXT    NOT NULL DEFAULT '',
  slug           TEXT    UNIQUE NOT NULL,
  brand_color    TEXT    NOT NULL DEFAULT '#6366f1',
  brand_logo_url TEXT    NOT NULL DEFAULT '',
  created_at     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id         TEXT    PRIMARY KEY,
  survey_id  TEXT    NOT NULL REFERENCES surveys(id),
  type       TEXT    NOT NULL CHECK(type IN ('short_text','long_text','multiple_choice','rating')),
  label      TEXT    NOT NULL,
  options    TEXT    NOT NULL DEFAULT '[]',   
  required   INTEGER NOT NULL DEFAULT 0,      
  position   INTEGER NOT NULL DEFAULT 0       
);

CREATE TABLE responses (
  id           TEXT NOT NULL PRIMARY KEY,
  survey_id    TEXT NOT NULL REFERENCES surveys(id),
  submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE answers (
  id          TEXT NOT NULL PRIMARY KEY,
  response_id TEXT NOT NULL REFERENCES responses(id),
  question_id TEXT NOT NULL REFERENCES questions(id),
  value       TEXT NOT NULL
);

CREATE INDEX idx_surveys_slug ON surveys(slug);
CREATE INDEX idx_questions_survey ON questions(survey_id);
CREATE INDEX idx_responses_survey ON responses(survey_id);
CREATE INDEX idx_answers_response ON answers(response_id);