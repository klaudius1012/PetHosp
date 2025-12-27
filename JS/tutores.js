document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tbody-tutores");
  const btnGerar = document.getElementById("btnGerarTutores");
  const btnLimpar = document.getElementById("btnLimparTutores");
  const busca = document.getElementById("buscaTutor");

  // Instancia o paginador (assumindo que pagination.js foi carregado)
  const paginator = new Paginator(5, carregarTutores);

  // Evento: Gerar Dados de Teste
  if (btnGerar) {
    btnGerar.addEventListener("click", () => {
      const dadosTeste = [
        {
          id: Date.now() + "1",
          nome: "Ana Silva",
          cpf: "123.456.789-00",
          telefone: "(11) 99999-0000",
          cidade: "São Paulo",
        },
        {
          id: Date.now() + "2",
          nome: "Carlos Oliveira",
          cpf: "234.567.890-11",
          telefone: "(21) 98888-1111",
          cidade: "Rio de Janeiro",
        },
        {
          id: Date.now() + "3",
          nome: "Mariana Santos",
          cpf: "345.678.901-22",
          telefone: "(31) 97777-2222",
          cidade: "Belo Horizonte",
        },
        {
          id: Date.now() + "4",
          nome: "Roberto Costa",
          cpf: "456.789.012-33",
          telefone: "(41) 96666-3333",
          cidade: "Curitiba",
        },
        {
          id: Date.now() + "5",
          nome: "Fernanda Lima",
          cpf: "567.890.123-44",
          telefone: "(51) 95555-4444",
          cidade: "Porto Alegre",
        },
        {
          id: Date.now() + "6",
          nome: "Lucas Pereira",
          cpf: "678.901.234-55",
          telefone: "(61) 94444-5555",
          cidade: "Brasília",
        },
      ];
      localStorage.setItem("tutores", JSON.stringify(dadosTeste));
      carregarTutores();
    });
  }

  // Evento: Limpar Dados (Solicitado)
  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      if (
        confirm("Tem certeza que deseja apagar todos os tutores cadastrados?")
      ) {
        localStorage.removeItem("tutores");
        carregarTutores();
      }
    });
  }

  // Evento: Busca
  if (busca) {
    busca.addEventListener("input", () => {
      paginator.reset();
      carregarTutores();
    });
  }

  // Carregar dados ao iniciar
  carregarTutores();

  function carregarTutores() {
    const tutores = JSON.parse(localStorage.getItem("tutores")) || [];
    const termo = busca ? busca.value.toLowerCase() : "";

    tbody.innerHTML = "";

    const filtrados = tutores.filter(
      (t) => t.nome.toLowerCase().includes(termo) || t.cpf.includes(termo)
    );

    if (filtrados.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;">Nenhum tutor encontrado.</td></tr>';
      return;
    }

    // Ordenar alfabeticamente
    filtrados.sort((a, b) => a.nome.localeCompare(b.nome));

    const { data, totalPages } = paginator.paginate(filtrados);

    data.forEach((t) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.nome}</td>
        <td>${t.cpf}</td>
        <td>${t.telefone}</td>
        <td>${t.cidade}</td>
        <td>
          <button class="btn-icon" onclick="window.location.href='editar-tutor.html?id=${t.id}'" title="Editar" style="cursor:pointer; border:none; background:transparent; margin-right: 5px;">✏️</button>
          <button class="btn-icon" onclick="excluirTutor('${t.id}')" title="Excluir" style="cursor:pointer; border:none; background:transparent;">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    paginator.renderControls("pagination", totalPages);
  }

  // Função global para excluir linha individual
  window.excluirTutor = function (id) {
    if (confirm("Deseja realmente excluir este tutor?")) {
      const tutores = JSON.parse(localStorage.getItem("tutores")) || [];
      const novosTutores = tutores.filter((t) => t.id !== id);
      localStorage.setItem("tutores", JSON.stringify(novosTutores));
      carregarTutores();
    }
  };
});
