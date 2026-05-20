document.addEventListener("DOMContentLoaded", () => {
  const performanceRows = document.getElementById("performanceRows");
  const emptyPerformance = document.getElementById("emptyPerformance");

  const performanceSearch = document.getElementById("performanceSearch");
  const filterSpecialty = document.getElementById("filterSpecialty");
  const filterLoad = document.getElementById("filterLoad");
  const filterSlaPerformance = document.getElementById("filterSlaPerformance");
  const filterAdvisorRating = document.getElementById("filterAdvisorRating");

  const metricActiveAdvisors = document.getElementById("metricActiveAdvisors");
  const metricAvgLoad = document.getElementById("metricAvgLoad");
  const metricTeamSla = document.getElementById("metricTeamSla");
  const metricTeamRating = document.getElementById("metricTeamRating");

  const performanceAiTip = document.getElementById("performanceAiTip");
  const performanceSummaryBox = document.getElementById("performanceSummaryBox");
  const loadBalanceList = document.getElementById("loadBalanceList");

  const refreshPerformance = document.getElementById("refreshPerformance");
  const exportPerformance = document.getElementById("exportPerformance");
  const clearPerformanceFilters = document.getElementById("clearPerformanceFilters");
  const showHighLoad = document.getElementById("showHighLoad");
  const generatePerformancePlan = document.getElementById("generatePerformancePlan");
  const prioritizePerformanceAi = document.getElementById("prioritizePerformanceAi");
  const generatePerformanceSummary = document.getElementById("generatePerformanceSummary");

  const advisorDetailModal = document.getElementById("advisorDetailModal");
  const closeAdvisorDetail = document.getElementById("closeAdvisorDetail");
  const advisorDetailTitle = document.getElementById("advisorDetailTitle");
  const advisorDetailSubtitle = document.getElementById("advisorDetailSubtitle");
  const advisorDetailContent = document.getElementById("advisorDetailContent");

  const performanceBot = document.getElementById("performanceBot");
  const openPerformanceBot = document.getElementById("openPerformanceBot");
  const openPerformanceHelp = document.getElementById("openPerformanceHelp");
  const closePerformanceBot = document.getElementById("closePerformanceBot");

  let advisors = [];

  const fallbackAdvisors = [
    {
      id: 1,
      nombre: "Asesor Técnico Hogar",
      especialidad: "Internet hogar",
      carga: 11,
      resueltos: 18,
      cumplimientoSla: 82,
      tiempoPromedio: "49 min",
      satisfaccion: 4.1,
      nivel: "Sobrecarga",
      recomendacion: "Redistribuir casos de baja prioridad y mantener solo incidencias críticas."
    },
    {
      id: 2,
      nombre: "Asesor Móvil",
      especialidad: "Telefonía móvil",
      carga: 7,
      resueltos: 22,
      cumplimientoSla: 94,
      tiempoPromedio: "34 min",
      satisfaccion: 4.6,
      nivel: "Estable",
      recomendacion: "Puede recibir casos móviles de prioridad alta."
    },
    {
      id: 3,
      nombre: "Asesor Facturación",
      especialidad: "Facturación",
      carga: 5,
      resueltos: 20,
      cumplimientoSla: 97,
      tiempoPromedio: "31 min",
      satisfaccion: 4.8,
      nivel: "Alto desempeño",
      recomendacion: "Buen candidato para reclamos de facturación críticos."
    },
    {
      id: 4,
      nombre: "Asesor Comercial",
      especialidad: "Atención comercial",
      carga: 9,
      resueltos: 14,
      cumplimientoSla: 86,
      tiempoPromedio: "42 min",
      satisfaccion: 4.2,
      nivel: "Carga media",
      recomendacion: "Mantener carga controlada y revisar tiempos de atención."
    },
    {
      id: 5,
      nombre: "Asesor Backoffice",
      especialidad: "Facturación",
      carga: 6,
      resueltos: 16,
      cumplimientoSla: 90,
      tiempoPromedio: "38 min",
      satisfaccion: 4.4,
      nivel: "Estable",
      recomendacion: "Puede apoyar en reclamos de cobro no reconocido."
    },
    {
      id: 6,
      nombre: "Asesor Soporte TV",
      especialidad: "Internet hogar",
      carga: 4,
      resueltos: 12,
      cumplimientoSla: 96,
      tiempoPromedio: "29 min",
      satisfaccion: 4.7,
      nivel: "Disponible",
      recomendacion: "Puede recibir más casos técnicos de hogar o TV."
    }
  ];

  async function initPerformance() {
    try {
      /*
        Backend futuro sugerido:
        GET /api/supervisor/desempeno-asesores

        Por ahora intentamos usar reportes generales si existen.
      */
      if (typeof getReporteCasos === "function") {
        const response = await getReporteCasos({ tipo: "desempeno_asesores" });
        advisors = response.asesores || response.data || [];
      }

      if (!advisors.length) {
        throw new Error("Sin desempeño desde backend.");
      }
    } catch (error) {
      console.warn("Usando desempeño simulado:", error.message);
      advisors = fallbackAdvisors;
    }

    renderPerformanceRows();
    updatePerformanceMetrics();
    renderLoadBalance();
  }

  function renderPerformanceRows() {
    const filtered = getFilteredAdvisors();

    performanceRows.innerHTML = "";

    filtered.forEach((advisor) => {
      const row = document.createElement("div");
      row.className = "performance-row";

      row.innerHTML = `
        <span class="case-code">${advisor.nombre}</span>
        <span>${advisor.especialidad}</span>
        <span class="advisor-load ${getLoadClass(advisor.carga)}">Carga: ${advisor.carga}</span>
        <span>${advisor.resueltos}</span>
        <span class="performance-pill ${getSlaClass(advisor.cumplimientoSla)}">${advisor.cumplimientoSla}%</span>
        <span>${advisor.tiempoPromedio}</span>
        <span class="rating-pill">
          <i class="fa-solid fa-star"></i> ${advisor.satisfaccion}
        </span>

        <div class="performance-actions">
          <button class="view-advisor-detail" data-id="${advisor.id}">
            Ver
          </button>
          <a href="asignar-casos.html">Asignar</a>
        </div>
      `;

      performanceRows.appendChild(row);
    });

    emptyPerformance.classList.toggle("hidden", filtered.length > 0);
    attachAdvisorEvents();
  }

  function getFilteredAdvisors() {
    const search = performanceSearch.value.trim().toLowerCase();
    const specialty = filterSpecialty.value;
    const load = filterLoad.value;
    const sla = filterSlaPerformance.value;
    const rating = filterAdvisorRating.value;

    return advisors.filter((advisor) => {
      const matchesSearch =
        !search ||
        advisor.nombre.toLowerCase().includes(search) ||
        advisor.especialidad.toLowerCase().includes(search) ||
        advisor.nivel.toLowerCase().includes(search);

      const matchesSpecialty = specialty === "all" || advisor.especialidad === specialty;

      const matchesLoad =
        load === "all" ||
        (load === "low" && advisor.carga <= 5) ||
        (load === "medium" && advisor.carga > 5 && advisor.carga <= 9) ||
        (load === "high" && advisor.carga > 9);

      const matchesSla =
        sla === "all" ||
        (sla === "excellent" && advisor.cumplimientoSla >= 95) ||
        (sla === "good" && advisor.cumplimientoSla >= 85 && advisor.cumplimientoSla < 95) ||
        (sla === "risk" && advisor.cumplimientoSla < 85);

      const matchesRating =
        rating === "all" ||
        (rating === "high" && advisor.satisfaccion >= 4.5) ||
        (rating === "medium" && advisor.satisfaccion >= 4.0 && advisor.satisfaccion < 4.5) ||
        (rating === "low" && advisor.satisfaccion < 4.0);

      return matchesSearch && matchesSpecialty && matchesLoad && matchesSla && matchesRating;
    });
  }

  function attachAdvisorEvents() {
    document.querySelectorAll(".view-advisor-detail").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const advisor = advisors.find((item) => item.id === id);

        if (advisor) {
          openAdvisorDetail(advisor);
        }
      });
    });
  }

  function openAdvisorDetail(advisor) {
    advisorDetailTitle.textContent = advisor.nombre;
    advisorDetailSubtitle.textContent = `Especialidad: ${advisor.especialidad}`;

    const rows = [
      ["Especialidad", advisor.especialidad],
      ["Carga actual", advisor.carga],
      ["Casos resueltos", advisor.resueltos],
      ["Cumplimiento SLA", `${advisor.cumplimientoSla}%`],
      ["Tiempo promedio", advisor.tiempoPromedio],
      ["Satisfacción", `${advisor.satisfaccion}/5`],
      ["Nivel operativo", advisor.nivel],
      ["Recomendación IA", advisor.recomendacion]
    ];

    advisorDetailContent.innerHTML = rows
      .map(
        ([label, value]) => `
          <div class="preview-row">
            <strong>${label}</strong>
            <span>${value}</span>
          </div>
        `
      )
      .join("");

    advisorDetailModal.classList.add("active");
  }

  function updatePerformanceMetrics() {
    const total = advisors.length;
    const avgLoad = total > 0
      ? Math.round(advisors.reduce((sum, item) => sum + item.carga, 0) / total)
      : 0;

    const avgSla = total > 0
      ? Math.round(advisors.reduce((sum, item) => sum + item.cumplimientoSla, 0) / total)
      : 0;

    const avgRating = total > 0
      ? (advisors.reduce((sum, item) => sum + item.satisfaccion, 0) / total).toFixed(1)
      : "0.0";

    metricActiveAdvisors.textContent = total;
    metricAvgLoad.textContent = avgLoad;
    metricTeamSla.textContent = `${avgSla}%`;
    metricTeamRating.textContent = avgRating;

    const highLoad = advisors.filter((item) => item.carga > 9).length;
    const lowSla = advisors.filter((item) => item.cumplimientoSla < 85).length;

    performanceAiTip.textContent =
      `Hay ${highLoad} asesor(es) con carga alta y ${lowSla} asesor(es) con SLA menor al 85%.`;
  }

  function renderLoadBalance() {
    loadBalanceList.innerHTML = advisors
      .map(
        (advisor) => `
          <div class="load-balance-item">
            <strong>${advisor.nombre}</strong>
            <span>Carga ${advisor.carga} · SLA ${advisor.cumplimientoSla}% · ${advisor.nivel}</span>
          </div>
        `
      )
      .join("");
  }

  function getLoadClass(load) {
    if (load <= 5) return "load-low";
    if (load <= 9) return "load-medium";
    return "load-high";
  }

  function getSlaClass(value) {
    if (value >= 95) return "performance-good";
    if (value >= 85) return "performance-medium";
    return "performance-risk";
  }

  [performanceSearch, filterSpecialty, filterLoad, filterSlaPerformance, filterAdvisorRating].forEach((field) => {
    field.addEventListener("input", renderPerformanceRows);
    field.addEventListener("change", renderPerformanceRows);
  });

  clearPerformanceFilters.addEventListener("click", () => {
    performanceSearch.value = "";
    filterSpecialty.value = "all";
    filterLoad.value = "all";
    filterSlaPerformance.value = "all";
    filterAdvisorRating.value = "all";

    renderPerformanceRows();
    showPerformanceToast("Filtros limpiados.");
  });

  showHighLoad.addEventListener("click", () => {
    filterLoad.value = "high";
    renderPerformanceRows();
    showPerformanceToast("Mostrando asesores con sobrecarga.");
  });

  refreshPerformance.addEventListener("click", () => {
    initPerformance();
    showPerformanceToast("Desempeño actualizado.");
  });

  exportPerformance.addEventListener("click", () => {
    showPerformanceToast("Reporte de desempeño exportado de forma simulada.");
  });

  prioritizePerformanceAi.addEventListener("click", () => {
    advisors.sort((a, b) => b.carga - a.carga || a.cumplimientoSla - b.cumplimientoSla);
    renderPerformanceRows();
    showPerformanceToast("Análisis IA aplicado.");
  });

  generatePerformancePlan.addEventListener("click", () => {
    performanceAiTip.textContent =
      "Plan IA: redistribuir casos del asesor con carga alta, asignar casos críticos a asesores con SLA mayor al 95% y revisar asesores con baja satisfacción.";

    showPerformanceToast("Plan IA generado.");
  });

  generatePerformanceSummary.addEventListener("click", () => {
    const highLoad = advisors.filter((item) => item.carga > 9).length;
    const lowSla = advisors.filter((item) => item.cumplimientoSla < 85).length;
    const excellent = advisors.filter((item) => item.cumplimientoSla >= 95).length;

    performanceSummaryBox.innerHTML = `
      <strong>Análisis generado:</strong><br>
      Se identificaron ${highLoad} asesor(es) con sobrecarga, ${lowSla} asesor(es) con SLA en riesgo
      y ${excellent} asesor(es) con alto desempeño. Se recomienda balancear la carga operativa.
    `;

    showPerformanceToast("Análisis de desempeño generado.");
  });

  closeAdvisorDetail.addEventListener("click", () => {
    advisorDetailModal.classList.remove("active");
  });

  advisorDetailModal.addEventListener("click", (event) => {
    if (event.target === advisorDetailModal) {
      advisorDetailModal.classList.remove("active");
    }
  });

  function togglePerformanceBot() {
    performanceBot.classList.toggle("active");
  }

  openPerformanceBot.addEventListener("click", togglePerformanceBot);
  openPerformanceHelp.addEventListener("click", togglePerformanceBot);

  closePerformanceBot.addEventListener("click", () => {
    performanceBot.classList.remove("active");
  });

  function showPerformanceToast(message, type = "success") {
    const existingToast = document.querySelector(".performance-toast");

    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "performance-toast";
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

  initPerformance();
});