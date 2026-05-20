document.addEventListener("DOMContentLoaded", () => {
  const slaRows = document.getElementById("slaRows");
  const emptySla = document.getElementById("emptySla");

  const slaSearch = document.getElementById("slaSearch");
  const filterSlaStatus = document.getElementById("filterSlaStatus");
  const filterSlaPriority = document.getElementById("filterSlaPriority");
  const filterSlaAdvisor = document.getElementById("filterSlaAdvisor");
  const filterSlaService = document.getElementById("filterSlaService");

  const metricSlaOk = document.getElementById("metricSlaOk");
  const metricSlaRisk = document.getElementById("metricSlaRisk");
  const metricSlaExpired = document.getElementById("metricSlaExpired");
  const metricSlaCompliance = document.getElementById("metricSlaCompliance");
  const sidebarSlaRiskCount = document.getElementById("sidebarSlaRiskCount");

  const slaAiTip = document.getElementById("slaAiTip");
  const slaAdvisorRisk = document.getElementById("slaAdvisorRisk");
  const slaSummaryBox = document.getElementById("slaSummaryBox");

  const refreshSla = document.getElementById("refreshSla");
  const exportSlaReport = document.getElementById("exportSlaReport");
  const clearSlaFilters = document.getElementById("clearSlaFilters");
  const showCriticalSla = document.getElementById("showCriticalSla");
  const generateSlaPlan = document.getElementById("generateSlaPlan");
  const prioritizeSlaAi = document.getElementById("prioritizeSlaAi");
  const generateSlaSummary = document.getElementById("generateSlaSummary");

  const tabButtons = document.querySelectorAll(".sla-tabs .case-filter");

  const slaDetailModal = document.getElementById("slaDetailModal");
  const closeSlaDetail = document.getElementById("closeSlaDetail");
  const slaDetailTitle = document.getElementById("slaDetailTitle");
  const slaDetailSubtitle = document.getElementById("slaDetailSubtitle");
  const slaDetailContent = document.getElementById("slaDetailContent");

  const slaBot = document.getElementById("slaBot");
  const openSlaBot = document.getElementById("openSlaBot");
  const openSlaHelp = document.getElementById("openSlaHelp");
  const closeSlaBot = document.getElementById("closeSlaBot");

  let slaCases = [];

  const fallbackSlaCases = [
    {
      codigoCaso: "CL-IN-000140",
      asesor: "Asesor Técnico Hogar",
      tipo: "Incidencia",
      servicio: "Internet hogar",
      categoria: "Sin servicio",
      prioridad: "Crítica",
      estadoSla: "En riesgo",
      horasRestantes: 5,
      avance: 78,
      accionSugerida: "Atención inmediata o escalamiento técnico."
    },
    {
      codigoCaso: "CL-RC-000137",
      asesor: "Asesor Facturación",
      tipo: "Reclamo",
      servicio: "Telefonía móvil",
      categoria: "Facturación",
      prioridad: "Alta",
      estadoSla: "En riesgo",
      horasRestantes: 8,
      avance: 65,
      accionSugerida: "Solicitar validación de facturación."
    },
    {
      codigoCaso: "CL-IN-000133",
      asesor: "Asesor Técnico Hogar",
      tipo: "Incidencia",
      servicio: "Claro TV+",
      categoria: "Corte de señal",
      prioridad: "Alta",
      estadoSla: "Vencido",
      horasRestantes: -2,
      avance: 100,
      accionSugerida: "Reasignar o escalar por vencimiento."
    },
    {
      codigoCaso: "CL-RC-000128",
      asesor: "Asesor Comercial",
      tipo: "Reclamo",
      servicio: "Internet hogar",
      categoria: "Contrato o plan",
      prioridad: "Media",
      estadoSla: "Dentro de SLA",
      horasRestantes: 24,
      avance: 35,
      accionSugerida: "Seguimiento normal."
    },
    {
      codigoCaso: "CL-IN-000099",
      asesor: "Asesor Móvil",
      tipo: "Incidencia",
      servicio: "Telefonía móvil",
      categoria: "Sin servicio",
      prioridad: "Crítica",
      estadoSla: "Vencido",
      horasRestantes: -1,
      avance: 100,
      accionSugerida: "Escalamiento inmediato a soporte técnico móvil."
    },
    {
      codigoCaso: "CL-RC-000088",
      asesor: "Asesor Comercial",
      tipo: "Reclamo",
      servicio: "Claro TV+",
      categoria: "Atención recibida",
      prioridad: "Media",
      estadoSla: "Dentro de SLA",
      horasRestantes: 30,
      avance: 25,
      accionSugerida: "Seguimiento normal."
    }
  ];

  async function initSlaMonitoring() {
    try {
      /*
        Con backend real, se recomienda crear endpoint:
        GET /api/supervisor/monitoreo-sla
        Por ahora se intenta usar reportes si existe.
      */
      if (typeof getReporteCasos === "function") {
        const response = await getReporteCasos({ tipo: "sla" });
        slaCases = response.casos || response.data || [];
      }

      if (!slaCases.length) {
        throw new Error("Sin datos SLA desde backend.");
      }
    } catch (error) {
      console.warn("Usando monitoreo SLA simulado:", error.message);
      slaCases = fallbackSlaCases;
    }

    prioritizeSlaCases();
    renderSlaRows();
    updateSlaMetrics();
    renderAdvisorRisk();
  }

  function prioritizeSlaCases() {
    slaCases.sort((a, b) => {
      const statusDiff = getSlaStatusScore(b.estadoSla) - getSlaStatusScore(a.estadoSla);

      if (statusDiff !== 0) return statusDiff;

      const priorityDiff = getPriorityScore(b.prioridad) - getPriorityScore(a.prioridad);

      if (priorityDiff !== 0) return priorityDiff;

      return Number(a.horasRestantes) - Number(b.horasRestantes);
    });

    const first = slaCases[0];

    if (first) {
      slaAiTip.textContent =
        `Prioriza ${first.codigoCaso}: ${first.estadoSla}, prioridad ${first.prioridad}, ${first.horasRestantes} h restantes.`;
    }
  }

  function renderSlaRows() {
    const filtered = getFilteredSlaCases();

    slaRows.innerHTML = "";

    filtered.forEach((item) => {
      const row = document.createElement("div");
      row.className = "sla-row";

      row.innerHTML = `
        <span class="case-code">${item.codigoCaso}</span>
        <span>${item.asesor}</span>
        <span>${item.servicio}</span>
        <span class="priority-pill ${getPriorityClass(item.prioridad)}">${item.prioridad}</span>
        <span class="sla-status-pill ${getSlaStatusClass(item.estadoSla)}">${item.estadoSla}</span>
        <span>${formatRemainingHours(item.horasRestantes)}</span>

        <div class="sla-progress-mini">
          <span style="width: ${Math.min(Number(item.avance), 100)}%"></span>
        </div>

        <div class="sla-actions">
          <button class="view-sla-detail" data-code="${item.codigoCaso}">
            Ver
          </button>
          <a href="asignar-casos.html">Reasignar</a>
        </div>
      `;

      slaRows.appendChild(row);
    });

    emptySla.classList.toggle("hidden", filtered.length > 0);
    attachSlaEvents();
  }

  function getFilteredSlaCases() {
    const search = slaSearch.value.trim().toLowerCase();
    const status = filterSlaStatus.value;
    const priority = filterSlaPriority.value;
    const advisor = filterSlaAdvisor.value;
    const service = filterSlaService.value;

    return slaCases.filter((item) => {
      const matchesSearch =
        !search ||
        item.codigoCaso.toLowerCase().includes(search) ||
        item.asesor.toLowerCase().includes(search) ||
        item.servicio.toLowerCase().includes(search) ||
        item.categoria.toLowerCase().includes(search);

      const matchesStatus = status === "all" || item.estadoSla === status;
      const matchesPriority = priority === "all" || item.prioridad === priority;
      const matchesAdvisor = advisor === "all" || item.asesor === advisor;
      const matchesService = service === "all" || item.servicio === service;

      return matchesSearch && matchesStatus && matchesPriority && matchesAdvisor && matchesService;
    });
  }

  function attachSlaEvents() {
    document.querySelectorAll(".view-sla-detail").forEach((button) => {
      button.addEventListener("click", () => {
        const code = button.dataset.code;
        const selected = slaCases.find((item) => item.codigoCaso === code);

        if (selected) {
          openSlaDetail(selected);
        }
      });
    });
  }

  function openSlaDetail(item) {
    slaDetailTitle.textContent = `Detalle SLA ${item.codigoCaso}`;
    slaDetailSubtitle.textContent = `${item.tipo} · ${item.servicio}`;

    const rows = [
      ["Código", item.codigoCaso],
      ["Asesor", item.asesor],
      ["Tipo", item.tipo],
      ["Servicio", item.servicio],
      ["Categoría", item.categoria],
      ["Prioridad", item.prioridad],
      ["Estado SLA", item.estadoSla],
      ["Tiempo restante", formatRemainingHours(item.horasRestantes)],
      ["Avance del SLA", `${item.avance}%`],
      ["Acción sugerida", item.accionSugerida],
      ["Recomendación IA", getSlaSuggestion(item)]
    ];

    slaDetailContent.innerHTML = rows
      .map(
        ([label, value]) => `
          <div class="preview-row">
            <strong>${label}</strong>
            <span>${value}</span>
          </div>
        `
      )
      .join("");

    slaDetailModal.classList.add("active");
  }

  function getSlaSuggestion(item) {
    if (item.estadoSla === "Vencido") {
      return "Revisar causa del vencimiento, escalar el caso y evaluar reasignación inmediata.";
    }

    if (item.estadoSla === "En riesgo") {
      return "Priorizar atención, solicitar avance al asesor y evitar que el caso venza.";
    }

    return "Mantener seguimiento normal y verificar actualizaciones periódicas.";
  }

  function updateSlaMetrics() {
    const ok = slaCases.filter((item) => item.estadoSla === "Dentro de SLA").length;
    const risk = slaCases.filter((item) => item.estadoSla === "En riesgo").length;
    const expired = slaCases.filter((item) => item.estadoSla === "Vencido").length;
    const total = slaCases.length;

    const compliance = total > 0 ? Math.round((ok / total) * 100) : 0;

    metricSlaOk.textContent = ok;
    metricSlaRisk.textContent = risk;
    metricSlaExpired.textContent = expired;
    metricSlaCompliance.textContent = `${compliance}%`;
    sidebarSlaRiskCount.textContent = risk + expired;
  }

  function renderAdvisorRisk() {
    const grouped = {};

    slaCases.forEach((item) => {
      if (!grouped[item.asesor]) {
        grouped[item.asesor] = {
          total: 0,
          risk: 0,
          expired: 0
        };
      }

      grouped[item.asesor].total++;

      if (item.estadoSla === "En riesgo") grouped[item.asesor].risk++;
      if (item.estadoSla === "Vencido") grouped[item.asesor].expired++;
    });

    slaAdvisorRisk.innerHTML = Object.entries(grouped)
      .map(
        ([advisor, data]) => `
          <div class="sla-advisor-risk-item">
            <strong>${advisor}</strong>
            <span>${data.total} casos · ${data.risk} en riesgo · ${data.expired} vencidos</span>
          </div>
        `
      )
      .join("");
  }

  function formatRemainingHours(hours) {
    const value = Number(hours);

    if (value < 0) {
      return `Vencido hace ${Math.abs(value)} h`;
    }

    return `${value} h`;
  }

  function getSlaStatusScore(status) {
    const scores = {
      "Dentro de SLA": 1,
      "En riesgo": 2,
      "Vencido": 3
    };

    return scores[status] || 1;
  }

  function getPriorityScore(priority) {
    const scores = {
      "Crítica": 4,
      "Alta": 3,
      "Media": 2,
      "Baja": 1
    };

    return scores[priority] || 1;
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

  function getSlaStatusClass(status) {
    const classes = {
      "Dentro de SLA": "sla-status-ok",
      "En riesgo": "sla-status-risk",
      "Vencido": "sla-status-expired"
    };

    return classes[status] || "sla-status-ok";
  }

  [
    slaSearch,
    filterSlaStatus,
    filterSlaPriority,
    filterSlaAdvisor,
    filterSlaService
  ].forEach((field) => {
    field.addEventListener("input", renderSlaRows);
    field.addEventListener("change", renderSlaRows);
  });

  clearSlaFilters.addEventListener("click", () => {
    slaSearch.value = "";
    filterSlaStatus.value = "all";
    filterSlaPriority.value = "all";
    filterSlaAdvisor.value = "all";
    filterSlaService.value = "all";

    tabButtons.forEach((button) => button.classList.remove("active"));
    tabButtons[0].classList.add("active");

    renderSlaRows();
    showSlaToast("Filtros limpiados.");
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const tab = button.dataset.tab;

      filterSlaStatus.value = "all";
      filterSlaPriority.value = "all";

      if (tab === "Crítica") {
        filterSlaPriority.value = "Crítica";
      } else if (tab !== "all") {
        filterSlaStatus.value = tab;
      }

      renderSlaRows();
    });
  });

  refreshSla.addEventListener("click", () => {
    initSlaMonitoring();
    showSlaToast("Monitoreo SLA actualizado.");
  });

  exportSlaReport.addEventListener("click", () => {
    showSlaToast("Reporte SLA exportado de forma simulada.");
  });

  showCriticalSla.addEventListener("click", () => {
    filterSlaStatus.value = "En riesgo";
    renderSlaRows();
    showSlaToast("Mostrando casos en riesgo.");
  });

  prioritizeSlaAi.addEventListener("click", () => {
    prioritizeSlaCases();
    renderSlaRows();
    showSlaToast("Casos priorizados por riesgo SLA.");
  });

  generateSlaPlan.addEventListener("click", () => {
    slaAiTip.textContent =
      "Plan IA: atender primero casos vencidos, luego críticos en riesgo y finalmente casos con mayor avance de SLA.";

    showSlaToast("Plan IA generado.");
  });

  generateSlaSummary.addEventListener("click", () => {
    const expired = slaCases.filter((item) => item.estadoSla === "Vencido").length;
    const risk = slaCases.filter((item) => item.estadoSla === "En riesgo").length;

    slaSummaryBox.innerHTML = `
      <strong>Análisis generado:</strong><br>
      Se identificaron ${expired} caso(s) vencidos y ${risk} caso(s) en riesgo.
      Se recomienda reasignar casos vencidos y priorizar incidencias críticas.
    `;

    showSlaToast("Análisis SLA generado.");
  });

  closeSlaDetail.addEventListener("click", () => {
    slaDetailModal.classList.remove("active");
  });

  slaDetailModal.addEventListener("click", (event) => {
    if (event.target === slaDetailModal) {
      slaDetailModal.classList.remove("active");
    }
  });

  function toggleSlaBot() {
    slaBot.classList.toggle("active");
  }

  openSlaBot.addEventListener("click", toggleSlaBot);
  openSlaHelp.addEventListener("click", toggleSlaBot);

  closeSlaBot.addEventListener("click", () => {
    slaBot.classList.remove("active");
  });

  function showSlaToast(message, type = "success") {
    const existingToast = document.querySelector(".sla-toast");

    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "sla-toast";
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

  initSlaMonitoring();
});