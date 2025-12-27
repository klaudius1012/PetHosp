document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tbody-atendimento");
  const btnGerar = document.getElementById("btnGerarDados");
  const btnLimpar = document.getElementById("btnLimparDados");
  const busca = document.getElementById("buscaAtendimento");

  const paginator = new Paginator(5, carregarAtendimentos);

  // Evento: Gerar Dados de Teste
  if (btnGerar) {
    btnGerar.addEventListener("click", () => {
      const dadosTeste = [
        {
          id: "AT" + Date.now() + "1",
          dataHora: new Date().toISOString().split("T")[0] + "T09:00",
          tutor: "Ana Silva",
          animal: "Rex",
          veterinario: "Dr. Silva",
          status: "Concluído",
          prioridade: "Rotina",
        },
        {
          id: "AT" + Date.now() + "2",
          dataHora: new Date().toISOString().split("T")[0] + "T10:30",
          tutor: "Carlos Oliveira",
          animal: "Mia",
          veterinario: "Dra. Santos",
          status: "Em Atendimento",
          prioridade: "Urgência",
        },
      ];
      // Adiciona aos existentes
      const existentes = JSON.parse(localStorage.getItem("atendimentos")) || [];
      localStorage.setItem(
        "atendimentos",
        JSON.stringify([...existentes, ...dadosTeste])
      );
      carregarAtendimentos();
    });
  }

  // Evento: Limpar Dados
  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      if (
        confirm("Tem certeza que deseja apagar o histórico de atendimentos?")
      ) {
        localStorage.removeItem("atendimentos");
        carregarAtendimentos();
      }
    });
  }

  // Evento: Busca
  if (busca) {
    busca.addEventListener("input", () => {
      paginator.reset();
      carregarAtendimentos();
    });
  }

  // Carregar dados ao iniciar
  carregarAtendimentos();

  function carregarAtendimentos() {
    const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
    const termo = busca ? busca.value.toLowerCase() : "";

    tbody.innerHTML = "";

    const filtrados = atendimentos.filter(
      (a) =>
        (a.tutor && a.tutor.toLowerCase().includes(termo)) ||
        (a.animal && a.animal.toLowerCase().includes(termo)) ||
        (a.veterinario && a.veterinario.toLowerCase().includes(termo))
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
      tr.innerHTML = `
        <td>${dataStr.split("-").reverse().join("/")} ${horaStr}</td>
        <td>${a.tutor}</td>
        <td>${a.animal}</td>
        <td>${a.veterinario}</td>
        <td>${a.status}</td>
        <td>
          <button class="btn-icon" onclick="alert('Detalhes em desenvolvimento')" title="Ver Detalhes" style="cursor:pointer; border:none; background:transparent;">👁️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    paginator.renderControls("pagination", totalPages);
  }
});
