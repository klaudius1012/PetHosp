document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastro");

  // Verifica se há um ID na URL para edição (ex: cadastro_tutor.html?id=1)
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id) {
    // Modo Edição: Carrega os dados do tutor
    document.querySelector("h2").textContent = "Editar Tutor";
    carregarDados(id);
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await salvarTutor(id);
    });
  }
});

async function carregarDados(id) {
  try {
    const response = await fetch(`/tutores/${id}`);
    if (!response.ok) throw new Error("Erro ao carregar dados do tutor");

    const tutor = await response.json();

    // Preenche os campos do formulário
    document.getElementById("nome").value = tutor.nome || "";
    document.getElementById("cpf").value = tutor.cpf || "";
    document.getElementById("nascimento").value = tutor.nascimento || "";
    document.getElementById("telefone").value = tutor.telefone || "";
    document.getElementById("telefone2").value = tutor.telefone2 || "";
    document.getElementById("endereco").value = tutor.endereco || "";
    document.getElementById("bairro").value = tutor.bairro || "";
    document.getElementById("cidade").value = tutor.cidade || "";
  } catch (error) {
    console.error(error);
    alert("Erro ao carregar dados para edição.");
  }
}

async function salvarTutor(id) {
  const dados = {
    nome: document.getElementById("nome").value,
    cpf: document.getElementById("cpf").value,
    nascimento: document.getElementById("nascimento").value,
    telefone: document.getElementById("telefone").value,
    telefone2: document.getElementById("telefone2").value,
    endereco: document.getElementById("endereco").value,
    bairro: document.getElementById("bairro").value,
    cidade: document.getElementById("cidade").value,
  };

  const url = id ? `/tutores/${id}` : "/tutores";
  const method = id ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(dados),
    });

    if (response.ok) {
      alert("Tutor salvo com sucesso!");
      window.location.href = "tutores.html"; // Redireciona para a lista
    } else {
      const errorData = await response.json();
      alert(errorData.error || "Erro ao salvar tutor.");
    }
  } catch (error) {
    console.error(error);
    alert("Erro de conexão com o servidor.");
  }
}
