document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tbody-financeiro");
  const btnNovo = document.getElementById("btnNovoLancamento");
  const modal = document.getElementById("modalFinanceiro");
  const btnCancelar = document.getElementById("btnCancelar");
  const form = document.getElementById("formFinanceiro");

  // Filtros
  const filtroInicio = document.getElementById("filtroInicio");
  const filtroFim = document.getElementById("filtroFim");
  const filtroTipo = document.getElementById("filtroTipo");
  const filtroStatus = document.getElementById("filtroStatus");

  let idEdicao = null;

  // Definir datas padrão para o filtro (mês atual)
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  filtroInicio.value = primeiroDia.toISOString().split("T")[0];
  filtroFim.value = ultimoDia.toISOString().split("T")[0];

  // Event Listeners
  btnNovo.addEventListener("click", () => abrirModal());
  btnCancelar.addEventListener("click", () => fecharModal());
  form.addEventListener("submit", salvarLancamento);

  [filtroInicio, filtroFim, filtroTipo, filtroStatus].forEach((el) => {
    el.addEventListener("change", carregarLancamentos);
  });

  carregarLancamentos();

  async function carregarLancamentos() {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center">Carregando...</td></tr>';

    const params = new URLSearchParams({
      inicio: filtroInicio.value,
      fim: filtroFim.value,
      tipo: filtroTipo.value,
      status: filtroStatus.value,
    });

    try {
      const res = await fetch(`/financeiro/?${params}`);
      const dados = await res.json();

      tbody.innerHTML = "";

      if (dados.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" style="text-align:center">Nenhum lançamento encontrado.</td></tr>';
        atualizarResumo([]);
        return;
      }

      dados.forEach((l) => {
        const tr = document.createElement("tr");
        const valorFormatado = parseFloat(l.valor).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        const dataVenc = new Date(l.data_vencimento).toLocaleDateString(
          "pt-BR",
        );

        // Classe para cor do valor
        const classeValor = l.tipo === "Receita" ? "text-green" : "text-red";

        tr.innerHTML = `
                    <td>${dataVenc}</td>
                    <td>${l.descricao}</td>
                    <td>${l.categoria || "-"}</td>
                    <td class="${classeValor}">${valorFormatado}</td>
                    <td><span class="badge ${l.status.toLowerCase()}">${l.status}</span></td>
                    <td>
                        <button class="btn-icon" onclick="editarLancamento(${l.id})">✏️</button>
                        <button class="btn-icon" onclick="excluirLancamento(${l.id})">🗑️</button>
                    </td>
                `;
        tbody.appendChild(tr);
      });

      atualizarResumo(dados);
    } catch (e) {
      console.error(e);
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center; color:red">Erro ao carregar dados.</td></tr>';
    }
  }

  function atualizarResumo(dados) {
    let receitas = 0;
    let despesas = 0;

    dados.forEach((d) => {
      const val = parseFloat(d.valor);
      if (d.tipo === "Receita") receitas += val;
      else despesas += val;
    });

    const saldo = receitas - despesas;

    document.getElementById("totalReceitas").textContent =
      receitas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    document.getElementById("totalDespesas").textContent =
      despesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    document.getElementById("totalSaldo").textContent = saldo.toLocaleString(
      "pt-BR",
      { style: "currency", currency: "BRL" },
    );

    const elSaldo = document.getElementById("totalSaldo");
    elSaldo.style.color = saldo >= 0 ? "#059669" : "#dc2626";
  }

  window.editarLancamento = async (id) => {
    try {
      const res = await fetch(`/financeiro/${id}`);
      if (!res.ok) {
        alert("Erro ao buscar dados do lançamento.");
        return;
      }
      const lancamento = await res.json();

      // Preencher o formulário
      document.getElementById("tipo").value = lancamento.tipo;
      document.getElementById("descricao").value = lancamento.descricao;
      document.getElementById("categoria").value = lancamento.categoria;
      document.getElementById("valor").value = lancamento.valor;
      // O backend retorna data no formato 'YYYY-MM-DDTHH:MM:SS', precisamos apenas de 'YYYY-MM-DD'
      document.getElementById("dataVencimento").value =
        lancamento.data_vencimento.split("T")[0];
      document.getElementById("status").value = lancamento.status;

      idEdicao = id; // Armazena o ID para o submit
      abrirModal(true); // Abre o modal sem resetar
    } catch (e) {
      console.error(e);
      alert("Erro de conexão ao tentar editar.");
    }
  };

  window.excluirLancamento = async (id) => {
    if (confirm("Tem certeza que deseja excluir este lançamento?")) {
      try {
        const res = await fetch(`/financeiro/${id}`, { method: "DELETE" });
        if (res.ok) carregarLancamentos();
        else alert("Erro ao excluir");
      } catch (e) {
        console.error(e);
      }
    }
  };

  async function salvarLancamento(e) {
    e.preventDefault();

    const payload = {
      tipo: document.getElementById("tipo").value,
      descricao: document.getElementById("descricao").value,
      categoria: document.getElementById("categoria").value,
      valor: document.getElementById("valor").value,
      data_vencimento: document.getElementById("dataVencimento").value,
      status: document.getElementById("status").value,
    };

    const method = idEdicao ? "PUT" : "POST";
    const url = idEdicao ? `/financeiro/${idEdicao}` : "/financeiro";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const acao = idEdicao ? "atualizado" : "salvo";
        // alert(`Lançamento ${acao} com sucesso!`); // Opcional
        fecharModal();
        carregarLancamentos();
      } else {
        alert("Erro ao salvar");
      }
    } catch (e) {
      console.error(e);
    }
  }

  function abrirModal(isEdit = false) {
    if (!isEdit) {
      form.reset();
      idEdicao = null;
      document.getElementById("dataVencimento").value = new Date()
        .toISOString()
        .split("T")[0];
    }
    modal.classList.remove("hidden");
  }

  function fecharModal() {
    idEdicao = null; // Limpa o ID de edição ao fechar
    modal.classList.add("hidden");
  }
});
