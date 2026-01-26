/**
 * auth-guard.js
 * Protege as rotas do frontend verificando se o usuário possui um token de login.
 * Inclua este script no <head> de todas as páginas internas (recepcao.html, etc).
 */

(function () {
  const token = localStorage.getItem("token");
  const path = window.location.pathname;

  // Lista de páginas públicas (Login)
  // O "/" representa o index.html servido pelo Flask
  const publicPages = ["/", "/index.html", "/login.html"];

  // Verifica se a página atual é pública
  const isPublicPage = publicPages.some((p) => path === p || path.endsWith(p));

  if (!token && !isPublicPage) {
    console.warn("Acesso negado: Usuário não autenticado.");
    window.location.href = "/"; // Redireciona para o login
  }
})();

// Função global de Logout para ser usada nos botões "Sair"
window.logout = function () {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");

  // Opcional: Limpa a sessão no backend
  fetch("/auth/logout", { method: "POST" }).finally(() => {
    window.location.href = "/";
  });
};
