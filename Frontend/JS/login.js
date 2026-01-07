document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;

      if (username) {
        localStorage.setItem("usuarioLogado", username);
        window.location.href = "home.html";
      }
    });
  }
});
