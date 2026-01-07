/**
 * c:\Users\Alessandra\Documents\PetHosp\JS\pagination.js
 * Classe genérica para gerenciar paginação em tabelas
 */
class Paginator {
  constructor(itemsPerPage = 5, onPageChangeCallback) {
    this.currentPage = 1;
    this.itemsPerPage = itemsPerPage;
    this.onPageChange = onPageChangeCallback;
  }

  /**
   * Reseta a paginação para a página 1.
   * Útil ao realizar novas buscas/filtros.
   */
  reset() {
    this.currentPage = 1;
  }

  /**
   * Retorna o subconjunto de itens da página atual e o total de páginas.
   * @param {Array} items - Array completo de dados filtrados
   * @returns {Object} { data: Array, totalPages: Number }
   */
  paginate(items) {
    const totalPages = Math.ceil(items.length / this.itemsPerPage);

    // Ajuste de segurança: se a página atual for maior que o total, volta para a última
    if (this.currentPage > totalPages && totalPages > 0) {
      this.currentPage = totalPages;
    }
    // Se não houver itens ou página for < 1, força 1
    if (this.currentPage < 1) this.currentPage = 1;

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    return {
      data: items.slice(start, end),
      totalPages: totalPages,
    };
  }

  /**
   * Renderiza os botões de controle no elemento HTML especificado.
   * @param {string} containerId - ID do elemento div onde os botões serão renderizados
   * @param {number} totalPages - Número total de páginas
   */
  renderControls(containerId, totalPages) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    // Se houver apenas 1 página ou nenhuma, não mostra controles
    if (totalPages <= 1) return;

    // Botão Anterior
    const btnPrev = document.createElement("button");
    btnPrev.textContent = "Anterior";
    btnPrev.disabled = this.currentPage === 1;
    btnPrev.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.onPageChange();
      }
    });

    // Texto Informativo
    const spanInfo = document.createElement("span");
    spanInfo.textContent = `Página ${this.currentPage} de ${totalPages}`;

    // Botão Próximo
    const btnNext = document.createElement("button");
    btnNext.textContent = "Próximo";
    btnNext.disabled = this.currentPage === totalPages;
    btnNext.addEventListener("click", () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.onPageChange();
      }
    });

    container.append(btnPrev, spanInfo, btnNext);
  }
}
