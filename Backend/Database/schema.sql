-- Tabela de Usuários (Login)
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin'
);

-- Tabela de Veterinários
CREATE TABLE IF NOT EXISTS veterinarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    crmv TEXT,
    telefone TEXT,
    email TEXT,
    especialidade TEXT
);

-- Tabela de Tutores
CREATE TABLE IF NOT EXISTS tutores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT
);

-- Tabela de Animais
CREATE TABLE IF NOT EXISTS animais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    especie TEXT,
    raca TEXT,
    nascimento TEXT,
    peso REAL,
    alergias TEXT,
    vacinacao TEXT,
    tutor_id INTEGER NOT NULL,
    FOREIGN KEY (tutor_id) REFERENCES tutores (id)
);

-- Tabela de Atendimentos
CREATE TABLE IF NOT EXISTS atendimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER NOT NULL,
    tutor_id INTEGER NOT NULL,
    veterinario_id INTEGER,
    data_hora TEXT,
    peso REAL,
    temperatura REAL,
    frequencia_cardiaca TEXT,
    frequencia_respiratoria TEXT,
    tpc TEXT,
    mucosas TEXT,
    hidratacao TEXT,
    consciencia TEXT,
    queixa TEXT,
    observacoes TEXT,
    status TEXT DEFAULT 'Aguardando',
    prioridade TEXT,
    alergias TEXT,
    vacinacao TEXT,
    ambiente TEXT,
    alimentacao TEXT,
    FOREIGN KEY (animal_id) REFERENCES animais (id),
    FOREIGN KEY (tutor_id) REFERENCES tutores (id),
    FOREIGN KEY (veterinario_id) REFERENCES veterinarios (id)
);

-- Tabelas Associadas ao Atendimento
CREATE TABLE IF NOT EXISTS evolucoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    atendimento_id INTEGER NOT NULL,
    data_hora TEXT,
    descricao TEXT,
    FOREIGN KEY (atendimento_id) REFERENCES atendimentos (id)
);

CREATE TABLE IF NOT EXISTS exames (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    atendimento_id INTEGER NOT NULL,
    tipo TEXT,
    prioridade TEXT,
    indicacao TEXT,
    FOREIGN KEY (atendimento_id) REFERENCES atendimentos (id)
);

CREATE TABLE IF NOT EXISTS procedimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    atendimento_id INTEGER NOT NULL,
    nome TEXT,
    detalhes TEXT,
    FOREIGN KEY (atendimento_id) REFERENCES atendimentos (id)
);

CREATE TABLE IF NOT EXISTS afericoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    atendimento_id INTEGER NOT NULL,
    data_hora TEXT,
    temperatura REAL,
    fc TEXT,
    fr TEXT,
    FOREIGN KEY (atendimento_id) REFERENCES atendimentos (id)
);

-- Financeiro
CREATE TABLE IF NOT EXISTS lancamentos_financeiros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    valor REAL NOT NULL,
    tipo TEXT NOT NULL, -- Receita ou Despesa
    data TEXT NOT NULL,
    categoria TEXT,
    status TEXT
);

-- Prescrições
CREATE TABLE IF NOT EXISTS prescricoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    atendimento_id INTEGER NOT NULL,
    data TEXT,
    observacoes TEXT,
    medicamentos TEXT, -- Armazenado como JSON string
    FOREIGN KEY (atendimento_id) REFERENCES atendimentos (id)
);

CREATE TABLE IF NOT EXISTS kits_prescricao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    medicamentos TEXT -- Armazenado como JSON string
);