document.addEventListener("DOMContentLoaded", () => {
  // Referências aos elementos do DOM
  const form = document.getElementById("formAtendimento");
  const selectTutor = document.getElementById("tutorSelect");
  const selectAnimal = document.getElementById("animalSelect");
  const selectVeterinario = document.getElementById("veterinarioSelect");
  const inputData = document.getElementById("dataAtendimento");
  const inputHora = document.getElementById("horaAtendimento");
  const inputPeso = document.getElementById("peso");
  const inputTemperatura = document.getElementById("temperatura");
  const selectPrioridade = document.getElementById("prioridade");
  const textQueixa = document.getElementById("queixa");
  const textObservacoes = document.getElementById("observacoes");
  const inputAtendimentoId = document.getElementById("atendimentoId"); // Hidden input

  // Carregar dados do localStorage
  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];
  const animais = JSON.parse(localStorage.getItem("animais")) || [];
  const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];

  // Pegar o ID do atendimento da URL
  const urlParams = new URLSearchParams(window.location.search);
  const atendimentoId = urlParams.get("id");
  if (!atendimentoId) {
    alert("ID do atendimento não encontrado!");
    window.location.href = "recepcao.html";
    return;
  }

  // Encontrar o atendimento a ser editado
  const atendimentoParaEditar = atendimentos.find(
    (a) => a.id === atendimentoId
  );
  if (!atendimentoParaEditar) {
    alert("Atendimento não encontrado!");
    window.location.href = "recepcao.html";
    return;
  }

  // Função para popular o select de tutores
  function popularTutores() {
    selectTutor.innerHTML = '<option value="">Selecione...</option>';
    tutores.forEach((t) => {
      const option = document.createElement("option");
      option.value = t.nome;
      option.textContent = t.nome;
      option.dataset.id = t.id;
      selectTutor.appendChild(option);
    });
  }

  // Função para popular o select de animais de um tutor
  function popularAnimais(tutorId, animalSelecionado) {
    selectAnimal.innerHTML = '<option value="">Selecione o animal...</option>';
    selectAnimal.disabled = false;

    const petsDoTutor = animais.filter((a) => a.tutorId == tutorId);
    if (petsDoTutor.length > 0) {
      petsDoTutor.forEach((a) => {
        const option = document.createElement("option");
        option.value = a.nome;
        option.textContent = a.nome;
        selectAnimal.appendChild(option);
      });
      selectAnimal.value = animalSelecionado;
    } else {
      selectAnimal.innerHTML =
        '<option value="">Nenhum animal encontrado</option>';
      selectAnimal.disabled = true;
    }
  }

  // Lógica de Dependência Tutor -> Animal
  selectTutor.addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex];
    const tutorId = selectedOption.dataset.id;
    popularAnimais(tutorId, ""); // Limpa a seleção de animal ao trocar de tutor
  });

  // Função para carregar os dados do atendimento no formulário
  function carregarDadosFormulario() {
    popularTutores();

    // Selecionar o tutor e popular os animais
    selectTutor.value = atendimentoParaEditar.tutor;
    const tutorSelecionado = tutores.find(
      (t) => t.nome === atendimentoParaEditar.tutor
    );
    if (tutorSelecionado) {
      popularAnimais(tutorSelecionado.id, atendimentoParaEditar.animal);
    }

    // Preencher os outros campos
    inputAtendimentoId.value = atendimentoParaEditar.id;
    selectVeterinario.value = atendimentoParaEditar.veterinario;
    const [data, hora] = (atendimentoParaEditar.dataHora || "T").split("T");
    inputData.value = data;
    inputHora.value = hora;
    inputPeso.value = atendimentoParaEditar.peso;
    inputTemperatura.value = atendimentoParaEditar.temperatura;
    selectPrioridade.value = atendimentoParaEditar.prioridade;
    textQueixa.value = atendimentoParaEditar.queixa;
    textObservacoes.value = atendimentoParaEditar.observacoes;
  }

  // Validação de Temperatura (Febre Alta)
  inputTemperatura.addEventListener("change", function () {
    const temperatura = parseFloat(this.value);
    this.style.borderColor = "";
    this.style.backgroundColor = "";
    if (!isNaN(temperatura) && temperatura > 39.5) {
      alert(
        `ALERTA: A temperatura informada (${temperatura}°C) indica febre alta!`
      );
      this.style.borderColor = "#dc2626";
      this.style.backgroundColor = "#fee2e2";
      if (selectPrioridade.value !== "Emergência") {
        if (confirm("Deseja alterar a prioridade para 'Emergência'?")) {
          selectPrioridade.value = "Emergência";
        }
      }
    }
  });

  // Salvar alterações do Atendimento
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const index = atendimentos.findIndex((a) => a.id === atendimentoId);
    if (index === -1) {
      alert("Erro ao salvar: Atendimento não encontrado.");
      return;
    }

    // Atualizar os dados do atendimento
    atendimentos[index] = {
      ...atendimentos[index], // Mantém status e id original
      tutor: selectTutor.value,
      animal: selectAnimal.value,
      veterinario: selectVeterinario.value,
      dataHora: `${inputData.value}T${inputHora.value}`,
      peso: inputPeso.value,
      temperatura: inputTemperatura.value,
      prioridade: selectPrioridade.value,
      queixa: textQueixa.value,
      observacoes: textObservacoes.value,
    };

    localStorage.setItem("atendimentos", JSON.stringify(atendimentos));

    alert("Atendimento atualizado com sucesso!");
    window.location.href = "recepcao.html";
  });

  // Iniciar o carregamento dos dados
  carregarDadosFormulario();
});
