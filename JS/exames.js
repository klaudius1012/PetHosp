document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const atendimentoId = params.get("id");

  if (!atendimentoId) {
    alert("Atendimento não identificado.");
    window.location.href = "home.html";
    return;
  }

  carregarHistorico(atendimentoId);
  configurarFormulario(atendimentoId);
});

function configurarFormulario(atendimentoId) {
  const form = document.getElementById("formExame");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const tipo = document.getElementById("tipoExame").value;
    const prioridade = document.getElementById("prioridadeExame").value;
    const indicacao = document.getElementById("indicacaoClinica").value;

    const novoExame = {
      id: Date.now().toString(),
      atendimentoId: atendimentoId,
      tipo: tipo,
      prioridade: prioridade,
      indicacao: indicacao,
      dataSolicitacao: new Date().toISOString(),
      status: "Solicitado",
    };

    const exames = JSON.parse(localStorage.getItem("exames")) || [];
    exames.push(novoExame);
    localStorage.setItem("exames", JSON.stringify(exames));

    alert("Exame solicitado com sucesso!");
    form.reset();
    carregarHistorico(atendimentoId);
  });
}

function carregarHistorico(atendimentoId) {
  const exames = JSON.parse(localStorage.getItem("exames")) || [];
  const container = document.getElementById("listaExames");

  const historico = exames
    .filter((e) => e.atendimentoId === atendimentoId)
    .sort((a, b) => new Date(b.dataSolicitacao) - new Date(a.dataSolicitacao));

  container.innerHTML = "";

  if (historico.length === 0) {
    container.innerHTML =
      "<p style='text-align:center; color:#666;'>Nenhum exame solicitado para este atendimento.</p>";
    return;
  }

  historico.forEach((ex) => {
    const card = document.createElement("div");
    card.className = "exame-card";
    const dataFormatada = new Date(ex.dataSolicitacao).toLocaleString("pt-BR");

    card.innerHTML = `
        <div class="exame-header">
            <span>${ex.tipo} (${ex.prioridade})</span>
            <span style="font-size: 0.85rem; font-weight: normal;">${dataFormatada}</span>
        </div>
        <div class="exame-desc"><strong>Indicação:</strong> ${ex.indicacao}</div>
        <div style="margin-top:0.5rem; font-size:0.85rem; color:#0f766e;">Status: ${ex.status}</div>
    `;
    container.appendChild(card);
  });
}
