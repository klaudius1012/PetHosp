document.addEventListener("DOMContentLoaded", () => {
  // 1. Capturar ID do Atendimento da URL
  const urlParams = new URLSearchParams(window.location.search);
  const atendimentoId = urlParams.get("id");

  // Referências aos elementos do DOM (Cabeçalho)
  const elNome = document.getElementById("headerAnimalNome");
  const elIdade = document.getElementById("headerAnimalIdade");
  const elPeso = document.getElementById("headerPeso");
  const elTemp = document.getElementById("headerTemp");
  const elAlergias = document.getElementById("headerAlergias");
  const tbody = document.getElementById("tbody-prescricao");

  // 2. Carregar dados do LocalStorage
  const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
  const animais = JSON.parse(localStorage.getItem("animais")) || [];
  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];

  // 3. Buscar o Atendimento específico
  const atendimento = atendimentos.find((a) => a.id === atendimentoId);

  if (atendimento) {
    // --- Preencher Cabeçalho ---
    elNome.textContent = atendimento.animal;
    elPeso.textContent = atendimento.peso || "--";
    elTemp.textContent = atendimento.temperatura || "--";

    // Tratamento de Alergias (Destaque visual)
    if (atendimento.alergias && atendimento.alergias.trim() !== "") {
      elAlergias.textContent = atendimento.alergias;
      elAlergias.style.color = "#dc2626"; // Vermelho alerta
      elAlergias.style.fontWeight = "bold";
    } else {
      elAlergias.textContent = "Nenhuma";
      elAlergias.style.color = "inherit";
    }

    // --- Calcular Idade ---
    // Tenta encontrar o cadastro completo do animal para pegar a data de nascimento
    // O sistema salva o nome do tutor no atendimento, usamos isso para filtrar se houver nomes de pets duplicados
    let animalCadastro = null;
    const tutorEncontrado = tutores.find((t) => t.nome === atendimento.tutor);

    if (tutorEncontrado) {
      animalCadastro = animais.find(
        (a) => a.nome === atendimento.animal && a.tutorId == tutorEncontrado.id
      );
    }

    if (!animalCadastro) {
      animalCadastro = animais.find((a) => a.nome === atendimento.animal); // Fallback apenas pelo nome
    }

    if (animalCadastro && animalCadastro.nascimento) {
      // Usa a data do atendimento como referência para o cálculo da idade
      const dataReferencia = atendimento.dataHora
        ? new Date(atendimento.dataHora)
        : new Date();
      elIdade.textContent = `Idade: ${calcularIdade(
        animalCadastro.nascimento,
        dataReferencia
      )}`;
    } else {
      elIdade.textContent = "Idade: --";
    }

    // --- Atualizar Botão de Nova Prescrição ---
    // Passa o ID do atendimento para a próxima tela
    const btnNova = document.querySelector(".btn-primary");
    if (btnNova) {
      btnNova.onclick = () => {
        window.location.href = `nova-prescricao.html?id=${atendimentoId}`;
      };
    }

    // --- Carregar Histórico de Prescrições (Placeholder) ---
    carregarHistoricoPrescricoes(atendimentoId);
  } else {
    // Caso não encontre o atendimento (acesso direto sem ID ou ID inválido)
    elNome.textContent = "Atendimento não selecionado";
    elIdade.textContent = "";
    tbody.innerHTML =
      '<tr><td colspan="3" style="text-align:center">Nenhum atendimento selecionado. Volte para a Internação ou Recepção.</td></tr>';
  }
});

// Função auxiliar para calcular idade
function calcularIdade(dataNasc, dataReferencia = new Date()) {
  const hoje = dataReferencia;
  const nasc = new Date(dataNasc);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();

  // Ajuste se ainda não fez aniversário este ano
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }

  // Se for filhote (menos de 1 ano), mostra em meses
  if (idade === 0) {
    let meses =
      (hoje.getFullYear() - nasc.getFullYear()) * 12 +
      (hoje.getMonth() - nasc.getMonth());
    if (hoje.getDate() < nasc.getDate()) meses--;
    return `${meses} meses`;
  }

  return `${idade} anos`;
}

function carregarHistoricoPrescricoes(id) {
  const tbody = document.getElementById("tbody-prescricao");
  // Futuramente aqui buscaremos do localStorage 'prescricoes' filtrando pelo id do atendimento
  tbody.innerHTML = `
    <tr><td colspan="3" style="text-align:center; color: #666; padding: 2rem;">Nenhuma prescrição registrada ainda.</td></tr>
  `;
}
