"use strict";

/* =========================================================
   ESTADO GLOBAL
========================================================= */

const SupervisorState = {
  theme: localStorage.getItem("claro360-theme") || "light",
  dashboardData: null,
  currentSearch: ""
};

/* =========================================================
   MOCK DATA - ELIMINAR CUANDO SE CONECTE AL BACKEND
========================================================= */

const MockSupervisorDashboard = {
  supervisor: {
    id: 1,
    nombre: "Supervisor Demo",
    iniciales: "SD",
    rol: "Supervisor de Atención",
    turno: "Turno mañana",
    estado: "Supervisión activa",
    ultimoAcceso: "Último acceso: hoy 08:00"
  },

  indicadores: [
    {
      icono: "🏷️",
      valor: 9,
      titulo: "Sin clasificar",
      descripcion: "Casos pendientes de revisión"
    },
    {
      icono: "👥",
      valor: 17,
      titulo: "Asignados",
      descripcion: "En bandejas de asesores"
    },
    {
      icono: "⏱️",
      valor: 5,
      titulo: "Riesgo SLA",
      descripcion: "Requieren acción inmediata"
    },
    {
      icono: "✅",
      valor: 22,
      titulo: "Cerrados hoy",
      descripcion: "Casos completados"
    }
  ],

  casosCriticos: [
    {
      id: 801,
      codigo: "CAS-2026-000245",
      icono: "⚠️",
      tipo: "Incidencia",
      cliente: "Cliente Empresa Demo",
      titulo: "Correo corporativo no disponible",
      descripcion: "Servicio empresarial con afectación operativa y SLA crítico.",
      servicio: "Correo empresa",
      estado: "Sin clasificar",
      estadoTipo: "danger",
      prioridad: "Crítica",
      sla: "01h 20m",
      canal: "Portal empresas"
    },
    {
      id: 802,
      codigo: "CAS-2026-000300",
      icono: "📡",
      tipo: "Incidencia",
      cliente: "Cliente Empresa Demo",
      titulo: "Enlace dedicado con intermitencia",
      descripcion: "Servicio B2B con impacto en conectividad de oficina principal.",
      servicio: "Fibra empresarial",
      estado: "Pendiente asignación",
      estadoTipo: "warning",
      prioridad: "Alta",
      sla: "03h 10m",
      canal: "Mesa empresas"
    }
  ],

  resumenIA: [
    {
      titulo: "Foco operativo",
      texto: "La prioridad debe estar en los casos empresariales con SLA menor a 4 horas."
    },
    {
      titulo: "Carga de asesores",
      texto: "Hay asesores con carga alta; conviene asignar nuevos casos a perfiles con menor saturación."
    },
    {
      titulo: "Riesgo de atraso",
      texto: "Los casos sin clasificar deben revisarse antes de ingresar a la cola operativa."
    }
  ],

  cargaAsesores: [
    {
      nombre: "Asesor Demo 1",
      equipo: "Empresas",
      casos: 7,
      carga: 80,
      estado: "Alta carga"
    },
    {
      nombre: "Asesor Demo 2",
      equipo: "Técnico Hogar",
      casos: 4,
      carga: 52,
      estado: "Disponible"
    },
    {
      nombre: "Asesor Demo 3",
      equipo: "Facturación",
      casos: 5,
      carga: 60,
      estado: "Media carga"
    }
  ],

  alertasSla: [
    {
      codigo: "CAS-2026-000245",
      titulo: "Correo corporativo no disponible",
      riesgo: "Crítico",
      restante: "01h 20m",
      porcentaje: 88,
      color: "var(--danger)"
    },
    {
      codigo: "CAS-2026-000300",
      titulo: "Enlace dedicado con intermitencia",
      riesgo: "Alto",
      restante: "03h 10m",
      porcentaje: 72,
      color: "var(--warning)"
    },
    {
      codigo: "CAS-2026-000123",
      titulo: "Lentitud Internet hogar",
      riesgo: "Medio",
      restante: "05h 42m",
      porcentaje: 54,
      color: "var(--info)"
    }
  ],

  tablero: [
    {
      estado: "Sin clasificar",
      casos: [
        { codigo: "CAS-2026-000245", titulo: "Correo corporativo no disponible", prioridad: "Crítica" },
        { codigo: "CAS-2026-000301", titulo: "Consulta por recibo", prioridad: "Media" }
      ]
    },
    {
      estado: "Clasificado",
      casos: [
        { codigo: "CAS-2026-000300", titulo: "Enlace dedicado intermitente", prioridad: "Alta" }
      ]
    },
    {
      estado: "Asignado",
      casos: [
        { codigo: "CAS-2026-000123", titulo: "Lentitud Internet hogar", prioridad: "Alta" },
        { codigo: "CAS-2026-000184", titulo: "Intermitencia móvil", prioridad: "Media" }
      ]
    },
    {
      estado: "Cierre",
      casos: [
        { codigo: "CAS-2026-000097", titulo: "Cobro no reconocido", prioridad: "Media" }
      ]
    }
  ]
};

const MockSupervisorCases = [
  {
    id: 801,
    codigo: "CAS-2026-000245",
    icono: "⚠️",
    tipo: "Sin clasificar",
    cliente: "Cliente Empresa Demo",
    titulo: "Correo corporativo no disponible",
    descripcion: "Cliente empresarial reporta error de acceso en correo corporativo.",
    servicio: "Correo empresa",
    estado: "Sin clasificar",
    estadoTipo: "danger",
    prioridad: "Crítica",
    sla: "01h 20m",
    canal: "Portal empresas"
  },
  {
    id: 802,
    codigo: "CAS-2026-000300",
    icono: "📡",
    tipo: "Incidencia",
    cliente: "Cliente Empresa Demo",
    titulo: "Enlace dedicado con intermitencia",
    descripcion: "Intermitencia en conectividad empresarial.",
    servicio: "Fibra empresarial",
    estado: "Pendiente asignación",
    estadoTipo: "warning",
    prioridad: "Alta",
    sla: "03h 10m",
    canal: "Mesa empresas"
  },
  {
    id: 803,
    codigo: "CAS-2026-000123",
    icono: "📝",
    tipo: "Reclamo",
    cliente: "Cliente Persona Demo",
    titulo: "Lentitud recurrente en Internet hogar",
    descripcion: "Reclamo por bajo rendimiento del servicio.",
    servicio: "Internet hogar",
    estado: "Clasificado",
    estadoTipo: "info",
    prioridad: "Alta",
    sla: "05h 42m",
    canal: "Web"
  }
];

const MockAdvisors = [
  {
    id: 1,
    nombre: "Asesor Demo 1",
    iniciales: "A1",
    equipo: "Empresas",
    especialidad: "Servicios empresariales",
    casos: 7,
    carga: 80,
    estado: "Alta carga"
  },
  {
    id: 2,
    nombre: "Asesor Demo 2",
    iniciales: "A2",
    equipo: "Técnico Hogar",
    especialidad: "Internet y TV hogar",
    casos: 4,
    carga: 52,
    estado: "Disponible"
  },
  {
    id: 3,
    nombre: "Asesor Demo 3",
    iniciales: "A3",
    equipo: "Facturación",
    especialidad: "Cobros y recibos",
    casos: 5,
    carga: 60,
    estado: "Media carga"
  },
  {
    id: 4,
    nombre: "Asesor Demo 4",
    iniciales: "A4",
    equipo: "Empresas",
    especialidad: "Cloud y correo empresas",
    casos: 3,
    carga: 38,
    estado: "Disponible"
  }
];

/* =========================================================
   API LAYER - CAMBIAR AQUÍ CUANDO EXISTA BACKEND
========================================================= */

const SupervisorApi = {
  async getDashboard() {
    await delay(500);
    return MockSupervisorDashboard;

    /*
    const response = await fetch("/api/supervisor/dashboard", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });

    return await response.json();
    */
  },

  async getCases() {
    await delay(400);
    return MockSupervisorCases;

    /*
    const response = await fetch("/api/supervisor/casos", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });

    return await response.json();
    */
  },

  async getAdvisors() {
    await delay(400);
    return MockAdvisors;

    /*
    const response = await fetch("/api/supervisor/asesores", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });

    return await response.json();
    */
  },

  async classifyCase(payload) {
    await delay(700);
    return {
      ok: true,
      codigo: payload.caseCode,
      operacion: "Clasificación registrada"
    };
  },

  async assignCase(payload) {
    await delay(700);
    return {
      ok: true,
      codigo: payload.caseCode,
      operacion: "Asignación registrada"
    };
  }
};

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(SupervisorState.theme);
  bindLayout();
  bindTheme();
  bindUserMenu();
  bindSearch();
  bindBot();
  bindModals();
  bindLogout();

  const page = document.body.dataset.page;

  if (page === "supervisor-dashboard") {
    initSupervisorDashboard();
  }

  if (page === "supervisor-clasificar") {
    initClassificationPage();
  }

  if (page === "supervisor-asignar") {
    initAssignmentPage();
  }
});

/* =========================================================
   UTILIDADES
========================================================= */

function $(selector, parent = document) {
  return parent.querySelector(selector);
}

function $all(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function showToast({ title, message, type = "info" }) {
  const container = $("#toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span>${type === "success" ? "✓" : type === "warning" ? "!" : type === "danger" ? "×" : "ℹ"}</span>
    <div>
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(24px)";
    setTimeout(() => toast.remove(), 250);
  }, 4200);
}

/* =========================================================
   DASHBOARD
========================================================= */

async function initSupervisorDashboard() {
  setText("#welcomeTitle", "Cargando supervisión...");
  setText("#welcomeMessage", "Estamos preparando la vista de control operativo.");

  const data = await SupervisorApi.getDashboard();
  SupervisorState.dashboardData = data;

  renderSupervisorDashboard(data);
}

function renderSupervisorDashboard(data) {
  const user = data.supervisor;

  setText("#userAvatar", user.iniciales);
  setText("#userNameTop", user.nombre);
  setText("#userRoleTop", user.rol);
  setText("#supervisorShift", user.turno);
  setText("#welcomeTitle", `Hola, ${user.nombre}`);
  setText(
    "#welcomeMessage",
    "Desde este panel puedes monitorear la operación, clasificar casos, asignar responsables y controlar riesgos SLA."
  );
  setText("#supervisorStatus", user.estado);
  setText("#supervisorLastAccess", user.ultimoAcceso);

  renderSupervisorKpis(data.indicadores);
  renderCriticalCases(data.casosCriticos);
  renderSupervisorAi(data.resumenIA);
  renderAdvisorLoad(data.cargaAsesores);
  renderSupervisorSla(data.alertasSla);
  renderSupervisorBoard(data.tablero);
}

function renderSupervisorKpis(items) {
  const grid = $("#supervisorKpiGrid");
  if (!grid) return;

  grid.innerHTML = items
    .map((item) => {
      return `
        <article class="kpi-card">
          <span class="kpi-card__icon">${item.icono}</span>
          <div>
            <strong>${item.valor}</strong>
            <p>${item.titulo}</p>
            <small>${item.descripcion}</small>
          </div>
        </article>
      `;
    })
    .join("");

  const pending = items.find((item) => item.titulo === "Sin clasificar");
  setText("#sidebarPendingCount", pending ? pending.valor : "");
}

function renderCriticalCases(cases) {
  const list = $("#criticalCasesList");
  if (!list) return;

  list.innerHTML = cases
    .map((caso) => renderCaseItem(caso, "data-supervisor-case-id"))
    .join("");

  $all("[data-supervisor-case-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.supervisorCaseId);
      const caso = cases.find((item) => item.id === id);
      if (caso) openSupervisorCaseModal(caso);
    });
  });
}

function renderSupervisorAi(items) {
  const container = $("#supervisorAiSummary");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <div class="ai-summary-item">
          <strong>${item.titulo}</strong>
          <p>${item.texto}</p>
        </div>
      `;
    })
    .join("");
}

function renderAdvisorLoad(items) {
  const container = $("#advisorLoadList");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <article class="advisor-load-item">
          <div class="advisor-load-top">
            <div>
              <strong>${item.nombre}</strong>
              <p>${item.equipo} · ${item.casos} casos</p>
            </div>
            <span class="status-pill ${item.carga >= 75 ? "status-pill--danger" : item.carga >= 55 ? "status-pill--warning" : "status-pill--success"}">
              ${item.estado}
            </span>
          </div>

          <div class="load-bar">
            <span style="width:${item.carga}%"></span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSupervisorSla(items) {
  const container = $("#supervisorSlaList");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <article class="sla-item">
          <div class="sla-item__top">
            <div>
              <strong>${item.codigo}</strong>
              <p>${item.titulo}</p>
            </div>

            <span class="status-pill ${item.riesgo === "Crítico" ? "status-pill--danger" : item.riesgo === "Alto" ? "status-pill--warning" : "status-pill--info"}">
              ${item.riesgo}
            </span>
          </div>

          <p>Tiempo restante: ${item.restante}</p>

          <div class="sla-bar">
            <span style="width:${item.porcentaje}%; background:${item.color};"></span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSupervisorBoard(columns) {
  const board = $("#supervisorBoard");
  if (!board) return;

  board.innerHTML = columns
    .map((column) => {
      return `
        <section class="queue-column">
          <div class="queue-column__header">
            <h3>${column.estado}</h3>
            <small>${column.casos.length}</small>
          </div>

          ${column.casos
            .map((caso) => {
              return `
                <article class="queue-card">
                  <strong>${caso.codigo}</strong>
                  <p>${caso.titulo}</p>
                  <span class="status-pill status-pill--info">${caso.prioridad}</span>
                </article>
              `;
            })
            .join("")}
        </section>
      `;
    })
    .join("");
}

/* =========================================================
   CLASIFICAR CASOS
========================================================= */

let ClassificationState = {
  cases: [],
  filter: "todos",
  search: ""
};

async function initClassificationPage() {
  bindClassificationEvents();

  const cases = await SupervisorApi.getCases();
  ClassificationState.cases = cases;

  renderClassificationCases();
}

function bindClassificationEvents() {
  $("#classificationSearchInput")?.addEventListener("input", (event) => {
    ClassificationState.search = event.target.value.trim().toLowerCase();
    renderClassificationCases();
  });

  $all("[data-classification-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      ClassificationState.filter = button.dataset.classificationFilter || "todos";

      $all("[data-classification-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      renderClassificationCases();
    });
  });

  $("#refreshClassificationBtn")?.addEventListener("click", async () => {
    ClassificationState.cases = await SupervisorApi.getCases();
    renderClassificationCases();

    showToast({
      title: "Cola actualizada",
      message: "Se actualizó la lista de casos por clasificar.",
      type: "success"
    });
  });

  $("#classificationSuggestBtn")?.addEventListener("click", fillClassificationSuggestion);
  $("#classifyWithAiBtn")?.addEventListener("click", fillClassificationSuggestion);

  $("#classificationForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearSupervisorFormErrors();

    const payload = {
      caseCode: $("#classificationCaseCode")?.value.trim(),
      type: $("#classificationType")?.value,
      category: $("#classificationCategory")?.value,
      priority: $("#classificationPriority")?.value,
      sla: $("#classificationSla")?.value,
      comment: $("#classificationComment")?.value.trim()
    };

    const validation = validateClassificationPayload(payload);

    if (!validation.ok) {
      showSupervisorFormErrors(validation.errors);
      showToast({
        title: "Formulario incompleto",
        message: validation.firstMessage,
        type: "warning"
      });
      return;
    }

    setSupervisorButtonLoading("#classificationSubmitBtn", true);

    const result = await SupervisorApi.classifyCase(payload);

    setSupervisorButtonLoading("#classificationSubmitBtn", false);

    if (result.ok) {
      openGenericModal({
        icon: "✓",
        title: "Clasificación guardada",
        text: `La clasificación del caso ${result.codigo} fue registrada correctamente.`
      });
    }
  });
}

function renderClassificationCases() {
  const list = $("#classificationCasesList");
  const empty = $("#emptyClassificationState");

  if (!list || !empty) return;

  const filtered = getFilteredClassificationCases();

  setText("#classificationSummaryStatus", `${filtered.length} casos visibles`);
  setText("#classificationSummaryText", `Filtro activo: ${ClassificationState.filter}`);
  setText("#sidebarPendingCount", ClassificationState.cases.filter((item) => item.estado === "Sin clasificar").length);

  if (!filtered.length) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  list.innerHTML = filtered
    .map((caso) => renderCaseItem(caso, "data-classification-case-id"))
    .join("");

  $all("[data-classification-case-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.classificationCaseId);
      const caso = ClassificationState.cases.find((item) => item.id === id);

      if (caso) {
        $("#classificationCaseCode").value = caso.codigo;
        $("#classificationType").value = caso.tipo === "Sin clasificar" ? "" : caso.tipo;
        $("#classificationPriority").value = caso.prioridad;
        $("#classificationComment").value = `Caso seleccionado para clasificación: ${caso.titulo}.`;
      }
    });
  });
}

function getFilteredClassificationCases() {
  return ClassificationState.cases.filter((caso) => {
    const q = ClassificationState.search;

    const matchesSearch =
      !q ||
      caso.codigo.toLowerCase().includes(q) ||
      caso.cliente.toLowerCase().includes(q) ||
      caso.titulo.toLowerCase().includes(q) ||
      caso.servicio.toLowerCase().includes(q) ||
      caso.canal.toLowerCase().includes(q);

    const filter = ClassificationState.filter;

    const matchesFilter =
      filter === "todos" ||
      caso.estado === filter ||
      caso.tipo === filter ||
      caso.prioridad === filter;

    return matchesSearch && matchesFilter;
  });
}

function fillClassificationSuggestion() {
  if (!$("#classificationCaseCode")?.value.trim()) {
    const first = ClassificationState.cases[0];
    if (first) $("#classificationCaseCode").value = first.codigo;
  }

  $("#classificationType").value = "Incidencia";
  $("#classificationCategory").value = "Servicio empresarial";
  $("#classificationPriority").value = "Crítica";
  $("#classificationSla").value = "4h";
  $("#classificationComment").value =
    "Clasificación sugerida por IA debido al impacto empresarial, criticidad del servicio y riesgo de SLA.";

  showToast({
    title: "Sugerencia aplicada",
    message: "La IA completó una clasificación sugerida.",
    type: "success"
  });
}

function validateClassificationPayload(payload) {
  const errors = {};

  if (!payload.caseCode) errors.classificationCaseCode = "Selecciona o ingresa el código del caso.";
  if (!payload.type) errors.classificationType = "Selecciona el tipo.";
  if (!payload.category) errors.classificationCategory = "Selecciona la categoría.";
  if (!payload.priority) errors.classificationPriority = "Selecciona la prioridad.";
  if (!payload.sla) errors.classificationSla = "Selecciona el SLA.";
  if (!payload.comment) errors.classificationComment = "Ingresa un comentario interno.";

  return buildSupervisorValidation(errors);
}

/* =========================================================
   ASIGNAR CASO
========================================================= */

let AssignmentState = {
  cases: [],
  advisors: []
};

async function initAssignmentPage() {
  bindAssignmentEvents();

  const [cases, advisors] = await Promise.all([
    SupervisorApi.getCases(),
    SupervisorApi.getAdvisors()
  ]);

  AssignmentState.cases = cases;
  AssignmentState.advisors = advisors;

  renderAssignmentCases(cases);
  renderAssignmentAdvisors(advisors);
  fillAdvisorSelect(advisors);
}

function bindAssignmentEvents() {
  $("#refreshAssignmentCasesBtn")?.addEventListener("click", async () => {
    AssignmentState.cases = await SupervisorApi.getCases();
    renderAssignmentCases(AssignmentState.cases);

    showToast({
      title: "Casos actualizados",
      message: "Se actualizó la lista de casos disponibles.",
      type: "success"
    });
  });

  $("#assignmentSuggestBtn")?.addEventListener("click", applyAssignmentSuggestion);
  $("#assignmentPreviewBtn")?.addEventListener("click", previewAssignment);

  $("#assignmentForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearSupervisorFormErrors();

    const payload = {
      caseCode: $("#assignmentCaseCode")?.value.trim(),
      advisorId: $("#assignmentAdvisor")?.value,
      advisorName: $("#assignmentAdvisor")?.selectedOptions[0]?.textContent || "",
      team: $("#assignmentTeam")?.value,
      reason: $("#assignmentReason")?.value.trim(),
      notify: $("#assignmentNotify")?.checked
    };

    const validation = validateAssignmentPayload(payload);

    if (!validation.ok) {
      showSupervisorFormErrors(validation.errors);
      showToast({
        title: "Formulario incompleto",
        message: validation.firstMessage,
        type: "warning"
      });
      return;
    }

    setSupervisorButtonLoading("#assignmentSubmitBtn", true);

    const result = await SupervisorApi.assignCase(payload);

    setSupervisorButtonLoading("#assignmentSubmitBtn", false);

    if (result.ok) {
      openGenericModal({
        icon: "✓",
        title: "Caso asignado",
        text: `El caso ${result.codigo} fue asignado correctamente.`
      });
    }
  });
}

function renderAssignmentCases(cases) {
  const list = $("#assignmentCasesList");
  if (!list) return;

  setText("#assignmentSummaryStatus", `${cases.length} casos disponibles`);
  setText("#assignmentSummaryText", "Selecciona un caso para asignarlo");

  list.innerHTML = cases
    .map((caso) => renderCaseItem(caso, "data-assignment-case-id"))
    .join("");

  $all("[data-assignment-case-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.assignmentCaseId);
      const caso = AssignmentState.cases.find((item) => item.id === id);

      if (caso) {
        $("#assignmentCaseCode").value = caso.codigo;
        $("#assignmentTeam").value = suggestTeamByService(caso.servicio);
        $("#assignmentReason").value =
          `Asignación propuesta por tipo de servicio (${caso.servicio}), prioridad ${caso.prioridad} y estado ${caso.estado}.`;
      }
    });
  });
}

function renderAssignmentAdvisors(advisors) {
  const grid = $("#assignmentAdvisorCards");
  if (!grid) return;

  grid.innerHTML = advisors
    .map((advisor) => {
      return `
        <article class="advisor-card">
          <div class="advisor-card__avatar">${advisor.iniciales}</div>
          <h3>${advisor.nombre}</h3>
          <p>${advisor.especialidad}</p>
          <small>${advisor.equipo} · ${advisor.casos} casos · ${advisor.estado}</small>
          <div class="load-bar">
            <span style="width:${advisor.carga}%"></span>
          </div>
        </article>
      `;
    })
    .join("");
}

function fillAdvisorSelect(advisors) {
  const select = $("#assignmentAdvisor");
  if (!select) return;

  select.innerHTML = `<option value="">Seleccionar</option>` +
    advisors
      .map((advisor) => {
        return `<option value="${advisor.id}">${advisor.nombre} · ${advisor.equipo} · ${advisor.estado}</option>`;
      })
      .join("");
}

function applyAssignmentSuggestion() {
  const caseCode = $("#assignmentCaseCode");

  if (!caseCode?.value.trim() && AssignmentState.cases.length) {
    caseCode.value = AssignmentState.cases[0].codigo;
  }

  const bestAdvisor = AssignmentState.advisors
    .slice()
    .sort((a, b) => a.carga - b.carga)[0];

  if (bestAdvisor) {
    $("#assignmentAdvisor").value = String(bestAdvisor.id);
    $("#assignmentTeam").value = bestAdvisor.equipo;
    $("#assignmentReason").value =
      `Asignación sugerida por IA: ${bestAdvisor.nombre} presenta menor carga relativa y especialidad compatible con el caso.`;
  }

  showToast({
    title: "Asignación sugerida",
    message: "La IA seleccionó un asesor con menor carga disponible.",
    type: "success"
  });
}

function previewAssignment() {
  const advisor = $("#assignmentAdvisor")?.selectedOptions[0]?.textContent || "No seleccionado";

  const summary = $("#assignmentPreviewSummary");
  if (summary) {
    summary.innerHTML = `
      <div>
        <span>Caso</span>
        <strong>${$("#assignmentCaseCode")?.value || "No indicado"}</strong>
      </div>
      <div>
        <span>Asesor</span>
        <strong>${advisor}</strong>
      </div>
      <div>
        <span>Equipo</span>
        <strong>${$("#assignmentTeam")?.value || "No seleccionado"}</strong>
      </div>
      <div>
        <span>Notificar</span>
        <strong>${$("#assignmentNotify")?.checked ? "Sí" : "No"}</strong>
      </div>
    `;
  }

  openModal("#assignmentPreviewModal");
}

function validateAssignmentPayload(payload) {
  const errors = {};

  if (!payload.caseCode) errors.assignmentCaseCode = "Selecciona o ingresa el código del caso.";
  if (!payload.advisorId) errors.assignmentAdvisor = "Selecciona el asesor responsable.";
  if (!payload.team) errors.assignmentTeam = "Selecciona el equipo.";
  if (!payload.reason) errors.assignmentReason = "Ingresa el motivo de asignación.";

  return buildSupervisorValidation(errors);
}

function suggestTeamByService(service) {
  if (service.toLowerCase().includes("empresa") || service.toLowerCase().includes("correo")) return "Empresas";
  if (service.toLowerCase().includes("internet")) return "Técnico Hogar";
  if (service.toLowerCase().includes("facturación")) return "Facturación";
  return "Atención General";
}

/* =========================================================
   COMPONENTES Y UTILIDADES
========================================================= */

function renderCaseItem(caso, dataAttribute) {
  return `
    <article class="case-item">
      <span class="case-icon">${caso.icono}</span>

      <div>
        <h3>${caso.titulo}</h3>
        <p>${caso.descripcion}</p>

        <div class="case-meta">
          <span>${caso.codigo}</span>
          <span>${caso.tipo}</span>
          <span>${caso.cliente}</span>
          <span>${caso.servicio}</span>
          <span>Prioridad ${caso.prioridad}</span>
          <span>SLA: ${caso.sla}</span>
          <span>${caso.canal}</span>
        </div>
      </div>

      <div>
        <span class="status-pill status-pill--${caso.estadoTipo}">
          ${caso.estado}
        </span>
        <button type="button" ${dataAttribute}="${caso.id}">
          Seleccionar
        </button>
      </div>
    </article>
  `;
}

function openSupervisorCaseModal(caso) {
  setText("#caseModalIcon", caso.icono);
  setText("#caseModalTitle", caso.codigo);
  setText("#caseModalText", caso.descripcion);

  const summary = $("#caseModalSummary");

  if (summary) {
    summary.innerHTML = `
      <div>
        <span>Cliente</span>
        <strong>${caso.cliente}</strong>
      </div>
      <div>
        <span>Tipo</span>
        <strong>${caso.tipo}</strong>
      </div>
      <div>
        <span>Servicio</span>
        <strong>${caso.servicio}</strong>
      </div>
      <div>
        <span>Estado</span>
        <strong>${caso.estado}</strong>
      </div>
      <div>
        <span>Prioridad</span>
        <strong>${caso.prioridad}</strong>
      </div>
      <div>
        <span>SLA</span>
        <strong>${caso.sla}</strong>
      </div>
    `;
  }

  openModal("#caseModal");
}

function buildSupervisorValidation(errors) {
  const messages = Object.values(errors);

  return {
    ok: messages.length === 0,
    errors,
    firstMessage: messages[0] || ""
  };
}

function showSupervisorFormErrors(errors) {
  Object.entries(errors).forEach(([key, value]) => {
    const element = $(`#${key}Error`);
    if (element) element.textContent = value;
  });
}

function clearSupervisorFormErrors() {
  $all(".form-error").forEach((item) => {
    item.textContent = "";
  });
}

function setSupervisorButtonLoading(selector, value) {
  const button = $(selector);
  if (!button) return;

  button.disabled = value;
  button.classList.toggle("loading", value);
}

/* =========================================================
   LAYOUT
========================================================= */

function bindLayout() {
  $("#menuBtn")?.addEventListener("click", () => {
    $("#sidebar")?.classList.add("open");
    $("#drawerBackdrop")?.classList.add("show");
    document.body.classList.add("drawer-open");
  });

  $("#drawerBackdrop")?.addEventListener("click", () => {
    closeSidebar();
    closeBot();
  });

  $("#refreshWorkloadBtn")?.addEventListener("click", () => {
    if (SupervisorState.dashboardData) {
      renderAdvisorLoad(SupervisorState.dashboardData.cargaAsesores);
    }

    showToast({
      title: "Carga actualizada",
      message: "Se actualizó la distribución por asesor.",
      type: "success"
    });
  });

  $("#refreshSlaBtn")?.addEventListener("click", () => {
    if (SupervisorState.dashboardData) {
      renderSupervisorSla(SupervisorState.dashboardData.alertasSla);
    }

    showToast({
      title: "SLA actualizado",
      message: "Se refrescaron las alertas de vencimiento.",
      type: "success"
    });
  });
}

function closeSidebar() {
  $("#sidebar")?.classList.remove("open");
  $("#drawerBackdrop")?.classList.remove("show");
  document.body.classList.remove("drawer-open");
}

/* =========================================================
   THEME
========================================================= */

function bindTheme() {
  $("#themeToggle")?.addEventListener("click", () => {
    const next = SupervisorState.theme === "light" ? "dark" : "light";
    applyTheme(next);

    showToast({
      title: "Tema actualizado",
      message: `Se activó el modo ${next === "dark" ? "oscuro" : "claro"}.`,
      type: "success"
    });
  });
}

function applyTheme(theme) {
  SupervisorState.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("claro360-theme", theme);
}

/* =========================================================
   USER MENU
========================================================= */

function bindUserMenu() {
  $("#userMenuButton")?.addEventListener("click", () => {
    $("#userMenuDropdown")?.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    const menu = $(".user-menu");
    if (menu && !menu.contains(event.target)) {
      $("#userMenuDropdown")?.classList.remove("open");
    }
  });
}

/* =========================================================
   SEARCH
========================================================= */

function bindSearch() {
  $("#globalSearchBtn")?.addEventListener("click", openSearch);
  $("#closeSearchBtn")?.addEventListener("click", closeSearch);

  $("#globalSearchInput")?.addEventListener("input", (event) => {
    SupervisorState.currentSearch = event.target.value.trim().toLowerCase();
    renderSearchResults();
  });
}

function openSearch() {
  $("#searchModal")?.classList.add("show");
  $("#searchModal")?.setAttribute("aria-hidden", "false");
  document.body.classList.add("search-open");

  setTimeout(() => $("#globalSearchInput")?.focus(), 100);

  renderSearchResults();
}

function closeSearch() {
  $("#searchModal")?.classList.remove("show");
  $("#searchModal")?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("search-open");
}

function renderSearchResults() {
  const container = $("#searchResults");
  if (!container) return;

  const q = SupervisorState.currentSearch;

  const cases = MockSupervisorCases.map((item) => ({
    icon: item.icono,
    title: item.codigo,
    text: `${item.cliente} · ${item.titulo}`,
    href: "clasificar-casos.html",
    keywords: `${item.codigo} ${item.cliente} ${item.titulo} ${item.servicio} ${item.estado}`.toLowerCase()
  }));

  const results = q ? cases.filter((item) => item.keywords.includes(q)) : cases;

  if (!results.length) {
    container.innerHTML = `<p class="muted">No se encontraron resultados.</p>`;
    return;
  }

  container.innerHTML = results
    .map((item) => {
      return `
        <a href="${item.href}" class="search-result-item">
          <span>${item.icon}</span>
          <div>
            <strong>${item.title}</strong>
            <small>${item.text}</small>
          </div>
        </a>
      `;
    })
    .join("");
}

/* =========================================================
   BOT
========================================================= */

function bindBot() {
  $("#openBotSidebar")?.addEventListener("click", openBot);
  $("#openBotWelcome")?.addEventListener("click", openBot);

  $("#analyzeSupervisorBtn")?.addEventListener("click", () => {
    openBot();
    addBotMessage("Resume la operación", "user");

    setTimeout(() => {
      addBotMessage(generateBotResponse("resume la operación"), "bot");
    }, 500);
  });

  $("#closeBotDrawer")?.addEventListener("click", closeBot);

  $("#botForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = $("#botInput");
    const prompt = input?.value.trim();

    if (!prompt) return;

    addBotMessage(prompt, "user");
    input.value = "";

    const typing = addTyping();

    await delay(500);

    typing.remove();
    addBotMessage(generateBotResponse(prompt), "bot");
  });

  $all("[data-bot-prompt]").forEach((button) => {
    button.addEventListener("click", async () => {
      const prompt = button.dataset.botPrompt || "";

      addBotMessage(prompt, "user");

      const typing = addTyping();

      await delay(500);

      typing.remove();
      addBotMessage(generateBotResponse(prompt), "bot");
    });
  });
}

function openBot() {
  $("#botDrawer")?.classList.add("open");
  $("#drawerBackdrop")?.classList.add("show");
  document.body.classList.add("drawer-open");
}

function closeBot() {
  $("#botDrawer")?.classList.remove("open");
  $("#drawerBackdrop")?.classList.remove("show");
  document.body.classList.remove("drawer-open");
}

function addBotMessage(text, sender) {
  const container = $("#botMessages");
  if (!container) return;

  const message = document.createElement("div");
  message.className = `message message--${sender}`;
  message.textContent = text;

  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
}

function addTyping() {
  const container = $("#botMessages");
  const message = document.createElement("div");

  message.className = "message message--bot";
  message.textContent = "IA Supervisor está analizando la operación...";

  container?.appendChild(message);

  if (container) {
    container.scrollTop = container.scrollHeight;
  }

  return message;
}

function generateBotResponse(prompt) {
  const text = prompt.toLowerCase();

  if (text.includes("operación") || text.includes("resumen")) {
    return "La operación presenta casos sin clasificar, riesgo SLA en servicios empresariales y necesidad de balancear carga entre asesores.";
  }

  if (text.includes("riesgo") || text.includes("sla")) {
    return "Los casos con menor SLA restante y prioridad crítica deben clasificarse y asignarse primero.";
  }

  if (text.includes("asigno") || text.includes("asignación") || text.includes("asesor")) {
    return "Recomiendo asignar considerando especialidad, carga actual, prioridad del caso y tiempo restante de SLA.";
  }

  if (text.includes("prioridad")) {
    return "La prioridad debe basarse en impacto, tipo de cliente, servicio afectado, urgencia y riesgo de vencimiento SLA.";
  }

  return "Puedo ayudarte a clasificar, asignar, balancear carga o revisar riesgos SLA.";
}

/* =========================================================
   MODALES
========================================================= */

function bindModals() {
  $all("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeAllModals);
  });

  $("#modalBackdrop")?.addEventListener("click", closeAllModals);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllModals();
      closeSearch();
      closeBot();
      closeSidebar();
    }
  });
}

function openModal(selector) {
  const modal = $(selector);
  const backdrop = $("#modalBackdrop");

  if (!modal || !backdrop) return;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  backdrop.classList.add("show");
  document.body.classList.add("modal-open");
}

function closeAllModals() {
  $all(".modal").forEach((modal) => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  });

  $("#modalBackdrop")?.classList.remove("show");
  document.body.classList.remove("modal-open");
}

function openGenericModal({ icon = "ℹ", title = "Información", text = "" }) {
  setText("#genericModalIcon", icon);
  setText("#genericModalTitle", title);
  setText("#genericModalText", text);
  openModal("#genericModal");
}

/* =========================================================
   LOGOUT
========================================================= */

function bindLogout() {
  $("#logoutBtn")?.addEventListener("click", logout);
  $("#logoutDropdownBtn")?.addEventListener("click", logout);
}

function logout() {
  localStorage.removeItem("claro360-token");
  localStorage.removeItem("claro360-session");

  showToast({
    title: "Sesión cerrada",
    message: "Serás redirigido al inicio de sesión.",
    type: "success"
  });

  setTimeout(() => {
    window.location.href = "../login.html";
  }, 700);
}

/* =========================================================
   PÁGINAS SUPERVISOR: INDICADORES Y REPORTES
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "supervisor-indicadores") {
    initSupervisorIndicatorsPage();
  }

  if (page === "supervisor-reportes") {
    initSupervisorReportsPage();
  }
});

/* =========================================================
   MOCK DATA - ELIMINAR CUANDO SE CONECTE AL BACKEND
========================================================= */

const MockSupervisorIndicators = {
  kpis: [
    {
      icono: "📥",
      valor: 128,
      titulo: "Casos ingresados",
      descripcion: "Durante el periodo"
    },
    {
      icono: "✅",
      valor: 92,
      titulo: "Casos cerrados",
      descripcion: "Atendidos completamente"
    },
    {
      icono: "⏱️",
      valor: "86%",
      titulo: "Cumplimiento SLA",
      descripcion: "Dentro del plazo"
    },
    {
      icono: "⚠️",
      valor: 11,
      titulo: "Casos en riesgo",
      descripcion: "SLA próximo a vencer"
    }
  ],

  tendencia: [
    { dia: "Lun", casos: 18 },
    { dia: "Mar", casos: 22 },
    { dia: "Mié", casos: 17 },
    { dia: "Jue", casos: 26 },
    { dia: "Vie", casos: 31 },
    { dia: "Sáb", casos: 9 },
    { dia: "Dom", casos: 5 }
  ],

  resumenIA: [
    {
      titulo: "Tendencia",
      texto: "El mayor volumen se concentra jueves y viernes, por lo que conviene reforzar capacidad esos días."
    },
    {
      titulo: "SLA",
      texto: "El cumplimiento general es aceptable, pero existen riesgos concentrados en servicios empresariales."
    },
    {
      titulo: "Acción sugerida",
      texto: "Balancear carga y priorizar casos críticos antes de derivar nuevos reclamos a asesores saturados."
    }
  ],

  slaRanking: [
    { equipo: "Empresas", valor: 78, detalle: "Cumplimiento menor por casos críticos B2B" },
    { equipo: "Técnico Hogar", valor: 84, detalle: "Riesgo moderado por incidencias de internet" },
    { equipo: "Facturación", valor: 91, detalle: "Buen desempeño en cierres" },
    { equipo: "Atención General", valor: 88, detalle: "Volumen estable" }
  ],

  asesorPerformance: [
    { asesor: "Asesor Demo 1", valor: 74, detalle: "Alta carga actual" },
    { asesor: "Asesor Demo 2", valor: 92, detalle: "Buen cumplimiento SLA" },
    { asesor: "Asesor Demo 3", valor: 86, detalle: "Productividad estable" },
    { asesor: "Asesor Demo 4", valor: 94, detalle: "Alta disponibilidad" }
  ],

  matriz: [
    { estado: "Sin clasificar", baja: 1, media: 3, alta: 4, critica: 1, total: 9, riesgo: "Alto" },
    { estado: "Clasificado", baja: 2, media: 4, alta: 2, critica: 0, total: 8, riesgo: "Medio" },
    { estado: "Asignado", baja: 4, media: 8, alta: 4, critica: 1, total: 17, riesgo: "Medio" },
    { estado: "En atención", baja: 3, media: 7, alta: 5, critica: 2, total: 17, riesgo: "Alto" },
    { estado: "Cerrado", baja: 8, media: 9, alta: 4, critica: 1, total: 22, riesgo: "Bajo" }
  ]
};

const MockSupervisorReports = {
  historial: [
    {
      nombre: "Reporte mensual de cumplimiento SLA",
      tipo: "SLA",
      formato: "PDF",
      fecha: "21/05/2026",
      estado: "Generado"
    },
    {
      nombre: "Detalle de casos por asesor",
      tipo: "Desempeño",
      formato: "Excel",
      fecha: "20/05/2026",
      estado: "Generado"
    },
    {
      nombre: "Reporte operativo diario",
      tipo: "Operativo",
      formato: "PDF",
      fecha: "19/05/2026",
      estado: "Generado"
    }
  ],

  programados: [
    {
      nombre: "Resumen ejecutivo semanal",
      frecuencia: "Todos los lunes",
      destinatario: "Gerencia de Atención",
      estado: "Activo"
    },
    {
      nombre: "Alertas SLA diarias",
      frecuencia: "Cada día 08:00",
      destinatario: "Supervisores",
      estado: "Activo"
    }
  ],

  resumenIA: [
    {
      titulo: "Recomendación",
      texto: "Para seguimiento de gestión, genera un reporte ejecutivo con cumplimiento SLA, carga y casos críticos."
    },
    {
      titulo: "Formato sugerido",
      texto: "PDF para gerencia y Excel para análisis operativo detallado."
    },
    {
      titulo: "Frecuencia",
      texto: "Un reporte diario operativo y uno semanal ejecutivo cubren la necesidad principal."
    }
  ]
};

/* =========================================================
   API LAYER - INDICADORES / REPORTES
========================================================= */

const SupervisorIndicatorsApi = {
  async getIndicators() {
    await delay(450);
    return MockSupervisorIndicators;

    /*
    const response = await fetch("/api/supervisor/indicadores", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });
    return await response.json();
    */
  }
};

const SupervisorReportsApi = {
  async getReports() {
    await delay(450);
    return MockSupervisorReports;

    /*
    const response = await fetch("/api/supervisor/reportes", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });
    return await response.json();
    */
  },

  async generateReport(payload) {
    await delay(800);

    return {
      ok: true,
      nombre: payload.name,
      tipo: payload.type,
      formato: payload.format,
      fecha: new Date().toLocaleDateString("es-PE")
    };

    /*
    const response = await fetch("/api/supervisor/reportes/generar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      },
      body: JSON.stringify(payload)
    });
    return await response.json();
    */
  }
};

/* =========================================================
   INDICADORES
========================================================= */

let IndicatorState = {
  data: null
};

async function initSupervisorIndicatorsPage() {
  bindIndicatorEvents();

  const data = await SupervisorIndicatorsApi.getIndicators();
  IndicatorState.data = data;

  renderSupervisorIndicators(data);
}

function bindIndicatorEvents() {
  $("#applyIndicatorFiltersBtn")?.addEventListener("click", () => {
    showToast({
      title: "Filtros aplicados",
      message: "Los indicadores fueron actualizados según los filtros seleccionados.",
      type: "success"
    });

    if (IndicatorState.data) {
      renderSupervisorIndicators(IndicatorState.data);
    }
  });

  $("#refreshIndicatorsBtn")?.addEventListener("click", async () => {
    IndicatorState.data = await SupervisorIndicatorsApi.getIndicators();
    renderSupervisorIndicators(IndicatorState.data);

    showToast({
      title: "Indicadores actualizados",
      message: "Se refrescaron las métricas del periodo.",
      type: "success"
    });
  });

  $("#indicatorAnalyzeBtn")?.addEventListener("click", openIndicatorAnalysis);
  $("#indicatorAiBtn")?.addEventListener("click", openIndicatorAnalysis);

  $("#downloadIndicatorsBtn")?.addEventListener("click", () => {
    openGenericModal({
      icon: "📊",
      title: "Descarga preparada",
      text: "Cuando se conecte el backend, esta opción descargará la matriz de indicadores en Excel o PDF."
    });
  });
}

function renderSupervisorIndicators(data) {
  setText("#indicatorSummaryStatus", "Indicadores actualizados");
  setText("#indicatorSummaryText", "Periodo: este mes");

  renderIndicatorKpis(data.kpis);
  renderCasesTrend(data.tendencia);
  renderIndicatorAi(data.resumenIA);
  renderMetricRanking("#slaRankingList", data.slaRanking, "equipo");
  renderMetricRanking("#advisorPerformanceList", data.asesorPerformance, "asesor");
  renderIndicatorMatrix(data.matriz);
}

function renderIndicatorKpis(items) {
  const grid = $("#indicatorKpiGrid");
  if (!grid) return;

  grid.innerHTML = items
    .map((item) => {
      return `
        <article class="kpi-card">
          <span class="kpi-card__icon">${item.icono}</span>
          <div>
            <strong>${item.valor}</strong>
            <p>${item.titulo}</p>
            <small>${item.descripcion}</small>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCasesTrend(items) {
  const chart = $("#casesTrendChart");
  if (!chart) return;

  const max = Math.max(...items.map((item) => item.casos), 1);

  chart.innerHTML = items
    .map((item) => {
      const height = Math.max((item.casos / max) * 240, 28);

      return `
        <div class="chart-bar">
          <span style="height:${height}px"></span>
          <strong>${item.dia}</strong>
          <small>${item.casos}</small>
        </div>
      `;
    })
    .join("");
}

function renderIndicatorAi(items) {
  const container = $("#indicatorAiSummary");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <div class="ai-summary-item">
          <strong>${item.titulo}</strong>
          <p>${item.texto}</p>
        </div>
      `;
    })
    .join("");
}

function renderMetricRanking(selector, items, labelKey) {
  const container = $(selector);
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <article class="metric-row">
          <div class="metric-row__top">
            <div>
              <strong>${item[labelKey]}</strong>
              <small>${item.detalle}</small>
            </div>

            <span class="status-pill ${item.valor >= 90 ? "status-pill--success" : item.valor >= 80 ? "status-pill--warning" : "status-pill--danger"}">
              ${item.valor}%
            </span>
          </div>

          <div class="metric-bar">
            <span style="width:${item.valor}%"></span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderIndicatorMatrix(items) {
  const body = $("#indicatorMatrixBody");
  if (!body) return;

  body.innerHTML = items
    .map((item) => {
      return `
        <tr>
          <td>${item.estado}</td>
          <td>${item.baja}</td>
          <td>${item.media}</td>
          <td>${item.alta}</td>
          <td>${item.critica}</td>
          <td><strong>${item.total}</strong></td>
          <td>
            <span class="status-pill ${item.riesgo === "Alto" ? "status-pill--danger" : item.riesgo === "Medio" ? "status-pill--warning" : "status-pill--success"}">
              ${item.riesgo}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");
}

function openIndicatorAnalysis() {
  openGenericModal({
    icon: "🤖",
    title: "Análisis IA de indicadores",
    text: "La operación mantiene buen cumplimiento general, pero existen riesgos concentrados en casos críticos empresariales y días de mayor ingreso de casos."
  });
}

/* =========================================================
   REPORTES
========================================================= */

let ReportState = {
  data: null
};

async function initSupervisorReportsPage() {
  bindReportEvents();

  const data = await SupervisorReportsApi.getReports();
  ReportState.data = data;

  renderSupervisorReports(data);
}

function bindReportEvents() {
  $("#reportSuggestBtn")?.addEventListener("click", applyReportSuggestion);
  $("#reportGenerateBtn")?.addEventListener("click", () => $("#reportForm")?.requestSubmit());
  $("#reportPreviewBtn")?.addEventListener("click", previewReport);

  $("#reportScheduleBtn")?.addEventListener("click", () => {
    openGenericModal({
      icon: "📅",
      title: "Programación de reporte",
      text: "Cuando se conecte el backend, esta opción permitirá programar envíos automáticos por correo."
    });
  });

  $("#refreshReportsBtn")?.addEventListener("click", async () => {
    ReportState.data = await SupervisorReportsApi.getReports();
    renderSupervisorReports(ReportState.data);

    showToast({
      title: "Reportes actualizados",
      message: "Se actualizó el historial de reportes.",
      type: "success"
    });
  });

  $("#reportForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearSupervisorFormErrors();

    const payload = getReportPayload();
    const validation = validateReportPayload(payload);

    if (!validation.ok) {
      showSupervisorFormErrors(validation.errors);

      showToast({
        title: "Formulario incompleto",
        message: validation.firstMessage,
        type: "warning"
      });

      return;
    }

    setSupervisorButtonLoading("#reportSubmitBtn", true);

    const result = await SupervisorReportsApi.generateReport(payload);

    setSupervisorButtonLoading("#reportSubmitBtn", false);

    if (result.ok) {
      openGenericModal({
        icon: "📄",
        title: "Reporte generado",
        text: `El reporte ${result.nombre} fue generado correctamente en formato ${result.formato}.`
      });
    }
  });
}

function renderSupervisorReports(data) {
  setText("#reportSummaryStatus", `${data.historial.length} reportes recientes`);
  setText("#reportSummaryText", `${data.programados.length} reportes programados`);

  renderReportAi(data.resumenIA);
  renderReportHistory(data.historial);
  renderScheduledReports(data.programados);
}

function renderReportAi(items) {
  const container = $("#reportAiSummary");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <div class="ai-summary-item">
          <strong>${item.titulo}</strong>
          <p>${item.texto}</p>
        </div>
      `;
    })
    .join("");
}

function renderReportHistory(items) {
  const container = $("#reportHistoryList");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <article class="report-card">
          <div class="report-card__top">
            <div>
              <h3>${item.nombre}</h3>
              <p>${item.tipo} · ${item.formato}</p>
            </div>

            <span class="status-pill status-pill--success">${item.estado}</span>
          </div>

          <small>${item.fecha}</small>
        </article>
      `;
    })
    .join("");
}

function renderScheduledReports(items) {
  const container = $("#scheduledReportsList");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <article class="report-card">
          <div class="report-card__top">
            <div>
              <h3>${item.nombre}</h3>
              <p>${item.frecuencia}</p>
            </div>

            <span class="status-pill status-pill--info">${item.estado}</span>
          </div>

          <small>Destinatario: ${item.destinatario}</small>
        </article>
      `;
    })
    .join("");
}

function applyReportSuggestion() {
  $("#reportType").value = "ejecutivo";
  $("#reportFormat").value = "PDF";
  $("#reportTeam").value = "todos";
  $("#reportPriority").value = "todos";
  $("#reportName").value = "Reporte ejecutivo de atención y cumplimiento SLA";

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  $("#reportDateFrom").value = formatDateInput(firstDay);
  $("#reportDateTo").value = formatDateInput(today);

  $("#reportIncludeCharts").checked = true;
  $("#reportIncludeAi").checked = true;
  $("#reportIncludeAnnexes").checked = false;

  showToast({
    title: "Configuración sugerida",
    message: "La IA completó una configuración recomendada para reporte ejecutivo.",
    type: "success"
  });
}

function previewReport() {
  const payload = getReportPayload();

  setText(
    "#reportPreviewText",
    payload.name || "Aún no se ha definido el nombre del reporte."
  );

  const summary = $("#reportPreviewSummary");

  if (summary) {
    summary.innerHTML = `
      <div>
        <span>Tipo</span>
        <strong>${payload.type || "No seleccionado"}</strong>
      </div>
      <div>
        <span>Formato</span>
        <strong>${payload.format || "No seleccionado"}</strong>
      </div>
      <div>
        <span>Rango</span>
        <strong>${payload.dateFrom || "Inicio"} al ${payload.dateTo || "Fin"}</strong>
      </div>
      <div>
        <span>Equipo</span>
        <strong>${payload.team}</strong>
      </div>
      <div>
        <span>Resumen IA</span>
        <strong>${payload.includeAi ? "Sí" : "No"}</strong>
      </div>
    `;
  }

  openModal("#reportPreviewModal");
}

function getReportPayload() {
  return {
    type: $("#reportType")?.value,
    format: $("#reportFormat")?.value,
    dateFrom: $("#reportDateFrom")?.value,
    dateTo: $("#reportDateTo")?.value,
    team: $("#reportTeam")?.value || "todos",
    priority: $("#reportPriority")?.value || "todos",
    name: $("#reportName")?.value.trim(),
    includeCharts: $("#reportIncludeCharts")?.checked,
    includeAi: $("#reportIncludeAi")?.checked,
    includeAnnexes: $("#reportIncludeAnnexes")?.checked
  };
}

function validateReportPayload(payload) {
  const errors = {};

  if (!payload.type) errors.reportType = "Selecciona el tipo de reporte.";
  if (!payload.format) errors.reportFormat = "Selecciona el formato.";
  if (!payload.dateFrom) errors.reportDateFrom = "Selecciona la fecha de inicio.";
  if (!payload.dateTo) errors.reportDateTo = "Selecciona la fecha de fin.";
  if (!payload.name) errors.reportName = "Ingresa el nombre del reporte.";

  return buildSupervisorValidation(errors);
}

function formatDateInput(date) {
  return date.toISOString().slice(0, 10);
}

/* =========================================================
   MODALES REUTILIZABLES
========================================================= */

let reusableConfirmCallback = null;
let reusableDeleteCallback = null;
let reusablePreviewCallback = null;

function openReusableModal(selector) {
  const modal = document.querySelector(selector);
  const backdrop = document.querySelector("#modalBackdrop");

  if (!modal || !backdrop) return;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  backdrop.classList.add("show");
  document.body.classList.add("modal-open");
}

function closeReusableModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  });

  document.querySelector("#modalBackdrop")?.classList.remove("show");
  document.body.classList.remove("modal-open");
}

function bindReusableModals() {
  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeReusableModals);
  });

  document.querySelector("#modalBackdrop")?.addEventListener("click", closeReusableModals);

  document.querySelector("#cancelConfirmActionBtn")?.addEventListener("click", closeReusableModals);

  document.querySelector("#acceptConfirmActionBtn")?.addEventListener("click", () => {
    if (typeof reusableConfirmCallback === "function") {
      reusableConfirmCallback();
    }

    reusableConfirmCallback = null;
    closeReusableModals();
  });

  document.querySelector("#acceptDeleteActionBtn")?.addEventListener("click", () => {
    if (typeof reusableDeleteCallback === "function") {
      reusableDeleteCallback();
    }

    reusableDeleteCallback = null;
    closeReusableModals();
  });

  document.querySelector("#acceptPreviewActionBtn")?.addEventListener("click", () => {
    if (typeof reusablePreviewCallback === "function") {
      reusablePreviewCallback();
    }

    reusablePreviewCallback = null;
    closeReusableModals();
  });
}

function openConfirmActionModal({
  title = "¿Deseas confirmar esta acción?",
  text = "Revisa que la información ingresada sea correcta antes de continuar.",
  actionName = "Acción pendiente",
  summary = [],
  onConfirm = null
}) {
  reusableConfirmCallback = onConfirm;

  setReusableText("#confirmActionTitle", title);
  setReusableText("#confirmActionText", text);
  setReusableText("#confirmActionName", actionName);

  const summaryContainer = document.querySelector("#confirmActionSummary");

  if (summaryContainer) {
    summaryContainer.innerHTML = summary.length
      ? summary.map((item) => {
          return `
            <div>
              <span>${item.label}</span>
              <strong>${item.value}</strong>
            </div>
          `;
        }).join("")
      : `
        <div>
          <span>Acción</span>
          <strong>${actionName}</strong>
        </div>
        <div>
          <span>Estado</span>
          <strong>Por confirmar</strong>
        </div>
      `;
  }

  openReusableModal("#confirmActionModal");
}

function openSuccessActionModal({
  title = "Operación realizada",
  text = "La información fue registrada correctamente."
}) {
  setReusableText("#successActionTitle", title);
  setReusableText("#successActionText", text);

  openReusableModal("#successActionModal");
}

function openWarningActionModal({
  title = "Revisión requerida",
  text = "Hay información pendiente o campos que necesitan validación."
}) {
  setReusableText("#warningActionTitle", title);
  setReusableText("#warningActionText", text);

  openReusableModal("#warningActionModal");
}

function openErrorActionModal({
  title = "No se pudo completar la acción",
  text = "Ocurrió un problema al procesar la solicitud."
}) {
  setReusableText("#errorActionTitle", title);
  setReusableText("#errorActionText", text);

  openReusableModal("#errorActionModal");
}

function openDeleteActionModal({
  title = "¿Deseas eliminar este registro?",
  text = "Esta acción puede afectar la información asociada.",
  recordName = "Registro seleccionado",
  onDelete = null
}) {
  reusableDeleteCallback = onDelete;

  setReusableText("#deleteActionTitle", title);
  setReusableText("#deleteActionText", text);
  setReusableText("#deleteActionName", recordName);

  openReusableModal("#deleteActionModal");
}

function openPreviewActionModal({
  title = "Vista previa",
  text = "Revisa la información antes de continuar.",
  items = [],
  onConfirm = null
}) {
  reusablePreviewCallback = onConfirm;

  setReusableText("#previewActionTitle", title);
  setReusableText("#previewActionText", text);

  const content = document.querySelector("#previewActionContent");

  if (content) {
    content.innerHTML = items.length
      ? items.map((item) => {
          return `
            <article>
              <strong>${item.label}</strong>
              <p>${item.value}</p>
            </article>
          `;
        }).join("")
      : `
        <article>
          <strong>Sin datos</strong>
          <p>No se encontró información para mostrar.</p>
        </article>
      `;
  }

  openReusableModal("#previewActionModal");
}

function openLoadingActionModal({
  title = "Procesando solicitud",
  text = "Estamos registrando la información. Por favor espera unos segundos."
}) {
  setReusableText("#loadingActionTitle", title);
  setReusableText("#loadingActionText", text);

  openReusableModal("#loadingActionModal");
}

function openAiActionModal({
  title = "Análisis inteligente",
  text = "La IA ha generado una recomendación para esta operación.",
  recommendations = []
}) {
  setReusableText("#aiActionTitle", title);
  setReusableText("#aiActionText", text);

  const container = document.querySelector("#aiActionRecommendations");

  if (container) {
    container.innerHTML = recommendations.length
      ? recommendations.map((item) => {
          return `
            <article>
              <strong>${item.title}</strong>
              <p>${item.text}</p>
            </article>
          `;
        }).join("")
      : `
        <article>
          <strong>Recomendación</strong>
          <p>Verifica los datos principales antes de confirmar la acción.</p>
        </article>
      `;
  }

  openReusableModal("#aiActionModal");
}

function setReusableText(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}