document.addEventListener("DOMContentLoaded", () => {
  const advisorCaseList = document.getElementById("advisorCaseList");

  const metricAssigned = document.getElementById("metricAssigned");
  const metricUrgent = document.getElementById("metricUrgent");
  const metricRisk = document.getElementById("metricRisk");
  const metricResolvedToday = document.getElementById("metricResolvedToday");
  const sidebarCasesCount = document.getElementById("sidebarCasesCount");

  const refreshAdvisorCases = document.getElementById("refreshAdvisorCases");
  const generateWorkPlan = document.getElementById("generateWorkPlan");
  const advisorAiTip = document.getElementById("advisorAiTip");
  const generateAlertsSummary = document.getElementById("generateAlertsSummary");

  const advisorBot = document.getElementById("advisorBot");
  const openAdvisorBot = document.getElementById("openAdvisorBot");
  const openAdvisorHelp = document.getElementById("openAdvisorHelp");
  const openAdvisorAssistant = document.getElementById("openAdvisorAssistant");
  const closeAdvisorBot = document.getElementById("closeAdvisorBot");

  let advisorCases = [];

  const fallbackCases = [
    {
      codigoCaso: "CL-IN-000099",
      tipo: "Incidencia",
      cliente: "Cliente Claro",
      servicio: "Telefonía móvil",
      categoria: "Sin servicio",
      prioridad: "Crítica",
      estado: "Pendiente cliente",
      slaRestante: 4,
      resumen: "El cliente reporta ausencia de señal móvil y requiere revisión urgente."
    },
    {
      codigoCaso: "CL-RC-000123",
      tipo: "Reclamo",
      cliente: "Cliente Claro",
      servicio: "Internet hogar",
      categoria: "Facturación",
      prioridad: "Alta",
      estado: "En atención",
      slaRestante: 18,
      resumen: "El cliente observa un monto mayor al esperado en su recibo mensual."
    },
    {
      codigoCaso: "CL-RC-000088",
      tipo: "Reclamo",
      cliente: "Cliente Claro",
      servicio: "Claro TV+",
      categoria: "Atención recibida",
      prioridad: "Media",
      estado: "Escalado",
      slaRestante: 10,
      resumen: "Caso escalado por disconformidad con la atención previa recibida."
    },
    {
      codigoCaso: "CL-IN-000074",
      tipo: "Incidencia",
      cliente: "Cliente Claro",
      servicio: "Internet hogar",
      categoria: "Intermitencia",
      prioridad: "Alta",
      estado: "En atención",
      slaRestante: 7,
      resumen: "Falla intermitente del servicio de internet hogar en horarios específicos."
    }
  ];

  async function initAdvisorDashboard() {
    try {
      const usuario = typeof getUsuarioActual === "function" ? getUsuarioActual() : null;
      const asesorId = usuario?.id || 1;

      if (typeof getCasosByAsesor !== "function") {
        throw new Error("api.js no disponible.");
      }

      const response = await getCasosByAsesor(asesorId);

      advisorCases = response.casos || response.data || [];
    } catch (error) {
      console.warn("Usando casos simulados para asesor:", error.message);
      advisorCases = fallbackCases;
    }

    renderAdvisorCases();
    updateAdvisorMetrics();
  }

  function renderAdvisorCases() {
    advisorCaseList.innerHTML = "";

    const orderedCases = [...advisorCases].sort((a, b) => {
      return getPriorityScore(b.prioridad) - getPriorityScore(a.prioridad) || a.slaRestante - b.slaRestante;
    });

    orderedCases.slice(0, 5).forEach((item) => {
      const element = document.createElement("article");
      element.className = "advisor-case-item";

      element.innerHTML = `
        <div class="advisor-case-icon">
          <i class="${item.tipo === "Reclamo" ? "fa-solid fa-file-lines" : "fa-solid fa-triangle-exclamation"}"></i>
        </div>

        <div class="advisor-case-content">
          <h3>${item.codigoCaso} · ${item.tipo}</h3>
          <p>${item.resumen}</p>

          <div class="advisor-case-meta">
            <span>${item.servicio}</span>
            <span>${item.categoria}</span>
            <span>${item.prioridad}</span>
            <span>${item.estado}</span>
            <span>SLA: ${item.slaRestante} h</span>
          </div>
        </div>

        <div class="advisor-case-actions">
          <a href="detalle-atencion.html">Atender</a>
          <button data-code="${item.codigoCaso}" class="advisor-summary-btn">Resumen IA</button>
        </div>
      `;

      advisorCaseList.appendChild(element);
    });

    attachAdvisorCaseEvents();
  }

  function attachAdvisorCaseEvents() {
    document.querySelectorAll(".advisor-summary-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const code = button.dataset.code;
        const selectedCase = advisorCases.find((item) => item.codigoCaso === code);

        if (!selectedCase) return;

        advisorAiTip.textContent = `Caso ${selectedCase.codigoCaso}: ${selectedCase.resumen}`;
        showAdvisorToast("Resumen IA del caso generado.");
      });
    });
  }

  function updateAdvisorMetrics() {
    const assigned = advisorCases.length;
    const urgent = advisorCases.filter((item) => item.prioridad === "Crítica" || item.prioridad === "Alta").length;
    const risk = advisorCases.filter((item) => Number(item.slaRestante) <= 8).length;
    const resolvedToday = 5;

    metricAssigned.textContent = assigned;
    metricUrgent.textContent = urgent;
    metricRisk.textContent = risk;
    metricResolvedToday.textContent = resolvedToday;
    sidebarCasesCount.textContent = assigned;
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

  if (refreshAdvisorCases) {
    refreshAdvisorCases.addEventListener("click", () => {
      initAdvisorDashboard();
      showAdvisorToast("Casos actualizados.");
    });
  }

  if (generateWorkPlan) {
    generateWorkPlan.addEventListener("click", () => {
      advisorAiTip.textContent =
        "Plan sugerido: atender primero casos críticos con SLA menor a 6 horas, luego casos en riesgo y finalmente casos pendientes por información.";

      showAdvisorToast("Plan de trabajo generado con IA.");
    });
  }

  if (generateAlertsSummary) {
    generateAlertsSummary.addEventListener("click", () => {
      showAdvisorToast("Resumen IA: prioriza los casos críticos y pendientes por cliente.");
    });
  }

  function toggleAdvisorBot() {
    advisorBot.classList.toggle("active");
  }

  if (openAdvisorBot) {
    openAdvisorBot.addEventListener("click", toggleAdvisorBot);
  }

  if (openAdvisorHelp) {
    openAdvisorHelp.addEventListener("click", toggleAdvisorBot);
  }

  if (openAdvisorAssistant) {
    openAdvisorAssistant.addEventListener("click", toggleAdvisorBot);
  }

  if (closeAdvisorBot) {
    closeAdvisorBot.addEventListener("click", () => {
      advisorBot.classList.remove("active");
    });
  }

  function showAdvisorToast(message, type = "success") {
    const existingToast = document.querySelector(".advisor-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "advisor-toast";
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

  initAdvisorDashboard();
});