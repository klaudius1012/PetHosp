document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const atendimentoId = params.get("id");

  if (!atendimentoId) {
    alert("Atendimento não identificado.");
    window.location.href = "home.html";
    return;
  }

  carregarHistorico(atendimentoId);
  configurarFormulario(atendimentoId);
});

function configurarFormulario(atendimentoId) {
  const form = document.getElementById("formEvolucao");
  const inputData = document.getElementById("dataEvolucao");
  const inputHora = document.getElementById("horaEvolucao");

  // Definir data e hora atuais como padrão
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  inputData.value = agora.toISOString().slice(0, 10);
  inputHora.value = agora.toISOString().slice(11, 16);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const descricao = document.getElementById("descricaoEvolucao").value;
    const data = inputData.value;
    const hora = inputHora.value;

    const novaEvolucao = {
      id: Date.now().toString(),
      atendimentoId: atendimentoId,
      data: data,
      hora: hora,
      descricao: descricao,
      dataRegistro: new Date().toISOString(),
    };

    const evolucoes = JSON.parse(localStorage.getItem("evolucoes")) || [];
    evolucoes.push(novaEvolucao);
    localStorage.setItem("evolucoes", JSON.stringify(evolucoes));

    alert("Evolução registrada com sucesso!");
    document.getElementById("descricaoEvolucao").value = ""; // Limpa apenas a descrição
    carregarHistorico(atendimentoId);
  });
}

function carregarHistorico(atendimentoId) {
  const evolucoes = JSON.parse(localStorage.getItem("evolucoes")) || [];
  const container = document.getElementById("listaEvolucoes");

  // Filtrar pelo atendimento e ordenar (mais recente primeiro)
  const historico = evolucoes
    .filter((e) => e.atendimentoId === atendimentoId)
    .sort(
      (a, b) =>
        new Date(b.data + "T" + b.hora) - new Date(a.data + "T" + a.hora)
    );

  container.innerHTML = "";

  if (historico.length === 0) {
    container.innerHTML =
      "<p style='text-align:center; color:#666;'>Nenhuma evolução registrada para este atendimento.</p>";
    return;
  }

  historico.forEach((ev) => {
    const card = document.createElement("div");
    card.className = "evolucao-card";
    const dataFormatada = ev.data.split("-").reverse().join("/");
    card.innerHTML = `<div class="evolucao-header"><span>${dataFormatada} às ${ev.hora}</span></div><div class="evolucao-desc">${ev.descricao}</div>`;
    container.appendChild(card);
  });
}
