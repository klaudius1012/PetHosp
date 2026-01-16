# PetClin - Sistema de Gestão Veterinária

O **PetClin** é uma aplicação web desenvolvida para auxiliar na gestão de clínicas veterinárias, focando no fluxo de atendimento, desde o cadastro de tutores e pets até a internação, evolução clínica e prescrição médica.

## 🚀 Funcionalidades Principais

### 1. Gestão de Cadastros
*   **Tutores:** Cadastro completo com validação de dados, listagem com paginação e busca rápida. Opção para gerar dados de teste automaticamente.
*   **Pacientes (Pets):**
    *   Vínculo automático com tutores.
    *   Cálculo dinâmico de idade (anos/meses).
    *   Upload e pré-visualização de fotos (armazenamento em Base64).
    *   **Histórico Médico:** Registro detalhado de vacinas (com alertas de vencimento) e alergias.

### 2. Recepção e Triagem
*   **Novo Atendimento:** Formulário de triagem completo.
*   **Alertas de Sinais Vitais:** O sistema analisa automaticamente os parâmetros inseridos (Temperatura, Frequência Cardíaca, Frequência Respiratória) e emite alertas visuais e pop-ups caso indiquem emergência (ex: febre alta, taquicardia/bradicardia específica por espécie).
*   **Priorização:** Sugestão automática de mudança de prioridade para "Emergência" baseada nos sinais vitais.

### 3. Internação e Monitoramento
*   **Painel de Controle:** Visualização clara dos pacientes aguardando ou em atendimento.
*   **Ordenação Inteligente:** Permite ordenar a lista por nome, tutor, veterinário ou idade.
*   **Indicadores Visuais:** Destaque para casos de emergência e status do atendimento.

### 4. Prontuário Eletrônico
*   **Evoluções Clínicas:** Registro cronológico da evolução do paciente com data e hora.
*   **Prescrição Médica:**
    *   Criação de receitas com múltiplos medicamentos.
    *   Funcionalidade de **Duplicar Prescrição** para agilizar atendimentos recorrentes.
    *   **Impressão:** Layout específico para impressão contendo dados do tutor, animal, medicamentos, evoluções recentes e exames.

### 5. Interface e Usabilidade
*   **Paginação:** Sistema genérico de paginação para tabelas longas.
*   **Feedback Visual:** Alertas piscantes para alergias críticas no cabeçalho do paciente.
*   **Responsividade:** Layout adaptável (HTML/CSS estruturado).

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+).
*   **Backend:** Node.js com Express (para servir a aplicação e APIs de persistência).
*   **Persistência de Dados:**
    *   Primária: `localStorage` (para agilidade e funcionamento offline/demo).
    *   Secundária: Endpoints no `server.js` preparados para salvar dados em arquivos JSON (`tutores.json`, `pet.json`).

## 📂 Estrutura de Arquivos Relevante

*   `Frontend/JS/server.js`: Servidor Express principal.
*   `Frontend/JS/internacao.js`: Lógica da lista de internação e paginação.
*   `Frontend/JS/novo-atendimento.js`: Lógica de triagem e validação de sinais vitais.
*   `Frontend/JS/pet.js`: Gestão do cadastro de animais e modais de vacinas/alergias.
*   `Frontend/JS/prescricao.js`: Gerenciamento e impressão de receitas médicas.
*   `Frontend/JS/shared.js`: Lógica compartilhada (cabeçalhos, alertas de triagem).

## ⚙️ Como Executar

### Pré-requisitos
*   Node.js instalado.

### Passo a Passo

1.  Navegue até a pasta raiz do projeto via terminal.
2.  Instale as dependências (caso ainda não tenha feito):
    ```bash
    npm install express
    ```
3.  Inicie o servidor:
    ```bash
    node Frontend/JS/server.js
    ```
4.  Acesse no navegador:
    *   **URL:** `http://localhost:3000/home.html`

## ⚠️ Notas de Desenvolvimento

*   **Validação de Febre:** O sistema alerta temperaturas acima de 39.5°C.
*   **Parâmetros Cardíacos:**
    *   Cães: Alerta se FC < 60 ou > 160 bpm.
    *   Gatos: Alerta se FC < 140 ou > 220 bpm.
*   **Armazenamento:** Atualmente, a aplicação faz uso intensivo do `localStorage` do navegador para manter o estado entre as páginas (Atendimentos, Animais, Tutores).
