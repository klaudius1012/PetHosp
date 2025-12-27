document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastro");

  // Pegar o ID da URL
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (!id) {
    alert("Tutor não identificado.");
    window.location.href = "tutores.html";
    return;
  }

  // Carregar dados do localStorage
  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];
  const tutor = tutores.find((t) => t.id === id);

  if (!tutor) {
    alert("Tutor não encontrado.");
    window.location.href = "tutores.html";
    return;
  }

  // Preencher o formulário com os dados existentes
  document.getElementById("nome").value = tutor.nome || "";
  document.getElementById("cpf").value = tutor.cpf || "";
  document.getElementById("nascimento").value = tutor.nascimento || "";
  document.getElementById("telefone").value = tutor.telefone || "";
  document.getElementById("endereco").value = tutor.endereco || "";
  document.getElementById("bairro").value = tutor.bairro || "";
  document.getElementById("cidade").value = tutor.cidade || "";

  // Evento de Salvar
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Atualizar objeto do tutor (mantendo o ID original)
    tutor.nome = document.getElementById("nome").value;
    tutor.cpf = document.getElementById("cpf").value;
    tutor.nascimento = document.getElementById("nascimento").value;
    tutor.telefone = document.getElementById("telefone").value;
    tutor.endereco = document.getElementById("endereco").value;
    tutor.bairro = document.getElementById("bairro").value;
    tutor.cidade = document.getElementById("cidade").value;

    // Encontrar índice e atualizar no array
    const index = tutores.findIndex((t) => t.id === id);
    if (index !== -1) {
      tutores[index] = tutor;
      localStorage.setItem("tutores", JSON.stringify(tutores));

      alert("Dados do tutor atualizados com sucesso!");
      window.location.href = "tutores.html";
    } else {
      alert("Erro ao salvar: Tutor não encontrado na lista.");
    }
  });
});
