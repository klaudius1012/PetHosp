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
    // Estilos inline para garantir visual consistente
    card.style.cssText =
      "background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border-left: 4px solid #0f766e;";

    const dataFormatada = new Date(ex.dataSolicitacao).toLocaleString("pt-BR");

    card.innerHTML = `
        <div class="exame-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">
            <div>
                <strong style="color: #0f766e; font-size: 1.1rem;">${
                  ex.tipo
                }</strong>
                <span style="background-color: ${
                  ex.prioridade === "Urgência" ? "#fee2e2" : "#e0f2f1"
                }; color: ${
      ex.prioridade === "Urgência" ? "#dc2626" : "#0f766e"
    }; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; margin-left: 8px;">${
      ex.prioridade
    }</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 0.85rem; color: #666;">${dataFormatada}</span>
                <button onclick="excluirExame('${
                  ex.id
                }')" title="Excluir" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">🗑️</button>
            </div>
        </div>
        <div class="exame-desc" style="color: #374151; margin-bottom: 8px;"><strong>Indicação:</strong> ${
          ex.indicacao
        }</div>
        <div style="font-size:0.85rem; color:#6b7280;">Status: <span style="font-weight:bold;">${
          ex.status
        }</span></div>
    `;
    container.appendChild(card);
  });
}

window.excluirExame = function (id) {
  if (confirm("Tem certeza que deseja cancelar a solicitação deste exame?")) {
    let exames = JSON.parse(localStorage.getItem("exames")) || [];
    exames = exames.filter((e) => e.id !== id);
    localStorage.setItem("exames", JSON.stringify(exames));

    const params = new URLSearchParams(window.location.search);
    const atendimentoId = params.get("id");
    carregarHistorico(atendimentoId);
  }
};
