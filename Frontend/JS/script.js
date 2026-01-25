// --- Manipulação do Formulário de Login ---
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    // Previne o envio padrão do formulário para tratar via JS
    e.preventDefault();

    const email = document.getElementById("username").value;
    const senha = document.getElementById("password").value;

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        // Sucesso: Redireciona para a home
        // Opcional: Salvar nome do usuário para exibição
        localStorage.setItem("user_nome", data.user.nome);
        window.location.replace("home.html");
      } else {
        alert(data.error || "Usuário ou senha incorretos.");
        document.getElementById("password").value = "";
      }
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Erro de conexão com o servidor.");
    }
  });

// --- Alternância de Visibilidade da Senha ---
document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    const iconEye = document.querySelector(".icon-eye");
    const iconEyeOff = document.querySelector(".icon-eye-off");

    // Verifica o tipo atual e alterna entre 'password' e 'text'
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Alterna os ícones de olho aberto/fechado
    if (type === "password") {
      iconEye.style.display = "block";
      iconEyeOff.style.display = "none";
    } else {
      iconEye.style.display = "none";
      iconEyeOff.style.display = "block";
    }
  });
