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
  const inputAlergias = document.getElementById("alergias");
  const textQueixa = document.getElementById("queixa");
  const textObservacoes = document.getElementById("observacoes");

  // Carregar dados do localStorage
  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];
  const animais = JSON.parse(localStorage.getItem("animais")) || [];

  // 1. Preencher Select de Tutores
  selectTutor.innerHTML = '<option value="">Selecione...</option>';
  tutores.forEach((t) => {
    const option = document.createElement("option");
    option.value = t.nome;
    option.textContent = t.nome;
    option.dataset.id = t.id; // Guarda o ID no dataset para busca
    selectTutor.appendChild(option);
  });

  // 2. Lógica de Dependência Tutor -> Animal
  selectTutor.addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex];
    const tutorId = selectedOption.dataset.id;

    // Resetar select de animais
    selectAnimal.innerHTML =
      '<option value="">Selecione um tutor primeiro...</option>';
    selectAnimal.disabled = true;
    inputPeso.value = "";
    const spanIdade = document.getElementById("spanIdadeAnimal");
    if (spanIdade) spanIdade.textContent = "";

    if (tutorId) {
      // Filtrar animais deste tutor
      const petsDoTutor = animais.filter((a) => a.tutorId == tutorId);

      if (petsDoTutor.length > 0) {
        selectAnimal.disabled = false;
        selectAnimal.innerHTML =
          '<option value="">Selecione o animal...</option>';

        petsDoTutor.forEach((a) => {
          const option = document.createElement("option");
          option.value = a.nome;
          option.textContent = a.nome;
          selectAnimal.appendChild(option);
        });
      } else {
        selectAnimal.innerHTML =
          '<option value="">Nenhum animal encontrado</option>';
      }
    }
  });

  // Função auxiliar para calcular idade
  function calcularIdade(dataNasc) {
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }

    if (idade === 0) {
      let meses = (hoje.getFullYear() - nasc.getFullYear()) * 12 + (hoje.getMonth() - nasc.getMonth());
      if (hoje.getDate() < nasc.getDate()) meses--;
      return `${meses} meses`;
    }

    return `${idade} anos`;
  }

  // Carregar dados do animal (Peso) ao selecionar
  selectAnimal.addEventListener("change", function () {
    const nomeAnimal = this.value;
    const selectedTutorOption = selectTutor.options[selectTutor.selectedIndex];
    const tutorId = selectedTutorOption ? selectedTutorOption.dataset.id : null;

    // Elemento para exibir a idade (cria se não existir)
    let spanIdade = document.getElementById("spanIdadeAnimal");
    if (!spanIdade) {
      spanIdade = document.createElement("span");
      spanIdade.id = "spanIdadeAnimal";
      spanIdade.style.marginLeft = "10px";
      spanIdade.style.color = "#555";
      spanIdade.style.fontSize = "0.9rem";
      this.parentNode.appendChild(spanIdade);
    }
    spanIdade.textContent = "";

    if (nomeAnimal && tutorId) {
      const animalEncontrado = animais.find(
        (a) => a.nome === nomeAnimal && a.tutorId == tutorId
      );
      if (animalEncontrado) {
        inputPeso.value = animalEncontrado.peso || "";
        if (animalEncontrado.nascimento) {
          spanIdade.textContent = `Idade: ${calcularIdade(animalEncontrado.nascimento)}`;
        }
      }
    }
  });

  // 3. Validação de Temperatura (Febre Alta)
  inputTemperatura.addEventListener("change", function () {
    const temperatura = parseFloat(this.value);

    // Limpa estilos anteriores
    this.style.borderColor = "";
    this.style.backgroundColor = "";

    if (!isNaN(temperatura) && temperatura > 39.5) {
      alert(
        `ALERTA: A temperatura informada (${temperatura}°C) indica febre alta!`
      );

      // Destaque visual
      this.style.borderColor = "#dc2626";
      this.style.backgroundColor = "#fee2e2";

      // Sugestão de mudança de prioridade
      if (selectPrioridade.value !== "Emergência") {
        const confirmar = confirm(
          "Deseja alterar a prioridade para 'Emergência'?"
        );
        if (confirmar) {
          selectPrioridade.value = "Emergência";
        }
      }
    }
  });

  // 4. Definir Data/Hora atual como padrão
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset()); // Ajuste fuso
  const isoString = agora.toISOString();
  inputData.value = isoString.slice(0, 10);
  inputHora.value = isoString.slice(11, 16);

  // 5. Salvar Atendimento
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const dadosAtendimento = {
      id: "AT" + Date.now(),
      tutor: selectTutor.value,
      animal: selectAnimal.value,
      veterinario: selectVeterinario.value,
      dataHora: `${inputData.value}T${inputHora.value}`,
      peso: inputPeso.value,
      temperatura: inputTemperatura.value,
      prioridade: selectPrioridade.value,
      alergias: inputAlergias.value,
      status: "Aguardando",
      queixa: textQueixa.value,
      observacoes: textObservacoes.value,
    };

    const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
    atendimentos.push(dadosAtendimento);
    localStorage.setItem("atendimentos", JSON.stringify(atendimentos));

    alert("Atendimento registrado com sucesso!");
    window.location.href = "recepcao.html";
  });
});
