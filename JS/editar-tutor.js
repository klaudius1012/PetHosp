document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("Tutor não identificado.");
    window.location.href = "tutores.html";
    return;
  }

  let tutores = JSON.parse(localStorage.getItem("tutores")) || [];
  let tutorIndex = tutores.findIndex((t) => t.id === id);
  let tutor = tutores[tutorIndex];

  if (!tutor) {
    alert("Tutor não encontrado.");
    window.location.href = "tutores.html";
    return;
  }

  // Preencher campos
  document.getElementById("nome").value = tutor.nome;
  document.getElementById("cpf").value = tutor.cpf;
  document.getElementById("nascimento").value = tutor.nascimento;
  document.getElementById("telefone").value = tutor.telefone;
  if (tutor.telefone2) {
    document.getElementById("telefone2").value = tutor.telefone2;
  }
  document.getElementById("endereco").value = tutor.endereco;
  document.getElementById("bairro").value = tutor.bairro;
  document.getElementById("cidade").value = tutor.cidade;

  const form = document.getElementById("formCadastro");
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    tutor.nome = document.getElementById("nome").value;
    tutor.cpf = document.getElementById("cpf").value;
    tutor.nascimento = document.getElementById("nascimento").value;
    tutor.telefone = document.getElementById("telefone").value;
    tutor.telefone2 = document.getElementById("telefone2").value;
    tutor.endereco = document.getElementById("endereco").value;
    tutor.bairro = document.getElementById("bairro").value;
    tutor.cidade = document.getElementById("cidade").value;

    tutores[tutorIndex] = tutor;
    localStorage.setItem("tutores", JSON.stringify(tutores));

    alert("Tutor atualizado com sucesso!");
    window.location.href = "tutores.html";
  });
});
