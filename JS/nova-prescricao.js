document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const atendimentoId = urlParams.get("id");

  if (atendimentoId) {
    carregarDadosCabecalho(atendimentoId);
    setupDuplicar(atendimentoId);
  } else {
    console.warn("Nenhum ID de atendimento fornecido.");
  }

  setupFormulario();
});

function carregarDadosCabecalho(id) {
  const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
  const animais = JSON.parse(localStorage.getItem("animais")) || [];
  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];

  const atendimento = atendimentos.find((a) => a.id === id);

  if (!atendimento) {
    alert("Atendimento não encontrado!");
    return;
  }

  // Preencher dados básicos vindos do Atendimento
  setText("headerTutor", atendimento.tutor);
  setText("headerPeso", atendimento.peso);
  setText("headerTemp", atendimento.temperatura);

  // Tratamento de Alergias (Prioridade para o registro do atendimento)
  const elAlergias = document.getElementById("headerAlergias");
  if (elAlergias) {
    const alergias = atendimento.alergias || "Nenhuma";
    elAlergias.textContent = alergias;
    if (alergias !== "Nenhuma" && alergias.trim() !== "") {
      elAlergias.style.color = "#dc2626";
      elAlergias.style.fontWeight = "bold";
    } else {
      elAlergias.style.color = "inherit";
      elAlergias.style.fontWeight = "normal";
    }
  }

  // Buscar Tutor (para pegar o telefone)
  const tutor = tutores.find((t) => t.nome === atendimento.tutor);
  if (tutor) {
    setText("headerTelefone", tutor.telefone);
  }

  // Buscar Animal (para foto, idade, raça, etc)
  // Tenta vincular pelo ID do tutor se possível, senão busca apenas pelo nome
  let animal = null;
  if (tutor) {
    animal = animais.find(
      (a) => a.nome === atendimento.animal && a.tutorId == tutor.id
    );
  }
  if (!animal) {
    animal = animais.find((a) => a.nome === atendimento.animal);
  }

  if (animal) {
    setText("headerAnimalNome", animal.nome);
    setText("headerRaca", animal.raca);
    setText("headerSexo", animal.sexo);
    setText("headerPorte", animal.porte);
    setText("headerReprodutiva", animal.condicaoReprodutiva);

    // Foto
    const img = document.getElementById("headerAnimalFoto");
    const placeholder = document.getElementById("headerAnimalFotoPlaceholder");
    if (animal.foto) {
      if (img) {
        img.src = animal.foto;
        img.style.display = "block";
      }
      if (placeholder) placeholder.style.display = "none";
    } else {
      if (img) img.style.display = "none";
      if (placeholder) placeholder.style.display = "flex";
    }

    // Idade
    if (animal.nascimento) {
      const elIdade = document.getElementById("headerAnimalIdade");
      if (elIdade) {
        elIdade.textContent = `Idade: ${calcularIdade(animal.nascimento)}`;
      }
    }
  } else {
    // Fallback se não achar cadastro do animal
    setText("headerAnimalNome", atendimento.animal);
  }
}

function setText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text || "--";
  }
}

function calcularIdade(dataNasc) {
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade === 0 ? "Menos de 1 ano" : `${idade} anos`;
}

function setupFormulario() {
  const btnAdd = document.getElementById("btnAddMedicamento");
  const container = document.getElementById("containerMedicamentos");

  // Adicionar nova linha
  if (btnAdd && container) {
    btnAdd.addEventListener("click", () => {
      adicionarLinhaMedicamento();
    });
  }

  // Remover linha (delegação de evento)
  if (container) {
    container.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("btn-remove-item") ||
        e.target.parentElement.classList.contains("btn-remove-item")
      ) {
        const btn = e.target.classList.contains("btn-remove-item")
          ? e.target
          : e.target.parentElement;
        const row = btn.closest(".medicamento-row");
        if (row) row.remove();
      }
    });
  }
}

function adicionarLinhaMedicamento(dados = null) {
  const container = document.getElementById("containerMedicamentos");
  if (!container) return;

  const row = document.createElement("div");
  row.className = "medicamento-row";
  row.innerHTML = `
    <div class="form-group" style="flex: 1; min-width: 100px;">
      <label>Via</label>
      <select class="form-control input-via">
        <option value="Oral">Oral</option>
        <option value="Tópico">Tópico</option>
        <option value="Oftálmico">Oftálmico</option>
        <option value="Otológico">Otológico</option>
        <option value="Subcutâneo">Subcutâneo</option>
        <option value="Intramuscular">Intramuscular</option>
        <option value="Intravenoso">Intravenoso</option>
      </select>
    </div>
    <div class="form-group" style="flex: 3; min-width: 200px;">
      <label>Medicamento / Conc.</label>
      <input type="text" class="form-control input-nome" placeholder="Ex: Amoxicilina 250mg" required>
    </div>
    <div class="form-group" style="flex: 0.5; min-width: 80px;">
      <label>Dose</label>
      <input type="number" class="form-control input-dose-qtd" placeholder="0" step="any" required>
    </div>
    <div class="form-group" style="flex: 1; min-width: 100px;">
      <label>Unidade</label>
      <select class="form-control input-dose-unidade">
        <option value="cp">cp</option>
        <option value="ml">ml</option>
        <option value="gotas">gotas</option>
        <option value="amp">amp</option>
        <option value="fr">fr</option>
        <option value="mg">mg</option>
      </select>
    </div>
    <div class="form-group" style="flex: 2; min-width: 150px;">
      <label>Frequência</label>
      <input type="text" class="form-control input-frequencia" placeholder="Ex: a cada 12h" required>
    </div>
    <div class="form-group" style="flex: 1; min-width: 100px;">
      <label>Duração</label>
      <input type="text" class="form-control input-duracao" placeholder="Ex: 7 dias">
    </div>
    <button type="button" class="btn-remove-item" title="Remover item">🗑️</button>
  `;

  container.appendChild(row);

  if (dados) {
    row.querySelector(".input-via").value = dados.via || "Oral";
    row.querySelector(".input-nome").value = dados.nome || "";
    row.querySelector(".input-duracao").value = dados.duracao || "";

    // Tentar parsear a posologia (formato: "QTD UNIDADE FREQUENCIA")
    if (dados.posologia) {
      const partes = dados.posologia.split(" ");
      if (partes.length >= 2) {
        row.querySelector(".input-dose-qtd").value = partes[0];
        row.querySelector(".input-dose-unidade").value = partes[1];
        row.querySelector(".input-frequencia").value = partes
          .slice(2)
          .join(" ");
      } else {
        // Fallback para dados legados ou mal formatados
        row.querySelector(".input-frequencia").value = dados.posologia;
      }
    }
  }
}

function setupDuplicar(atendimentoId) {
  const btnDuplicar = document.getElementById("btnDuplicarUltima");
  if (!btnDuplicar) return;

  btnDuplicar.addEventListener("click", () => {
    const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
    const atendimento = atendimentos.find((a) => a.id === atendimentoId);
    if (!atendimento) return;

    const prescricoes = JSON.parse(localStorage.getItem("prescricoes")) || [];
    const historico = prescricoes.filter(
      (p) => p.animal === atendimento.animal
    );

    if (historico.length === 0) {
      alert("Nenhuma prescrição anterior encontrada para este animal.");
      return;
    }

    historico.sort((a, b) => new Date(b.data) - new Date(a.data));
    const ultima = historico[0];

    if (
      confirm(
        `Deseja carregar os dados da prescrição de ${new Date(
          ultima.data
        ).toLocaleDateString()}?`
      )
    ) {
      document.getElementById("containerMedicamentos").innerHTML = "";
      ultima.itens.forEach((item) => adicionarLinhaMedicamento(item));
      document.getElementById("observacoes").value = ultima.observacoes || "";
    }
  });
}
