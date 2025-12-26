document.addEventListener("DOMContentLoaded", () => {
  // Inicialização: Carregar dados iniciais se localStorage estiver vazio (Seed)
  seedData();
});

// --- Seed Data (Dados Iniciais) ---
async function seedData() {
  if (!localStorage.getItem("tutores")) {
    try {
      // Tenta carregar do arquivo JSON local (pode falhar dependendo do servidor/browser policy)
      // Como fallback, usamos um array vazio ou dados hardcoded se o fetch falhar
      const response = await fetch("DATA/tutores.json");
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("tutores", JSON.stringify(data));
        console.log("Dados de tutores carregados do JSON.");
      }
    } catch (e) {
      console.log(
        "Não foi possível carregar tutores.json automaticamente (CORS/File protocol)."
      );
      // Fallback manual para teste se necessário

      localStorage.setItem("tutores", JSON.stringify(tutoresIniciais));
    }
  }

  if (!localStorage.getItem("animais")) {
    try {
      const response = await fetch("DATA/pet.json");
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("animais", JSON.stringify(data));
        console.log("Dados de animais carregados do JSON.");
      }
    } catch (e) {
      console.log("Não foi possível carregar pet.json automaticamente.");
    }
  }
}
