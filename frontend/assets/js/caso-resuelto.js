document.addEventListener("DOMContentLoaded", () => {
  const resolvedRows = document.getElementById("resolvedRows");
  const emptyResolved = document.getElementById("emptyResolved");

  const resolvedSearch = document.getElementById("resolvedSearch");
  const filterResolvedType = document.getElementById("filterResolvedType");
  const filterResolvedService = document.getElementById("filterResolvedService");
  const filterResolvedResult = document.getElementById("filterResolvedResult");
  const filterRating = document.getElementById("filterRating");

  const clearResolvedFilters = document.getElementById("clearResolvedFilters");
  const refreshResolvedCases = document.getElementById("refreshResolvedCases");
  const exportResolvedCases = document.getElementById("exportResolvedCases");

  const metricResolvedToday = document.getElementById("metricResolvedToday");
  const metricAvgTime = document.getElementById("metricAvgTime");
  const metricSlaCompliance = document.getElementById("metricSlaCompliance");
  const metricSatisfaction = document.getElementById("metricSatisfaction");
  const avgSatisfactionText = document.getElementById("avgSatisfactionText");

  const indicatorInSla = document.getElementById("indicatorInSla");
  const indicatorOutSla = document.getElementById("indicatorOutSla");
  const indicatorLowRating = document.getElementById("indicatorLowRating");

  const resolvedAiSummary = document.getElementById("resolvedAiSummary");
  const generateResolvedSummary = document.getElementById("generateResolvedSummary");

  const resolvedDetailModal = document.getElementById("resolvedDetailModal");
  const closeResolvedDetail = document.getElementById("closeResolvedDetail");
  const resolvedDetailTitle = document.getElementById("resolvedDetailTitle");
  const resolvedDetailSubtitle = document.getElementById("resolvedDetailSubtitle");
  const resolvedDetailContent = document.getElementById("resolvedDetailContent");
  const downloadResolvedProof = document.getElementById("downloadResolvedProof");

  const resolvedBot = document.getElementById("resolvedBot");
  const openResolvedBot = document.getElementById("openResolvedBot");
  const openResolvedHelp = document.getElementById("openResolvedHelp");
  const closeResolvedBot = document.getElementById("closeResolvedBot");

  let resolvedCases = [];

  const fallbackResolvedCases = [
    {
      codigoCaso: "CL-IN-000074",
      cliente: "Cliente Claro",
      tipo: "Incidencia",
      servicio: "Internet hogar",
      resultado: "Solucionado",
      dentroSla: true,
      tiempoAtencion: "32 min",
      calificacion: 5,
      solucion:
        "Se realizó validación técnica y se confirmó restablecimiento del servicio de internet hogar."
    },
    {
      codigoCaso: "CL-RC-000061",
      cliente: "Cliente Claro",
      tipo: "Reclamo",
      servicio: "Telefonía fija",
      resultado: "Solucionado",
      dentroSla: true,
      tiempoAtencion: "45 min",
      calificacion: 4,
      solucion:
        "Se actualizó la información del plan contratado y se comunicó respuesta formal al cliente."
    },
    {
      codigoCaso: "CL-RC-000052",
      cliente: "Cliente Claro",
      tipo: "Reclamo",
      servicio: "Claro TV+",
      resultado: "No procede",
      dentroSla: true,
      tiempoAtencion: "28 min",
      calificacion: 3,
      solucion:
        "Se revisó el caso y no se identificó inconsistencia en la atención registrada."
    },
    {
      codigoCaso: "CL-IN-000041",
      cliente: "Cliente Claro",
      tipo: "Incidencia",
      servicio: "Telefonía móvil",
      resultado: "Derivado",
      dentroSla: false,
      tiempoAtencion: "70 min",
      calificacion: 3,
      solucion:
        "El caso fue derivado a soporte técnico móvil por requerir validación especializada."
    },
    {
      codigoCaso: "CL-RC-000038",
      cliente: "Cliente Claro",
      tipo: "Reclamo",
      servicio: "Internet hogar",
      resultado: "Solucionado",
      dentroSla: true,
      tiempoAtencion: "25 min",
      calificacion: 5,
      solucion:
        "Se confirmó ajuste en facturación y se comunicó la solución al cliente."
    }
  ];

  async function initResolvedCases() {
    try {
      const usuario = typeof getUsuarioActual === "function" ? getUsuarioActual() : null;
      const asesorId = usuario?.id || 1;

      if (typeof getCasosByAsesor !== "function") {
        throw new Error("api.js no disponible.");
      }

      const response = await getCasosByAsesor(asesorId);
      const cases = response.casos || response.data || [];

      resolvedCases = cases.filter((item) => {
        return item.estado === "Resuelto" || item.estado === "Cerrado";
      });

      if (resolvedCases.length === 0) {
        throw new Error("Sin casos resueltos en backend.");
      }
    } catch (error) {
      console.warn("Usando casos resueltos simulados:", error.message);
      resolvedCases = fallbackResolvedCases;
    }

    renderResolvedCases();
    updateResolvedMetrics();
  }

  function renderResolvedCases() {
    const filtered = getFilteredResolvedCases();

    resolvedRows.innerHTML = "";

    filtered.forEach((item) => {
      const row = document.createElement("div");
      row.className = "resolved-row";

      row.innerHTML = `
        <span class="case-code">${item.codigoCaso}</span>
        <span>${item.cliente}</span>
        <span>${item.tipo}</span>
        <span>${item.servicio}</span>
        <span class="result-pill ${getResultClass(item.resultado)}">${item.resultado}</span>
        <span class="sla-tag ${item.dentroSla ? "sla-normal" : "sla-critical"}">
          ${item.dentroSla ? "Dentro SLA" : "Fuera SLA"}
        </span>
        <span class="rating-pill">
          <i class="fa-solid fa-star"></i> ${item.calificacion}/5
        </span>

        <div class="resolved-actions">
          <button class="view-resolved-detail" data-code="${item.codigoCaso}">
            Ver
          </button>
          <button class="ghost download-proof" data-code="${item.codigoCaso}">
            Constancia
          </button>
        </div>
      `;

      resolvedRows.appendChild(row);
    });

    emptyResolved.classList.toggle("hidden", filtered.length > 0);
    attachResolvedEvents();
  }

  function getFilteredResolvedCases() {
    const search = resolvedSearch.value.trim().toLowerCase();
    const type = filterResolvedType.value;
    const service = filterResolvedService.value;
    const result = filterResolvedResult.value;
    const rating = filterRating.value;

    return resolvedCases.filter((item) => {
      const matchesSearch =
        !search ||
        item.codigoCaso.toLowerCase().includes(search) ||
        item.cliente.toLowerCase().includes(search) ||
        item.servicio.toLowerCase().includes(search) ||
        item.solucion.toLowerCase().includes(search);

      const matchesType = type === "all" || item.tipo === type;
      const matchesService = service === "all" || item.servicio === service;
      const matchesResult = result === "all" || item.resultado === result;

      const matchesRating =
        rating === "all" ||
        (rating === "5" && item.calificacion === 5) ||
        (rating === "4" && item.calificacion === 4) ||
        (rating === "3" && item.calificacion <= 3);

      return matchesSearch && matchesType && matchesService && matchesResult && matchesRating;
    });
  }

  function attachResolvedEvents() {
    document.querySelectorAll(".view-resolved-detail").forEach((button) => {
      button.addEventListener("click", () => {
        const code = button.dataset.code;
        const selected = resolvedCases.find((item) => item.codigoCaso === code);

        if (selected) {
          openResolvedDetail(selected);
        }
      });
    });

    document.querySelectorAll(".download-proof").forEach((button) => {
      button.addEventListener("click", () => {
        showResolvedToast(`Constancia del caso ${button.dataset.code} generada de forma simulada.`);
      });
    });
  }

  function openResolvedDetail(item) {
    resolvedDetailTitle.textContent = `Caso resuelto ${item.codigoCaso}`;
    resolvedDetailSubtitle.textContent = `${item.tipo} · ${item.servicio}`;

    const rows = [
      ["Código", item.codigoCaso],
      ["Cliente", item.cliente],
      ["Tipo", item.tipo],
      ["Servicio", item.servicio],
      ["Resultado", item.resultado],
      ["SLA", item.dentroSla ? "Dentro del plazo" : "Fuera del plazo"],
      ["Tiempo de atención", item.tiempoAtencion],
      ["Calificación", `${item.calificacion}/5`],
      ["Solución registrada", item.solucion],
      ["Sugerencia IA", getResolvedSuggestion(item)]
    ];

    resolvedDetailContent.innerHTML = rows
      .map(
        ([label, value]) => `
          <div class="preview-row">
            <strong>${label}</strong>
            <span>${value}</span>
          </div>
        `
      )
      .join("");

    resolvedDetailModal.classList.add("active");
  }

  function getResolvedSuggestion(item) {
    if (!item.dentroSla) {
      return "Analizar causa de demora para evitar incumplimientos similares.";
    }

    if (item.calificacion <= 3) {
      return "Revisar calidad de respuesta y claridad de la solución comunicada.";
    }

    return "Caso resuelto correctamente. Mantener buenas prácticas de atención.";
  }

  function updateResolvedMetrics() {
    const total = resolvedCases.length;
    const inSla = resolvedCases.filter((item) => item.dentroSla).length;
    const outSla = total - inSla;
    const lowRating = resolvedCases.filter((item) => item.calificacion <= 3).length;
    const avgRating =
      total > 0
        ? (resolvedCases.reduce((sum, item) => sum + item.calificacion, 0) / total).toFixed(1)
        : "0.0";

    const slaCompliance = total > 0 ? Math.round((inSla / total) * 100) : 0;

    metricResolvedToday.textContent = total;
    metricAvgTime.textContent = "36 min";
    metricSlaCompliance.textContent = `${slaCompliance}%`;
    metricSatisfaction.textContent = avgRating;
    avgSatisfactionText.textContent = `${avgRating} de 5 según casos calificados.`;

    indicatorInSla.textContent = inSla;
    indicatorOutSla.textContent = outSla;
    indicatorLowRating.textContent = lowRating;
  }

  function getResultClass(result) {
    const classes = {
      Solucionado: "result-success",
      "No procede": "result-neutral",
      Derivado: "result-warning"
    };

    return classes[result] || "result-neutral";
  }

  [resolvedSearch, filterResolvedType, filterResolvedService, filterResolvedResult, filterRating].forEach((field) => {
    field.addEventListener("input", renderResolvedCases);
    field.addEventListener("change", renderResolvedCases);
  });

  clearResolvedFilters.addEventListener("click", () => {
    resolvedSearch.value = "";
    filterResolvedType.value = "all";
    filterResolvedService.value = "all";
    filterResolvedResult.value = "all";
    filterRating.value = "all";

    renderResolvedCases();
    showResolvedToast("Filtros limpiados.");
  });

  refreshResolvedCases.addEventListener("click", () => {
    initResolvedCases();
    showResolvedToast("Casos resueltos actualizados.");
  });

  exportResolvedCases.addEventListener("click", () => {
    showResolvedToast("Exportación de casos resueltos generada de forma simulada.");
  });

  generateResolvedSummary.addEventListener("click", () => {
    const lowRating = resolvedCases.filter((item) => item.calificacion <= 3).length;
    const outSla = resolvedCases.filter((item) => !item.dentroSla).length;

    resolvedAiSummary.innerHTML = `
      <strong>Análisis generado:</strong><br>
      Se identificaron ${outSla} caso(s) fuera de SLA y ${lowRating} caso(s) con calificación baja.
      Se recomienda revisar la claridad de las respuestas y los tiempos de escalamiento.
    `;

    showResolvedToast("Análisis IA generado.");
  });

  if (downloadResolvedProof) {
    downloadResolvedProof.addEventListener("click", () => {
      showResolvedToast("Constancia descargada de forma simulada.");
    });
  }

  closeResolvedDetail.addEventListener("click", () => {
    resolvedDetailModal.classList.remove("active");
  });

  resolvedDetailModal.addEventListener("click", (event) => {
    if (event.target === resolvedDetailModal) {
      resolvedDetailModal.classList.remove("active");
    }
  });

  function toggleResolvedBot() {
    resolvedBot.classList.toggle("active");
  }

  openResolvedBot.addEventListener("click", toggleResolvedBot);
  openResolvedHelp.addEventListener("click", toggleResolvedBot);

  closeResolvedBot.addEventListener("click", () => {
    resolvedBot.classList.remove("active");
  });

  function showResolvedToast(message, type = "success") {
    const existingToast = document.querySelector(".resolved-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "resolved-toast";
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

  initResolvedCases();
});