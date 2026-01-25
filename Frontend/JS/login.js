document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Lógica de Mostrar/Esconder Senha ---
  const btnToggleSenha = document.getElementById("btnToggleSenha");
  const inputSenha = document.getElementById("senha");

  if (btnToggleSenha && inputSenha) {
    btnToggleSenha.addEventListener("click", (e) => {
      e.preventDefault(); // Evita que o botão envie o formulário

      // Alterna o tipo do input
      const tipoAtual = inputSenha.getAttribute("type");
      const novoTipo = tipoAtual === "password" ? "text" : "password";
      inputSenha.setAttribute("type", novoTipo);

      // Opcional: Alternar ícone ou texto do botão
      // Se você estiver usando emojis no HTML (ex: 👁️), pode alternar aqui:
      if (novoTipo === "text") {
        btnToggleSenha.textContent = "🙈"; // Ícone de "esconder"
      } else {
        btnToggleSenha.textContent = "👁️"; // Ícone de "ver"
      }
    });
  }

  // --- 2. Lógica de Login (Conexão com a API) ---
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;
      const msgErro = document.getElementById("msgErro"); // Elemento <p> ou <div> para erros

      try {
        const response = await fetch("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("usuario", JSON.stringify(data.user));
          window.location.href = "recepcao.html"; // Redireciona para a tela inicial
        } else {
          if (msgErro) msgErro.textContent = data.error || "Erro ao entrar.";
          else alert(data.error || "Erro ao entrar.");
        }
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro de conexão com o servidor.");
      }
    });
  }
});
