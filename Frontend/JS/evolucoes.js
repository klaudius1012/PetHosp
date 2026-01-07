document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const atendimentoId = params.get("id");

  if (!atendimentoId) {
    alert("Atendimento não identificado.");
    window.location.href = "internacao.html";
    return;
  }

  const form = document.getElementById("formEvolucao");
  const inputData = document.getElementById("dataEvolucao");
  const inputHora = document.getElementById("horaEvolucao");
  const inputDescricao = document.getElementById("descricaoEvolucao");
  const listaContainer = document.getElementById("listaEvolucoes");

  // Define data e hora atuais como padrão ao carregar
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  inputData.value = agora.toISOString().slice(0, 10);
  inputHora.value = agora.toISOString().slice(11, 16);

  // Carrega histórico
  carregarEvolucoes();

  // Evento de Salvar
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    salvarEvolucao();
  });

  function salvarEvolucao() {
    const descricao = inputDescricao.value.trim();
    if (!descricao) {
      alert("Por favor, descreva a evolução.");
      return;
    }

    const novaEvolucao = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      atendimentoId: atendimentoId,
      data: inputData.value,
      hora: inputHora.value,
      descricao: descricao,
      dataRegistro: new Date().toISOString(),
    };

    const evolucoes = JSON.parse(localStorage.getItem("evolucoes")) || [];
    evolucoes.push(novaEvolucao);
    localStorage.setItem("evolucoes", JSON.stringify(evolucoes));

    alert("Evolução registrada com sucesso!");
    inputDescricao.value = ""; // Limpa o campo de descrição
    carregarEvolucoes();
  }

  function carregarEvolucoes() {
    const evolucoes = JSON.parse(localStorage.getItem("evolucoes")) || [];
    const lista = evolucoes.filter((e) => e.atendimentoId === atendimentoId);

    // Ordenar: mais recente primeiro
    lista.sort((a, b) => {
      const dtA = new Date(`${a.data}T${a.hora}`);
      const dtB = new Date(`${b.data}T${b.hora}`);
      return dtB - dtA;
    });

    listaContainer.innerHTML = "";

    if (lista.length === 0) {
      listaContainer.innerHTML =
        '<p style="text-align:center; color:#666; padding: 1rem;">Nenhuma evolução registrada para este atendimento.</p>';
      return;
    }

    lista.forEach((ev) => {
      const div = document.createElement("div");
      // Estilização inline para os cards de evolução
      div.innerHTML = `
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border-left: 4px solid #0f766e;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">
            <strong style="color: #0f766e;">${new Date(
              ev.data
            ).toLocaleDateString()} às ${ev.hora}</strong>
            <button onclick="excluirEvolucao('${
              ev.id
            }')" title="Excluir" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">🗑️</button>
          </div>
          <div style="white-space: pre-wrap; color: #374151; line-height: 1.5;">${
            ev.descricao
          }</div>
        </div>
      `;
      listaContainer.appendChild(div);
    });
  }

  window.excluirEvolucao = function (id) {
    if (confirm("Tem certeza que deseja excluir este registro de evolução?")) {
      let evolucoes = JSON.parse(localStorage.getItem("evolucoes")) || [];
      evolucoes = evolucoes.filter((e) => e.id !== id);
      localStorage.setItem("evolucoes", JSON.stringify(evolucoes));
      carregarEvolucoes();
    }
  };
});
