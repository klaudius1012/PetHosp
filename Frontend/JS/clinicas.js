document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const clinicasContainer = document.getElementById("clinicas-container");

  // Adiciona a classe 'active' ao item do menu
  const menuItems = document.querySelectorAll("#listaServicos li");
  menuItems.forEach((item) => {
    if (item.textContent.trim() === "Clínicas") {
      item.classList.add("active");
    }
  });

  async function carregarClinicas() {
    if (!clinicasContainer) return;

    clinicasContainer.innerHTML =
      '<p style="text-align:center; padding: 20px;">Carregando...</p>';

    try {
      const response = await fetch("/clinicas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar clínicas.");
      }

      const clinicas = await response.json();

      if (!Array.isArray(clinicas)) {
        throw new Error("Formato de dados inválido recebido do servidor.");
      }

      clinicasContainer.innerHTML = ""; // Limpa o container

      if (clinicas.length === 0) {
        clinicasContainer.innerHTML = `<p class="empty-message">Nenhuma clínica cadastrada. Clique em "Cadastrar Nova Clínica" para começar.</p>`;
        return;
      }

      clinicas.forEach((clinica) => {
        const card = document.createElement("div");
        card.className = "clinica-card";
        card.innerHTML = `
          <h3>${clinica.nome}</h3>
          <p><strong>CNPJ:</strong> ${clinica.cnpj || "Não informado"}</p>
          <p><strong>Endereço:</strong> ${clinica.endereco || "Não informado"}</p>
          <p><strong>Telefone:</strong> ${clinica.telefone || "Não informado"}</p>
          <div class="card-actions">
            <button class="btn-edit" onclick="window.location.href='criar_clinica.html?id=${clinica.id}'" data-id="${clinica.id}">Editar</button>
            <button class="btn-delete" onclick="excluirClinica(${clinica.id})">Excluir</button>
          </div>
        `;
        clinicasContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Erro:", error);
      clinicasContainer.innerHTML = `<p class="error-message">Ocorreu um erro ao carregar as clínicas. Tente novamente mais tarde.</p>`;
    }
  }

  // Função global para excluir clínica
  window.excluirClinica = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta clínica?")) return;

    try {
      const response = await fetch(`/clinicas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Clínica excluída com sucesso!");
        carregarClinicas(); // Recarrega a lista
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao excluir clínica.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao excluir clínica.");
    }
  };

  carregarClinicas();
});
