document.addEventListener("DOMContentLoaded", () => {
  let chartInstance = null;
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
    if (!inputTemp.value && !inputFC.value && !inputFR.value) {
      alert("Preencha pelo menos um sinal vital (Temp, FC ou FR).");
      return;
    }

    const novaAfericao = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      atendimentoId: atendimentoId,
      data: inputData.value,
      hora: inputHora.value,
      temperatura: inputTemp.value,
      fc: inputFC.value,
      fr: inputFR.value,
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
        card.style.cssText =
          "background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border-left: 4px solid #0f766e;";

        const dataFormatada = new Date(af.data).toLocaleDateString();

        // Montar string de sinais vitais
        let sinais = [];
        if (af.temperatura)
          sinais.push(`<strong>Temp:</strong> ${af.temperatura}°C`);
        if (af.fc) sinais.push(`<strong>FC:</strong> ${af.fc} bpm`);
        if (af.fr) sinais.push(`<strong>FR:</strong> ${af.fr} mpm`);

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">
              <div style="color: #0f766e; font-size: 1rem;">
                 ${sinais.join(" | ")}
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 0.85rem; color: #666;">${dataFormatada} às ${
          af.hora
        }</span>
                <button onclick="excluirAfericao('${
                  af.id
                }')" title="Excluir" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">🗑️</button>
              </div>
            </div>
            ${
              af.obs
                ? `<div style="color: #374151; font-size: 0.9rem;"><em>Obs: ${af.obs}</em></div>`
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
      const data = new Date(a.data).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });
      return `${data} ${a.hora}`;
    });

    const dataTemp = dadosOrdenados.map((a) => a.temperatura || null);
    const dataFC = dadosOrdenados.map((a) => a.fc || null);
    const dataFR = dadosOrdenados.map((a) => a.fr || null);

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
          y: { type: "linear", display: true, position: "left", title: { display: true, text: "Temperatura (°C)" } },
          y1: { type: "linear", display: true, position: "right", title: { display: true, text: "Frequência" }, grid: { drawOnChartArea: false } },
        },
      },
    });
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
