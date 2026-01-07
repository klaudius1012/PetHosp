// --- Manipulação do Formulário de Login ---
document
  .getElementById("loginForm")
  .addEventListener("submit", function (e) {
    // Previne o envio padrão do formulário para tratar via JS
    e.preventDefault();

    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    // Validação de credenciais (Simulação de autenticação)
    if (user === "admin" && pass === "123") {
        window.location.replace("home.html");
    } else {
      alert("Usuário ou senha incorretos.");
      // Limpar senha em caso de erro
      document.getElementById("password").value = "";
    }
  });

// --- Alternância de Visibilidade da Senha ---
document.getElementById("togglePassword").addEventListener("click", function () {
  const passwordInput = document.getElementById("password");
  const iconEye = document.querySelector(".icon-eye");
  const iconEyeOff = document.querySelector(".icon-eye-off");

  // Verifica o tipo atual e alterna entre 'password' e 'text'
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
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
