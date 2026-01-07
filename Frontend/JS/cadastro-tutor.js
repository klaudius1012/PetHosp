document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formCadastro");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const nascimento = document.getElementById("nascimento").value;
    const telefone = document.getElementById("telefone").value;
    const telefone2 = document.getElementById("telefone2").value;
    const endereco = document.getElementById("endereco").value;
    const bairro = document.getElementById("bairro").value;
    const cidade = document.getElementById("cidade").value;

    const novoTutor = {
      id: Date.now().toString(),
      nome: nome,
      cpf: cpf,
      nascimento: nascimento,
      telefone: telefone,
      telefone2: telefone2,
      endereco: endereco,
      bairro: bairro,
      cidade: cidade,
      dataCadastro: new Date().toISOString(),
    };

    let tutores = JSON.parse(localStorage.getItem("tutores")) || [];
    tutores.push(novoTutor);
    localStorage.setItem("tutores", JSON.stringify(tutores));

    alert("Tutor cadastrado com sucesso!");
    window.location.href = "tutores.html";
  });
});
