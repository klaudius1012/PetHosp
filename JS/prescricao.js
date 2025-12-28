document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const atendimentoId = urlParams.get("id");

  if (!atendimentoId) {
    alert("ID do atendimento não fornecido.");
    window.location.href = "home.html";
    return;
  }

  carregarDadosCabecalho(atendimentoId);
  carregarHistorico(atendimentoId);

  // Atualizar o link do botão "Nova Prescrição" para passar o ID
  const btnNova = document.querySelector(
    "button[onclick*='nova-prescricao.html']"
  );
  if (btnNova) {
    btnNova.onclick = () => {
      window.location.href = `nova-prescricao.html?id=${atendimentoId}`;
    };
  }
});

function carregarDadosCabecalho(id) {
  const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
  const animais = JSON.parse(localStorage.getItem("animais")) || [];
  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];

  const atendimento = atendimentos.find((a) => a.id === id);

  if (!atendimento) {
    return;
  }

  // Preencher dados básicos vindos do Atendimento
  setText("headerTutor", atendimento.tutor);
  setText("headerPeso", atendimento.peso);
  setText("headerTemp", atendimento.temperatura);

  // Tratamento de Alergias
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

  // Buscar Tutor
  const tutor = tutores.find((t) => t.nome === atendimento.tutor);
  if (tutor) {
    setText("headerTelefone", tutor.telefone);
  }

  // Buscar Animal
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
    setText("headerAnimalNome", atendimento.animal);
  }
}

function carregarHistorico(atendimentoId) {
  const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
  const prescricoes = JSON.parse(localStorage.getItem("prescricoes")) || [];
  const tbody = document.getElementById("tbody-prescricao");

  const atendimentoAtual = atendimentos.find((a) => a.id === atendimentoId);
  if (!atendimentoAtual) return;

  // Filtra prescrições do mesmo animal (histórico completo do paciente)
  const historico = prescricoes.filter(
    (p) => p.animal === atendimentoAtual.animal
  );

  // Ordenar da mais recente para a mais antiga
  historico.sort((a, b) => new Date(b.data) - new Date(a.data));

  tbody.innerHTML = "";

  if (historico.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" style="text-align:center">Nenhuma prescrição encontrada para este animal.</td></tr>';
    return;
  }

  historico.forEach((p) => {
    const data = new Date(p.data).toLocaleDateString("pt-BR");
    const listaMedicamentos = p.itens
      .map((item) => `${item.nome} (${item.posologia})`)
      .join(", ");

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${data}</td>
        <td>${listaMedicamentos}</td>
        <td>${p.veterinario || "--"}</td>
        <td style="text-align: center;">
          <button class="btn-imprimir" onclick="imprimirPrescricao('${
            p.id
          }')" title="Imprimir Receita">🖨️</button>
        </td>
    `;
    tbody.appendChild(tr);
  });
}

function imprimirPrescricao(id) {
  const prescricoes = JSON.parse(localStorage.getItem("prescricoes")) || [];
  const prescricao = prescricoes.find((p) => p.id === id);

  if (!prescricao) {
    alert("Prescrição não encontrada.");
    return;
  }

  const conteudo = `
    <html>
      <head>
        <title>Receita - ${prescricao.animal}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 40px; border-bottom: 2px solid #0f766e; padding-bottom: 20px; }
          .logo-img { max-width: 80px; max-height: 80px; }
          .clinic-details { text-align: left; }
          .clinic-name { font-size: 28px; font-weight: bold; color: #0f766e; margin-bottom: 5px; }
          .clinic-info { font-size: 14px; color: #666; }
          .patient-info { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e5e7eb; }
          .patient-info p { margin: 8px 0; font-size: 14px; }
          .rx-title { font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 2px; color: #333; }
          .item { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #ccc; }
          .item:last-child { border-bottom: none; }
          .item-name { font-weight: bold; font-size: 18px; margin-bottom: 5px; }
          .item-details { margin-left: 20px; font-size: 15px; color: #444; }
          .obs-box { margin-top: 30px; padding: 15px; background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 5px; font-size: 14px; }
          .footer { margin-top: 80px; text-align: center; }
          .signature-line { border-top: 1px solid #333; width: 250px; margin: 0 auto 10px auto; }
          .date-footer { margin-top: 40px; text-align: right; font-size: 12px; color: #888; }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="../img/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'">
          <div class="clinic-details">
            <div class="clinic-name">PetClin Veterinária</div>
            <div class="clinic-info">Rua dos Animais, 123 - Centro</div>
            <div class="clinic-info">Tel: (11) 9999-9999 | CRMV-SP 12345</div>
          </div>
        </div>

        <div class="patient-info">
          <p><strong>Tutor:</strong> ${prescricao.tutor}</p>
          <p><strong>Paciente:</strong> ${prescricao.animal}</p>
          <p><strong>Data da Prescrição:</strong> ${new Date(
            prescricao.data
          ).toLocaleDateString("pt-BR")}</p>
        </div>

        <div class="rx-title">Receita Veterinária</div>

        <div class="medicamentos">
          ${prescricao.itens
            .map(
              (item, index) => `
            <div class="item">
              <div class="item-name">${index + 1}. ${
                item.nome
              } <span style="font-weight:normal; font-size:14px;">(${
                item.via
              })</span></div>
              <div class="item-details"><strong>Posologia:</strong> ${
                item.posologia
              }</div>
              <div class="item-details"><strong>Duração:</strong> ${
                item.duracao
              }</div>
            </div>
          `
            )
            .join("")}
        </div>

        ${
          prescricao.observacoes
            ? `
          <div class="obs-box">
            <strong>Observações / Orientações:</strong><br>
            ${prescricao.observacoes.replace(/\n/g, "<br>")}
          </div>
        `
            : ""
        }

        <div class="footer">
          <div class="signature-line"></div>
          <div style="font-weight:bold;">${
            prescricao.veterinario || "Médico Veterinário"
          }</div>
          <div style="font-size:12px;">Assinatura e Carimbo</div>
        </div>

        <div class="date-footer">
          Impresso em ${new Date().toLocaleString("pt-BR")}
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(conteudo);
  printWindow.document.close();
}

function setText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) element.textContent = text || "--";
}

function calcularIdade(dataNasc) {
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade === 0 ? "Menos de 1 ano" : `${idade} anos`;
}
