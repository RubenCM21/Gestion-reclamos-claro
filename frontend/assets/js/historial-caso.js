document.addEventListener("DOMContentLoaded", () => {
  const filterMovement = document.getElementById("filterMovement");
  const filterResponsible = document.getElementById("filterResponsible");
  const filterFrom = document.getElementById("filterFrom");
  const filterTo = document.getElementById("filterTo");
  const clearHistoryFilters = document.getElementById("clearHistoryFilters");

  const historyItems = Array.from(document.querySelectorAll(".history-item"));
  const emptyHistory = document.getElementById("emptyHistory");
  const indicatorMovements = document.getElementById("indicatorMovements");

  const expandHistory = document.getElementById("expandHistory");
  const historyToggles = document.querySelectorAll(".history-toggle");

  const generateHistorySummary = document.getElementById("generateHistorySummary");
  const historyAiSummary = document.getElementById("historyAiSummary");

  const exportHistory = document.getElementById("exportHistory");
  const downloadPdfHistory = document.getElementById("downloadPdfHistory");
  const downloadExcelHistory = document.getElementById("downloadExcelHistory");

  const historyBot = document.getElementById("historyBot");
  const openHistoryBot = document.getElementById("openHistoryBot");
  const openHistoryHelp = document.getElementById("openHistoryHelp");
  const closeHistoryBot = document.getElementById("closeHistoryBot");

  function applyHistoryFilters() {
    const movement = filterMovement.value;
    const responsible = filterResponsible.value;
    const from = filterFrom.value;
    const to = filterTo.value;

    let visibleCount = 0;

    historyItems.forEach((item) => {
      const itemMovement = item.dataset.movement;
      const itemResponsible = item.dataset.responsible;
      const itemDate = item.dataset.date;

      const matchesMovement = movement === "all" || itemMovement === movement;
      const matchesResponsible = responsible === "all" || itemResponsible === responsible;
      const matchesFrom = !from || itemDate >= from;
      const matchesTo = !to || itemDate <= to;

      const visible =
        matchesMovement &&
        matchesResponsible &&
        matchesFrom &&
        matchesTo;

      item.classList.toggle("hidden", !visible);

      if (visible) {
        visibleCount++;
      }
    });

    if (emptyHistory) {
      emptyHistory.classList.toggle("hidden", visibleCount > 0);
    }

    if (indicatorMovements) {
      indicatorMovements.textContent = visibleCount;
    }
  }

  [filterMovement, filterResponsible, filterFrom, filterTo].forEach((element) => {
    if (element) {
      element.addEventListener("change", applyHistoryFilters);
      element.addEventListener("input", applyHistoryFilters);
    }
  });

  if (clearHistoryFilters) {
    clearHistoryFilters.addEventListener("click", () => {
      filterMovement.value = "all";
      filterResponsible.value = "all";
      filterFrom.value = "";
      filterTo.value = "";

      applyHistoryFilters();
      showHistoryToast("Filtros de historial limpiados correctamente.");
    });
  }

  historyToggles.forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".history-item");
      item.classList.toggle("expanded");

      button.textContent = item.classList.contains("expanded")
        ? "Ocultar detalle técnico"
        : "Ver detalle técnico";
    });
  });

  if (expandHistory) {
    expandHistory.addEventListener("click", () => {
      const shouldExpand = expandHistory.textContent.trim() === "Expandir todo";

      historyItems.forEach((item) => {
        const hasExtra = item.querySelector(".history-extra");
        const toggle = item.querySelector(".history-toggle");

        if (hasExtra) {
          item.classList.toggle("expanded", shouldExpand);
        }

        if (toggle) {
          toggle.textContent = shouldExpand
            ? "Ocultar detalle técnico"
            : "Ver detalle técnico";
        }
      });

      expandHistory.textContent = shouldExpand ? "Contraer todo" : "Expandir todo";
    });
  }

  if (generateHistorySummary) {
    generateHistorySummary.addEventListener("click", () => {
      const visibleItems = historyItems.filter((item) => !item.classList.contains("hidden"));
      const movementCount = visibleItems.length;

      historyAiSummary.innerHTML = `
        <strong>Resumen generado:</strong><br>
        Se identificaron ${movementCount} movimiento(s) visibles en el historial.
        El caso fue registrado, cuenta con evidencias, fue clasificado por el supervisor,
        asignado al área responsable y actualmente se encuentra en atención.
        No se requiere acción inmediata del cliente.
      `;

      showHistoryToast("Resumen IA del historial generado.");
    });
  }

  if (exportHistory) {
    exportHistory.addEventListener("click", () => {
      showHistoryToast("Exportación general del historial generada de forma simulada.");
    });
  }

  if (downloadPdfHistory) {
    downloadPdfHistory.addEventListener("click", () => {
      showHistoryToast("Descarga PDF simulada del historial.");
    });
  }

  if (downloadExcelHistory) {
    downloadExcelHistory.addEventListener("click", () => {
      showHistoryToast("Descarga Excel simulada del historial.");
    });
  }

  function toggleHistoryBot() {
    historyBot.classList.toggle("active");
  }

  if (openHistoryBot) {
    openHistoryBot.addEventListener("click", toggleHistoryBot);
  }

  if (openHistoryHelp) {
    openHistoryHelp.addEventListener("click", toggleHistoryBot);
  }

  if (closeHistoryBot) {
    closeHistoryBot.addEventListener("click", () => {
      historyBot.classList.remove("active");
    });
  }

  function showHistoryToast(message, type = "success") {
    const existingToast = document.querySelector(".history-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "history-toast";
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

  applyHistoryFilters();
});