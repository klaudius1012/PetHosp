(function () {
  const usuario = sessionStorage.getItem("usuarioLogado");
  const path = window.location.pathname;
  const isLoginPage = path.includes("index.html");
  const isInViewDir = path.includes("/view/") || path.includes("\\view\\");

  // Se não estiver logado e não estiver na página de login, redireciona para login

  // Se já estiver logado e tentar acessar a página de login, redireciona para home
  if (usuario && isLoginPage) {
    window.location.href = "view/home.html";
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("usuarioLogado");
      window.location.href = "../../index.html";
    });
  }

  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.querySelector(".sidebar");

  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      menuBtn.classList.toggle("open");
    });

    document.addEventListener("click", (event) => {
      if (
        sidebar.classList.contains("open") &&
        !sidebar.contains(event.target) &&
        !menuBtn.contains(event.target)
      ) {
        sidebar.classList.remove("open");
        menuBtn.classList.remove("open");
      }
    });
  }

  highlightActiveMenuItem();
});

function highlightActiveMenuItem() {
  const path = window.location.pathname;
  // Pega o nome do arquivo atual (ex: agenda.html)
  const currentPage = path.split("/").pop();

  const menuItems = document.querySelectorAll(".sidebar li");
  menuItems.forEach((item) => {
    // Remove a classe active de todos os itens para garantir limpeza
    item.classList.remove("active");

    const onclick = item.getAttribute("onclick");
    if (onclick) {
      // Verifica se o onclick contém o nome da página atual
      if (onclick.includes(currentPage)) {
        item.classList.add("active");
      }
    }
  });
}
