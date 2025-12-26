document.addEventListener("DOMContentLoaded", () => {
  // Funcionalidade do Menu Mobile
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.querySelector(".sidebar");
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // Filtro de busca
  const buscaInput = document.getElementById("buscaRecepcao");
  if (buscaInput) {
    buscaInput.addEventListener("input", (e) => {
      const termo = e.target.value.toLowerCase();
      const linhas = document.querySelectorAll("#tbody-recepcao tr");

      linhas.forEach((linha) => {
        const texto = linha.innerText.toLowerCase();
        linha.style.display = texto.includes(termo) ? "" : "none";
      });
    });
  }

  // Botão Gerar Dados de Teste
  const btnGerar = document.getElementById("btnGerarDados");
  if (btnGerar) {
    btnGerar.addEventListener("click", gerarDadosTeste);
  }

  // Botão Limpar Dados
  const btnLimpar = document.getElementById("btnLimparDados");
  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      if (confirm("Tem certeza que deseja limpar todos os atendimentos?")) {
        localStorage.removeItem("atendimentos");
        carregarAtendimentos();
      }
    });
  }

  carregarAtendimentos();
});

function carregarAtendimentos() {
  const tbody = document.getElementById("tbody-recepcao");
  tbody.innerHTML = "";

  const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];

  // Filtra: Status "Aberto" (Aguardando ou Em Atendimento)
  const lista = atendimentos.filter((a) => {
    const isAberto = ["Aguardando", "Em Atendimento"].includes(a.status);
    return isAberto;
  });

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-message">Nenhum atendimento aberto encontrado.</td></tr>`;
    return;
  }

  // Ordenar: Emergência primeiro, depois por hora
  lista.sort((a, b) => {
    if (a.prioridade === "Emergência" && b.prioridade !== "Emergência")
      return -1;
    if (a.prioridade !== "Emergência" && b.prioridade === "Emergência")
      return 1;
    return (a.dataHora || "").localeCompare(b.dataHora || "");
  });

  lista.forEach((a) => {
    const tr = document.createElement("tr");

    // Destaque visual para Emergência
    if (a.prioridade === "Emergência") {
      tr.classList.add("row-emergencia");
    }

    const hora = a.dataHora ? a.dataHora.split("T")[1] : "--:--";

    tr.innerHTML = `
      <td>${hora}</td>
      <td>${a.tutor}</td>
      <td>${a.animal}</td>
      <td>${a.veterinario || "A definir"}</td>
      <td class="${a.prioridade === "Emergência" ? "text-emergencia" : ""}">${
      a.prioridade
    }</td>
      <td>${a.status}</td>
      <td>
        <button class="btn-editar" onclick="window.location.href='editar-atendimento.html?id=${
          a.id
        }'">Editar</button>
        <button class="btn-finalizar" onclick="finalizarAtendimento('${
          a.id
        }')">Finalizar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function gerarDadosTeste() {
  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];
  const animais = JSON.parse(localStorage.getItem("animais")) || [];
  const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const prioridades = ["Rotina", "Urgência", "Emergência"];
  const vets = ["Dr. Silva", "Dra. Santos", "Dr. Oliveira", "Plantão"];

  for (let i = 0; i < 3; i++) {
    const hoje = new Date();
    hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
    const hora = Math.floor(Math.random() * 12) + 8;
    const minuto = Math.floor(Math.random() * 60);
    const dataHoraStr =
      hoje.toISOString().split("T")[0] +
      "T" +
      String(hora).padStart(2, "0") +
      ":" +
      String(minuto).padStart(2, "0");

    atendimentos.push({
      id: "AT" + Date.now() + Math.floor(Math.random() * 1000),
      tutor: tutores.length > 0 ? random(tutores).nome : "Tutor Teste " + i,
      animal: animais.length > 0 ? random(animais).nome : "Pet Teste " + i,
      veterinario: random(vets),
      dataHora: dataHoraStr,
      peso: (Math.random() * 20 + 2).toFixed(1),
      temperatura: (Math.random() * 2 + 37).toFixed(1),
      prioridade: random(prioridades),
      status: "Aguardando",
      queixa: "Gerado automaticamente para teste.",
      observacoes: "",
    });
  }
  localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
  carregarAtendimentos();
  alert("3 atendimentos de teste gerados para hoje!");
}

window.finalizarAtendimento = function (id) {
  if (
    confirm("Deseja finalizar este atendimento? Ele sairá da lista de abertos.")
  ) {
    const atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
    const index = atendimentos.findIndex((a) => a.id === id);
    if (index !== -1) {
      atendimentos[index].status = "Finalizado";
      localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
      carregarAtendimentos();
    }
  }
};
