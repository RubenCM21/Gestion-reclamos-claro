document.addEventListener("DOMContentLoaded", () => {
  const rows = Array.from(document.querySelectorAll(".cases-row"));
  const searchInput = document.getElementById("caseSearch");

  const filterType = document.getElementById("filterType");
  const filterStatus = document.getElementById("filterStatus");
  const filterPriority = document.getElementById("filterPriority");
  const filterService = document.getElementById("filterService");

  const clearCaseFilters = document.getElementById("clearCaseFilters");
  const tabButtons = document.querySelectorAll(".cases-tabs .case-filter");
  const emptyCases = document.getElementById("emptyCases");

  const toggleView = document.getElementById("toggleView");
  const casesTable = document.getElementById("casesTable");
  const casesCardView = document.getElementById("casesCardView");

  const caseDetailModal = document.getElementById("caseDetailModal");
  const closeCaseDetail = document.getElementById("closeCaseDetail");
  const detailTitle = document.getElementById("detailTitle");
  const detailSubtitle = document.getElementById("detailSubtitle");
  const caseDetailGrid = document.getElementById("caseDetailGrid");

  const exportCases = document.getElementById("exportCases");
  const smartSearch = document.getElementById("smartSearch");

  const casesBot = document.getElementById("casesBot");
  const openCasesBot = document.getElementById("openCasesBot");
  const openCasesHelp = document.getElementById("openCasesHelp");
  const closeCasesBot = document.getElementById("closeCasesBot");

  let cardViewActive = false;

  function applyCaseFilters() {
    const search = searchInput.value.trim().toLowerCase();
    const type = filterType.value;
    const status = filterStatus.value;
    const priority = filterPriority.value;
    const service = filterService.value;

    let visibleCount = 0;

    rows.forEach((row) => {
      const rowCode = row.dataset.code.toLowerCase();
      const rowType = row.dataset.type;
      const rowService = row.dataset.service;
      const rowCategory = row.dataset.category.toLowerCase();
      const rowPriority = row.dataset.priority;
      const rowStatus = row.dataset.status;

      const matchesSearch =
        !search ||
        rowCode.includes(search) ||
        rowService.toLowerCase().includes(search) ||
        rowCategory.includes(search);

      const matchesType = type === "all" || rowType === type;
      const matchesStatus = status === "all" || rowStatus === status;
      const matchesPriority = priority === "all" || rowPriority === priority;
      const matchesService = service === "all" || rowService === service;

      const visible =
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesPriority &&
        matchesService;

      row.classList.toggle("hidden", !visible);

      if (visible) {
        visibleCount++;
      }
    });

    updateEmptyState(visibleCount);
    renderCardView();
  }

  function updateEmptyState(visibleCount) {
    if (!emptyCases) return;

    emptyCases.classList.toggle("hidden", visibleCount > 0);
  }

  [searchInput, filterType, filterStatus, filterPriority, filterService].forEach((element) => {
    if (element) {
      element.addEventListener("input", applyCaseFilters);
      element.addEventListener("change", applyCaseFilters);
    }
  });

  if (clearCaseFilters) {
    clearCaseFilters.addEventListener("click", () => {
      searchInput.value = "";
      filterType.value = "all";
      filterStatus.value = "all";
      filterPriority.value = "all";
      filterService.value = "all";

      tabButtons.forEach((button) => button.classList.remove("active"));
      tabButtons[0].classList.add("active");

      applyCaseFilters();
      showCasesToast("Filtros limpiados correctamente.");
    });
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const selectedTab = button.dataset.tab;

      filterStatus.value = selectedTab === "all" ? "all" : selectedTab;

      applyCaseFilters();
    });
  });

  if (smartSearch) {
    smartSearch.addEventListener("click", () => {
      const text = searchInput.value.trim();

      if (!text) {
        showCasesToast("Escribe un código, servicio o categoría para realizar la búsqueda.", "error");
        return;
      }

      showCasesToast("Búsqueda inteligente aplicada.");
      applyCaseFilters();
    });
  }

  if (toggleView) {
    toggleView.addEventListener("click", () => {
      cardViewActive = !cardViewActive;

      if (cardViewActive) {
        casesTable.style.display = "none";
        casesCardView.classList.remove("hidden");
        toggleView.innerHTML = '<i class="fa-solid fa-table"></i> Vista tabla';
        renderCardView();
      } else {
        casesTable.style.display = "grid";
        casesCardView.classList.add("hidden");
        toggleView.innerHTML = '<i class="fa-solid fa-table-cells-large"></i> Vista tarjetas';
      }
    });
  }

  function renderCardView() {
    if (!casesCardView || !cardViewActive) return;

    const visibleRows = rows.filter((row) => !row.classList.contains("hidden"));

    casesCardView.innerHTML = "";

    visibleRows.forEach((row) => {
      const card = document.createElement("article");
      card.className = "case-mini-card";

      card.innerHTML = `
        <div class="case-mini-card__top">
          <h3>${row.dataset.code}</h3>
          <span class="status-pill ${getStatusClass(row.dataset.status)}">
            ${row.dataset.status}
          </span>
        </div>

        <p>
          <strong>${row.dataset.type}</strong> · ${row.dataset.service}<br>
          ${row.dataset.category}
        </p>

        <span class="priority-pill ${getPriorityClass(row.dataset.priority)}">
          ${row.dataset.priority}
        </span>

        <div class="case-mini-card__actions">
          <button class="case-action-btn view-detail" data-code="${row.dataset.code}">
            Ver detalle
          </button>
          <button class="case-action-btn ghost">
            Historial
          </button>
        </div>
      `;

      casesCardView.appendChild(card);
    });

    attachDetailEvents();
  }

  function getStatusClass(status) {
    const classes = {
      "En atención": "status-blue",
      "Pendiente cliente": "status-orange",
      "Escalado": "status-red",
      "Resuelto": "status-green",
      "Cerrado": "status-dark",
      "Registrado": "status-blue"
    };

    return classes[status] || "status-blue";
  }

  function getPriorityClass(priority) {
    const classes = {
      "Crítica": "priority-critical",
      "Alta": "priority-high",
      "Media": "priority-medium",
      "Baja": "priority-low"
    };

    return classes[priority] || "priority-medium";
  }

  function attachDetailEvents() {
    const detailButtons = document.querySelectorAll(".view-detail");

    detailButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const code = button.dataset.code;
        const row = rows.find((item) => item.dataset.code === code);

        if (row) {
          openCaseDetail(row);
        }
      });
    });
  }

  function openCaseDetail(row) {
    detailTitle.textContent = `Detalle del caso ${row.dataset.code}`;
    detailSubtitle.textContent = `${row.dataset.type} asociado a ${row.dataset.service}.`;

    const detailRows = [
      ["Código", row.dataset.code],
      ["Tipo", row.dataset.type],
      ["Servicio", row.dataset.service],
      ["Categoría", row.dataset.category],
      ["Prioridad", row.dataset.priority],
      ["Estado", row.dataset.status],
      ["Responsable", "Área de Atención Claro"],
      ["Última actualización", getRowUpdate(row)],
      ["Siguiente acción", getNextAction(row.dataset.status)],
      ["Observación IA", getAiObservation(row.dataset.status)]
    ];

    caseDetailGrid.innerHTML = detailRows
      .map(
        ([label, value]) => `
          <div class="case-detail-item">
            <strong>${label}</strong>
            <span>${value}</span>
          </div>
        `
      )
      .join("");

    caseDetailModal.classList.add("active");
  }

  function getRowUpdate(row) {
    const spans = row.querySelectorAll("span");
    return spans[6]?.textContent || "No disponible";
  }

  function getNextAction(status) {
    const actions = {
      "En atención": "Esperar actualización del asesor responsable.",
      "Pendiente cliente": "Adjuntar la información solicitada para continuar.",
      "Escalado": "El caso está siendo revisado por un área especializada.",
      "Resuelto": "Puedes revisar la solución y calificar la atención.",
      "Cerrado": "El caso se encuentra finalizado.",
      "Registrado": "El caso está pendiente de clasificación."
    };

    return actions[status] || "Revisar el historial del caso.";
  }

  function getAiObservation(status) {
    const observations = {
      "En atención": "El caso se encuentra dentro del flujo normal de atención.",
      "Pendiente cliente": "Se recomienda responder pronto para evitar retrasos.",
      "Escalado": "La intervención de un área especializada puede ampliar el plazo.",
      "Resuelto": "Revisa si la solución recibida responde al problema reportado.",
      "Cerrado": "Puedes descargar la constancia del caso.",
      "Registrado": "El caso será clasificado según categoría y prioridad."
    };

    return observations[status] || "Sin observación disponible.";
  }

  if (closeCaseDetail) {
    closeCaseDetail.addEventListener("click", () => {
      caseDetailModal.classList.remove("active");
    });
  }

  if (caseDetailModal) {
    caseDetailModal.addEventListener("click", (event) => {
      if (event.target === caseDetailModal) {
        caseDetailModal.classList.remove("active");
      }
    });
  }

  if (exportCases) {
    exportCases.addEventListener("click", () => {
      showCasesToast("Se generó una exportación simulada de tus casos.");
    });
  }

  function toggleCasesBot() {
    casesBot.classList.toggle("active");
  }

  if (openCasesBot) {
    openCasesBot.addEventListener("click", toggleCasesBot);
  }

  if (openCasesHelp) {
    openCasesHelp.addEventListener("click", toggleCasesBot);
  }

  if (closeCasesBot) {
    closeCasesBot.addEventListener("click", () => {
      casesBot.classList.remove("active");
    });
  }

  function showCasesToast(message, type = "success") {
    const existingToast = document.querySelector(".cases-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "cases-toast";
    toast.textContent = message;

    const background = type === "error" ? "#b6000c" : "#171717";

    Object.assign(toast.style, {
      position: "fixed",
      top: "24px",
      right: "24px",
      padding: "14px 18px",
      background,
      color: "#ffffff",
      borderRadius: "14px",
      boxShadow: "0 14px 35px rgba(0,0,0,.18)",
      zIndex: "999",
      fontWeight: "800"
    });

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  attachDetailEvents();
  applyCaseFilters();
});