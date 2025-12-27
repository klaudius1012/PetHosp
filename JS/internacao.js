document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tbody-atendimento");
  const busca = document.getElementById("buscaAtendimento");

  const paginator = new Paginator(5, carregarAtendimentos);

  // Evento: Busca
  if (busca) {
    busca.addEventListener("input", () => {
      paginator.reset();
      carregarAtendimentos();
    });
  }

  // Evento: Clique na tabela (Finalizar Atendimento)
  tbody.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("btn-finalizar")) {
      const id = e.target.getAttribute("data-id");
      if (confirm("Deseja finalizar o atendimento? O paciente sairá da lista de pendentes.")) {
        const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
        const index = atendimentos.findIndex((a) => a.id === id);

        if (index !== -1) {
          atendimentos[index].status = "Finalizado";
          localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
          alert("Atendimento finalizado com sucesso!");
          carregarAtendimentos();
        }
      }
    }
  });

  // Carregar dados ao iniciar
  carregarAtendimentos();

  function carregarAtendimentos() {
    const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
    const termo = busca ? busca.value.toLowerCase() : "";

    tbody.innerHTML = "";

    const filtrados = atendimentos.filter(
      (a) =>
        (a.status === "Aguardando" || a.status === "Em Atendimento") &&
        ((a.tutor && a.tutor.toLowerCase().includes(termo)) ||
          (a.animal && a.animal.toLowerCase().includes(termo)) ||
          (a.veterinario && a.veterinario.toLowerCase().includes(termo)))
    );

    if (filtrados.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;">Nenhum atendimento encontrado.</td></tr>';
      return;
    }

    // Ordenar por data/hora decrescente
    filtrados.sort((a, b) => b.dataHora.localeCompare(a.dataHora));

    const { data, totalPages } = paginator.paginate(filtrados);

    data.forEach((a) => {
      const [dataStr, horaStr] = (a.dataHora || "T").split("T");
      const tr = document.createElement("tr");

      if (a.prioridade === "Emergência") {
        tr.classList.add("row-emergencia");
      }

      const prioridadeClass =
        a.prioridade === "Emergência" ? "text-emergencia" : "";

      tr.innerHTML = `
        <td>${dataStr.split("-").reverse().join("/")} ${horaStr}</td>
        <td>${a.tutor}</td>
        <td>${a.animal}</td>
        <td>${a.veterinario}</td>
        <td class="${prioridadeClass}">${a.prioridade || "-"}</td>
        <td>${a.status}</td>
        <td>
          <button class="btn-editar" onclick="window.location.href='prescricao.html?id=${a.id}'">Prescrever</button>
          <button class="btn-finalizar" data-id="${a.id}">Finalizar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    paginator.renderControls("pagination", totalPages);
  }
});
