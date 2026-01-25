document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const atendimentoId = params.get("id");

  if (!atendimentoId) {
    alert("Atendimento não encontrado!");
    window.location.href = "internacao.html";
    return;
  }

  const container = document.getElementById("medicamentos-container");
  const btnAdd = document.getElementById("btnAddMedicamento");
  const form = document.getElementById("formPrescricao");
  const selectKit = document.getElementById("selectKit");
  const btnCarregarKit = document.getElementById("btnCarregarKit");
  const btnSalvarKit = document.getElementById("btnSalvarKit");
  const btnExcluirKit = document.getElementById("btnExcluirKit");
  const btnImprimir = document.getElementById("btnImprimirReceita");
  const btnOpenAlergias = document.getElementById("btnOpenAlergias");
  const modalAlergias = document.getElementById("modalAlergias");
  const btnCancelAlergias = document.getElementById("btnCancelAlergias");
  const listaAlergiasModal = document.getElementById("listaAlergiasModal");

  // Carregar dados do atendimento para verificar alergias
  let atendimento = null;
  let termosAlergia = [];

  try {
    const res = await fetch(`/atendimentos/${atendimentoId}`);
    if (res.ok) {
      atendimento = await res.json();
      if (atendimento.alergias) {
        const alergiasTexto = atendimento.alergias.toLowerCase();
        const termosIgnorados = ["não", "nao", "nenhuma", "nenhum", "--", "", "negativo"];
        if (!termosIgnorados.includes(alergiasTexto.trim())) {
          termosAlergia = alergiasTexto
            .split(/[,;]+/)
            .map((t) => t.trim())
            .filter((t) => t.length > 2);
        }
      }
      // Preencher header de impressão
      document.getElementById("headerAnimalNome").textContent = atendimento.animal_nome || atendimento.animal;
      document.getElementById("headerTutor").textContent = atendimento.tutor_nome || atendimento.tutor;
    }
  } catch (e) {
    console.error("Erro ao carregar atendimento", e);
  }

  // Configuração do Modal de Alergias
  if (btnOpenAlergias && modalAlergias) {
    btnOpenAlergias.addEventListener("click", (e) => {
      e.preventDefault();
      modalAlergias.classList.remove("hidden");

      if (listaAlergiasModal) {
        listaAlergiasModal.innerHTML = "";
        let lista = [];
        if (atendimento && atendimento.alergias) {
          lista = atendimento.alergias
            .split(/[,;]+/)
            .map((s) => s.trim())
            .filter((s) => s);
        }

        lista.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          listaAlergiasModal.appendChild(li);
        });
      }
    });
  }

  if (btnCancelAlergias && modalAlergias) {
    btnCancelAlergias.addEventListener("click", () => {
      modalAlergias.classList.add("hidden");
    });
  }

  // Função para adicionar linha de medicamento
  function addMedicamentoRow(data = null) {
    // Se data for um evento (clique do botão), trata como null para criar linha vazia
    if (data instanceof Event) data = null;

    const template = document.getElementById("medicamento-template");
    const clone = template.content.cloneNode(true);
    const wrapper = clone.querySelector(".medicamento-wrapper");
    const row = wrapper.querySelector(".medicamento-row");
    const justifDiv = wrapper.querySelector(".justificativa-alergia");
    const justifInput = wrapper.querySelector('input[name="justificativa"]');
    const nomeInput = row.querySelector('input[name="nome"]');
    const intervaloSelect = row.querySelector('select[name="intervalo"]');
    const intervaloCustom = row.querySelector('input[name="intervalo_custom"]');
    const duracaoInput = row.querySelector('input[name="duracao"]');

    if (data) {
      nomeInput.value = data.nome || "";
      if (data.dose) {
        const parts = data.dose.split(" ");
        if (parts[0])
          row.querySelector('input[name="dose_valor"]').value = parts[0];
        if (parts[1])
          row.querySelector('select[name="dose_unidade"]').value = parts[1];
      }
      if (data.intervalo) {
        const options = Array.from(intervaloSelect.options).map((o) => o.value);
        if (options.includes(data.intervalo)) {
          intervaloSelect.value = data.intervalo;
        } else {
          intervaloSelect.value = "Outro";
          intervaloCustom.style.display = "block";
          intervaloCustom.value = data.intervalo;
        }
      }
      if (data.duracao) duracaoInput.value = data.duracao;
    }

    // Evento para mostrar/ocultar campo personalizado
    intervaloSelect.addEventListener("change", () => {
      if (intervaloSelect.value === "Outro") {
        intervaloCustom.style.display = "block";
        intervaloCustom.required = true;
      } else {
        intervaloCustom.style.display = "none";
        intervaloCustom.required = false;
        intervaloCustom.value = "";
      }
    });

    // Monitorar digitação para verificar alergia
    nomeInput.addEventListener("input", () => {
      const nome = nomeInput.value.toLowerCase();
      let termoEncontrado = null;

      for (const termo of termosAlergia) {
        if (
          nome.includes(termo) ||
          (termo.length > 3 && termo.includes(nome))
        ) {
          termoEncontrado = termo;
          break;
        }
      }

      if (termoEncontrado) {
        justifDiv.style.display = "block";
        justifInput.required = true;
        const sugestoes = sugerirAlternativas(termoEncontrado);
        const label = justifDiv.querySelector(".justificativa-label");
        label.textContent = `⚠️ ALERTA: Paciente alérgico a "${termoEncontrado.toUpperCase()}". Justificativa obrigatória:${
          sugestoes.length ? " (Sugestões: " + sugestoes.join(", ") + ")" : ""
        }`;
      } else {
        justifDiv.style.display = "none";
        justifInput.required = false;
        justifInput.value = "";
      }
    });

    // Se estiver carregando dados, dispara verificação e restaura justificativa
    if (data && data.nome) {
      nomeInput.dispatchEvent(new Event("input"));
      if (data.justificativa) justifInput.value = data.justificativa;
    }

    // Evento de remover
    row.querySelector(".btn-remove-item").addEventListener("click", () => {
      wrapper.remove();
    });

    container.appendChild(wrapper);
  }

  // Verifica se é modo de visualização ou edição
  const prescricaoId = params.get("prescricaoId");
  const isViewMode = params.get("view") === "true";

  if (prescricaoId) {
    try {
      const res = await fetch(`/prescricoes/${prescricaoId}`);
      if (res.ok) {
        const prescricao = await res.json();
      // Preenche os medicamentos
      prescricao.medicamentos.forEach((med) => addMedicamentoRow(med));
      // Preenche observações
      document.getElementById("observacoes").value =
        prescricao.observacoes || "";

      if (isViewMode) {
        // Desabilita todos os campos
        const inputs = form.querySelectorAll("input, select, textarea, button");
        inputs.forEach((el) => {
          // Mantém o botão Cancelar habilitado (identificado pela classe btn-neutral)
          if (el.classList.contains("btn-neutral")) {
            el.disabled = false;
          } else {
            el.disabled = true;
          }
        });

        // Esconde o botão de salvar
        const btnSalvar = form.querySelector("button[type='submit']");
        if (btnSalvar) btnSalvar.style.display = "none";

        // Esconde botões de ação que não fazem sentido na visualização
        btnAdd.style.display = "none";
        const removeBtns = container.querySelectorAll(".btn-remove-item");
        removeBtns.forEach((btn) => (btn.style.display = "none"));
      }
      }
    } catch (e) {
      console.error("Erro ao carregar prescrição", e);
    }
  } else {
    // Adiciona uma linha inicial apenas se for nova prescrição
    addMedicamentoRow();
  }

  // Botão de adicionar
  btnAdd.addEventListener("click", addMedicamentoRow);

  // --- Lógica de Kits / Modelos ---
  async function carregarListaKits() {
    try {
      const res = await fetch('/prescricoes/kits');
      const kits = await res.json();
      
      selectKit.innerHTML = '<option value="">Selecione um modelo...</option>';
      kits.forEach((kit) => {
        const option = document.createElement("option");
        option.value = kit.id;
        option.textContent = kit.nome;
        // Armazena dados no elemento para evitar novo fetch
        option.dataset.medicamentos = JSON.stringify(kit.medicamentos);
        selectKit.appendChild(option);
      });
    } catch (e) { console.error(e); }
  }

  if (btnSalvarKit) {
    btnSalvarKit.addEventListener("click", async () => {
      const medicamentos = [];
      const wrappers = container.querySelectorAll(".medicamento-wrapper");

      wrappers.forEach((wrapper) => {
        const row = wrapper.querySelector(".medicamento-row");
        const nome = row.querySelector('input[name="nome"]').value;
        const doseValor = row.querySelector('input[name="dose_valor"]').value;
        const doseUnidade = row.querySelector(
          'select[name="dose_unidade"]'
        ).value;
        const intervaloSelect = row.querySelector('select[name="intervalo"]');
        const intervaloCustom = row.querySelector(
          'input[name="intervalo_custom"]'
        );
        let intervalo = intervaloSelect.value;
        if (intervalo === "Outro") {
          intervalo = intervaloCustom.value;
        }
        const justificativa = wrapper.querySelector(
          'input[name="justificativa"]'
        ).value;
        const duracaoInput = row.querySelector('input[name="duracao"]');
        const duracao = duracaoInput ? duracaoInput.value : "";

        if (nome) {
          const dose = doseValor ? `${doseValor} ${doseUnidade}` : "";
          medicamentos.push({ nome, dose, intervalo, justificativa });
        }
      });

      if (medicamentos.length === 0) {
        alert("Adicione medicamentos antes de salvar um modelo.");
        return;
      }

      const nomeKit = prompt("Nome do Kit / Modelo (ex: Otite Canina):");
      if (nomeKit) {
        try {
          const res = await fetch('/prescricoes/kits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nomeKit, medicamentos })
          });
          if (res.ok) {
            alert("Kit salvo com sucesso!");
            carregarListaKits();
          }
        } catch (e) {
          alert("Erro ao salvar kit.");
        }
      }
    });
  }

  if (btnCarregarKit) {
    btnCarregarKit.addEventListener("click", () => {
      const selectedOption = selectKit.options[selectKit.selectedIndex];
      if (!selectedOption.value) return;

      const kit = {
        nome: selectedOption.textContent,
        medicamentos: JSON.parse(selectedOption.dataset.medicamentos || "[]")
      };

      if (kit && kit.medicamentos.length > 0) {
        if (
          confirm(
            `Deseja carregar o kit "${kit.nome}"? Isso adicionará os medicamentos à lista atual.`
          )
        ) {
          kit.medicamentos.forEach((med) => addMedicamentoRow(med));
        }
      }
    });
  }

  if (btnExcluirKit) {
    btnExcluirKit.addEventListener("click", async () => {
      const kitId = selectKit.value;
      if (!kitId) {
        alert("Selecione um modelo para excluir.");
        return;
      }

      if (
        confirm("Tem certeza que deseja excluir este modelo de prescrição?")
      ) {
        try {
          const res = await fetch(`/prescricoes/kits/${kitId}`, { method: 'DELETE' });
          if (res.ok) {
            alert("Modelo excluído com sucesso!");
            carregarListaKits();
          }
        } catch (e) { alert("Erro ao excluir."); }
      }
    });
  }

  if (btnImprimir) {
    btnImprimir.addEventListener("click", () => {
      const medicamentos = [];
      const wrappers = container.querySelectorAll(".medicamento-wrapper");

      wrappers.forEach((wrapper) => {
        const row = wrapper.querySelector(".medicamento-row");
        const nome = row.querySelector('input[name="nome"]').value;
        if (!nome) return;

        const doseVal = row.querySelector('input[name="dose_valor"]').value;
        const doseUni = row.querySelector('select[name="dose_unidade"]').value;
        const dose = doseVal ? `${doseVal} ${doseUni}` : "";

        const intervaloSelect = row.querySelector('select[name="intervalo"]');
        const intervaloCustom = row.querySelector(
          'input[name="intervalo_custom"]'
        );
        let intervalo = intervaloSelect.value;
        if (intervalo === "Outro") intervalo = intervaloCustom.value;

        const duracaoInput = row.querySelector('input[name="duracao"]');
        const duracao = duracaoInput ? duracaoInput.value : "";

        medicamentos.push({ nome, dose, intervalo, duracao });
      });

      if (medicamentos.length === 0) {
        alert("Adicione pelo menos um medicamento para imprimir.");
        return;
      }

      const nomeAnimal = document.getElementById("headerAnimalNome").textContent.trim();
      const nomeTutor = document.getElementById("headerTutor").textContent.trim();
      // Tenta pegar nome do veterinário do atendimento carregado ou da sessão (não temos acesso direto à sessão aqui, então usa placeholder)
      const veterinario = atendimento 
        ? (atendimento.veterinario_nome || atendimento.veterinario || "Veterinário") 
        : "Veterinário";
        
      const observacoes = document.getElementById("observacoes").value;

      const janelaImpressao = window.open("", "_blank");
      const linhasMedicamentos = medicamentos
        .map(
          (med) => `
          <tr>
            <td>${med.nome}</td>
            <td>${med.dose}</td>
            <td>${med.intervalo || "--"}</td>
            <td>${med.duracao || "--"}</td>
          </tr>
        `
        )
        .join("");

      const conteudo = `
        <html>
          <head>
            <title>Receita - ${nomeAnimal}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #333; }
              .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #2dd4bf; padding-bottom: 20px; }
              .brand { display: flex; align-items: center; gap: 15px; }
              .brand img { max-height: 80px; width: auto; }
              .brand h1 { margin: 0; color: #0f766e; font-size: 28px; }
              .contact-info { text-align: right; font-size: 0.85rem; color: #666; line-height: 1.5; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 8px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f0fcf9; color: #0f766e; }
              .obs { margin-top: 20px; padding: 15px; border: 1px solid #eee; border-radius: 5px; }
              .footer { margin-top: 120px; text-align: center; font-size: 0.9em; color: #666; }
              .assinatura { margin-top: 50px; border-top: 1px solid #333; width: 300px; margin-left: auto; margin-right: auto; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="brand">
                <img src="../img/logo.png" alt="Logo" onerror="this.style.display='none'">
                <h1>PetClin</h1>
              </div>
              <div class="contact-info">
                <strong>Clínica Veterinária</strong><br>
                Rua Exemplo, 123 - Centro<br>
                (11) 99999-9999 | contato@petclin.com
              </div>
            </div>

            <div class="info-grid">
              <div><strong>Veterinário:</strong> ${veterinario}</div>
              <div><strong>Data:</strong> ${new Date().toLocaleString()}</div>
              <div><strong>Tutor:</strong> ${nomeTutor}</div>
              <div><strong>Paciente:</strong> ${nomeAnimal}</div>
            </div>

            <h3>Receita Veterinária</h3>
            <table>
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Dose</th>
                  <th>Intervalo</th>
                  <th>Duração</th>
                </tr>
              </thead>
              <tbody>
                ${linhasMedicamentos}
              </tbody>
            </table>

            ${
              observacoes
                ? `<div class="obs"><strong>Observações/Recomendações:</strong><br>${observacoes.replace(
                    /\n/g,
                    "<br>"
                  )}</div>`
                : ""
            }

            <div class="footer">
              <div class="assinatura">Assinatura do Veterinário</div>
              <p>Impresso em ${new Date().toLocaleString()}</p>
            </div>
            <script>
              window.onload = () => { window.print(); };
            </script>
          </body>
        </html>
      `;

      janelaImpressao.document.write(conteudo);
      janelaImpressao.document.close();
    });
  }

  if (selectKit) carregarListaKits();

  // Salvar
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    salvarPrescricao();
  });

  async function salvarPrescricao() {
    const medicamentos = [];
    const wrappers = container.querySelectorAll(".medicamento-wrapper");
    let erro = false;

    wrappers.forEach((wrapper) => {
      const row = wrapper.querySelector(".medicamento-row");
      if (erro) return;

      const nome = row.querySelector('input[name="nome"]').value;
      const doseInput = row.querySelector('input[name="dose_valor"]');
      const doseValor = doseInput.value;
      const doseUnidade = row.querySelector(
        'select[name="dose_unidade"]'
      ).value;
      const intervaloSelect = row.querySelector('select[name="intervalo"]');
      const intervaloCustom = row.querySelector(
        'input[name="intervalo_custom"]'
      );
      let intervalo = intervaloSelect.value;

      if (intervalo === "Outro") {
        intervalo = intervaloCustom.value;
        if (!intervalo.trim()) {
          alert("Por favor, especifique o intervalo personalizado.");
          intervaloCustom.focus();
          erro = true;
          return;
        }
      }
      const justificativa = wrapper.querySelector(
        'input[name="justificativa"]'
      ).value;
      const duracaoInput = row.querySelector('input[name="duracao"]');
      const duracao = duracaoInput ? duracaoInput.value : "";

      if (nome) {
        if (doseValor) {
          const valor = parseFloat(doseValor);
          if (isNaN(valor) || valor <= 0) {
            alert("A dose deve ser um número positivo.");
            doseInput.focus();
            erro = true;
            return;
          }
        }

        // Verifica se justificativa é obrigatória e está vazia (validação manual extra)
        const justifInput = wrapper.querySelector(
          'input[name="justificativa"]'
        );
        if (justifInput.required && !justificativa.trim()) {
          alert(
            `Por favor, preencha a justificativa para o medicamento "${nome}".`
          );
          justifInput.focus();
          erro = true;
          return;
        }

        const dose = doseValor ? `${doseValor} ${doseUnidade}` : "";
        medicamentos.push({ nome, dose, intervalo, justificativa, duracao });
      }
    });

    if (erro) return;

    if (medicamentos.length === 0) {
      alert("Adicione pelo menos um medicamento.");
      return;
    }

    const observacoes = document.getElementById("observacoes").value;

    const novaPrescricao = {
      atendimento_id: atendimentoId,
      medicamentos: medicamentos,
      observacoes: observacoes,
    };

    try {
      const res = await fetch('/prescricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaPrescricao)
      });
      if (res.ok) {
        alert("Prescrição salva com sucesso!");
        window.location.href = `prescricao.html?id=${atendimentoId}`;
      } else { alert("Erro ao salvar."); }
    } catch (e) { alert("Erro de conexão."); }
  }

  function sugerirAlternativas(termoAlergia) {
    const mapa = {
      dipirona: ["Tramadol", "Gabapentina"],
      amoxicilina: ["Doxiciclina", "Azitromicina"],
      penicilina: ["Eritromicina", "Clindamicina"],
      cefalexina: ["Enrofloxacina", "Marbofloxacina"],
      aines: ["Corticosteroides", "Opioides"],
      "anti-inflamatorio": ["Corticosteroides", "Opioides"],
      "anti-inflamatório": ["Corticosteroides", "Opioides"],
    };

    const termo = termoAlergia.toLowerCase();
    const chave = Object.keys(mapa).find((key) => termo.includes(key));
    return chave ? mapa[chave] : [];
  }
});
