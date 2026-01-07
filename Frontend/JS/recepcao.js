const paginator = new Paginator(5, carregarAtendimentos);

document.addEventListener("DOMContentLoaded", () => {
  // Funcionalidade do Menu Mobile
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.querySelector(".sidebar");
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // Filtro de busca
  const buscaInput = document.getElementById("buscaRecepcao");
  if (buscaInput) {
    buscaInput.addEventListener("input", () => {
      paginator.reset();
      carregarAtendimentos();
    });
  }

  // Filtro de Data
  const dataFiltro = document.getElementById("dataFiltro");
  if (dataFiltro) {
    dataFiltro.addEventListener("change", () => {
      paginator.reset();
      carregarAtendimentos();
    });
  }

  carregarAtendimentos();
});

function carregarAtendimentos() {
  const tbody = document.getElementById("tbody-recepcao");
  tbody.innerHTML = "";

  const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
  const buscaInput = document.getElementById("buscaRecepcao");
  const dataFiltro = document.getElementById("dataFiltro");

  const termo = buscaInput ? buscaInput.value.toLowerCase() : "";
  const dataSelecionada = dataFiltro ? dataFiltro.value : "";

  // Filtra:
  // - Se tem data selecionada: Mostra TUDO daquela data (Histórico)
  // - Se NÃO tem data: Mostra apenas pendentes (Fila de espera)
  const lista = atendimentos.filter((a) => {
    const dataAtendimento = a.dataHora ? a.dataHora.split("T")[0] : "";
    const matchData = !dataSelecionada || dataAtendimento === dataSelecionada;
    const isAberto = dataSelecionada
      ? true
      : ["Aguardando", "Em Atendimento"].includes(a.status);
    const matchBusca =
      (a.tutor && a.tutor.toLowerCase().includes(termo)) ||
      (a.animal && a.animal.toLowerCase().includes(termo));
    return isAberto && matchBusca && matchData;
  });

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-message">Nenhum atendimento aberto encontrado.</td></tr>`;
    return;
  }

  // Ordenar: Emergência primeiro, depois por hora
  lista.sort((a, b) => {
    if (a.prioridade === "Emergência" && b.prioridade !== "Emergência")
      return -1;
    if (a.prioridade !== "Emergência" && b.prioridade === "Emergência")
      return 1;
    return (a.dataHora || "").localeCompare(b.dataHora || "");
  });

  const { data, totalPages } = paginator.paginate(lista);

  data.forEach((a) => {
    const tr = document.createElement("tr");

    // Destaque visual para Emergência
    if (a.prioridade === "Emergência") {
      tr.classList.add("row-emergencia");
    }

    const hora = a.dataHora ? a.dataHora.split("T")[1] : "--:--";

    tr.innerHTML = `
      <td>${hora}</td>
      <td>${a.tutor}</td>
      <td>${a.animal}</td>
      <td>${a.veterinario || "A definir"}</td>
      <td class="${a.prioridade === "Emergência" ? "text-emergencia" : ""}">${
      a.prioridade
    }</td>
      <td>${a.status}</td>
      <td>
        <button class="btn-editar" onclick="window.location.href='editar-atendimento.html?id=${
          a.id
        }'">Editar</button>
        <button class="btn-finalizar" onclick="finalizarAtendimento('${
          a.id
        }')">Finalizar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  paginator.renderControls("pagination", totalPages);
}

window.finalizarAtendimento = function (id) {
  if (
    confirm("Deseja finalizar este atendimento? Ele sairá da lista de abertos.")
  ) {
    const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
    const index = atendimentos.findIndex((a) => a.id === id);
    if (index !== -1) {
      atendimentos[index].status = "Finalizado";
      localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
      carregarAtendimentos();
    }
  }
};
