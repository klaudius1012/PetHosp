document.addEventListener("DOMContentLoaded", () => {
  carregarDadosCabecalho();
  initAlergiasModal();
});

function carregarDadosCabecalho() {
  const header = document.querySelector(".atendimento-header");
  if (!header) return;

  const params = new URLSearchParams(window.location.search);
  const atendimentoId = params.get("id");

  if (!atendimentoId) {
    return;
  }

  const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
  const atendimento = atendimentos.find((a) => a.id == atendimentoId);

  if (!atendimento) {
    console.warn("Atendimento não encontrado.");
    return;
  }

  const animais = JSON.parse(localStorage.getItem("animais")) || [];
  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];

  // 1. Identificar Tutor (com fallback por nome)
  let tutor = null;
  if (atendimento.tutorId) {
    tutor = tutores.find((t) => t.id == atendimento.tutorId);
  }
  if (!tutor && atendimento.tutor) {
    tutor = tutores.find((t) => t.nome === atendimento.tutor);
  }

  // 2. Identificar Animal (com fallback por nome e tutor)
  let animal = null;
  if (atendimento.animalId) {
    animal = animais.find((a) => a.id == atendimento.animalId);
  }
  if (!animal && atendimento.animal) {
    if (tutor) {
      animal = animais.find(
        (a) => a.nome === atendimento.animal && a.tutorId == tutor.id
      );
    }
    if (!animal) {
      animal = animais.find((a) => a.nome === atendimento.animal);
    }
  }

  if (animal) {
    setElementText("headerAnimalNome", animal.nome);
    setElementText("headerRaca", animal.raca);
    setElementText("headerSexo", animal.sexo);
    setElementText("headerPorte", animal.porte);
    setElementText("headerReprodutiva", animal.condicaoReprodutiva);

    if (animal.nascimento) {
      setElementText(
        "headerAnimalIdade",
        `Idade: ${calcularIdade(animal.nascimento)}`
      );
    } else {
      setElementText("headerAnimalIdade", "Idade: --");
    }

    const img = document.getElementById("headerAnimalFoto");
    const placeholder = document.getElementById("headerAnimalFotoPlaceholder");
    if (img && placeholder) {
      if (animal.foto) {
        img.src = animal.foto;
        img.style.display = "block";
        placeholder.style.display = "none";
      } else {
        img.style.display = "none";
        placeholder.style.display = "block";
      }
    }
  } else {
    setElementText("headerAnimalNome", atendimento.animal);
  }

  if (tutor) {
    setElementText("headerTutor", tutor.nome);
    setElementText("headerTelefone", tutor.telefone);
  } else {
    setElementText("headerTutor", atendimento.tutor);
  }

  setElementText("headerPeso", atendimento.peso);
  setElementText("headerTemp", atendimento.temperatura);
  setElementText("headerFC", atendimento.frequenciaCardiaca);
  setElementText("headerFR", atendimento.frequenciaRespiratoria);
  setElementText("headerTPC", atendimento.tpc);
  setElementText("headerMucosas", atendimento.mucosas);
  setElementText("headerHidratacao", atendimento.hidratacao);
  setElementText("headerConsciencia", atendimento.consciencia);
  setElementText("headerQueixa", atendimento.queixa);
  setElementText("headerAlergias", atendimento.alergias);

  // --- Alertas de Triagem ---
  const fc = parseFloat(atendimento.frequenciaCardiaca);
  const fr = parseFloat(atendimento.frequenciaRespiratoria);
  const tpc = parseFloat(atendimento.tpc);
  const temp = parseFloat(atendimento.temperatura);
  const especie = animal ? (animal.especie || "").toLowerCase() : "";

  // Função para adicionar/remover classe de alerta no .info-item
  function setTriageAlert(elementId, isAlert) {
    const element = document.getElementById(elementId);
    // A estrutura é: .info-item > .value > span#elementId
    if (element && element.parentElement && element.parentElement.parentElement) {
      const infoItem = element.parentElement.parentElement;
      if (isAlert) {
        infoItem.classList.add("param-alert");
      } else {
        infoItem.classList.remove("param-alert");
      }
    }
  }

  // Checar FC (Frequência Cardíaca)
  let fcAlert = false;
  if (!isNaN(fc) && especie) {
    if (especie.includes("canino") || especie.includes("cão") || especie.includes("cachorro")) {
      if (fc < 60 || fc > 160) fcAlert = true; // Parâmetros para cães
    } else if (especie.includes("felino") || especie.includes("gato")) {
      if (fc < 140 || fc > 220) fcAlert = true; // Parâmetros para gatos
    }
  }
  setTriageAlert("headerFC", fcAlert);

  // Checar FR (Frequência Respiratória)
  let frAlert = false;
  if (!isNaN(fr) && (fr < 10 || fr > 35)) frAlert = true; // Parâmetro geral
  setTriageAlert("headerFR", frAlert);

  // Checar TPC (Tempo de Preenchimento Capilar)
  let tpcAlert = false;
  if (!isNaN(tpc) && tpc >= 2) tpcAlert = true;
  setTriageAlert("headerTPC", tpcAlert);

  // Checar Temperatura
  let tempAlert = false;
  if (!isNaN(temp) && (temp < 37.5 || temp > 39.5)) tempAlert = true;
  setTriageAlert("headerTemp", tempAlert);

  // Checar Mucosas
  let mucosasAlert = false;
  const mucosasValue = (atendimento.mucosas || "").toLowerCase();
  if (mucosasValue && mucosasValue !== "róseas" && mucosasValue !== "roseas") {
    mucosasAlert = true;
  }
  setTriageAlert("headerMucosas", mucosasAlert);

  // Checar Hidratação
  let hidratacaoAlert = false;
  const hidratacaoValue = (atendimento.hidratacao || "").toLowerCase();
  if (hidratacaoValue && hidratacaoValue !== "normal") hidratacaoAlert = true;
  setTriageAlert("headerHidratacao", hidratacaoAlert);

  // Checar Nível de Consciência
  let conscienciaAlert = false;
  const conscienciaValue = (atendimento.consciencia || "").toLowerCase();
  if (conscienciaValue && conscienciaValue !== "alerta") {
    conscienciaAlert = true;
  }
  setTriageAlert("headerConsciencia", conscienciaAlert);

  // Adicionar ícone de alerta ao título se houver parâmetros anormais
  const hasAnyTriageAlert =
    fcAlert ||
    frAlert ||
    tpcAlert ||
    tempAlert ||
    mucosasAlert ||
    hidratacaoAlert ||
    conscienciaAlert;

  const animalNameEl = document.getElementById("headerAnimalNome");
  if (animalNameEl && hasAnyTriageAlert) {
    const alertIcon = document.createElement("span");
    alertIcon.textContent = " ⚠️";
    alertIcon.title = "Atenção: Parâmetros vitais fora do normal";
    alertIcon.style.fontSize = "0.8em";
    alertIcon.style.cursor = "help";
    animalNameEl.appendChild(alertIcon);
  }

  const alergiasEl = document.getElementById("headerAlergias");
  if (alergiasEl && alergiasEl.parentElement) {
    const val = (atendimento.alergias || "").toLowerCase();
    if (val && val !== "não" && val !== "nenhuma" && val !== "--") {
      alergiasEl.parentElement.classList.add("alert-item");
    } else {
      alergiasEl.parentElement.classList.remove("alert-item");
    }
  }
}

function setElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text || "--";
  }
}

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return "--";
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();

  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }

  if (idade === 0) {
    let meses =
      (hoje.getFullYear() - nasc.getFullYear()) * 12 +
      (hoje.getMonth() - nasc.getMonth());
    if (hoje.getDate() < nasc.getDate()) meses--;
    return `${meses} meses`;
  }

  return `${idade} anos`;
}

function initAlergiasModal() {
  const headerAlergias = document.getElementById("headerAlergias");
  const btnAlergias =
    document.querySelector(".btn-ver-alergias") ||
    document.getElementById("btnOpenAlergias") ||
    document.getElementById("btnOpenAlergiasHeader");
  const modalAlergias = document.getElementById("modalAlergias");
  const btnCancel = document.getElementById("btnCancelAlergias");

  // Lógica de Piscar (Blink)
  if (headerAlergias && btnAlergias) {
    const verificarAlergias = () => {
      const texto = headerAlergias.textContent
        ? headerAlergias.textContent.trim()
        : "";
      const textoLower = texto.toLowerCase();
      const termosNegativos = ["", "--", "nenhuma", "não", "nao", "negativo"];

      if (!termosNegativos.includes(textoLower)) {
        btnAlergias.classList.add("btn-blink");
      } else {
        btnAlergias.classList.remove("btn-blink");
      }
    };

    const observer = new MutationObserver(verificarAlergias);
    observer.observe(headerAlergias, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    verificarAlergias();
  }

  // Lógica de Abrir Modal
  if (btnAlergias && modalAlergias) {
    btnAlergias.addEventListener("click", (e) => {
      e.preventDefault();
      modalAlergias.classList.remove("hidden");

      // Popula a lista do modal se estiver vazia, usando o texto do cabeçalho
      const lista = document.getElementById("listaAlergiasModal");
      if (lista && lista.children.length === 0 && headerAlergias) {
        const texto = headerAlergias.textContent.trim();
        if (texto && texto !== "--") {
          const itens = texto.split(/[,;]+/).map((s) => s.trim()).filter((s) => s);
          lista.innerHTML = "";
          itens.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            lista.appendChild(li);
          });
        }
      }
    });
  }

  // Lógica de Fechar Modal
  if (btnCancel && modalAlergias) {
    btnCancel.addEventListener("click", () => {
      modalAlergias.classList.add("hidden");
    });
  }
}
