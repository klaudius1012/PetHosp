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
      alert("Funcionalidade desativada no modo integrado com API.");
    });
  }

  // Evento: Limpar Dados (Solicitado)
  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      alert("Para limpar dados, utilize o banco de dados diretamente.");
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

  async function carregarTutores() {
    const termo = busca ? busca.value : "";
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;">Carregando...</td></tr>';

    try {
      // Busca na API (assumindo que o backend suporta ?q= para busca ou retorna tudo)
      const url = termo
        ? `/tutores/?q=${encodeURIComponent(termo)}`
        : "/tutores/";
      const response = await fetch(url);

      if (response.status === 401) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "index.html";
        return;
      }

      const tutores = await response.json();
      tbody.innerHTML = "";

      if (!Array.isArray(tutores) || tutores.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="5" style="text-align:center;">Nenhum tutor encontrado.</td></tr>';
        return;
      }

      // Ordenar alfabeticamente (caso o backend não ordene)
      tutores.sort((a, b) => a.nome.localeCompare(b.nome));

      const { data, totalPages } = paginator.paginate(tutores);

      data.forEach((t) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${t.nome}</td>
          <td>${t.cpf || "-"}</td>
          <td>${t.telefone || "-"}</td>
          <td>${t.cidade || "-"}</td>
          <td>
            <button class="btn-icon" onclick="window.location.href='editar-tutor.html?id=${t.id}'" title="Editar" style="cursor:pointer; border:none; background:transparent; margin-right: 5px;">✏️</button>
            <button class="btn-icon" onclick="excluirTutor(${t.id})" title="Excluir" style="cursor:pointer; border:none; background:transparent;">🗑️</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      paginator.renderControls("pagination", totalPages);
    } catch (error) {
      console.error("Erro ao carregar tutores:", error);
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center; color:red">Erro de conexão.</td></tr>';
    }
  }

  // Função global para excluir linha individual
  window.excluirTutor = async function (id) {
    if (confirm("Deseja realmente excluir este tutor?")) {
      try {
        const response = await fetch(`/tutores/${id}`, { method: "DELETE" });
        if (response.ok) {
          alert("Tutor excluído com sucesso!");
          carregarTutores();
        } else {
          const err = await response.json();
          alert(err.error || "Erro ao excluir tutor.");
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao tentar excluir.");
      }
    }
  };
});
