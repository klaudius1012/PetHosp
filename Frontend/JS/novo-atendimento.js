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
  const inputFC = document.getElementById("frequenciaCardiaca");
  const inputFR = document.getElementById("frequenciaRespiratoria");
  const inputTPC = document.getElementById("tpc");
  const selectMucosas = document.getElementById("mucosas");
  const selectHidratacao = document.getElementById("hidratacao");
  const selectConsciencia = document.getElementById("consciencia");
  const selectPrioridade = document.getElementById("prioridade");
  const inputAlergias = document.getElementById("alergias");
  const textQueixa = document.getElementById("queixa");
  const textObservacoes = document.getElementById("observacoes");
  const inputVacinacao = document.getElementById("vacinacao");
  const inputAmbiente = document.getElementById("ambiente");
  const inputAlimentacao = document.getElementById("alimentacao");
  const alertaVacinacao = document.getElementById("alertaVacinacao");

  // Elementos do Modal de Alergias
  const btnOpenAlergias = document.getElementById("btnOpenAlergias");
  const modalAlergias = document.getElementById("modalAlergias");
  const inputNovaAlergia = document.getElementById("inputNovaAlergia");
  const btnAddAlergiaItem = document.getElementById("btnAddAlergiaItem");
  const listaAlergiasModal = document.getElementById("listaAlergiasModal");
  const btnSaveAlergias = document.getElementById("btnSaveAlergias");
  const btnCancelAlergias = document.getElementById("btnCancelAlergias");
  const alergiasTags = document.getElementById("alergiasTags");

  let alergiasTemp = [];

  // Elementos do Modal de Vacinas
  const btnOpenVacinas = document.getElementById("btnOpenVacinas");
  const modalVacinas = document.getElementById("modalVacinas");
  const inputNomeVacina = document.getElementById("inputNomeVacina");
  const inputDataVacina = document.getElementById("inputDataVacina");
  const inputDataRevacinaItem = document.getElementById("inputDataRevacinaItem");
  const btnAddVacinaItem = document.getElementById("btnAddVacinaItem");
  const listaVacinasModal = document.getElementById("listaVacinasModal");
  const btnSaveVacinas = document.getElementById("btnSaveVacinas");
  const btnCancelVacinas = document.getElementById("btnCancelVacinas");
  const vacinasTags = document.getElementById("vacinasTags");
  let vacinasTemp = [];

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
    const tutorId = selectedOption ? selectedOption.dataset.id : null;

    // Resetar select de animais
    selectAnimal.innerHTML =
      '<option value="">Selecione um tutor primeiro...</option>';
    selectAnimal.disabled = true;
    inputPeso.value = "";
    if (inputVacinacao) {
      inputVacinacao.value = "";
      inputVacinacao.classList.remove("input-error");
    }
    if (inputAmbiente) inputAmbiente.value = "";
    if (inputAlimentacao) inputAlimentacao.value = "";
    if (inputAlergias) {
      inputAlergias.value = "";
      renderAlergiasTags();
    }
    if (alertaVacinacao) alertaVacinacao.style.display = "none";
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
      let meses =
        (hoje.getFullYear() - nasc.getFullYear()) * 12 +
        (hoje.getMonth() - nasc.getMonth());
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

    // Limpa o alerta de vacinação ao trocar de animal
    if (alertaVacinacao) alertaVacinacao.style.display = "none";
    if (inputVacinacao) inputVacinacao.classList.remove("input-error");

    // Limpa campos que não devem ser auto-completados para evitar dados residuais
    inputPeso.value = "";
    if (inputFC) inputFC.value = "";
    if (inputFR) inputFR.value = "";
    if (inputTPC) inputTPC.value = "";
    if (selectMucosas) selectMucosas.value = "";
    if (selectHidratacao) selectHidratacao.value = "";
    if (selectConsciencia) selectConsciencia.value = "";
    if (inputVacinacao) {
      inputVacinacao.value = "";
      renderVacinasTags();
    }
    if (inputAmbiente) inputAmbiente.value = "";
    if (inputAlimentacao) inputAlimentacao.value = "";

    if (nomeAnimal && tutorId) {
      const animalEncontrado = animais.find(
        (a) => a.nome === nomeAnimal && a.tutorId == tutorId
      );
      if (animalEncontrado) {
        if (animalEncontrado.nascimento) {
          spanIdade.textContent = `Idade: ${calcularIdade(
            animalEncontrado.nascimento
          )}`;
        }
        if (inputAlergias) {
          inputAlergias.value = animalEncontrado.alergias || "";
          renderAlergiasTags();
        }
        if (inputVacinacao) {
          inputVacinacao.value = animalEncontrado.vacinacao || "";
          renderVacinasTags();
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

    const selectedTutorOption = selectTutor.options[selectTutor.selectedIndex];
    const tutorId = selectedTutorOption ? selectedTutorOption.dataset.id : null;
    const animalObj = animais.find(
      (a) => a.nome === selectAnimal.value && a.tutorId == tutorId
    );

    const dadosAtendimento = {
      id: "AT" + Date.now(),
      tutor: selectTutor.value,
      tutorId: tutorId,
      animal: selectAnimal.value,
      animalId: animalObj ? animalObj.id : null,
      veterinario: selectVeterinario.value,
      dataHora: `${inputData.value}T${inputHora.value}`,
      peso: inputPeso.value,
      temperatura: inputTemperatura.value,
      frequenciaCardiaca: inputFC.value,
      frequenciaRespiratoria: inputFR.value,
      tpc: inputTPC.value,
      mucosas: selectMucosas.value,
      hidratacao: selectHidratacao.value,
      consciencia: selectConsciencia.value,
      prioridade: selectPrioridade.value,
      alergias: inputAlergias.value,
      vacinacao: inputVacinacao ? inputVacinacao.value : "",
      ambiente: inputAmbiente ? inputAmbiente.value : "",
      alimentacao: inputAlimentacao ? inputAlimentacao.value : "",
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

  // --- Lógica do Modal de Alergias ---

  function renderAlergiasTags() {
    if (!alergiasTags || !inputAlergias) return;
    alergiasTags.innerHTML = "";
    const alergiasStr = inputAlergias.value;
    if (!alergiasStr) return;

    const lista = alergiasStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    lista.forEach((alergia) => {
      const tag = document.createElement("span");
      tag.className = "alergia-tag";
      tag.textContent = alergia;
      alergiasTags.appendChild(tag);
    });
  }

  function renderListaModal() {
    listaAlergiasModal.innerHTML = "";
    alergiasTemp.forEach((alergia, index) => {
      const li = document.createElement("li");
      li.textContent = alergia;

      const btnRemove = document.createElement("button");
      btnRemove.textContent = "❌";
      btnRemove.style.marginLeft = "10px";
      btnRemove.style.border = "none";
      btnRemove.style.background = "transparent";
      btnRemove.style.cursor = "pointer";
      btnRemove.onclick = () => {
        alergiasTemp.splice(index, 1);
        renderListaModal();
      };

      li.appendChild(btnRemove);
      listaAlergiasModal.appendChild(li);
    });
  }

  if (btnOpenAlergias) {
    btnOpenAlergias.addEventListener("click", () => {
      const val = inputAlergias.value;
      alergiasTemp = val
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : [];
      renderListaModal();
      modalAlergias.classList.remove("hidden");
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
      const novasAlergias = alergiasTemp.join(", ");
      inputAlergias.value = novasAlergias;
      renderAlergiasTags();
      modalAlergias.classList.add("hidden");

      // Atualizar cadastro do animal permanentemente
      const nomeAnimal = selectAnimal.value;
      const selectedTutorOption =
        selectTutor.options[selectTutor.selectedIndex];
      const tutorId = selectedTutorOption
        ? selectedTutorOption.dataset.id
        : null;

      if (nomeAnimal && tutorId) {
        const animalIndex = animais.findIndex(
          (a) => a.nome === nomeAnimal && a.tutorId == tutorId
        );
        if (animalIndex !== -1) {
          animais[animalIndex].alergias = novasAlergias;
          localStorage.setItem("animais", JSON.stringify(animais));
          alert("Alergias atualizadas no cadastro do animal!");
        }
      }
    });
  }

  if (btnCancelAlergias) {
    btnCancelAlergias.addEventListener("click", () => {
      modalAlergias.classList.add("hidden");
    });
  }

  // --- Lógica do Modal de Vacinas ---

  function renderVacinasTags() {
    if (!vacinasTags || !inputVacinacao) return;
    vacinasTags.innerHTML = "";
    const vacinasStr = inputVacinacao.value;

    let lista = [];
    try {
      lista = vacinasStr ? JSON.parse(vacinasStr) : [];
    } catch (e) {
      if (vacinasStr) lista = [{ nome: vacinasStr, data: "", revacina: "" }];
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    lista.forEach((vacina) => {
      let isVencida = false;
      if (vacina.revacina) {
        const [ano, mes, dia] = vacina.revacina.split("-").map(Number);
        const dataRevacina = new Date(ano, mes - 1, dia);
        if (dataRevacina < hoje) {
          isVencida = true;
        }
      }

      // Mostrar apenas vacinas que necessitam de atenção (vencidas)
      if (!isVencida) return;

      const tag = document.createElement("span");
      tag.className = "vacina-tag vencida";

      const dataFormatada = vacina.data ? new Date(vacina.data).toLocaleDateString("pt-BR") : "";
      const revacinaFormatada = vacina.revacina ? new Date(vacina.revacina).toLocaleDateString("pt-BR") : "";
      let texto = vacina.nome;
      if (dataFormatada) texto += ` (${dataFormatada})`;
      if (revacinaFormatada) texto += ` ➝ Rev: ${revacinaFormatada}`;
      texto += " ⚠️";
      tag.textContent = texto;
      vacinasTags.appendChild(tag);
    });
  }

  function renderListaVacinasModal() {
    listaVacinasModal.innerHTML = "";
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    vacinasTemp.forEach((vacina, index) => {
      const li = document.createElement("li");
      const divInfo = document.createElement("div");
      const dataFormatada = vacina.data ? new Date(vacina.data).toLocaleDateString("pt-BR") : "Sem data";
      const revacinaFormatada = vacina.revacina ? new Date(vacina.revacina).toLocaleDateString("pt-BR") : "-";
      divInfo.textContent = `${vacina.nome} | Aplic: ${dataFormatada} | Próx: ${revacinaFormatada}`;
      if (vacina.revacina) {
        const [ano, mes, dia] = vacina.revacina.split("-").map(Number);
        const dataRevacina = new Date(ano, mes - 1, dia);
        if (dataRevacina < hoje) {
          li.style.color = "#b91c1c";
          li.style.backgroundColor = "#fef2f2";
          const spanAlert = document.createElement("span");
          spanAlert.textContent = " ⚠️ VENCIDA";
          spanAlert.style.fontWeight = "bold";
          spanAlert.style.marginLeft = "5px";
          divInfo.appendChild(spanAlert);
        }
      }
      li.appendChild(divInfo);
      const btnRemove = document.createElement("button");
      btnRemove.textContent = "❌";
      btnRemove.style.marginLeft = "10px";
      btnRemove.style.border = "none";
      btnRemove.style.background = "transparent";
      btnRemove.style.cursor = "pointer";
      btnRemove.onclick = () => {
        vacinasTemp.splice(index, 1);
        renderListaVacinasModal();
      };
      li.appendChild(btnRemove);
      listaVacinasModal.appendChild(li);
    });
  }

  function calcularRevacina() {
    const dataAplicacao = inputDataVacina.value;
    if (dataAplicacao) {
      const data = new Date(dataAplicacao);
      data.setDate(data.getDate() + 365);
      inputDataRevacinaItem.value = data.toISOString().split("T")[0];
    }
  }
  if (inputDataVacina) inputDataVacina.addEventListener("change", calcularRevacina);
  if (inputNomeVacina) inputNomeVacina.addEventListener("input", () => { if (inputDataVacina.value && !inputDataRevacinaItem.value) calcularRevacina(); });

  if (btnOpenVacinas) btnOpenVacinas.addEventListener("click", () => { const val = inputVacinacao.value; try { vacinasTemp = val ? JSON.parse(val) : []; } catch (e) { vacinasTemp = val ? [{ nome: val, data: "", revacina: "" }] : []; } renderListaVacinasModal(); modalVacinas.classList.remove("hidden"); });
  if (btnAddVacinaItem) btnAddVacinaItem.addEventListener("click", () => { const nome = inputNomeVacina.value.trim(); const data = inputDataVacina.value; const revacina = inputDataRevacinaItem.value; if (nome) { vacinasTemp.push({ nome, data, revacina }); inputNomeVacina.value = ""; inputDataVacina.value = ""; inputDataRevacinaItem.value = ""; inputNomeVacina.focus(); renderListaVacinasModal(); } else { alert("Digite o nome da vacina."); } });
  
  if (btnSaveVacinas) {
    btnSaveVacinas.addEventListener("click", () => {
      inputVacinacao.value = JSON.stringify(vacinasTemp);
      renderVacinasTags();
      modalVacinas.classList.add("hidden");

      // Atualizar cadastro do animal permanentemente
      const nomeAnimal = selectAnimal.value;
      const selectedTutorOption = selectTutor.options[selectTutor.selectedIndex];
      const tutorId = selectedTutorOption ? selectedTutorOption.dataset.id : null;
      if (nomeAnimal && tutorId) {
        const animalIndex = animais.findIndex((a) => a.nome === nomeAnimal && a.tutorId == tutorId);
        if (animalIndex !== -1) {
          animais[animalIndex].vacinacao = inputVacinacao.value;
          localStorage.setItem("animais", JSON.stringify(animais));
        }
      }
    });
  }
  if (btnCancelVacinas) btnCancelVacinas.addEventListener("click", () => { modalVacinas.classList.add("hidden"); });
});
