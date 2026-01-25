document.addEventListener("DOMContentLoaded", () => {
  carregarTutores();

  const buscaInput = document.getElementById("buscaTutor");
  if (buscaInput) {
    buscaInput.addEventListener("input", () => {
      // Implementar filtro local ou debounce para busca no backend se necessário
      // Por enquanto, recarrega tudo (o backend de tutores atual não tem filtro por query string implementado no GET /, mas pode ser adicionado)
      // Para simplificar, vamos apenas recarregar e filtrar no front se a lista for pequena, ou deixar sem filtro por enquanto.
      // Como o backend `tutores_routes.py` GET / retorna tudo, podemos filtrar no front.
      carregarTutores(buscaInput.value);
    });
  }
});

async function carregarTutores(filtro = "") {
  const tbody = document.getElementById("tbody-tutores");
  tbody.innerHTML =
    '<tr><td colspan="5" style="text-align:center;">Carregando...</td></tr>';

  try {
    const response = await fetch("/tutores/");
    if (!response.ok) throw new Error("Erro ao buscar tutores");

    let tutores = await response.json();

    if (filtro) {
      const termo = filtro.toLowerCase();
      tutores = tutores.filter(
        (t) =>
          t.nome.toLowerCase().includes(termo) ||
          (t.cpf && t.cpf.includes(termo)),
      );
    }

    tbody.innerHTML = "";

    if (tutores.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;">Nenhum tutor encontrado.</td></tr>';
      return;
    }

    tutores.forEach((t) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.nome}</td>
        <td>${t.cpf || "-"}</td>
        <td>${t.telefone || "-"}</td>
        <td>${t.email || "-"}</td>
        <td>
          <button class="btn-icon" onclick="window.location.href='editar-tutor.html?id=${t.id}'">✏️</button>
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
