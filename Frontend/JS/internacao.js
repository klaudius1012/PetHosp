document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tbody-atendimento");
  const busca = document.getElementById("buscaAtendimento");

  const paginator = new Paginator(5, carregarAtendimentos);

  let currentSortColumn = "dataHora";
  let currentSortDirection = "desc";

  // Evento: Ordenação ao clicar no cabeçalho
  document.querySelectorAll("th[data-column]").forEach((th) => {
    th.addEventListener("click", () => {
      const column = th.getAttribute("data-column");
      if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
      } else {
        currentSortColumn = column;
        currentSortDirection = "asc";
      }
      carregarAtendimentos();
    });
  });

  // Evento: Busca
  if (busca) {
    busca.addEventListener("input", () => {
      paginator.reset();
      carregarAtendimentos();
    });
  }

  // Evento: Clique na tabela (Finalizar Atendimento)
  tbody.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("btn-editar")) {
      const id = e.target.getAttribute("data-id");
      const atendimentos =
        JSON.parse(localStorage.getItem("atendimentos")) || [];
      const index = atendimentos.findIndex((a) => a.id === id);

      if (index !== -1) {
        atendimentos[index].status = "Em Atendimento";
        localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
        window.location.href = `prescricao.html?id=${id}`;
      }
    }

    if (e.target && e.target.classList.contains("btn-finalizar")) {
      const id = e.target.getAttribute("data-id");
      if (
        confirm(
          "Deseja finalizar o atendimento? O paciente sairá da lista de pendentes."
        )
      ) {
        const atendimentos =
          JSON.parse(localStorage.getItem("atendimentos")) || [];
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
    const animais = JSON.parse(localStorage.getItem("animais")) || [];
    const tutores = JSON.parse(localStorage.getItem("tutores")) || [];
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
        '<tr><td colspan="8" style="text-align:center;">Nenhum atendimento encontrado.</td></tr>';
      return;
    }

    // Ordenação Dinâmica
    filtrados.sort((a, b) => {
      let valA, valB;

      if (currentSortColumn === "idade") {
        // Lógica específica para idade (baseada em data de nascimento)
        valA = getNascimento(a, animais, tutores);
        valB = getNascimento(b, animais, tutores);

        if (!valA && !valB) return 0;
        if (!valA) return 1;
        if (!valB) return -1;
      } else {
        valA = (a[currentSortColumn] || "").toString().toLowerCase();
        valB = (b[currentSortColumn] || "").toString().toLowerCase();
      }

      if (valA < valB) return currentSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return currentSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    // Atualizar indicadores visuais no cabeçalho
    document.querySelectorAll("th[data-column]").forEach((th) => {
      th.textContent = th.textContent.replace(" ▲", "").replace(" ▼", "");
      if (th.getAttribute("data-column") === currentSortColumn) {
        th.textContent += currentSortDirection === "asc" ? " ▲" : " ▼";
      }
    });

    const { data, totalPages } = paginator.paginate(filtrados);

    data.forEach((a) => {
      const [dataStr, horaStr] = (a.dataHora || "T").split("T");
      const tr = document.createElement("tr");

      // Calcular Idade
      let idadeStr = "--";
      const tutorEncontrado = tutores.find((t) => t.nome === a.tutor);
      let animalEncontrado = null;

      if (tutorEncontrado) {
        animalEncontrado = animais.find(
          (an) => an.nome === a.animal && an.tutorId == tutorEncontrado.id
        );
      }
      if (!animalEncontrado) {
        animalEncontrado = animais.find((an) => an.nome === a.animal);
      }
      if (animalEncontrado && animalEncontrado.nascimento) {
        idadeStr = calcularIdade(animalEncontrado.nascimento);
      }

      if (a.prioridade === "Emergência") {
        tr.classList.add("row-emergencia");
      }

      const prioridadeClass =
        a.prioridade === "Emergência" ? "text-emergencia" : "";

      tr.innerHTML = `
        <td>${dataStr.split("-").reverse().join("/")} ${horaStr}</td>
        <td>${a.tutor}</td>
        <td>${a.animal}</td>
        <td>${idadeStr}</td>
        <td>${a.veterinario}</td>
        <td class="${prioridadeClass}">${a.prioridade || "-"}</td>
        <td>${a.status}</td>
        <td>
          <button class="btn-editar" data-id="${a.id}">Prescrever</button>
          <button class="btn-finalizar" data-id="${a.id}">Finalizar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    paginator.renderControls("pagination", totalPages);
  }

  function calcularIdade(dataNasc) {
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }

    if (idade === 0) {
      let meses =
        (hoje.getFullYear() - nasc.getFullYear()) * 12 +
        (hoje.getMonth() - nasc.getMonth());
      if (hoje.getDate() < nasc.getDate()) meses--;
      return `${meses} meses`;
    }

    return `${idade} anos`;
  }

  function getNascimento(atendimento, animais, tutores) {
    const tutorEncontrado = tutores.find((t) => t.nome === atendimento.tutor);
    let animalEncontrado = null;

    if (tutorEncontrado) {
      animalEncontrado = animais.find(
        (an) =>
          an.nome === atendimento.animal && an.tutorId == tutorEncontrado.id
      );
    }
    if (!animalEncontrado) {
      animalEncontrado = animais.find((an) => an.nome === atendimento.animal);
    }
    return animalEncontrado ? animalEncontrado.nascimento : null;
  }
});
