document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const atendimentoId = params.get("id");

  if (!atendimentoId) {
    alert("Nenhum atendimento selecionado.");
    window.location.href = "internacao.html";
    return;
  }

  // Atualiza os links dos botões de ação para manter o ID do atendimento
  atualizarLinksAcao(atendimentoId);

  carregarHistoricoPrescricoes(atendimentoId);
});

function atualizarLinksAcao(id) {
  const buttons = document.querySelectorAll(".actions-container button");
  buttons.forEach((btn) => {
    const onclick = btn.getAttribute("onclick");
    if (onclick && onclick.includes("window.location.href")) {
      // Garante que o ID seja passado corretamente na navegação
      // O HTML já tem + window.location.search, então isso é apenas um reforço se necessário
    }
    // Para o botão "Nova Prescrição" específico que pode não ter o search
    if (btn.textContent.includes("Nova Prescrição")) {
      btn.onclick = () =>
        (window.location.href = `nova-prescricao.html?id=${id}`);
    }
  });
}

function carregarHistoricoPrescricoes(atendimentoId) {
  const tbody = document.getElementById("tbody-prescricao");
  const prescricoes = JSON.parse(localStorage.getItem("prescricoes")) || [];

  // Filtrar por atendimento
  const lista = prescricoes.filter((p) => p.atendimentoId === atendimentoId);

  tbody.innerHTML = "";

  if (lista.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="empty-message">Nenhuma prescrição registrada.</td></tr>';
    return;
  }

  // Ordenar por data (mais recente primeiro)
  lista.sort((a, b) => new Date(b.data) - new Date(a.data));

  lista.forEach((p) => {
    const tr = document.createElement("tr");
    const dataFormatada = new Date(p.data).toLocaleString();

    // Resumo dos medicamentos (primeiros 2 ou 3)
    const resumoMedicamentos = p.medicamentos
      .map((m) => `${m.nome} (${m.dose})`)
      .join(", ");

    tr.innerHTML = `
      <td>${dataFormatada}</td>
      <td>${resumoMedicamentos}</td>
      <td>${p.veterinario || "--"}</td>
      <td>
        <button class="btn-imprimir" title="Imprimir" onclick="alert('Funcionalidade de impressão em desenvolvimento para ID: ${
          p.id
        }')">🖨️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
