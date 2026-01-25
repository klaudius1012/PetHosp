document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formPet");
  form.noValidate = true; // Desabilita validação nativa para usar a customizada
  const inputNascimento = document.getElementById("nascimento");
  const spanIdade = document.getElementById("idade-calculada");

  // Elementos do Modal de Alergias
  const btnOpenAlergias = document.getElementById("btnOpenAlergias");
  const modalAlergias = document.getElementById("modalAlergias");
  const inputNovaAlergia = document.getElementById("inputNovaAlergia");
  const btnAddAlergiaItem = document.getElementById("btnAddAlergiaItem");
  const listaAlergiasModal = document.getElementById("listaAlergiasModal");
  const btnSaveAlergias = document.getElementById("btnSaveAlergias");
  const btnCancelAlergias = document.getElementById("btnCancelAlergias");
  const alergiasTags = document.getElementById("alergiasTags");
  const inputAlergias = document.getElementById("alergias");
  let alergiasTemp = [];

  // Elementos do Modal de Vacinas
  const btnOpenVacinas = document.getElementById("btnOpenVacinas");
  const modalVacinas = document.getElementById("modalVacinas");
  const inputNomeVacina = document.getElementById("inputNomeVacina");
  const inputDataVacina = document.getElementById("inputDataVacina");
  const inputDataRevacinaItem = document.getElementById(
    "inputDataRevacinaItem",
  );
  const btnAddVacinaItem = document.getElementById("btnAddVacinaItem");
  const listaVacinasModal = document.getElementById("listaVacinasModal");
  const btnSaveVacinas = document.getElementById("btnSaveVacinas");
  const btnCancelVacinas = document.getElementById("btnCancelVacinas");
  const vacinasTags = document.getElementById("vacinasTags");
  const inputVacinacao = document.getElementById("vacinacao");
  let vacinasTemp = [];

  // Carregar Tutores para o Datalist
  let tutores = [];
  const datalist = document.getElementById("listaTutores");

  async function carregarTutores() {
    try {
      const response = await fetch("/tutores");
      if (response.ok) {
        tutores = await response.json();
        tutores.sort((a, b) => a.nome.localeCompare(b.nome));

        datalist.innerHTML = "";
        tutores.forEach((t) => {
          const option = document.createElement("option");
          option.value = t.nome;
          option.textContent = `CPF: ${t.cpf || ""}`;
          datalist.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Erro ao carregar tutores:", error);
    }
  }
  carregarTutores();

  // Remove classe de erro ao digitar/selecionar
  const inputs = form.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      input.classList.remove("input-error");
    });
  });

  // Lógica da Foto (Preview e Base64)
  const inputFoto = document.getElementById("foto");
  const imgPreview = document.getElementById("foto-preview");
  const placeholder = document.getElementById("foto-placeholder");
  let fotoBase64 = "";

  inputFoto.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
        // Limite de 500KB
        alert("A imagem deve ter no máximo 500KB.");
        inputFoto.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        fotoBase64 = ev.target.result;
        imgPreview.src = fotoBase64;
        imgPreview.style.display = "block";
        placeholder.style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  });

  // Cálculo de Idade dinâmico
  inputNascimento.addEventListener("change", () => {
    if (inputNascimento.value) {
      spanIdade.textContent = `Idade: ${calcularIdade(inputNascimento.value)}`;
    } else {
      spanIdade.textContent = "";
    }
  });

  function calcularIdade(dataNasc) {
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;

    if (idade === 0) {
      let meses =
        (hoje.getFullYear() - nasc.getFullYear()) * 12 +
        (hoje.getMonth() - nasc.getMonth());
      if (hoje.getDate() < nasc.getDate()) meses--;
      return `${meses} meses`;
    }
    return `${idade} anos`;
  }

  // Salvar Pet no "Banco de Dados" (localStorage)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let isValid = true;
    const requiredFields = form.querySelectorAll("[required]");
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.classList.add("input-error");
        isValid = false;
      } else {
        field.classList.remove("input-error");
      }
    });

    if (!isValid) {
      alert("Por favor, preencha todos os campos obrigatórios destacados.");
      return;
    }

    const nomeTutor = document.getElementById("tutorInput").value;
    const tutorObj = tutores.find((t) => t.nome === nomeTutor);

    if (!tutorObj) {
      document.getElementById("tutorInput").classList.add("input-error");
      alert("Por favor, selecione um tutor válido da lista.");
      return;
    }

    const novoPet = {
      tutor_id: tutorObj.id,
      nome: document.getElementById("nome").value,
      especie: document.getElementById("especie").value,
      raca: document.getElementById("raca").value,
      sexo: document.getElementById("sexo").value,
      nascimento: document.getElementById("nascimento").value,
      peso: document.getElementById("peso").value,
      porte: document.getElementById("porte").value,
      condicao_reprodutiva: document.getElementById("condicaoReprodutiva")
        .value,
      alergias: document.getElementById("alergias").value,
      vacinacao: document.getElementById("vacinacao").value, // Novo campo
      ambiente: document.getElementById("ambiente").value, // Novo campo
      alimentacao: document.getElementById("alimentacao").value, // Novo campo
      observacoes: document.getElementById("observacoes").value,
      foto: fotoBase64,
    };

    try {
      const response = await fetch("/animais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoPet),
      });

      if (response.ok) {
        alert("Pet cadastrado com sucesso!");
        window.location.href = "animais.html";
      } else {
        const err = await response.json();
        alert("Erro ao cadastrar: " + (err.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    }
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
      inputAlergias.value = alergiasTemp.join(", ");
      renderAlergiasTags();
      modalAlergias.classList.add("hidden");
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
      // Fallback para string antiga se existir
      if (vacinasStr) lista = [{ nome: vacinasStr, data: "", revacina: "" }];
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    lista.forEach((vacina) => {
      const tag = document.createElement("span");
      tag.className = "vacina-tag";

      let isVencida = false;
      if (vacina.revacina) {
        const [ano, mes, dia] = vacina.revacina.split("-").map(Number);
        const dataRevacina = new Date(ano, mes - 1, dia);
        if (dataRevacina < hoje) {
          tag.classList.add("vencida");
          isVencida = true;
        }
      }

      // Formata a data se existir
      const dataFormatada = vacina.data
        ? new Date(vacina.data).toLocaleDateString("pt-BR")
        : "";
      const revacinaFormatada = vacina.revacina
        ? new Date(vacina.revacina).toLocaleDateString("pt-BR")
        : "";

      let texto = vacina.nome;
      if (dataFormatada) texto += ` (${dataFormatada})`;
      if (revacinaFormatada) texto += ` ➝ Rev: ${revacinaFormatada}`;
      if (isVencida) texto += " ⚠️";
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
      const dataFormatada = vacina.data
        ? new Date(vacina.data).toLocaleDateString("pt-BR")
        : "Sem data";
      const revacinaFormatada = vacina.revacina
        ? new Date(vacina.revacina).toLocaleDateString("pt-BR")
        : "-";

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

  // Cálculo automático da revacina (padrão 1 ano)
  function calcularRevacina() {
    const dataAplicacao = inputDataVacina.value;
    if (dataAplicacao) {
      const data = new Date(dataAplicacao);
      // Adiciona 365 dias (1 ano) como padrão
      data.setDate(data.getDate() + 365);
      inputDataRevacinaItem.value = data.toISOString().split("T")[0];
    }
  }

  if (inputDataVacina) {
    inputDataVacina.addEventListener("change", calcularRevacina);
  }
  if (inputNomeVacina) {
    // Recalcula ao selecionar vacina caso a data já esteja preenchida
    inputNomeVacina.addEventListener("input", () => {
      if (inputDataVacina.value && !inputDataRevacinaItem.value)
        calcularRevacina();
    });
  }

  if (btnOpenVacinas) {
    btnOpenVacinas.addEventListener("click", () => {
      const val = inputVacinacao.value;
      try {
        vacinasTemp = val ? JSON.parse(val) : [];
      } catch (e) {
        vacinasTemp = val ? [{ nome: val, data: "", revacina: "" }] : [];
      }
      renderListaVacinasModal();
      modalVacinas.classList.remove("hidden");
    });
  }

  if (btnAddVacinaItem) {
    btnAddVacinaItem.addEventListener("click", () => {
      const nome = inputNomeVacina.value.trim();
      const data = inputDataVacina.value;
      const revacina = inputDataRevacinaItem.value;

      if (nome) {
        vacinasTemp.push({ nome, data, revacina });
        inputNomeVacina.value = "";
        inputDataVacina.value = "";
        inputDataRevacinaItem.value = "";
        inputNomeVacina.focus();
        renderListaVacinasModal();
      } else {
        alert("Digite o nome da vacina.");
      }
    });
  }

  if (btnSaveVacinas) {
    btnSaveVacinas.addEventListener("click", () => {
      inputVacinacao.value = JSON.stringify(vacinasTemp);
      renderVacinasTags();
      modalVacinas.classList.add("hidden");
    });
  }

  if (btnCancelVacinas) {
    btnCancelVacinas.addEventListener("click", () => {
      modalVacinas.classList.add("hidden");
    });
  }
});
