-- Wordle Forense — schema + seed
-- INTENCIONALMENTE INSEGURO (aula de computação forense).
-- Senhas em texto plano de propósito: o SQLi do login deixa a credencial
-- literal no log do Postgres (log_statement=all).

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(20) NOT NULL
);

CREATE TABLE words (
    id SERIAL PRIMARY KEY,
    word VARCHAR(5) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE game_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    word_id INTEGER NOT NULL REFERENCES words(id),
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMP
);

CREATE TABLE attempts (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES game_sessions(id),
    guess VARCHAR(5) NOT NULL,
    result VARCHAR(5) NOT NULL,
    attempt_number INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed de usuários (senha em texto plano — só para fins didáticos)
INSERT INTO users (username, password, email, role) VALUES
    ('admin',  'admin123', 'admin@forense.edu',  'ADMIN'),
    ('aluno1', 'senha123', 'aluno1@forense.edu', 'USER'),
    ('aluno2', 'senha456', 'aluno2@forense.edu', 'USER'),
    ('aluno3', 'senha789', 'aluno3@forense.edu', 'USER');

-- Palavras de 5 letras em português (maiúsculas, sem acento — simplifica o jogo)
INSERT INTO words (word, difficulty, active) VALUES
    ('CASAS', 'FACIL',   TRUE),
    ('LIVRO', 'FACIL',   TRUE),
    ('PRAIA', 'FACIL',   TRUE),
    ('MUNDO', 'FACIL',   TRUE),
    ('FELIZ', 'FACIL',   TRUE),
    ('JOGAR', 'MEDIO',   TRUE),
    ('TEMPO', 'MEDIO',   TRUE),
    ('NOITE', 'MEDIO',   TRUE),
    ('VERDE', 'MEDIO',   TRUE),
    ('FORTE', 'MEDIO',   TRUE),
    ('PLANO', 'MEDIO',   TRUE),
    ('TERRA', 'MEDIO',   TRUE),
    ('VENTO', 'DIFICIL', TRUE),
    ('PEDRA', 'DIFICIL', TRUE),
    ('SONHO', 'DIFICIL', TRUE);
