document.addEventListener("DOMContentLoaded", () => {
  carregarDadosCabecalho();
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
  setElementText("headerQueixa", atendimento.queixa);
  setElementText("headerAlergias", atendimento.alergias);

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
