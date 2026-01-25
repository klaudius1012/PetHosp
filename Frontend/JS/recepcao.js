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

async function carregarAtendimentos() {
  const tbody = document.getElementById("tbody-recepcao");
  tbody.innerHTML =
    '<tr><td colspan="7" style="text-align:center;">Carregando...</td></tr>';

  const buscaInput = document.getElementById("buscaRecepcao");
  const dataFiltro = document.getElementById("dataFiltro");

  const termo = buscaInput ? buscaInput.value.toLowerCase() : "";
  const dataSelecionada = dataFiltro ? dataFiltro.value : "";

  try {
    // Constrói a URL com filtros
    let url = "/atendimentos/?";
    if (dataSelecionada) url += `data=${dataSelecionada}&`;
    if (termo) url += `q=${encodeURIComponent(termo)}&`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao buscar atendimentos");

    let lista = await response.json();

    // Lógica de visualização:
    // Se NÃO tem data selecionada, mostramos apenas a "Fila de Espera" (Aguardando/Em Atendimento)
    // Se TEM data, o backend já filtrou por data, mostramos tudo (Histórico)
    if (!dataSelecionada) {
      lista = lista.filter((a) =>
        ["Aguardando", "Em Atendimento"].includes(a.status),
      );
    }

    tbody.innerHTML = "";

    if (lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-message">Nenhum atendimento encontrado.</td></tr>`;
      return;
    }

    // Ordenação já vem do backend (Emergência > Data), mas garantimos aqui caso necessário
    // O backend já ordena corretamente, então podemos confiar na ordem ou reforçar:
    /*
    lista.sort((a, b) => {
      if (a.prioridade === "Emergência" && b.prioridade !== "Emergência") return -1;
      if (a.prioridade !== "Emergência" && b.prioridade === "Emergência") return 1;
      return (a.data_hora || "").localeCompare(b.data_hora || "");
    });
    */

    const { data, totalPages } = paginator.paginate(lista);

    data.forEach((a) => {
      const tr = document.createElement("tr");

      // Destaque visual para Emergência
      if (a.prioridade === "Emergência") {
        tr.classList.add("row-emergencia");
      }

      // Formatação de hora (backend retorna YYYY-MM-DDTHH:MM:SS ou similar)
      let hora = "--:--";
      if (a.data_hora) {
        const dateObj = new Date(a.data_hora);
        hora = dateObj.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      // Nomes vêm dos JOINs do backend (tutor_nome, animal_nome, veterinario_nome)
      // Fallback para campos antigos se necessário, mas o backend envia _nome
      const tutorNome = a.tutor_nome || a.tutor || "Desconhecido";
      const animalNome = a.animal_nome || a.animal || "Desconhecido";
      const vetNome = a.veterinario_nome || a.veterinario || "A definir";

      tr.innerHTML = `
        <td>${hora}</td>
        <td>${tutorNome}</td>
        <td>${animalNome}</td>
        <td>${vetNome}</td>
        <td class="${a.prioridade === "Emergência" ? "text-emergencia" : ""}">${a.prioridade}</td>
        <td>${a.status}</td>
        <td>
          <button class="btn-editar" onclick="window.location.href='editar-atendimento.html?id=${a.id}'">Editar</button>
          <button class="btn-finalizar" onclick="finalizarAtendimento(${a.id})">Finalizar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    paginator.renderControls("pagination", totalPages);
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red">Erro ao carregar atendimentos.</td></tr>`;
  }
}

window.finalizarAtendimento = async function (id) {
  if (
    confirm("Deseja finalizar este atendimento? Ele sairá da lista de abertos.")
  ) {
    try {
      const response = await fetch(`/atendimentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Finalizado" }),
      });

      if (response.ok) {
        carregarAtendimentos();
      } else {
        alert("Erro ao finalizar atendimento.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    }
  }
};
