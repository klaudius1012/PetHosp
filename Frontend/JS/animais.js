document.addEventListener("DOMContentLoaded", () => {
  carregarAnimais();

  const buscaInput = document.getElementById("buscaAnimal");
  if (buscaInput) {
    buscaInput.addEventListener("input", carregarAnimais);
  }
});

function carregarAnimais() {
  const tbody = document.getElementById("tbody-animais");
  const termo = document.getElementById("buscaAnimal").value.toLowerCase();
  const animais = JSON.parse(localStorage.getItem("animais")) || [];

  tbody.innerHTML = "";

  const animaisFiltrados = animais.filter((a) => {
    const nome = a.nome ? a.nome.toLowerCase() : "";
    const especie = a.especie ? a.especie.toLowerCase() : "";
    const tutor = a.tutorNome ? a.tutorNome.toLowerCase() : "";
    return (
      nome.includes(termo) || especie.includes(termo) || tutor.includes(termo)
    );
  });

  if (animaisFiltrados.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center; padding: 15px;">Nenhum animal encontrado.</td></tr>';
    return;
  }

  // Ordenar alfabeticamente
  animaisFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));

  animaisFiltrados.forEach((a) => {
    const tr = document.createElement("tr");

    // --- LÓGICA DE ALERTA DE VACINAÇÃO ---
    let alertaVacina = "";
    if (a.dataRevacina) {
      const hoje = new Date();
      const dataRevacina = new Date(a.dataRevacina);

      // Zera horas para comparar apenas datas
      hoje.setHours(0, 0, 0, 0);
      dataRevacina.setHours(0, 0, 0, 0);

      if (dataRevacina < hoje) {
        // Vencida: Adiciona ícone e destaca a linha
        alertaVacina = `<span title="Vacinação vencida em ${new Date(
          a.dataRevacina
        ).toLocaleDateString()}" style="cursor: help; margin-left: 8px; font-size: 1.2em;">⚠️</span>`;
        tr.style.backgroundColor = "#fff1f2"; // Fundo vermelho claro
      }
    }
    // -------------------------------------

    tr.innerHTML = `
      <td>
        <div style="display: flex; align-items: center;">
          ${a.nome} ${alertaVacina}
        </div>
      </td>
      <td>${a.especie || "-"}</td>
      <td>${a.raca || "-"}</td>
      <td>${a.tutorNome || "-"}</td>
      <td>
        <button class="btn-icon" onclick="window.location.href='editar-pet.html?id=${
          a.id
        }'" title="Editar" style="background:none; border:none; cursor:pointer; font-size: 1.2rem;">✏️</button>
        <button class="btn-icon" onclick="excluirAnimal('${
          a.id
        }')" title="Excluir" style="background:none; border:none; cursor:pointer; font-size: 1.2rem; color: #dc2626;">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function excluirAnimal(id) {
  if (confirm("Tem certeza que deseja excluir este animal?")) {
    let animais = JSON.parse(localStorage.getItem("animais")) || [];
    animais = animais.filter((a) => a.id !== id);
    localStorage.setItem("animais", JSON.stringify(animais));
    carregarAnimais();
  }
}

// Expor para o escopo global
window.excluirAnimal = excluirAnimal;
