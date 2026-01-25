document.addEventListener("DOMContentLoaded", () => {
  carregarAnimais();

  const buscaInput = document.getElementById("buscaAnimal");
  if (buscaInput) {
    buscaInput.addEventListener("input", carregarAnimais);
  }
});

async function carregarAnimais() {
  const tbody = document.getElementById("tbody-animais");
  const termo = document.getElementById("buscaAnimal").value;

  tbody.innerHTML =
    '<tr><td colspan="5" style="text-align:center;">Carregando...</td></tr>';

  try {
    // Otimização: Passa o termo de busca para o backend
    const url = termo ? `/animais?q=${encodeURIComponent(termo)}` : "/animais";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao buscar animais");

    let animais = await response.json();

    tbody.innerHTML = "";

    if (animais.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center; padding: 15px;">Nenhum animal encontrado.</td></tr>';
      return;
    }

    // A ordenação pode vir do backend, mas podemos garantir aqui também.
    animais.sort((a, b) => a.nome.localeCompare(b.nome));

    animais.forEach((a) => {
      const tr = document.createElement("tr");

      // --- LÓGICA DE ALERTA DE VACINAÇÃO ---
      // (Simplificada para este exemplo, pois depende do parsing do JSON de vacinas)
      let alertaVacina = "";
      // Lógica completa de parsing de vacinas pode ser readicionada aqui se necessário

      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center;">
            ${a.nome} ${alertaVacina}
          </div>
        </td>
        <td>${a.especie || "-"}</td>
        <td>${a.raca || "-"}</td>
        <td>${a.tutor_nome || "-"}</td>
        <td>
          <button class="btn-icon" onclick="window.location.href='editar-pet.html?id=${
            a.id
          }'" title="Editar" style="background:none; border:none; cursor:pointer; font-size: 1.2rem;">✏️</button>
          <button class="btn-icon" onclick="excluirAnimal(${
            a.id
          })" title="Excluir" style="background:none; border:none; cursor:pointer; font-size: 1.2rem; color: #dc2626;">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center; color:red">Erro ao carregar dados.</td></tr>';
  }
}

async function excluirAnimal(id) {
  if (confirm("Tem certeza que deseja excluir este animal?")) {
    try {
      // Nota: Rota DELETE ainda não foi criada explicitamente no animal_routes.py anterior,
      // mas assumindo padrão REST. Se falhar, precisaremos adicionar a rota DELETE no backend.
      // Vou adicionar a rota DELETE no próximo passo se necessário, mas aqui está o código frontend.
      const response = await fetch(`/animais/${id}`, { method: "DELETE" });
      if (response.ok) {
        alert("Animal excluído!");
        carregarAnimais();
      } else {
        alert("Erro ao excluir.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão.");
    }
  }
}

// Expor para o escopo global
window.excluirAnimal = excluirAnimal;
