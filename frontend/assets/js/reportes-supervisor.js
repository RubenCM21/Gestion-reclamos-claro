document.addEventListener("DOMContentLoaded", () => {
  const reportFrom = document.getElementById("reportFrom");
  const reportTo = document.getElementById("reportTo");
  const filterReportType = document.getElementById("filterReportType");
  const filterReportService = document.getElementById("filterReportService");
  const filterReportStatus = document.getElementById("filterReportStatus");

  const metricTotalCases = document.getElementById("metricTotalCases");
  const metricResolvedCases = document.getElementById("metricResolvedCases");
  const metricReportSla = document.getElementById("metricReportSla");
  const metricReportRating = document.getElementById("metricReportRating");

  const statusReportBars = document.getElementById("statusReportBars");
  const serviceReportBars = document.getElementById("serviceReportBars");
  const advisorReportRows = document.getElementById("advisorReportRows");
  const criticalReportList = document.getElementById("criticalReportList");

  const reportsAiTip = document.getElementById("reportsAiTip");
  const reportSummaryBox = document.getElementById("reportSummaryBox");

  const clearReportFilters = document.getElementById("clearReportFilters");
  const refreshReports = document.getElementById("refreshReports");
  const exportReportPdf = document.getElementById("exportReportPdf");
  const exportReportExcel = document.getElementById("exportReportExcel");

  const generateExecutiveSummary = document.getElementById("generateExecutiveSummary");
  const showCriticalReport = document.getElementById("showCriticalReport");
  const generateReportSummary = document.getElementById("generateReportSummary");

  const analyzeStatusReport = document.getElementById("analyzeStatusReport");
  const analyzeServiceReport = document.getElementById("analyzeServiceReport");
  const analyzeAdvisorReport = document.getElementById("analyzeAdvisorReport");

  const reportsBot = document.getElementById("reportsBot");
  const openReportsBot = document.getElementById("openReportsBot");
  const openReportsHelp = document.getElementById("openReportsHelp");
  const closeReportsBot = document.getElementById("closeReportsBot");

  let reportData = null;

  const fallbackReport = {
    resumen: {
      totalCasos: 48,
      resueltos: 31,
      cumplimientoSla: 88,
      satisfaccion: 4.4
    },
    estados: [
      { nombre: "Registrado", valor: 7 },
      { nombre: "En atención", valor: 12 },
      { nombre: "Pendiente cliente", valor: 5 },
      { nombre: "Escalado", valor: 4 },
      { nombre: "Resuelto", valor: 16 },
      { nombre: "Cerrado", valor: 4 }
    ],
    servicios: [
      { nombre: "Internet hogar", valor: 18 },
      { nombre: "Telefonía móvil", valor: 15 },
      { nombre: "Claro TV+", valor: 8 },
      { nombre: "Telefonía fija", valor: 7 }
    ],
    asesores: [
      {
        asesor: "Asesor Técnico Hogar",
        casos: 13,
        resueltos: 8,
        sla: 82,
        satisfaccion: 4.1,
        estado: "Riesgo"
      },
      {
        asesor: "Asesor Móvil",
        casos: 10,
        resueltos: 7,
        sla: 94,
        satisfaccion: 4.6,
        estado: "Estable"
      },
      {
        asesor: "Asesor Facturación",
        casos: 9,
        resueltos: 8,
        sla: 97,
        satisfaccion: 4.8,
        estado: "Óptimo"
      },
      {
        asesor: "Asesor Comercial",
        casos: 8,
        resueltos: 5,
        sla: 86,
        satisfaccion: 4.2,
        estado: "Estable"
      }
    ],
    criticos: [
      {
        titulo: "Mayor volumen en Internet hogar",
        descripcion: "Concentra 18 casos del periodo analizado."
      },
      {
        titulo: "SLA bajo en asesor técnico",
        descripcion: "Cumplimiento SLA de 82%, por debajo del umbral esperado."
      },
      {
        titulo: "Casos escalados pendientes",
        descripcion: "Existen 4 casos escalados que requieren seguimiento."
      }
    ]
  };

  async function initReports() {
    try {
      const params = getReportParams();

      if (typeof getReporteCasos !== "function") {
        throw new Error("api.js no disponible.");
      }

      const response = await getReporteCasos(params);

      reportData = response.reporte || response.data || null;

      if (!reportData) {
        throw new Error("Sin reporte desde backend.");
      }
    } catch (error) {
      console.warn("Usando reporte simulado:", error.message);
      reportData = fallbackReport;
    }

    renderReports();
  }

  function getReportParams() {
    return {
      desde: reportFrom.value,
      hasta: reportTo.value,
      tipo: filterReportType.value,
      servicio: filterReportService.value,
      estado: filterReportStatus.value
    };
  }

  function renderReports() {
    updateMetrics();
    renderBars(statusReportBars, reportData.estados);
    renderBars(serviceReportBars, reportData.servicios);
    renderAdvisorRows();
    renderCriticalItems();
  }

  function updateMetrics() {
    metricTotalCases.textContent = reportData.resumen.totalCasos;
    metricResolvedCases.textContent = reportData.resumen.resueltos;
    metricReportSla.textContent = `${reportData.resumen.cumplimientoSla}%`;
    metricReportRating.textContent = reportData.resumen.satisfaccion;

    reportsAiTip.textContent =
      `Se registran ${reportData.resumen.totalCasos} casos, con ${reportData.resumen.cumplimientoSla}% de cumplimiento SLA.`;
  }

  function renderBars(container, data) {
    const maxValue = Math.max(...data.map((item) => item.valor), 1);

    container.innerHTML = data
      .map((item) => {
        const percent = Math.round((item.valor / maxValue) * 100);

        return `
          <div class="report-bar-item">
            <div class="report-bar-item__top">
              <span>${item.nombre}</span>
              <strong>${item.valor}</strong>
            </div>

            <div class="report-bar-track">
              <div class="report-bar-fill" style="width: ${percent}%"></div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderAdvisorRows() {
    advisorReportRows.innerHTML = reportData.asesores
      .map(
        (item) => `
          <div class="report-row">
            <span class="case-code">${item.asesor}</span>
            <span>${item.casos}</span>
            <span>${item.resueltos}</span>
            <span class="performance-pill ${getSlaClass(item.sla)}">${item.sla}%</span>
            <span class="rating-pill">
              <i class="fa-solid fa-star"></i> ${item.satisfaccion}
            </span>
            <span>${item.estado}</span>
          </div>
        `
      )
      .join("");
  }

  function renderCriticalItems() {
    criticalReportList.innerHTML = reportData.criticos
      .map(
        (item) => `
          <div class="report-critical-item">
            <strong>${item.titulo}</strong>
            <span>${item.descripcion}</span>
          </div>
        `
      )
      .join("");
  }

  function getSlaClass(value) {
    if (value >= 95) return "performance-good";
    if (value >= 85) return "performance-medium";
    return "performance-risk";
  }

  [reportFrom, reportTo, filterReportType, filterReportService, filterReportStatus].forEach((field) => {
    field.addEventListener("change", initReports);
  });

  clearReportFilters.addEventListener("click", () => {
    reportFrom.value = "";
    reportTo.value = "";
    filterReportType.value = "all";
    filterReportService.value = "all";
    filterReportStatus.value = "all";

    initReports();
    showReportsToast("Filtros limpiados.");
  });

  refreshReports.addEventListener("click", () => {
    initReports();
    showReportsToast("Reportes actualizados.");
  });

  exportReportPdf.addEventListener("click", () => {
    showReportsToast("Reporte PDF generado de forma simulada.");
  });

  exportReportExcel.addEventListener("click", () => {
    showReportsToast("Reporte Excel generado de forma simulada.");
  });

  generateExecutiveSummary.addEventListener("click", () => {
    reportSummaryBox.innerHTML = `
      <strong>Resumen ejecutivo generado:</strong><br>
      La operación registra ${reportData.resumen.totalCasos} casos, con ${reportData.resumen.resueltos} resueltos.
      El cumplimiento SLA es de ${reportData.resumen.cumplimientoSla}% y la satisfacción promedio es ${reportData.resumen.satisfaccion}/5.
    `;

    showReportsToast("Resumen ejecutivo IA generado.");
  });

  showCriticalReport.addEventListener("click", () => {
    reportSummaryBox.innerHTML = `
      <strong>Puntos críticos:</strong><br>
      Se recomienda revisar el volumen en Internet hogar, los casos escalados y asesores con SLA menor al promedio.
    `;

    showReportsToast("Puntos críticos identificados.");
  });

  generateReportSummary.addEventListener("click", () => {
    reportSummaryBox.innerHTML = `
      <strong>Análisis generado:</strong><br>
      El reporte muestra una operación estable, aunque con oportunidades de mejora en servicios técnicos,
      seguimiento de casos escalados y balance de carga por asesor.
    `;

    showReportsToast("Análisis IA generado.");
  });

  analyzeStatusReport.addEventListener("click", () => {
    reportsAiTip.textContent =
      "IA: los estados con mayor concentración son En atención y Resuelto. Revisar pendientes cliente para evitar retrasos.";
    showReportsToast("Estados analizados.");
  });

  analyzeServiceReport.addEventListener("click", () => {
    reportsAiTip.textContent =
      "IA: Internet hogar y Telefonía móvil concentran el mayor volumen de casos. Conviene reforzar capacidad técnica.";
    showReportsToast("Servicios analizados.");
  });

  analyzeAdvisorReport.addEventListener("click", () => {
    reportsAiTip.textContent =
      "IA: el asesor técnico hogar presenta menor cumplimiento SLA; se recomienda balancear carga o reasignar casos.";
    showReportsToast("Asesores analizados.");
  });

  function toggleReportsBot() {
    reportsBot.classList.toggle("active");
  }

  openReportsBot.addEventListener("click", toggleReportsBot);
  openReportsHelp.addEventListener("click", toggleReportsBot);

  closeReportsBot.addEventListener("click", () => {
    reportsBot.classList.remove("active");
  });

  function showReportsToast(message, type = "success") {
    const existingToast = document.querySelector(".reports-toast");

    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "reports-toast";
    toast.textContent = message;

    Object.assign(toast.style, {
      position: "fixed",
      top: "24px",
      right: "24px",
      padding: "14px 18px",
      background: type === "error" ? "#b6000c" : "#171717",
      color: "#ffffff",
      borderRadius: "14px",
      boxShadow: "0 14px 35px rgba(0,0,0,.18)",
      zIndex: "999",
      fontWeight: "800"
    });

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  initReports();
});