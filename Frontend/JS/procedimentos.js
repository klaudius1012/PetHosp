document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const atendimentoId = params.get("id");

  if (!atendimentoId) {
    alert("Atendimento não identificado.");
    window.location.href = "internacao.html";
    return;
  }

  const form = document.getElementById("formProcedimento");
  const inputNome = document.getElementById("nomeProcedimento");
  const inputData = document.getElementById("dataProcedimento");
  const inputHora = document.getElementById("horaProcedimento");
  const inputDetalhes = document.getElementById("detalhesProcedimento");
  const listaContainer = document.getElementById("listaProcedimentos");

  // Define data e hora atuais como padrão
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  inputData.value = agora.toISOString().slice(0, 10);
  inputHora.value = agora.toISOString().slice(11, 16);

  // Carrega histórico
  carregarProcedimentos();

  // Evento de Salvar
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    salvarProcedimento();
  });

  function salvarProcedimento() {
    const nome = inputNome.value.trim();
    if (!nome) {
      alert("Informe o nome do procedimento.");
      return;
    }

    const novoProcedimento = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      atendimentoId: atendimentoId,
      nome: nome,
      data: inputData.value,
      hora: inputHora.value,
      detalhes: inputDetalhes.value.trim(),
      dataRegistro: new Date().toISOString(),
    };

    const procedimentos =
      JSON.parse(localStorage.getItem("procedimentos")) || [];
    procedimentos.push(novoProcedimento);
    localStorage.setItem("procedimentos", JSON.stringify(procedimentos));

    alert("Procedimento registrado com sucesso!");
    inputNome.value = "";
    inputDetalhes.value = "";
    carregarProcedimentos();
  }

  function carregarProcedimentos() {
    const procedimentos =
      JSON.parse(localStorage.getItem("procedimentos")) || [];
    const lista = procedimentos.filter(
      (p) => p.atendimentoId === atendimentoId
    );

    // Ordenar: mais recente primeiro
    lista.sort((a, b) => {
      const dtA = new Date(`${a.data}T${a.hora}`);
      const dtB = new Date(`${b.data}T${b.hora}`);
      return dtB - dtA;
    });

    listaContainer.innerHTML = "";

    if (lista.length === 0) {
      listaContainer.innerHTML =
        '<p style="text-align:center; color:#666; padding: 1rem;">Nenhum procedimento registrado.</p>';
      return;
    }

    lista.forEach((proc) => {
      const card = document.createElement("div");
      card.style.cssText =
        "background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border-left: 4px solid #0f766e;";

      const dataFormatada = new Date(proc.data).toLocaleDateString();

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">
          <strong style="color: #0f766e; font-size: 1.1rem;">${
            proc.nome
          }</strong>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 0.85rem; color: #666;">${dataFormatada} às ${
        proc.hora
      }</span>
            <button onclick="excluirProcedimento('${
              proc.id
            }')" title="Excluir" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">🗑️</button>
          </div>
        </div>
        <div style="color: #374151; line-height: 1.5;">${
          proc.detalhes || "<em>Sem detalhes adicionais.</em>"
        }</div>
      `;
      listaContainer.appendChild(card);
    });
  }

  window.excluirProcedimento = function (id) {
    if (confirm("Tem certeza que deseja excluir este procedimento?")) {
      let procedimentos =
        JSON.parse(localStorage.getItem("procedimentos")) || [];
      procedimentos = procedimentos.filter((p) => p.id !== id);
      localStorage.setItem("procedimentos", JSON.stringify(procedimentos));
      carregarProcedimentos();
    }
  };
});
