document.addEventListener("DOMContentLoaded", () => {
  let chartInstance = null;
  let chartPressaoInstance = null;
  let chartGlicemiaInstance = null;
  const params = new URLSearchParams(window.location.search);
  const atendimentoId = params.get("id");

  if (!atendimentoId) {
    alert("Atendimento não identificado.");
    window.location.href = "internacao.html";
    return;
  }

  const form = document.getElementById("formAfericao");
  const inputData = document.getElementById("dataAfericao");
  const inputHora = document.getElementById("horaAfericao");
  const inputTemp = document.getElementById("tempAfericao");
  const inputFC = document.getElementById("fcAfericao");
  const inputFR = document.getElementById("frAfericao");
  const inputTPC = document.getElementById("tpcAfericao");
  const inputPaSistolica = document.getElementById("paSistolica");
  const inputPaDiastolica = document.getElementById("paDiastolica");
  const inputGlicemia = document.getElementById("glicemiaAfericao");
  const inputMucosas = document.getElementById("mucosasAfericao");
  const inputHidratacao = document.getElementById("hidratacaoAfericao");
  const inputConsciencia = document.getElementById("conscienciaAfericao");
  const inputUrina = document.getElementById("urinaAfericao");
  const inputObs = document.getElementById("obsAfericao");
  const listaContainer = document.getElementById("listaAfericoes");

  // Define data e hora atuais como padrão
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  if (inputData) inputData.value = agora.toISOString().slice(0, 10);
  if (inputHora) inputHora.value = agora.toISOString().slice(11, 16);

  // Carrega histórico
  carregarAfericoes();

  // Evento de Salvar
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      salvarAfericao();
    });
  }

  function salvarAfericao() {
    // Validação básica: pelo menos um sinal vital deve ser preenchido
    if (
      !inputTemp.value &&
      !inputFC.value &&
      !inputFR.value &&
      !inputTPC.value &&
      !inputPaSistolica.value &&
      !inputPaDiastolica.value &&
      !inputGlicemia.value &&
      !inputMucosas.value &&
      !inputHidratacao.value &&
      !inputConsciencia.value
    ) {
      alert("Preencha pelo menos um parâmetro clínico.");
      return;
    }

    let pressaoVal = "";
    if (inputPaSistolica.value || inputPaDiastolica.value) {
      pressaoVal = `${inputPaSistolica.value || "?"}/${
        inputPaDiastolica.value || "?"
      }`;
    }

    const novaAfericao = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      atendimentoId: atendimentoId,
      data: inputData.value,
      hora: inputHora.value,
      temperatura: inputTemp.value,
      fc: inputFC.value,
      fr: inputFR.value,
      tpc: inputTPC.value,
      pressao: pressaoVal,
      glicemia: inputGlicemia.value,
      mucosas: inputMucosas.value,
      hidratacao: inputHidratacao.value,
      consciencia: inputConsciencia.value,
      urina: inputUrina.value,
      obs: inputObs ? inputObs.value.trim() : "",
      dataRegistro: new Date().toISOString(),
    };

    const afericoes = JSON.parse(localStorage.getItem("afericoes")) || [];
    afericoes.push(novaAfericao);
    localStorage.setItem("afericoes", JSON.stringify(afericoes));

    alert("Aferição registrada com sucesso!");
    inputTemp.value = "";
    inputFC.value = "";
    inputFR.value = "";
    inputTPC.value = "";
    inputPaSistolica.value = "";
    inputPaDiastolica.value = "";
    inputGlicemia.value = "";
    inputMucosas.value = "";
    inputHidratacao.value = "";
    inputConsciencia.value = "";
    inputUrina.value = "";
    if (inputObs) inputObs.value = "";
    carregarAfericoes();
  }

  function carregarAfericoes() {
    const afericoes = JSON.parse(localStorage.getItem("afericoes")) || [];
    const lista = afericoes.filter((a) => a.atendimentoId === atendimentoId);

    // Ordenar: mais recente primeiro
    lista.sort((a, b) => {
      const dtA = new Date(`${a.data}T${a.hora}`);
      const dtB = new Date(`${b.data}T${b.hora}`);
      return dtB - dtA;
    });

    atualizarGrafico(lista);

    if (listaContainer) {
      listaContainer.innerHTML = "";

      if (lista.length === 0) {
        listaContainer.innerHTML =
          '<p style="text-align:center; color:#666; padding: 1rem;">Nenhuma aferição registrada.</p>';
        return;
      }

      lista.forEach((af) => {
        const card = document.createElement("div");
        card.className = "afericao-card";

        const dataFormatada = new Date(af.data).toLocaleDateString();

        // Montar string de sinais vitais
        let sinais = [];
        if (af.temperatura)
          sinais.push(`<strong>Temp:</strong> ${af.temperatura}°C`);
        if (af.fc) sinais.push(`<strong>FC:</strong> ${af.fc} bpm`);
        if (af.fr) sinais.push(`<strong>FR:</strong> ${af.fr} mpm`);
        if (af.tpc) sinais.push(`<strong>TPC:</strong> ${af.tpc}s`);
        if (af.pressao) sinais.push(`<strong>PA:</strong> ${af.pressao}`);
        if (af.glicemia) sinais.push(`<strong>Glic:</strong> ${af.glicemia}`);

        let qualitativos = [];
        if (af.mucosas)
          qualitativos.push(`<strong>Mucosas:</strong> ${af.mucosas}`);
        if (af.hidratacao)
          qualitativos.push(`<strong>Hidrat:</strong> ${af.hidratacao}`);
        if (af.consciencia)
          qualitativos.push(`<strong>Cons:</strong> ${af.consciencia}`);
        if (af.urina) qualitativos.push(`<strong>Urina:</strong> ${af.urina}`);

        card.innerHTML = `
            <div class="afericao-header">
              <div class="afericao-info-col">
                <div class="sinais-vitais">
                   ${sinais.join(" | ")}
                </div>
                <div class="qualitativos">
                   ${qualitativos.join(" | ")}
                </div>
              </div>
              <div class="afericao-meta">
                <span class="afericao-date">${dataFormatada} às ${
          af.hora
        }</span>
                <button onclick="excluirAfericao('${
                  af.id
                }')" title="Excluir" class="btn-delete">🗑️</button>
              </div>
            </div>
            ${
              af.obs
                ? `<div class="afericao-obs"><em>Obs: ${af.obs}</em></div>`
                : ""
            }
          `;
        listaContainer.appendChild(card);
      });
    }
  }

  function atualizarGrafico(lista) {
    const ctx = document.getElementById("graficoAfericoes");
    if (!ctx) return;

    // Ordenar cronologicamente (mais antigo para mais recente) para o gráfico
    const dadosOrdenados = [...lista].sort((a, b) => {
      const dtA = new Date(`${a.data}T${a.hora}`);
      const dtB = new Date(`${b.data}T${b.hora}`);
      return dtA - dtB;
    });

    const labels = dadosOrdenados.map((a) => {
      const data = new Date(a.data).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
      });
      return `${data} ${a.hora}`;
    });

    const dataTemp = dadosOrdenados.map((a) => a.temperatura || null);
    const dataFC = dadosOrdenados.map((a) => a.fc || null);
    const dataFR = dadosOrdenados.map((a) => a.fr || null);
    const dataGlicemia = dadosOrdenados.map((a) => a.glicemia || null);

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Temp (°C)",
            data: dataTemp,
            borderColor: "#ef4444", // Vermelho
            backgroundColor: "#ef4444",
            yAxisID: "y",
            tension: 0.2,
          },
          {
            label: "FC (bpm)",
            data: dataFC,
            borderColor: "#3b82f6", // Azul
            backgroundColor: "#3b82f6",
            yAxisID: "y1",
            tension: 0.2,
          },
          {
            label: "FR (mpm)",
            data: dataFR,
            borderColor: "#10b981", // Verde
            backgroundColor: "#10b981",
            yAxisID: "y1", // Compartilha eixo com FC
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: { display: true, text: "Temperatura (°C)" },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: { display: true, text: "Frequência" },
            grid: { drawOnChartArea: false },
          },
        },
      },
    });

    // Gráfico de Pressão Arterial
    const ctxPressao = document.getElementById("graficoPressao");
    if (ctxPressao) {
      const dataSistolica = dadosOrdenados.map((a) => {
        if (!a.pressao || !a.pressao.includes("/")) return null;
        const val = parseFloat(a.pressao.split("/")[0]);
        return isNaN(val) ? null : val;
      });

      const dataDiastolica = dadosOrdenados.map((a) => {
        if (!a.pressao || !a.pressao.includes("/")) return null;
        const val = parseFloat(a.pressao.split("/")[1]);
        return isNaN(val) ? null : val;
      });

      if (chartPressaoInstance) {
        chartPressaoInstance.destroy();
      }

      chartPressaoInstance = new Chart(ctxPressao, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Sistólica (Max)",
              data: dataSistolica,
              borderColor: "#dc2626", // Vermelho escuro
              backgroundColor: "#dc2626",
              tension: 0.2,
            },
            {
              label: "Diastólica (Min)",
              data: dataDiastolica,
              borderColor: "#2563eb", // Azul forte
              backgroundColor: "#2563eb",
              tension: 0.2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          scales: {
            y: {
              type: "linear",
              display: true,
              title: { display: true, text: "Pressão (mmHg)" },
              beginAtZero: false,
            },
          },
        },
      });
    }

    // Gráfico de Glicemia
    const ctxGlicemia = document.getElementById("graficoGlicemia");
    if (ctxGlicemia) {
      if (chartGlicemiaInstance) {
        chartGlicemiaInstance.destroy();
      }

      chartGlicemiaInstance = new Chart(ctxGlicemia, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Glicemia (mg/dL)",
              data: dataGlicemia,
              borderColor: "#eab308", // Amarelo/Dourado
              backgroundColor: "#eab308",
              tension: 0.2,
              yAxisID: "y",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          scales: {
            y: {
              type: "linear",
              display: true,
              position: "left",
              title: { display: true, text: "Glicemia (mg/dL)" },
            },
          },
        },
      });
    }
  }

  window.excluirAfericao = function (id) {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      let afericoes = JSON.parse(localStorage.getItem("afericoes")) || [];
      afericoes = afericoes.filter((a) => a.id !== id);
      localStorage.setItem("afericoes", JSON.stringify(afericoes));
      carregarAfericoes();
    }
  };
});
