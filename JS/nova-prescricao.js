document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const atendimentoId = params.get("id");

  if (!atendimentoId) {
    alert("Atendimento não encontrado!");
    window.location.href = "internacao.html";
    return;
  }

  const container = document.getElementById("medicamentos-container");
  const btnAdd = document.getElementById("btnAddMedicamento");
  const form = document.getElementById("formPrescricao");

  // Função para adicionar linha de medicamento
  function addMedicamentoRow() {
    const row = document.createElement("div");
    row.classList.add("medicamento-row");

    row.innerHTML = `
      <div class="form-group med-name-group">
        <label>Medicamento</label>
        <input type="text" name="nome" class="form-control" required placeholder="Nome do fármaco">
      </div>
      <div class="form-group med-info-group">
        <label>Dose</label>
        <input type="text" name="dose" class="form-control" placeholder="Ex: 10mg">
      </div>
      <div class="form-group med-info-group">
        <label>Frequência</label>
        <input type="text" name="frequencia" class="form-control" placeholder="Ex: 8/8h">
      </div>
      <div class="form-group med-info-group">
        <label>Duração</label>
        <input type="text" name="duracao" class="form-control" placeholder="Ex: 5 dias">
      </div>
      <button type="button" class="btn-remove-item" title="Remover">🗑️</button>
    `;

    // Evento de remover
    row.querySelector(".btn-remove-item").addEventListener("click", () => {
      row.remove();
    });

    container.appendChild(row);
  }

  // Adiciona uma linha inicial
  addMedicamentoRow();

  // Botão de adicionar
  btnAdd.addEventListener("click", addMedicamentoRow);

  // Salvar
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const medicamentos = [];
    const rows = container.querySelectorAll(".medicamento-row");

    rows.forEach((row) => {
      const nome = row.querySelector('input[name="nome"]').value;
      const dose = row.querySelector('input[name="dose"]').value;
      const frequencia = row.querySelector('input[name="frequencia"]').value;
      const duracao = row.querySelector('input[name="duracao"]').value;

      if (nome) {
        medicamentos.push({ nome, dose, frequencia, duracao });
      }
    });

    if (medicamentos.length === 0) {
      alert("Adicione pelo menos um medicamento.");
      return;
    }

    const observacoes = document.getElementById("observacoes").value;
    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado")) || {
      nome: "Veterinário",
    };

    const novaPrescricao = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      atendimentoId: atendimentoId,
      data: new Date().toISOString(),
      veterinario: usuario.nome,
      medicamentos: medicamentos,
      observacoes: observacoes,
    };

    // Salvar no localStorage
    const prescricoes = JSON.parse(localStorage.getItem("prescricoes")) || [];
    prescricoes.push(novaPrescricao);
    localStorage.setItem("prescricoes", JSON.stringify(prescricoes));

    alert("Prescrição salva com sucesso!");
    window.location.href = `prescricao.html?id=${atendimentoId}`;
  });
});
