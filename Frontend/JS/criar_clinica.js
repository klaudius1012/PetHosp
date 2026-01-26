document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formClinica");
  const cnpjInput = document.getElementById("cnpj");
  const telefoneInput = document.getElementById("telefone");

  // Máscara de CNPJ
  if (cnpjInput) {
    cnpjInput.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, ""); // Remove tudo o que não é dígito

      if (v.length > 14) v = v.slice(0, 14); // Limita a 14 números

      v = v.replace(/^(\d{2})(\d)/, "$1.$2"); // Coloca ponto entre o segundo e o terceiro dígitos
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3"); // Coloca ponto entre o quinto e o sexto dígitos
      v = v.replace(/\.(\d{3})(\d)/, ".$1/$2"); // Coloca uma barra entre o oitavo e o nono dígitos
      v = v.replace(/(\d{4})(\d)/, "$1-$2"); // Coloca um hífen depois do bloco de quatro dígitos

      e.target.value = v;
    });
  }

  // Máscara de Telefone
  if (telefoneInput) {
    telefoneInput.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "");
      v = v.slice(0, 11); // Limita a 11 dígitos (DD) 9XXXX-XXXX
      v = v.replace(/^(\d{2})(\d)/, "($1) $2");
      v = v.replace(/(\d{5})(\d)/, "$1-$2");
      e.target.value = v;
    });
  }

  // Verifica se é edição (tem ID na URL)
  const urlParams = new URLSearchParams(window.location.search);
  const clinicaId = urlParams.get("id");

  if (clinicaId) {
    // Ajusta título e botão para refletir edição
    const title = document.querySelector(".header-actions h2");
    if (title) title.textContent = "Editar Clínica";

    const btnSubmit = document.querySelector(
      "#formClinica button[type='submit']",
    );
    if (btnSubmit) btnSubmit.textContent = "Salvar Alterações";

    // Carrega dados da clínica
    try {
      const response = await fetch(`/clinicas/${clinicaId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (document.getElementById("nome"))
          document.getElementById("nome").value = data.nome || "";
        if (document.getElementById("cnpj"))
          document.getElementById("cnpj").value = data.cnpj || "";
        if (document.getElementById("endereco"))
          document.getElementById("endereco").value = data.endereco || "";
        if (document.getElementById("telefone"))
          document.getElementById("telefone").value = data.telefone || "";
      }
    } catch (error) {
      console.error("Erro ao carregar clínica:", error);
    }
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nome = document.getElementById("nome").value;
      const cnpj = document.getElementById("cnpj").value;
      const endereco = document.getElementById("endereco").value;
      const telefone = document.getElementById("telefone").value;

      try {
        const url = clinicaId ? `/clinicas/${clinicaId}` : "/clinicas";
        const method = clinicaId ? "PUT" : "POST";

        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ nome, cnpj, endereco, telefone }),
        });

        if (response.ok) {
          alert(
            clinicaId
              ? "Clínica atualizada com sucesso!"
              : "Clínica criada com sucesso!",
          );
          window.location.href = "clinicas.html";
        } else {
          const data = await response.json();
          alert(data.error || "Erro ao salvar clínica.");
        }
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro de conexão.");
      }
    });
  }
});
