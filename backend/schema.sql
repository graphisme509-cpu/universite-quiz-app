-- Tables unifiées : users (comptes + xp/badges), resultats (notes), quizzes/questions/scores/sessions (quiz + feedback), badges/user_badges (dashboard)

-- Users (inscription/connexion + xp pour dashboard)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verify_token TEXT,
    email_verify_expires TIMESTAMPTZ,
    xp INTEGER DEFAULT 0,  -- Pour progression
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

-- Refresh tokens (auth scalable)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    token TEXT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Résultats/Notes (ex-sqlite, unifié avec user_id pour auth)
CREATE TABLE IF NOT EXISTS resultats (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    code_etudiant TEXT NOT NULL UNIQUE,
    math DECIMAL(5,2) NOT NULL DEFAULT 0,
    physique DECIMAL(5,2) NOT NULL DEFAULT 0,
    info DECIMAL(5,2) NOT NULL DEFAULT 0,
    moyenne DECIMAL(5,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_resultats_user ON resultats(user_id);
CREATE INDEX idx_resultats_code ON resultats(code_etudiant);

-- Quizzes/Questions (quiz + explications pour feedback)
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    matiere TEXT NOT NULL,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_quizzes_matiere ON quizzes(matiere);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,  -- [{text: "..."}, ...]
    correct_index INTEGER NOT NULL,  -- Index de la bonne réponse
    explanation TEXT  -- Pour feedback
);

-- Scores/Sessions (quiz + temps/feedback scalable)
CREATE TABLE IF NOT EXISTS scores (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_scores_user_quiz ON scores(user_id, quiz_id);  -- Scalable pour 1000+ users

CREATE TABLE IF NOT EXISTS quiz_sessions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL,
    correct BOOLEAN NOT NULL,
    completion_time INTEGER NOT NULL,  -- secondes
    completed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_quiz ON quiz_sessions(quiz_id);

-- Badges/Gamification (dashboard)
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'fas fa-medal'
);

CREATE TABLE IF NOT EXISTS user_badges (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- Données initiales (exemples)
INSERT INTO badges (name, description) VALUES
('Débutant', 'Premier quiz complété'),
('Maître Maths', '100% sur 5 quiz maths'),
('Expert', 'Niveau 5 atteint') ON CONFLICT DO NOTHING;

-- Exemples users/notes/quizzes (pour test)
INSERT INTO users (name, email, password_hash, email_verified) VALUES
('Test User', 'test@example.com', '$2b$12$examplehash', TRUE) ON CONFLICT DO NOTHING;

INSERT INTO resultats (user_id, code_etudiant, math, physique, info, moyenne) VALUES
((SELECT id FROM users WHERE email='test@example.com'), 'ABC123', 15.00, 12.00, 18.00, 15.00) ON CONFLICT DO NOTHING;

INSERT INTO quizzes (name, matiere) VALUES ('Quiz Maths', 'maths'), ('Quiz Histoire', 'histoire') ON CONFLICT DO NOTHING;

-- Triggers pour auto-XP/badges (scalabilité auto)
CREATE OR REPLACE FUNCTION award_xp() RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET xp = xp + (NEW.score * 10) WHERE id = NEW.user_id;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trig_award_xp AFTER INSERT OR UPDATE ON scores FOR EACH ROW EXECUTE FUNCTION award_xp();

-- Sécurité : Revoke public access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
