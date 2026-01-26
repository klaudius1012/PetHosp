-- Tabela de Clínicas
CREATE TABLE IF NOT EXISTS clinicas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cnpj TEXT,
    endereco TEXT,
    telefone TEXT
);

-- Tabela de Usuários (Login)
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    role TEXT,
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

-- Tabela de Veterinários
CREATE TABLE IF NOT EXISTS veterinarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    crmv TEXT,
    telefone TEXT,
    email TEXT,
    especialidade TEXT,
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

-- Tabela de Tutores
CREATE TABLE IF NOT EXISTS tutores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    cpf TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

-- Tabela de Animais
CREATE TABLE IF NOT EXISTS animais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    tutor_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    especie TEXT,
    raca TEXT,
    sexo TEXT,
    nascimento TEXT,
    peso REAL,
    porte TEXT,
    condicao_reprodutiva TEXT,
    alergias TEXT,
    vacinacao TEXT,
    ambiente TEXT,
    alimentacao TEXT,
    observacoes TEXT,
    foto TEXT,
    FOREIGN KEY (tutor_id) REFERENCES tutores (id),
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

-- Tabela de Atendimentos
CREATE TABLE IF NOT EXISTS atendimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    animal_id INTEGER NOT NULL,
    tutor_id INTEGER NOT NULL,
    veterinario_id INTEGER,
    data_hora TEXT,
    status TEXT DEFAULT 'Aguardando',
    prioridade TEXT,
    queixa TEXT,
    peso REAL,
    temperatura REAL,
    frequencia_cardiaca TEXT,
    frequencia_respiratoria TEXT,
    tpc TEXT,
    mucosas TEXT,
    hidratacao TEXT,
    consciencia TEXT,
    observacoes TEXT,
    alergias TEXT,
    vacinacao TEXT,
    ambiente TEXT,
    alimentacao TEXT,
    FOREIGN KEY (animal_id) REFERENCES animais (id),
    FOREIGN KEY (tutor_id) REFERENCES tutores (id),
    FOREIGN KEY (veterinario_id) REFERENCES usuarios (id),
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    data TEXT,
    hora TEXT,
    tutor TEXT,
    telefone TEXT,
    animal TEXT,
    especie TEXT,
    veterinario TEXT,
    tipo TEXT,
    status TEXT,
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

-- Tabela de Evoluções
CREATE TABLE IF NOT EXISTS evolucoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    atendimento_id INTEGER NOT NULL,
    veterinario_id INTEGER,
    data_hora TEXT,
    descricao TEXT,
    tipo TEXT,
    FOREIGN KEY (atendimento_id) REFERENCES atendimentos (id),
    FOREIGN KEY (veterinario_id) REFERENCES usuarios (id),
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

-- Tabela de Produtos (Estoque)
CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    categoria TEXT,
    classe_terapeutica TEXT,
    principio_ativo TEXT,
    concentracao TEXT,
    unidade_medida TEXT,
    apresentacao TEXT,
    lote TEXT,
    validade DATE,
    estoque_atual REAL NOT NULL DEFAULT 0,
    estoque_minimo REAL NOT NULL DEFAULT 0,
    valor_custo REAL,
    valor_venda REAL,
    fornecedor TEXT,
    observacoes TEXT,
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

-- Tabela de Classes Terapêuticas
CREATE TABLE IF NOT EXISTS classes_terapeuticas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

-- Tabela de Lançamentos Financeiros
CREATE TABLE IF NOT EXISTS financeiro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    tipo TEXT NOT NULL, -- 'Receita' ou 'Despesa'
    categoria TEXT,
    descricao TEXT NOT NULL,
    valor REAL NOT NULL,
    data_vencimento DATE,
    data_pagamento DATE,
    status TEXT,
    metodo_pagamento TEXT,
    tutor_id INTEGER,
    atendimento_id INTEGER,
    observacoes TEXT,
    FOREIGN KEY (tutor_id) REFERENCES tutores (id),
    FOREIGN KEY (atendimento_id) REFERENCES atendimentos (id),
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

-- Tabela de Prescrições
CREATE TABLE IF NOT EXISTS prescricoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    atendimento_id INTEGER NOT NULL,
    veterinario_id INTEGER,
    data TEXT,
    observacoes TEXT,
    medicamentos TEXT, -- Armazenado como JSON string
    FOREIGN KEY (atendimento_id) REFERENCES atendimentos (id),
    FOREIGN KEY (veterinario_id) REFERENCES usuarios (id),
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

-- Tabela de Kits de Prescrição (Modelos)
CREATE TABLE IF NOT EXISTS prescricao_kits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    veterinario_id INTEGER, -- NULL para kits globais
    nome TEXT NOT NULL,
    medicamentos TEXT, -- Armazenado como JSON string
    FOREIGN KEY (veterinario_id) REFERENCES usuarios (id),
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

-- Outras tabelas do schema original que não têm rotas, mas podem ser úteis
CREATE TABLE IF NOT EXISTS exames (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    atendimento_id INTEGER NOT NULL,
    tipo TEXT,
    prioridade TEXT,
    indicacao TEXT,
    status TEXT,
    resultado TEXT,
    FOREIGN KEY (atendimento_id) REFERENCES atendimentos (id),
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

CREATE TABLE IF NOT EXISTS procedimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    atendimento_id INTEGER NOT NULL,
    nome TEXT,
    detalhes TEXT,
    FOREIGN KEY (atendimento_id) REFERENCES atendimentos (id),
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);

CREATE TABLE IF NOT EXISTS afericoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL,
    atendimento_id INTEGER NOT NULL,
    data_hora TEXT,
    temperatura REAL,
    fc TEXT,
    fr TEXT,
    pa_sistolica INTEGER,
    pa_diastolica INTEGER,
    glicemia INTEGER,
    mucosas TEXT,
    hidratacao TEXT,
    consciencia TEXT,
    urina TEXT,
    observacoes TEXT,
    FOREIGN KEY (atendimento_id) REFERENCES atendimentos (id),
    FOREIGN KEY (clinica_id) REFERENCES clinicas (id)
);