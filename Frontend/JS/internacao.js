document.addEventListener("DOMContentLoaded", () => {
  carregarInternados();

  const buscaInput = document.getElementById("buscaInternacao");
  if (buscaInput) {
    // Adiciona um "debounce" para não fazer requisições a cada tecla digitada
    let debounceTimer;
    buscaInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        carregarInternados();
      }, 300);
    });
  }
});

async function carregarInternados() {
  const tbody = document.getElementById("tbody-internacao");
  const termoBusca = document.getElementById("buscaInternacao").value;

  tbody.innerHTML =
    '<tr><td colspan="5" class="loading-message">Carregando...</td></tr>';

  try {
    const url = termoBusca
      ? `/internacoes?q=${encodeURIComponent(termoBusca)}`
      : "/internacoes";
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }

    const internados = await response.json();
    tbody.innerHTML = "";

    if (internados.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="empty-message">Nenhum animal internado.</td></tr>';
      return;
    }

    internados.forEach((atendimento) => {
      const tr = document.createElement("tr");
      const dataEntrada = new Date(atendimento.data_hora).toLocaleString(
        "pt-BR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      );

      tr.innerHTML = `
        <td>${atendimento.animal_nome || "Não informado"}</td>
        <td>${atendimento.tutor_nome || "Não informado"}</td>
        <td>${dataEntrada}</td>
        <td>${atendimento.veterinario_nome || "Não definido"}</td>
        <td>
          <button class="btn-icon" onclick="window.location.href='prescricao.html?id=${atendimento.id}'" title="Ver Prontuário">
            📄
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar animais internados:", error);
    tbody.innerHTML =
      '<tr><td colspan="5" class="error-message">Falha ao carregar dados.</td></tr>';
  }
}
