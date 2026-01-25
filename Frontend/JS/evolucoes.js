document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const atendimentoId = params.get("id");

  if (!atendimentoId) {
    alert("Nenhum atendimento selecionado.");
    window.location.href = "internacao.html";
    return;
  }

  // Carregar cabeçalho (reutilizando função se disponível ou implementando simples)
  carregarCabecalho(atendimentoId);
  carregarEvolucoes(atendimentoId);

  const btnSalvar = document.getElementById("btnSalvarEvolucao");
  if (btnSalvar) {
    btnSalvar.addEventListener("click", () => salvarEvolucao(atendimentoId));
  }
});

async function carregarCabecalho(id) {
  try {
    const response = await fetch(`/atendimentos/${id}`);
    if (response.ok) {
      const at = await response.json();
      document.getElementById("headerAnimalNome").textContent =
        at.animal_nome || at.animal;
      document.getElementById("headerTutor").textContent =
        at.tutor_nome || at.tutor;
    }
  } catch (e) {
    console.error("Erro ao carregar cabeçalho", e);
  }
}

async function carregarEvolucoes(atendimentoId) {
  const container = document.getElementById("lista-evolucoes");
  container.innerHTML = '<p style="text-align:center">Carregando...</p>';

  try {
    const response = await fetch(`/evolucoes?atendimento_id=${atendimentoId}`);
    const lista = await response.json();

    container.innerHTML = "";

    if (lista.length === 0) {
      container.innerHTML =
        '<p class="empty-message">Nenhuma evolução registrada.</p>';
      return;
    }

    lista.forEach((ev) => {
      const div = document.createElement("div");
      div.className = "evolucao-card"; // Assumindo classe CSS existente ou genérica
      div.style.border = "1px solid #ddd";
      div.style.padding = "15px";
      div.style.marginBottom = "10px";
      div.style.borderRadius = "8px";
      div.style.backgroundColor = "#fff";

      const dataFormatada = new Date(ev.data_hora).toLocaleString();

      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:#666; font-size:0.9em;">
            <span><strong>${dataFormatada}</strong></span>
            <span>${ev.veterinario_nome || "Veterinário"}</span>
        </div>
        <div style="font-weight:bold; color:#0f766e; margin-bottom:5px;">${ev.tipo}</div>
        <div style="white-space: pre-wrap;">${ev.descricao}</div>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    container.innerHTML =
      '<p style="color:red">Erro ao carregar evoluções.</p>';
  }
}

async function salvarEvolucao(atendimentoId) {
  const descricao = document.getElementById("descricaoEvolucao").value;
  const tipo = document.getElementById("tipoEvolucao").value;

  if (!descricao.trim()) {
    alert("Digite a descrição da evolução.");
    return;
  }

  try {
    const response = await fetch("/evolucoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ atendimento_id: atendimentoId, descricao, tipo }),
    });

    if (response.ok) {
      document.getElementById("descricaoEvolucao").value = "";
      carregarEvolucoes(atendimentoId);
    } else {
      alert("Erro ao salvar evolução.");
    }
  } catch (e) {
    console.error(e);
    alert("Erro de conexão.");
  }
}
