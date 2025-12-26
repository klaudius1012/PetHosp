// Variáveis de Paginação
let currentPageTutores = 1;
let currentPageAnimais = 1;
const itemsPerPage = 5;

// Variáveis de Busca e Ordenação
let searchQueryTutores = "";
let sortColumnTutores = null;
let sortDirectionTutores = "asc";

let searchQueryAnimais = "";
let sortColumnAnimais = null;
let sortDirectionAnimais = "asc";

document.addEventListener("DOMContentLoaded", () => {
  // Navegação Lateral
  const menuItems = document.querySelectorAll("#listaServicos li");
  const views = document.querySelectorAll("article");

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Remove classe active de todos
      menuItems.forEach((i) => i.classList.remove("active"));
      views.forEach((v) => v.classList.add("hidden"));

      // Ativa o selecionado
      item.classList.add("active");
      const viewId = `view-${item.dataset.key}`;
      const view = document.getElementById(viewId);
      if (view) {
        view.classList.remove("hidden");
        carregarDados(item.dataset.key);
      }
    });
  });

  // Botões de Ação Rápida
  setupNavigation("btnNovoAtendimento", "novo-atendimento.html");
  setupNavigation("btnNovoTutor", "cadastro_tutor.html");
  setupNavigation("btnNovoPet", "pet.html");

  // Botão de Gerar Tutor de Teste
  document.getElementById("btnGerarTutorTeste")?.addEventListener("click", gerarTutorAleatorio);
  document.getElementById("btnGerarAgendaTeste")?.addEventListener("click", gerarAgendamentoAleatorio);

  // Adicionar botão de Gerar Dados de Teste dinamicamente
  const btnNovoPet = document.getElementById("btnNovoPet");
  if (btnNovoPet) {
    const btnGerar = document.createElement("button");
    btnGerar.textContent = "Gerar Dados de Teste";
    btnGerar.className = btnNovoPet.className; // Copia o estilo do botão vizinho
    btnGerar.style.marginLeft = "10px";
    btnGerar.style.backgroundColor = "#6c757d"; // Cor cinza para diferenciar
    btnGerar.addEventListener("click", gerarDadosAleatoriosAnimais);
    btnNovoPet.parentNode.insertBefore(btnGerar, btnNovoPet.nextSibling);
  }

  // Inicialização: Carregar dados iniciais se localStorage estiver vazio (Seed)
  seedData();

  // Carregar Dashboard por padrão
  carregarDados("dashboard");

  // Configuração dos Botões de Paginação
  document.getElementById("btnPrevPage")?.addEventListener("click", () => {
    if (currentPageTutores > 1) {
      currentPageTutores--;
      renderTutores();
    }
  });
  document.getElementById("btnNextPage")?.addEventListener("click", () => {
    renderTutores(true); // Passa flag para indicar 'próxima'
  });

  document.getElementById("btnPrevPagePets")?.addEventListener("click", () => {
    if (currentPageAnimais > 1) {
      currentPageAnimais--;
      renderAnimais();
    }
  });
  document.getElementById("btnNextPagePets")?.addEventListener("click", () => {
    renderAnimais(true); // Passa flag para indicar 'próxima'
  });

  // Listeners de Busca
  document.getElementById("buscaTutor")?.addEventListener("input", (e) => {
    searchQueryTutores = e.target.value.toLowerCase();
    currentPageTutores = 1;
    renderTutores();
  });

  document.getElementById("buscaPet")?.addEventListener("input", (e) => {
    searchQueryAnimais = e.target.value.toLowerCase();
    currentPageAnimais = 1;
    renderAnimais();
  });

  // Listeners de Busca e Filtro (Agenda)
  document.getElementById("buscaAgenda")?.addEventListener("input", renderAgenda);
  document.getElementById("filtroVetAgenda")?.addEventListener("change", renderAgenda);

  // Listeners de Ordenação (Tutores)
  document.querySelectorAll("#view-tutores th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const column = th.dataset.column;
      if (sortColumnTutores === column) {
        sortDirectionTutores = sortDirectionTutores === "asc" ? "desc" : "asc";
      } else {
        sortColumnTutores = column;
        sortDirectionTutores = "asc";
      }
      renderTutores();
    });
  });

  // Listeners de Ordenação (Animais)
  document.querySelectorAll("#view-animais th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const column = th.dataset.column;
      if (sortColumnAnimais === column) {
        sortDirectionAnimais = sortDirectionAnimais === "asc" ? "desc" : "asc";
      } else {
        sortColumnAnimais = column;
        sortDirectionAnimais = "asc";
      }
      renderAnimais();
    });
  });

  // --- Listeners de Agendamento ---
  const modalAgenda = document.getElementById("modalAgendamento");
  const btnNovoAgendamento = document.getElementById("btnNovoAgendamento");
  const btnCancelarAgenda = document.getElementById("btnCancelarAgenda");
  const formAgendamento = document.getElementById("formAgendamento");

  if (btnNovoAgendamento) {
    btnNovoAgendamento.addEventListener("click", () => {
      document.getElementById("formAgendamento").reset();
      document.getElementById("agendaId").value = "";
      document.querySelector("#modalAgendamento h2").textContent = "Novo Agendamento";
      modalAgenda.classList.remove("hidden");
      carregarOpcoesAgenda();
    });
  }

  if (btnCancelarAgenda) {
    btnCancelarAgenda.addEventListener("click", () => {
      modalAgenda.classList.add("hidden");
      formAgendamento.reset();
      document.getElementById("agendaId").value = "";
    });
  }

  if (formAgendamento) {
    formAgendamento.addEventListener("submit", (e) => {
      e.preventDefault();
      salvarAgendamento();
    });
  }
});

function setupNavigation(btnId, url) {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener("click", () => (window.location.href = url));
  }
}

function carregarDados(key) {
  switch (key) {
    case "recepção":
      renderRecepcao();
      break;
    case "tutores":
      renderTutores();
      break;
    case "animais":
      renderAnimais();
      break;
    case "agenda":
      renderAgenda();
      break;
  }
}

// --- Renderização da Recepção ---
function renderRecepcao() {
  const tbody = document.getElementById("tbody-recepcao");
  tbody.innerHTML = "";
  const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];

  // Filtra apenas atendimentos que não estão finalizados (opcional)
  const ativos = atendimentos.filter((a) => a.status !== "Finalizado");

  ativos.forEach((at) => {
    const tr = document.createElement("tr");

    // Verifica prioridade para destacar
    if (at.prioridade === "Emergência") {
      tr.style.backgroundColor = "#ffebee"; // Vermelho claro
      tr.style.color = "#c62828";
    }

    // Select para alterar status
    const selectStatus = document.createElement("select");
    const statusOptions = [
      "Aguardando",
      "Em Atendimento",
      "Finalizado",
      "Cancelado",
    ];
    statusOptions.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      if (at.status === opt) option.selected = true;
      selectStatus.appendChild(option);
    });

    selectStatus.addEventListener("change", (e) => {
      atualizarStatusAtendimento(at.id, e.target.value);
    });

    tr.innerHTML = `
      <td>${at.dataHora ? at.dataHora.split(" ")[1] : "--:--"}</td>
      <td>${at.tutor}</td>
      <td>${at.animal}</td>
      <td>${at.motivo}</td>
      <td>${at.prioridade || "-"}</td>
      <td></td> <!-- Célula para o select -->
      <td>
        <button class="btn btn-sm btn-primary" onclick="window.location.href='detalhes-atendimento.html?id=${
          at.id
        }'">Ver</button>
      </td>
    `;

    // Insere o select na célula correta
    tr.cells[5].appendChild(selectStatus);
    tbody.appendChild(tr);
  });
}

function atualizarStatusAtendimento(id, novoStatus) {
  const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
  const index = atendimentos.findIndex((a) => a.id === id);
  if (index !== -1) {
    atendimentos[index].status = novoStatus;
    localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
    // Recarrega a tabela se o status mudar para algo que deva sair da lista (ex: Finalizado)
    // renderRecepcao();
  }
}

// --- Renderização de Tutores ---
function renderTutores(isNext = false) {
  const tbody = document.getElementById("tbody-tutores");
  tbody.innerHTML = "";
  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];

  // Filtragem
  let filteredTutores = tutores.filter(
    (t) =>
      t.nome.toLowerCase().includes(searchQueryTutores) ||
      t.cpf.includes(searchQueryTutores)
  );

  // Ordenação
  if (sortColumnTutores) {
    filteredTutores.sort((a, b) => {
      const valA = (a[sortColumnTutores] || "").toString().toLowerCase();
      const valB = (b[sortColumnTutores] || "").toString().toLowerCase();
      if (valA < valB) return sortDirectionTutores === "asc" ? -1 : 1;
      if (valA > valB) return sortDirectionTutores === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Atualiza indicadores visuais de ordenação
  document.querySelectorAll("#view-tutores th.sortable").forEach((th) => {
    const baseText = th.textContent.replace(/[⇅↑↓]/g, "").trim();
    if (th.dataset.column === sortColumnTutores) {
      th.textContent = `${baseText} ${
        sortDirectionTutores === "asc" ? "↑" : "↓"
      }`;
    } else {
      th.textContent = `${baseText} ⇅`;
    }
  });

  // Lógica de Paginação
  const totalPages = Math.ceil(filteredTutores.length / itemsPerPage) || 1;

  if (isNext && currentPageTutores < totalPages) {
    currentPageTutores++;
  }

  // Garante que a página atual é válida
  if (currentPageTutores > totalPages) currentPageTutores = totalPages;
  if (currentPageTutores < 1) currentPageTutores = 1;

  const start = (currentPageTutores - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedTutores = filteredTutores.slice(start, end);

  paginatedTutores.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.nome}</td>
      <td>${t.telefone}</td>
      <td>${t.cpf}</td>
      <td>${t.endereco}</td>
      <td>${t.bairro}</td>
      <td>${t.cidade}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="window.location.href='cadastro_tutor.html?id=${t.id}'">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="excluirTutor('${t.id}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Atualiza controles
  document.getElementById(
    "pageIndicator"
  ).textContent = `Página ${currentPageTutores} de ${totalPages}`;
  document.getElementById("btnPrevPage").disabled = currentPageTutores === 1;
  document.getElementById("btnNextPage").disabled =
    currentPageTutores === totalPages;
}

// --- Renderização de Animais ---
function renderAnimais(isNext = false) {
  const tbody = document.getElementById("tbody-animais");
  tbody.innerHTML = "";
  const animais = JSON.parse(localStorage.getItem("animais")) || [];
  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];

  // Enriquecer dados com nome do tutor para busca e ordenação
  let enrichedAnimais = animais.map((a) => {
    const tutor = tutores.find((t) => t.id === a.tutorId);
    return {
      ...a,
      tutorNome: tutor ? tutor.nome : a.tutorNome || "Desconhecido",
    };
  });

  // Filtragem
  enrichedAnimais = enrichedAnimais.filter(
    (a) =>
      a.nome.toLowerCase().includes(searchQueryAnimais) ||
      a.especie.toLowerCase().includes(searchQueryAnimais) ||
      a.tutorNome.toLowerCase().includes(searchQueryAnimais)
  );

  // Ordenação
  if (sortColumnAnimais) {
    enrichedAnimais.sort((a, b) => {
      const valA = (a[sortColumnAnimais] || "").toString().toLowerCase();
      const valB = (b[sortColumnAnimais] || "").toString().toLowerCase();
      if (valA < valB) return sortDirectionAnimais === "asc" ? -1 : 1;
      if (valA > valB) return sortDirectionAnimais === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Atualiza indicadores visuais de ordenação
  document.querySelectorAll("#view-animais th.sortable").forEach((th) => {
    const baseText = th.textContent.replace(/[⇅↑↓]/g, "").trim();
    if (th.dataset.column === sortColumnAnimais) {
      th.textContent = `${baseText} ${
        sortDirectionAnimais === "asc" ? "↑" : "↓"
      }`;
    } else {
      th.textContent = `${baseText} ⇅`;
    }
  });

  // Lógica de Paginação
  const totalPages = Math.ceil(enrichedAnimais.length / itemsPerPage) || 1;

  if (isNext && currentPageAnimais < totalPages) {
    currentPageAnimais++;
  }

  // Garante que a página atual é válida
  if (currentPageAnimais > totalPages) currentPageAnimais = totalPages;
  if (currentPageAnimais < 1) currentPageAnimais = 1;

  const start = (currentPageAnimais - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedAnimais = enrichedAnimais.slice(start, end);

  paginatedAnimais.forEach((a) => {
    const tutor = tutores.find((t) => t.id === a.tutorId);
    const nomeTutor = tutor ? tutor.nome : a.tutorNome || "Desconhecido";
    const telefoneTutor = tutor ? tutor.telefone : "-";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nomeTutor}</td>
      <td>${telefoneTutor}</td>
      <td>${a.nome}</td>
      <td>${a.especie}</td>
      <td>${a.raca || "-"}</td>
      <td title="${a.nascimento || ""}">${calcularIdade(a.nascimento)}</td>
      <td>${a.condicaoReprodutiva || "-"}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="window.location.href='pet.html?id=${
          a.id
        }'">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="excluirAnimal('${
          a.id
        }')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Atualiza controles
  document.getElementById(
    "pageIndicatorPets"
  ).textContent = `Página ${currentPageAnimais} de ${totalPages}`;
  document.getElementById("btnPrevPagePets").disabled =
    currentPageAnimais === 1;
  document.getElementById("btnNextPagePets").disabled =
    currentPageAnimais === totalPages;
}

// --- Funções de Agenda ---
function carregarOpcoesAgenda() {
  const listaAnimais = document.getElementById("listaAnimaisAgenda");
  const listaTutores = document.getElementById("listaTutoresAgenda");

  const animais = JSON.parse(localStorage.getItem("animais")) || [];
  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];

  listaAnimais.innerHTML = "";
  animais.forEach((a) => {
    const opt = document.createElement("option");
    opt.value = a.nome;
    listaAnimais.appendChild(opt);
  });

  listaTutores.innerHTML = "";
  tutores.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.nome;
    listaTutores.appendChild(opt);
  });
}

function salvarAgendamento() {
  const id = document.getElementById("agendaId").value;
  const hora = document.getElementById("agendaHora").value;
  const animal = document.getElementById("agendaAnimal").value;
  const tutor = document.getElementById("agendaTutor").value;
  const vet = document.getElementById("agendaVet").value;
  const tipo = document.getElementById("agendaTipo").value;

  const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
  
  if (id) {
    const index = agendamentos.findIndex((a) => a.id === id);
    if (index !== -1) {
      agendamentos[index] = { id, hora, animal, tutor, veterinario: vet, tipo };
    }
  } else {
    const novoAgendamento = {
      id: "AG" + Date.now(),
      hora,
      animal,
      tutor,
      veterinario: vet,
      tipo,
    };
    agendamentos.push(novoAgendamento);
  }

  agendamentos.sort((a, b) => a.hora.localeCompare(b.hora));

  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

  document.getElementById("modalAgendamento").classList.add("hidden");
  document.getElementById("formAgendamento").reset();
  renderAgenda();
}

function renderAgenda() {
  const tbody = document.getElementById("tbody-agenda");
  tbody.innerHTML = "";
  const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
  
  const termoBusca = document.getElementById("buscaAgenda")?.value.toLowerCase() || "";
  const filtroVet = document.getElementById("filtroVetAgenda")?.value || "";

  const filtrados = agendamentos.filter((ag) => {
    const matchBusca = (ag.animal || "").toLowerCase().includes(termoBusca) || (ag.tutor || "").toLowerCase().includes(termoBusca);
    const matchVet = !filtroVet || ag.veterinario === filtroVet;
    return matchBusca && matchVet;
  });

  filtrados.forEach((ag) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ag.hora}</td>
      <td>${ag.animal}</td>
      <td>${ag.tutor}</td>
      <td>${ag.veterinario}</td>
      <td>${ag.tipo}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editarAgendamento('${ag.id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="excluirAgendamento('${ag.id}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editarAgendamento(id) {
  const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
  const ag = agendamentos.find((a) => a.id === id);

  if (ag) {
    document.getElementById("agendaId").value = ag.id;
    document.getElementById("agendaHora").value = ag.hora;
    document.getElementById("agendaAnimal").value = ag.animal;
    document.getElementById("agendaTutor").value = ag.tutor;
    document.getElementById("agendaVet").value = ag.veterinario;
    document.getElementById("agendaTipo").value = ag.tipo;

    document.querySelector("#modalAgendamento h2").textContent = "Editar Agendamento";
    carregarOpcoesAgenda();
    document.getElementById("modalAgendamento").classList.remove("hidden");
  }
}

function excluirAgendamento(id) {
  if (confirm("Deseja excluir este agendamento?")) {
    let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
    agendamentos = agendamentos.filter((a) => a.id !== id);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
    renderAgenda();
  }
}

// --- Seed Data (Dados Iniciais) ---
async function seedData() {
  if (!localStorage.getItem("tutores")) {
    try {
      // Tenta carregar do arquivo JSON local (pode falhar dependendo do servidor/browser policy)
      // Como fallback, usamos um array vazio ou dados hardcoded se o fetch falhar
      const response = await fetch("DATA/tutores.json");
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("tutores", JSON.stringify(data));
        console.log("Dados de tutores carregados do JSON.");
      }
    } catch (e) {
      console.log(
        "Não foi possível carregar tutores.json automaticamente (CORS/File protocol)."
      );
      // Fallback manual para teste se necessário
      
      localStorage.setItem("tutores", JSON.stringify(tutoresIniciais));
    }
  }

  if (!localStorage.getItem("animais")) {
    try {
      const response = await fetch("DATA/pet.json");
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("animais", JSON.stringify(data));
        console.log("Dados de animais carregados do JSON.");
      }
    } catch (e) {
      console.log("Não foi possível carregar pet.json automaticamente.");
    }
  }
}

// --- Funções de Exclusão ---
function excluirTutor(id) {
  if (confirm("Tem certeza que deseja excluir este tutor?")) {
    const animais = JSON.parse(localStorage.getItem("animais")) || [];
    const temAnimais = animais.some((a) => a.tutorId === id);

    if (temAnimais) {
      alert(
        "Não é possível excluir este tutor pois ele possui animais cadastrados."
      );
      return;
    }

    let tutores = JSON.parse(localStorage.getItem("tutores")) || [];
    tutores = tutores.filter((t) => t.id !== id);
    localStorage.setItem("tutores", JSON.stringify(tutores));
    renderTutores();
  }
}

function excluirAnimal(id) {
  if (confirm("Tem certeza que deseja excluir este animal?")) {
    let animais = JSON.parse(localStorage.getItem("animais")) || [];
    animais = animais.filter((a) => a.id !== id);
    localStorage.setItem("animais", JSON.stringify(animais));
    renderAnimais();
  }
}

function gerarDadosAleatoriosAnimais() {
  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];
  if (tutores.length === 0) {
    alert("Não há tutores cadastrados para vincular os animais.");
    return;
  }

  const nomes = [
    "Rex",
    "Luna",
    "Thor",
    "Mel",
    "Paçoca",
    "Amora",
    "Zeus",
    "Bella",
    "Simba",
    "Nala",
    "Chico",
    "Belinha",
    "Bob",
    "Pandora",
    "Fred",
    "Lola",
    "Max",
    "Molly",
    "Duke",
    "Daisy",
  ];
  const especiesMap = {
    Cachorro: ["SRD", "Labrador", "Poodle", "Bulldog", "Golden Retriever"],
    Gato: ["SRD", "Siamês", "Persa", "Maine Coon"],
    Ave: ["Papagaio", "Canário"],
  };
  const portes = ["Pequeno", "Médio", "Grande"];
  const sexos = ["Macho", "Fêmea"];
  const condicoes = ["Castrado", "Inteiro"];

  const novosAnimais = [];

  tutores.forEach((tutor) => {
    // Gera entre 1 e 2 pets por tutor
    const qtd = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < qtd; i++) {
      const especie =
        Object.keys(especiesMap)[
          Math.floor(Math.random() * Object.keys(especiesMap).length)
        ];
      const racas = especiesMap[especie];
      const raca = racas[Math.floor(Math.random() * racas.length)];

      const ano = new Date().getFullYear() - Math.floor(Math.random() * 15);
      const mes = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
      const dia = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");

      novosAnimais.push({
        id: "P" + Date.now() + Math.floor(Math.random() * 99999),
        tutorId: tutor.id,
        tutorNome: tutor.nome,
        nome: nomes[Math.floor(Math.random() * nomes.length)],
        especie: especie,
        raca: raca,
        sexo: sexos[Math.floor(Math.random() * sexos.length)],
        nascimento: `${ano}-${mes}-${dia}`,
        peso: (Math.random() * 15 + 1).toFixed(1),
        porte: portes[Math.floor(Math.random() * portes.length)],
        condicaoReprodutiva:
          condicoes[Math.floor(Math.random() * condicoes.length)],
      });
    }
  });

  localStorage.setItem("animais", JSON.stringify(novosAnimais));
  renderAnimais();
  alert("Tabela de animais populada com dados aleatórios!");
}

function gerarTutorAleatorio() {
  const nomes = [
    "Lucas",
    "Mariana",
    "Roberto",
    "Fernanda",
    "Ricardo",
    "Patrícia",
    "Gustavo",
    "Camila",
    "Eduardo",
    "Vanessa",
  ];
  const sobrenomes = [
    "Silva",
    "Santos",
    "Oliveira",
    "Souza",
    "Rodrigues",
    "Ferreira",
    "Alves",
    "Pereira",
    "Lima",
    "Gomes",
  ];
  const bairros = [
    "Centro",
    "Jardins",
    "Bela Vista",
    "Pinheiros",
    "Vila Madalena",
    "Moema",
    "Barra Funda",
    "Tatuapé",
  ];
  const cidades = [
    "São Paulo",
    "Rio de Janeiro",
    "Belo Horizonte",
    "Curitiba",
    "Porto Alegre",
  ];

  const nome =
    nomes[Math.floor(Math.random() * nomes.length)] +
    " " +
    sobrenomes[Math.floor(Math.random() * sobrenomes.length)];

  // Helper para gerar números aleatórios
  const r = (n) => Math.floor(Math.random() * n);

  const novoTutor = {
    id: "T" + Date.now(),
    nome: nome,
    cpf: `${r(10)}${r(10)}${r(10)}.${r(10)}${r(10)}${r(10)}.${r(10)}${r(10)}${r(
      10
    )}-${r(10)}${r(10)}`,
    telefone: `(${r(10)}${r(10)}) 9${r(10)}${r(10)}${r(10)}${r(10)}-${r(10)}${r(
      10
    )}${r(10)}${r(10)}`,
    endereco: `Rua Exemplo, ${r(1000)}`,
    bairro: bairros[Math.floor(Math.random() * bairros.length)],
    cidade: cidades[Math.floor(Math.random() * cidades.length)],
    dataCadastro: new Date().toISOString(),
  };

  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];

  if (tutores.some((t) => t.cpf === novoTutor.cpf)) {
    alert("O CPF gerado aleatoriamente já existe. Por favor, tente novamente.");
    return;
  }

  tutores.push(novoTutor);
  localStorage.setItem("tutores", JSON.stringify(tutores));
  renderTutores();
  alert(`Tutor ${nome} adicionado com sucesso!`);
}

function calcularIdade(dataString) {
  if (!dataString) return "-";
  const hoje = new Date();
  const nascimento = new Date(dataString);
  
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();

  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    anos--;
  }

  if (anos > 0) return `${anos} ano${anos > 1 ? "s" : ""}`;

  // Se tem menos de 1 ano, calcula meses
  let meses = (hoje.getFullYear() - nascimento.getFullYear()) * 12 + (hoje.getMonth() - nascimento.getMonth());
  if (hoje.getDate() < nascimento.getDate()) meses--;
  
  return meses > 0 ? `${meses} m${meses > 1 ? "eses" : "ês"}` : "Recém-nascido";
}

function gerarAgendamentoAleatorio() {
  const animais = JSON.parse(localStorage.getItem("animais")) || [];
  
  if (animais.length === 0) {
    alert("É necessário ter animais cadastrados para gerar agendamentos de teste.");
    return;
  }

  const tipos = ["Consulta", "Vacina", "Retorno", "Exame", "Cirurgia"];
  const veterinarios = ["Dr. Silva", "Dra. Santos", "Dr. João", "Dra. Maria", "Plantão"];
  
  // Seleciona dados aleatórios
  const animalAleatorio = animais[Math.floor(Math.random() * animais.length)];
  
  // Gera hora aleatória entre 08:00 e 18:00
  const hora = String(Math.floor(Math.random() * (18 - 8 + 1)) + 8).padStart(2, '0');
  const minuto = String(Math.floor(Math.random() * 4) * 15).padStart(2, '0'); // 00, 15, 30, 45

  const novoAgendamento = {
    id: "AG" + Date.now(),
    hora: `${hora}:${minuto}`,
    animal: animalAleatorio.nome,
    tutor: animalAleatorio.tutorNome || "Tutor Desconhecido",
    veterinario: veterinarios[Math.floor(Math.random() * veterinarios.length)],
    tipo: tipos[Math.floor(Math.random() * tipos.length)],
  };

  const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
  agendamentos.push(novoAgendamento);
  agendamentos.sort((a, b) => a.hora.localeCompare(b.hora));

  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
  renderAgenda();
  alert("Agendamento de teste gerado com sucesso!");
}
