document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tbody-agenda");
  const btnGerar = document.getElementById("btnGerarAgendaTeste");
  const btnNovo = document.getElementById("btnNovoAgendamento");
  const modal = document.getElementById("modalAgendamento");
  const btnCancelar = document.getElementById("btnCancelarAgenda");
  const btnLimpar = document.getElementById("btnLimparAgenda");
  const form = document.getElementById("formAgendamento");
  const busca = document.getElementById("buscaAgenda");
  let idEdicao = null;

  const paginator = new Paginator(5, carregarAgenda);

  // Eventos
  if (btnGerar) btnGerar.addEventListener("click", gerarDadosTeste);

  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      if (confirm("Tem certeza que deseja limpar toda a agenda?")) {
        localStorage.removeItem("agenda");
        carregarAgenda();
      }
    });
  }

  if (btnNovo) {
    btnNovo.addEventListener("click", () => {
      idEdicao = null;
      document.querySelector("#modalAgendamento h2").textContent =
        "Novo Agendamento";
      form.reset();
      modal.classList.remove("hidden");
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      modal.classList.add("hidden");
      form.reset();
      idEdicao = null;
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      salvarAgendamento();
    });
  }

  if (busca) {
    busca.addEventListener("input", () => {
      paginator.reset();
      carregarAgenda();
    });
  }

  // Carregar dados iniciais por último para garantir que eventos funcionem
  carregarDatalists();
  carregarAgenda();

  // Função para carregar e renderizar a tabela
  function carregarAgenda() {
    const agenda = JSON.parse(localStorage.getItem("agenda")) || [];
    const termo = busca ? busca.value.toLowerCase() : "";

    tbody.innerHTML = "";

    const filtrados = agenda.filter((item) => {
      const tutor = item.tutor ? item.tutor.toLowerCase() : "";
      const animal = item.animal ? item.animal.toLowerCase() : "";
      return tutor.includes(termo) || animal.includes(termo);
    });

    if (filtrados.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" style="text-align:center;">Nenhum agendamento encontrado.</td></tr>';
      return;
    }

    // Ordenar por hora
    filtrados.sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));

    const { data, totalPages } = paginator.paginate(filtrados);

    data.forEach((item) => {
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";
      tr.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        editarAgendamento(item);
      });

      tr.innerHTML = `
        <td>${item.tutor}</td>
        <td>${item.telefone || "-"}</td>
        <td>${item.animal}</td>
        <td>${item.hora}</td>
        <td>${item.especie || "-"}</td>
        <td>${item.veterinario}</td>
        <td>${item.tipo}</td>
        <td>
          <button class="btn-icon" onclick="prepararEdicao('${
            item.id
          }')" title="Editar" style="cursor:pointer; border:none; background:transparent; margin-right: 5px;">✏️</button>
          <button class="btn-icon" onclick="excluirAgendamento('${
            item.id
          }')" title="Excluir" style="cursor:pointer; border:none; background:transparent;">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    paginator.renderControls("pagination", totalPages);
  }

  // Preparar modal para edição
  function editarAgendamento(item) {
    idEdicao = item.id;
    document.getElementById("agendaHora").value = item.hora;
    document.getElementById("agendaAnimal").value = item.animal;
    document.getElementById("agendaEspecie").value = item.especie || "";
    document.getElementById("agendaTutor").value = item.tutor;
    document.getElementById("agendaTelefone").value = item.telefone || "";
    document.getElementById("agendaVet").value = item.veterinario;
    document.getElementById("agendaTipo").value = item.tipo;

    document.querySelector("#modalAgendamento h2").textContent =
      "Editar Agendamento";
    modal.classList.remove("hidden");
  }

  // Salvar novo agendamento
  function salvarAgendamento() {
    const agenda = JSON.parse(localStorage.getItem("agenda")) || [];
    const hora = document.getElementById("agendaHora").value;
    const animal = document.getElementById("agendaAnimal").value;
    const especie = document.getElementById("agendaEspecie").value;
    const tutor = document.getElementById("agendaTutor").value;
    const telefone = document.getElementById("agendaTelefone").value;
    const vet = document.getElementById("agendaVet").value;
    const tipo = document.getElementById("agendaTipo").value;

    if (idEdicao) {
      const index = agenda.findIndex((i) => i.id === idEdicao);
      if (index !== -1) {
        agenda[index].hora = hora;
        agenda[index].animal = animal;
        agenda[index].especie = especie;
        agenda[index].tutor = tutor;
        agenda[index].telefone = telefone;
        agenda[index].veterinario = vet;
        agenda[index].tipo = tipo;
      }
    } else {
      agenda.push({
        id: Date.now().toString(),
        hora,
        animal,
        especie,
        tutor,
        telefone,
        veterinario: vet,
        tipo,
      });
    }

    localStorage.setItem("agenda", JSON.stringify(agenda));

    modal.classList.add("hidden");
    form.reset();
    idEdicao = null;
    carregarAgenda();
  }

  // Gerar dados de teste
  function gerarDadosTeste() {
    const dados = [
      {
        id: "1",
        tutor: "Ana Silva",
        telefone: "(11) 99999-1111",
        animal: "Rex",
        hora: "08:00",
        especie: "Cachorro",
        veterinario: "Dr. Silva",
        tipo: "Consulta",
      },
      {
        id: "2",
        tutor: "Carlos Souza",
        telefone: "(11) 98888-2222",
        animal: "Mia",
        hora: "09:00",
        especie: "Gato",
        veterinario: "Dra. Santos",
        tipo: "Vacina",
      },
      {
        id: "3",
        tutor: "Beatriz Lima",
        telefone: "(11) 97777-3333",
        animal: "Thor",
        hora: "10:30",
        especie: "Cachorro",
        veterinario: "Dr. Silva",
        tipo: "Retorno",
      },
      {
        id: "4",
        tutor: "João Mendes",
        telefone: "(11) 96666-4444",
        animal: "Lola",
        hora: "14:00",
        especie: "Gato",
        veterinario: "Plantão",
        tipo: "Exame",
      },
      {
        id: "5",
        tutor: "Fernanda Costa",
        telefone: "(11) 95555-5555",
        animal: "Luna",
        hora: "15:30",
        especie: "Gato",
        veterinario: "Dra. Santos",
        tipo: "Cirurgia",
      },
      {
        id: "6",
        tutor: "Marcos Paulo",
        telefone: "(11) 94444-6666",
        animal: "Bob",
        hora: "16:00",
        especie: "Cachorro",
        veterinario: "Dr. Silva",
        tipo: "Consulta",
      },
    ];
    localStorage.setItem("agenda", JSON.stringify(dados));
    carregarAgenda();
  }

  // Preencher datalists para facilitar o cadastro
  function carregarDatalists() {
    const tutores = JSON.parse(localStorage.getItem("tutores")) || [];
    const animais = JSON.parse(localStorage.getItem("animais")) || [];

    const dlTutores = document.getElementById("listaTutoresAgenda");
    const dlAnimais = document.getElementById("listaAnimaisAgenda");

    if (dlTutores)
      dlTutores.innerHTML = tutores
        .map((t) => `<option value="${t.nome}">`)
        .join("");
    if (dlAnimais)
      dlAnimais.innerHTML = animais
        .map((a) => `<option value="${a.nome}">`)
        .join("");
  }

  // Expor excluir globalmente
  window.excluirAgendamento = function (id) {
    if (confirm("Deseja excluir este agendamento?")) {
      const agenda = JSON.parse(localStorage.getItem("agenda")) || [];
      const novaAgenda = agenda.filter((item) => item.id !== id);
      localStorage.setItem("agenda", JSON.stringify(novaAgenda));
      carregarAgenda();
    }
  };

  // Expor editar globalmente
  window.prepararEdicao = function (id) {
    const agenda = JSON.parse(localStorage.getItem("agenda")) || [];
    const item = agenda.find((i) => i.id === id);
    if (item) {
      editarAgendamento(item);
    }
  };
});
