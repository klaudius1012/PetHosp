document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const atendimentoId = params.get("id");

  if (!atendimentoId) {
    alert("Nenhum atendimento selecionado.");
    window.location.href = "internacao.html";
    return;
  }

  // Atualiza os links dos botões de ação para manter o ID do atendimento
  atualizarLinksAcao(atendimentoId);
  carregarCabecalhoAtendimento(atendimentoId);

  carregarHistoricoPrescricoes(atendimentoId);
  setupModalAlergias(atendimentoId);
});

function atualizarLinksAcao(id) {
  const buttons = document.querySelectorAll(".actions-container button");
  buttons.forEach((btn) => {
    const onclick = btn.getAttribute("onclick");
    if (onclick && onclick.includes("window.location.href")) {
      // Garante que o ID seja passado corretamente na navegação
      // O HTML já tem + window.location.search, então isso é apenas um reforço se necessário
    }
    // Para o botão "Nova Prescrição" específico que pode não ter o search
    if (btn.textContent.includes("Nova Prescrição")) {
      btn.onclick = () =>
        (window.location.href = `nova-prescricao.html?id=${id}`);
    }
  });
}

async function carregarCabecalhoAtendimento(id) {
  try {
    const response = await fetch(`/atendimentos/${id}`);
    if (response.ok) {
      const at = await response.json();

      // Preencher Header
      document.getElementById("headerAnimalNome").textContent =
        at.animal_nome || at.animal;
      document.getElementById("headerTutor").textContent =
        at.tutor_nome || at.tutor;
      document.getElementById("headerQueixa").textContent = at.queixa || "--";
      document.getElementById("headerPeso").textContent = at.peso || "--";
      document.getElementById("headerTemp").textContent =
        at.temperatura || "--";
      document.getElementById("headerFC").textContent =
        at.frequencia_cardiaca || "--";
      document.getElementById("headerFR").textContent =
        at.frequencia_respiratoria || "--";
      document.getElementById("headerTPC").textContent = at.tpc || "--";
      document.getElementById("headerMucosas").textContent = at.mucosas || "--";
      document.getElementById("headerHidratacao").textContent =
        at.hidratacao || "--";
      document.getElementById("headerConsciencia").textContent =
        at.consciencia || "--";

      // Alergias
      const headerAlergias = document.getElementById("headerAlergias");
      if (headerAlergias) headerAlergias.textContent = at.alergias || "";

      // Buscar dados extras do animal se necessário (foto, idade, etc)
      if (at.animal_id) {
        const resAnimal = await fetch(`/animais/${at.animal_id}`);
        if (resAnimal.ok) {
          const animal = await resAnimal.json();
          // Preencher foto e idade aqui se os elementos existirem no HTML
        }
      }
    }
  } catch (e) {
    console.error("Erro ao carregar cabeçalho", e);
  }
}

async function carregarHistoricoPrescricoes(atendimentoId) {
  const tbody = document.getElementById("tbody-prescricao");

  const response = await fetch(`/prescricoes?atendimento_id=${atendimentoId}`);
  const lista = await response.json();

  tbody.innerHTML = "";

  if (lista.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="empty-message">Nenhuma prescrição registrada.</td></tr>';
    return;
  }

  // Ordenar por data (mais recente primeiro)
  lista.sort((a, b) => new Date(b.data) - new Date(a.data));

  lista.forEach((p) => {
    const tr = document.createElement("tr");
    const dataFormatada = new Date(p.data).toLocaleString();

    // Resumo dos medicamentos
    const resumoMedicamentos = `${p.medicamentos.length} medicamentos prescritos`;

    tr.innerHTML = `
      <td>${dataFormatada}</td>
      <td>${resumoMedicamentos}</td>
      <td>${p.veterinario_nome || "--"}</td>
      <td>
        <button class="btn-visualizar" title="Visualizar" onclick="visualizarPrescricao(${
          p.id
        }')" style="cursor:pointer; border:none; background:transparent; margin-right: 5px; font-size: 1.2rem;">👁️</button>
        <button class="btn-duplicar" title="Duplicar" onclick="duplicarPrescricao(${
          p.id
        }')" style="cursor:pointer; border:none; background:transparent; margin-right: 5px; font-size: 1.2rem;">📋</button>
        <button class="btn-imprimir" title="Imprimir" onclick="imprimirPrescricao(${
          p.id
        }')" style="cursor:pointer; border:none; background:transparent; font-size: 1.2rem;">🖨️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function visualizarPrescricao(id) {
  // Busca detalhes para pegar o atendimento_id correto se necessário, ou usa URL
  const params = new URLSearchParams(window.location.search);
  const atendimentoId = params.get("id");
  // Redireciona para a página de nova prescrição em modo de visualização
  window.location.href = `nova-prescricao.html?id=${atendimentoId}&prescricaoId=${id}&view=true`;
}

async function duplicarPrescricao(id) {
  const params = new URLSearchParams(window.location.search);
  const atendimentoId = params.get("id");
  // Redireciona para a página de nova prescrição carregando os dados da antiga como base (sem view=true)
  window.location.href = `nova-prescricao.html?id=${atendimentoId}&prescricaoId=${id}`;
}

async function imprimirPrescricao(id) {
  try {
    const resPresc = await fetch(`/prescricoes/${id}`);
    if (!resPresc.ok) throw new Error("Prescrição não encontrada");
    const prescricao = await resPresc.json();

    const resAtend = await fetch(`/atendimentos/${prescricao.atendimento_id}`);
    const atendimento = await resAtend.json();

    const nomeTutor = atendimento.tutor_nome || atendimento.tutor || "--";
    const nomeAnimal = atendimento.animal_nome || atendimento.animal || "--";

    // Buscar dados adicionais (Evoluções, etc) - Placeholder por enquanto
    let evolucoes = [];
    try {
      const resEvol = await fetch(
        `/evolucoes?atendimento_id=${prescricao.atendimento_id}`,
      );
      if (resEvol.ok) evolucoes = await resEvol.json();
    } catch (e) {
      console.error("Erro ao buscar evoluções para impressão", e);
    }

    const exames = [];
    const procedimentos = [];
    const afericoes = [];

    // Gerar HTML para seções extras
    let htmlExtras = "";

    if (evolucoes.length > 0) {
      htmlExtras += `<h3>Evoluções Clínicas</h3>
    <table class="print-table">
      <thead><tr><th>Data/Hora</th><th>Descrição</th></tr></thead>
      <tbody>
        ${evolucoes
          .map(
            (e) =>
              `<tr><td>${new Date(e.data_hora).toLocaleString()}</td><td>${e.descricao}</td></tr>`,
          )
          .join("")}
      </tbody>
    </table>`;
    }

    if (exames.length > 0) {
      htmlExtras += `<h3>Exames Solicitados</h3>
    <table class="print-table">
      <thead><tr><th>Tipo</th><th>Prioridade</th><th>Indicação</th></tr></thead>
      <tbody>
        ${exames
          .map(
            (e) =>
              `<tr><td>${e.tipo || e.tipoExame}</td><td>${
                e.prioridade || e.prioridadeExame
              }</td><td>${e.indicacao || e.indicacaoClinica}</td></tr>`,
          )
          .join("")}
      </tbody>
    </table>`;
    }

    if (procedimentos.length > 0) {
      htmlExtras += `<h3>Procedimentos</h3>
    <table class="print-table">
      <thead><tr><th>Nome</th><th>Detalhes</th></tr></thead>
      <tbody>
        ${procedimentos
          .map(
            (p) => `<tr><td>${p.nome}</td><td>${p.detalhes || "-"}</td></tr>`,
          )
          .join("")}
      </tbody>
    </table>`;
    }

    if (afericoes.length > 0) {
      htmlExtras += `<h3>Aferições / Sinais Vitais</h3>
    <table class="print-table">
      <thead><tr><th>Data/Hora</th><th>Temp</th><th>FC</th><th>FR</th></tr></thead>
      <tbody>
        ${afericoes
          .map(
            (a) =>
              `<tr><td>${a.data} ${a.hora}</td><td>${
                a.temperatura || "-"
              }</td><td>${a.fc || "-"}</td><td>${a.fr || "-"}</td></tr>`,
          )
          .join("")}
      </tbody>
    </table>`;
    }

    // Preencher dados no template de impressão (DOM)
    document.getElementById("print-vet").textContent =
      atendimento.veterinario_nome || "--";
    document.getElementById("print-data").textContent = new Date(
      prescricao.data,
    ).toLocaleString();
    document.getElementById("print-tutor").textContent = nomeTutor;
    document.getElementById("print-animal").textContent = nomeAnimal;

    const linhasMedicamentos = prescricao.medicamentos
      .map(
        (med) => `
      <tr>
        <td>${med.nome}</td>
        <td>${med.dose}</td>
        <td>${med.intervalo || "--"}</td>
      </tr>
    `,
      )
      .join("");

    document.getElementById("print-medicamentos-tbody").innerHTML =
      linhasMedicamentos;
    document.getElementById("print-extras").innerHTML = htmlExtras;

    const obsContainer = document.getElementById("print-obs-container");
    if (prescricao.observacoes) {
      document.getElementById("print-obs-text").innerHTML =
        prescricao.observacoes.replace(/\n/g, "<br>");
      obsContainer.style.display = "block";
    } else {
      obsContainer.style.display = "none";
    }

    document.getElementById("print-data-impressao").textContent =
      new Date().toLocaleString();

    // Acionar impressão
    window.print();
  } catch (e) {
    console.error(e);
    alert("Erro ao preparar impressão.");
  }
}

function setupModalAlergias(atendimentoId) {
  const btnOpenAlergias = document.getElementById("btnOpenAlergias");
  const modalAlergias = document.getElementById("modalAlergias");
  const inputNovaAlergia = document.getElementById("inputNovaAlergia");
  const btnAddAlergiaItem = document.getElementById("btnAddAlergiaItem");
  const listaAlergiasModal = document.getElementById("listaAlergiasModal");
  const btnSaveAlergias = document.getElementById("btnSaveAlergias");
  const btnCancelAlergias = document.getElementById("btnCancelAlergias");
  let alergiasTemp = [];

  // Ocultar opções de edição (Adicionar/Salvar) para visualização apenas
  if (inputNovaAlergia && inputNovaAlergia.parentElement) {
    inputNovaAlergia.parentElement.style.display = "none";
  }
  if (btnSaveAlergias) {
    btnSaveAlergias.style.display = "none";
  }
  if (btnCancelAlergias) {
    btnCancelAlergias.textContent = "Fechar";
  }

  function renderListaModal() {
    if (!listaAlergiasModal) return;
    listaAlergiasModal.innerHTML = "";
    alergiasTemp.forEach((alergia, index) => {
      const li = document.createElement("li");
      li.textContent = alergia;
      listaAlergiasModal.appendChild(li);
    });
  }

  if (btnOpenAlergias) {
    btnOpenAlergias.addEventListener("click", () => {
      // Usa o texto que já está no header (carregado via API)
      const headerAlergias = document.getElementById("headerAlergias");
      const alergiasStr = headerAlergias ? headerAlergias.textContent : "";

      alergiasTemp = alergiasStr
        ? alergiasStr
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : [];
      renderListaModal();
      if (modalAlergias) modalAlergias.classList.remove("hidden");
    });
  }

  if (btnAddAlergiaItem) {
    btnAddAlergiaItem.addEventListener("click", () => {
      const val = inputNovaAlergia.value.trim();
      if (val) {
        alergiasTemp.push(val);
        inputNovaAlergia.value = "";
        renderListaModal();
      }
    });
  }

  if (btnSaveAlergias) {
    btnSaveAlergias.addEventListener("click", () => {
      // Apenas visualização nesta tela, ou implementar PUT /atendimentos
      alert(
        "Edição de alergias deve ser feita no cadastro do animal ou na triagem.",
      );
      if (modalAlergias) modalAlergias.classList.add("hidden");
    });
  }

  if (btnCancelAlergias) {
    btnCancelAlergias.addEventListener("click", () => {
      if (modalAlergias) modalAlergias.classList.add("hidden");
    });
  }
}
