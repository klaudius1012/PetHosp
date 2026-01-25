document.addEventListener("DOMContentLoaded", () => {
  carregarInternacao();

  // Filtro de busca
  const buscaInput = document.getElementById("buscaInternacao");
  if (buscaInput) {
    buscaInput.addEventListener("input", carregarInternacao);
  }
});

async function carregarInternacao() {
  const tbody = document.getElementById("tbody-internacao");
  const buscaInput = document.getElementById("buscaInternacao");
  const termo = buscaInput ? buscaInput.value.toLowerCase() : "";

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando...</td></tr>';

  try {
    // Busca atendimentos com status "Em Atendimento"
    let url = '/atendimentos/?status=Em Atendimento';
    if (termo) url += `&q=${encodeURIComponent(termo)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao buscar internação");

    const lista = await response.json();

    tbody.innerHTML = "";

    if (lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-message">Nenhum paciente internado/em atendimento no momento.</td></tr>`;
      return;
    }

    // Ordenar por data (mais antigos primeiro, ou prioridade)
    lista.sort((a, b) => (a.data_hora || "").localeCompare(b.data_hora || ""));

    lista.forEach((a) => {
      const tr = document.createElement("tr");

      // Formatação de hora
      let entrada = "--:--";
      if (a.data_hora) {
        const dateObj = new Date(a.data_hora);
        entrada = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }

      tr.innerHTML = `
        <td>${entrada}</td>
        <td>${a.tutor_nome || a.tutor}</td>
        <td>${a.animal_nome || a.animal}</td>
        <td>${a.queixa || "-"}</td>
        <td>${a.status}</td>
        <td>
          <button class="btn-icon" onclick="window.location.href='prescricao.html?id=${a.id}'" title="Prescrição">💊</button>
          <button class="btn-icon" onclick="window.location.href='evolucoes.html?id=${a.id}'" title="Evolução">📋</button>
          <button class="btn-icon" onclick="window.location.href='exames.html?id=${a.id}'" title="Exames">🔬</button>
          <button class="btn-icon" onclick="darAlta(${a.id})" title="Dar Alta" style="color: green;">🏠</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red">Erro ao carregar dados.</td></tr>`;
  }
}

window.darAlta = async function (id) {
  if (confirm("Confirma a ALTA deste paciente? O atendimento será finalizado.")) {
    try {
      const response = await fetch(`/atendimentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Finalizado' })
      });

      if (response.ok) carregarInternacao();
      else alert("Erro ao dar alta.");
    } catch (e) {
      console.error(e);
    }
  }
};