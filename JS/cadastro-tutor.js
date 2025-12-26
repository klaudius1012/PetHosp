document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastro");
  const params = new URLSearchParams(window.location.search);
  const idEditar = params.get("id");
  const tutores = JSON.parse(localStorage.getItem("tutores")) || [];

  // Se houver ID na URL, carrega os dados para edição
  if (idEditar) {
    const tutor = tutores.find((t) => t.id === idEditar);
    if (tutor) {
      document.querySelector(".header-actions h2").textContent = "Editar Tutor";
      document.getElementById("nome").value = tutor.nome || "";
      document.getElementById("cpf").value = tutor.cpf || "";
      document.getElementById("nascimento").value = tutor.nascimento || "";
      document.getElementById("telefone").value = tutor.telefone || "";
      document.getElementById("endereco").value = tutor.endereco || "";
      document.getElementById("bairro").value = tutor.bairro || "";
      document.getElementById("cidade").value = tutor.cidade || "";
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const dadosTutor = {
      id: idEditar || "T" + Date.now(),
      nome: document.getElementById("nome").value,
      cpf: document.getElementById("cpf").value,
      nascimento: document.getElementById("nascimento").value,
      telefone: document.getElementById("telefone").value,
      endereco: document.getElementById("endereco").value,
      bairro: document.getElementById("bairro").value,
      cidade: document.getElementById("cidade").value,
      dataCadastro: idEditar
        ? tutores.find((t) => t.id === idEditar).dataCadastro
        : new Date().toISOString(),
    };

    if (
      tutores.some((t) => t.cpf === dadosTutor.cpf && t.id !== dadosTutor.id)
    ) {
      alert("Erro: Este CPF já está cadastrado para outro tutor.");
      return;
    }

    if (idEditar) {
      const index = tutores.findIndex((t) => t.id === idEditar);
      if (index !== -1) tutores[index] = dadosTutor;
      alert("Tutor atualizado com sucesso!");
    } else {
      tutores.push(dadosTutor);
      alert("Tutor cadastrado com sucesso!");
    }

    localStorage.setItem("tutores", JSON.stringify(tutores));
    window.location.href = "home.html";
  });
});
