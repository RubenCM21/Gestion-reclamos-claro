document.addEventListener("DOMContentLoaded", () => {
  const supervisorCaseList = document.getElementById("supervisorCaseList");

  const metricPendingClassify = document.getElementById("metricPendingClassify");
  const metricCriticalCases = document.getElementById("metricCriticalCases");
  const metricSlaRisk = document.getElementById("metricSlaRisk");
  const metricAssignedToday = document.getElementById("metricAssignedToday");
  const sidebarPendingCount = document.getElementById("sidebarPendingCount");

  const supervisorAiTip = document.getElementById("supervisorAiTip");
  const refreshSupervisorCases = document.getElementById("refreshSupervisorCases");
  const generateSupervisorPlan = document.getElementById("generateSupervisorPlan");
  const generateSupervisorAlerts = document.getElementById("generateSupervisorAlerts");

  const supervisorBot = document.getElementById("supervisorBot");
  const openSupervisorBot = document.getElementById("openSupervisorBot");
  const openSupervisorHelp = document.getElementById("openSupervisorHelp");
  const openSupervisorAssistant = document.getElementById("openSupervisorAssistant");
  const closeSupervisorBot = document.getElementById("closeSupervisorBot");

  let supervisorCases = [];

  const fallbackCases = [
    {
      codigoCaso: "CL-IN-000140",
      tipo: "Incidencia",
      servicio: "Internet hogar",
      categoria: "Sin servicio",
      prioridad: "Crítica",
      estado: "Registrado",
      slaRestante: 5,
      resumen: "Caso nuevo sin clasificar por caída total del servicio de internet hogar."
    },
    {
      codigoCaso: "CL-RC-000137",
      tipo: "Reclamo",
      servicio: "Telefonía móvil",
      categoria: "Facturación",
      prioridad: "Alta",
      estado: "Registrado",
      slaRestante: 10,
      resumen: "Reclamo por cobro no reconocido pendiente de clasificación."
    },
    {
      codigoCaso: "CL-IN-000133",
      tipo: "Incidencia",
      servicio: "Claro TV+",
      categoria: "Corte de señal",
      prioridad: "Alta",
      estado: "Registrado",
      slaRestante: 8,
      resumen: "Incidencia reportada con evidencia visual pendiente de asignación."
    },
    {
      codigoCaso: "CL-RC-000128",
      tipo: "Reclamo",
      servicio: "Internet hogar",
      categoria: "Contrato o plan",
      prioridad: "Media",
      estado: "Registrado",
      slaRestante: 24,
      resumen: "Cliente solicita revisión de condiciones del plan contratado."
    }
  ];

  async function initSupervisorDashboard() {
    try {
      if (typeof getCasosPendientesClasificacion !== "function") {
        throw new Error("api.js no disponible.");
      }

      const response = await getCasosPendientesClasificacion();
      supervisorCases = response.casos || response.data || [];

      if (supervisorCases.length === 0) {
        throw new Error("Sin casos pendientes en backend.");
      }
    } catch (error) {
      console.warn("Usando casos simulados para supervisor:", error.message);
      supervisorCases = fallbackCases;
    }

    prioritizeSupervisorCases();
    renderSupervisorCases();
    updateSupervisorMetrics();
  }

  function prioritizeSupervisorCases() {
    supervisorCases.sort((a, b) => {
      const priorityDiff = getPriorityScore(b.prioridad) - getPriorityScore(a.prioridad);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return Number(a.slaRestante) - Number(b.slaRestante);
    });

    const first = supervisorCases[0];

    if (first) {
      supervisorAiTip.textContent =
        `Prioriza ${first.codigoCaso}: ${first.prioridad}, SLA restante ${first.slaRestante} horas.`;
    }
  }

  function renderSupervisorCases() {
    supervisorCaseList.innerHTML = "";

    supervisorCases.slice(0, 5).forEach((item) => {
      const element = document.createElement("article");
      element.className = "supervisor-case-item";

      element.innerHTML = `
        <div class="supervisor-case-icon">
          <i class="${item.tipo === "Reclamo" ? "fa-solid fa-file-lines" : "fa-solid fa-triangle-exclamation"}"></i>
        </div>

        <div class="supervisor-case-content">
          <h3>${item.codigoCaso} · ${item.tipo}</h3>
          <p>${item.resumen}</p>

          <div class="supervisor-case-meta">
            <span>${item.servicio}</span>
            <span>${item.categoria}</span>
            <span>${item.prioridad}</span>
            <span>${item.estado}</span>
            <span>SLA: ${item.slaRestante} h</span>
          </div>
        </div>

        <div class="supervisor-case-actions">
          <a href="clasificar-casos.html">Clasificar</a>
          <a href="asignar-casos.html">Asignar</a>
          <button data-code="${item.codigoCaso}" class="supervisor-summary-btn">
            IA
          </button>
        </div>
      `;

      supervisorCaseList.appendChild(element);
    });

    attachSupervisorEvents();
  }

  function attachSupervisorEvents() {
    document.querySelectorAll(".supervisor-summary-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const code = button.dataset.code;
        const selected = supervisorCases.find((item) => item.codigoCaso === code);

        if (!selected) return;

        supervisorAiTip.textContent =
          `Caso ${selected.codigoCaso}: se recomienda clasificar como ${selected.prioridad} y asignar a un asesor especializado en ${selected.servicio}.`;

        showSupervisorToast("Recomendación IA generada.");
      });
    });
  }

  function updateSupervisorMetrics() {
    const pending = supervisorCases.length;
    const critical = supervisorCases.filter((item) => item.prioridad === "Crítica" || item.prioridad === "Alta").length;
    const slaRisk = supervisorCases.filter((item) => Number(item.slaRestante) <= 12).length;

    metricPendingClassify.textContent = pending;
    metricCriticalCases.textContent = critical;
    metricSlaRisk.textContent = slaRisk;
    metricAssignedToday.textContent = 15;
    sidebarPendingCount.textContent = pending;
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

  refreshSupervisorCases.addEventListener("click", () => {
    initSupervisorDashboard();
    showSupervisorToast("Casos del supervisor actualizados.");
  });

  generateSupervisorPlan.addEventListener("click", () => {
    supervisorAiTip.textContent =
      "Plan sugerido: clasificar primero casos críticos con SLA menor a 6 horas, luego asignar casos técnicos a asesores especializados y revisar cargas altas.";

    showSupervisorToast("Plan IA generado.");
  });

  generateSupervisorAlerts.addEventListener("click", () => {
    showSupervisorToast("Resumen IA: prioriza SLA crítico y redistribuye carga en asesores saturados.");
  });

  function toggleSupervisorBot() {
    supervisorBot.classList.toggle("active");
  }

  openSupervisorBot.addEventListener("click", toggleSupervisorBot);
  openSupervisorHelp.addEventListener("click", toggleSupervisorBot);
  openSupervisorAssistant.addEventListener("click", toggleSupervisorBot);

  closeSupervisorBot.addEventListener("click", () => {
    supervisorBot.classList.remove("active");
  });

  function showSupervisorToast(message, type = "success") {
    const existingToast = document.querySelector(".supervisor-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "supervisor-toast";
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

  initSupervisorDashboard();
});