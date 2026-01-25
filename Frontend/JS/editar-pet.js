document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const animalId = params.get("id");

  if (!animalId) {
    alert("Animal não especificado.");
    window.location.href = "animais.html";
    return;
  }

  const form = document.getElementById("formPet");
  form.noValidate = true;

  // Elementos de UI
  const inputNascimento = document.getElementById("nascimento");
  const spanIdade = document.getElementById("idade-calculada");
  const inputFoto = document.getElementById("foto");
  const imgPreview = document.getElementById("foto-preview");
  const placeholder = document.getElementById("foto-placeholder");

  // Variáveis de estado
  let fotoBase64 = "";
  let tutores = [];
  let alergiasTemp = [];
  let vacinasTemp = [];

  // --- Carregar Tutores ---
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

  // --- Carregar Dados do Animal ---
  async function carregarAnimal() {
    try {
      const response = await fetch(`/animais/${animalId}`);
      if (!response.ok) throw new Error("Erro ao buscar animal");

      const animal = await response.json();
      preencherFormulario(animal);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar dados do animal.");
      window.location.href = "animais.html";
    }
  }

  function preencherFormulario(animal) {
    // Campos simples
    document.getElementById("nome").value = animal.nome || "";
    document.getElementById("especie").value = animal.especie || "";
    document.getElementById("raca").value = animal.raca || "";
    document.getElementById("sexo").value = animal.sexo || "";
    document.getElementById("porte").value = animal.porte || "";
    document.getElementById("peso").value = animal.peso || "";
    document.getElementById("condicaoReprodutiva").value =
      animal.condicao_reprodutiva || "Inteiro";
    document.getElementById("ambiente").value = animal.ambiente || "";
    document.getElementById("alimentacao").value = animal.alimentacao || "";
    document.getElementById("observacoes").value = animal.observacoes || "";
    document.getElementById("nascimento").value = animal.nascimento || "";

    // Tutor
    if (animal.tutor_id) {
      const tutor = tutores.find((t) => t.id == animal.tutor_id);
      if (tutor) {
        document.getElementById("tutorInput").value = tutor.nome;
      }
    }

    // Foto
    if (animal.foto) {
      fotoBase64 = animal.foto;
      imgPreview.src = fotoBase64;
      imgPreview.style.display = "block";
      placeholder.style.display = "none";
    }

    // Idade
    if (animal.nascimento) {
      spanIdade.textContent = `Idade: ${calcularIdade(animal.nascimento)}`;
    }

    // Alergias
    document.getElementById("alergias").value = animal.alergias || "";
    if (animal.alergias) {
      alergiasTemp = animal.alergias
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      renderAlergiasTags();
    }

    // Vacinas
    document.getElementById("vacinacao").value = animal.vacinacao || "";
    if (animal.vacinacao) {
      try {
        vacinasTemp = JSON.parse(animal.vacinacao);
      } catch (e) {
        vacinasTemp = [];
      }
      renderVacinasTags();
    }
  }

  // Inicialização
  await carregarTutores();
  await carregarAnimal();

  // --- Lógica de Foto ---
  inputFoto.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
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

  // --- Cálculo de Idade ---
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

  // --- Modais (Alergias e Vacinas) ---
  const modalAlergias = document.getElementById("modalAlergias");
  const listaAlergiasModal = document.getElementById("listaAlergiasModal");
  const alergiasTags = document.getElementById("alergiasTags");
  const inputAlergias = document.getElementById("alergias");

  function renderAlergiasTags() {
    alergiasTags.innerHTML = "";
    alergiasTemp.forEach((alergia) => {
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

  document.getElementById("btnOpenAlergias").addEventListener("click", () => {
    renderListaModal();
    modalAlergias.classList.remove("hidden");
  });

  document.getElementById("btnAddAlergiaItem").addEventListener("click", () => {
    const val = document.getElementById("inputNovaAlergia").value.trim();
    if (val) {
      alergiasTemp.push(val);
      document.getElementById("inputNovaAlergia").value = "";
      renderListaModal();
    }
  });

  document.getElementById("btnSaveAlergias").addEventListener("click", () => {
    inputAlergias.value = alergiasTemp.join(", ");
    renderAlergiasTags();
    modalAlergias.classList.add("hidden");
  });

  document.getElementById("btnCancelAlergias").addEventListener("click", () => {
    modalAlergias.classList.add("hidden");
  });

  // Vacinas
  const modalVacinas = document.getElementById("modalVacinas");
  const listaVacinasModal = document.getElementById("listaVacinasModal");
  const vacinasTags = document.getElementById("vacinasTags");
  const inputVacinacao = document.getElementById("vacinacao");
  const inputNomeVacina = document.getElementById("inputNomeVacina");
  const inputDataVacina = document.getElementById("inputDataVacina");
  const inputDataRevacinaItem = document.getElementById(
    "inputDataRevacinaItem",
  );

  function renderVacinasTags() {
    vacinasTags.innerHTML = "";
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    vacinasTemp.forEach((vacina) => {
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

      let texto = vacina.nome;
      if (vacina.data)
        texto += ` (${new Date(vacina.data).toLocaleDateString("pt-BR")})`;
      if (isVencida) texto += " ⚠️";
      tag.textContent = texto;
      vacinasTags.appendChild(tag);
    });
  }

  function renderListaVacinasModal() {
    listaVacinasModal.innerHTML = "";
    vacinasTemp.forEach((vacina, index) => {
      const li = document.createElement("li");
      li.textContent = `${vacina.nome} | Aplic: ${vacina.data || "-"} | Rev: ${vacina.revacina || "-"}`;
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

  // Auto-calculo revacina
  inputDataVacina.addEventListener("change", () => {
    if (inputDataVacina.value) {
      const d = new Date(inputDataVacina.value);
      d.setDate(d.getDate() + 365);
      inputDataRevacinaItem.value = d.toISOString().split("T")[0];
    }
  });

  document.getElementById("btnOpenVacinas").addEventListener("click", () => {
    renderListaVacinasModal();
    modalVacinas.classList.remove("hidden");
  });

  document.getElementById("btnAddVacinaItem").addEventListener("click", () => {
    const nome = inputNomeVacina.value.trim();
    const data = inputDataVacina.value;
    const revacina = inputDataRevacinaItem.value;
    if (nome) {
      vacinasTemp.push({ nome, data, revacina });
      inputNomeVacina.value = "";
      inputDataVacina.value = "";
      inputDataRevacinaItem.value = "";
      renderListaVacinasModal();
    } else {
      alert("Nome da vacina é obrigatório.");
    }
  });

  document.getElementById("btnSaveVacinas").addEventListener("click", () => {
    inputVacinacao.value = JSON.stringify(vacinasTemp);
    renderVacinasTags();
    modalVacinas.classList.add("hidden");
  });

  document.getElementById("btnCancelVacinas").addEventListener("click", () => {
    modalVacinas.classList.add("hidden");
  });

  // --- Salvar Alterações ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validação Tutor
    const nomeTutor = document.getElementById("tutorInput").value;
    const tutorObj = tutores.find((t) => t.nome === nomeTutor);
    if (!tutorObj) {
      alert("Selecione um tutor válido.");
      return;
    }

    const dadosAtualizados = {
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
      vacinacao: document.getElementById("vacinacao").value,
      ambiente: document.getElementById("ambiente").value,
      alimentacao: document.getElementById("alimentacao").value,
      observacoes: document.getElementById("observacoes").value,
      foto: fotoBase64,
    };

    try {
      const response = await fetch(`/animais/${animalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtualizados),
      });

      if (response.ok) {
        alert("Pet atualizado com sucesso!");
        window.location.href = "animais.html";
      } else {
        const err = await response.json();
        alert("Erro ao atualizar: " + (err.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    }
  });
});
