"use strict";

/* =========================================================
   ESTADO GLOBAL
========================================================= */

const AdvisorState = {
  theme: localStorage.getItem("claro360-theme") || "light",
  dashboardData: null,
  currentSearch: ""
};

/* =========================================================
   MOCK DATA - ELIMINAR CUANDO SE CONECTE AL BACKEND
   Datos solo para visualizar y probar el frontend.
========================================================= */

const MockAdvisorDashboard = {
  asesor: {
    id: 1,
    nombre: "Asesor Demo",
    iniciales: "AD",
    rol: "Asesor de Atención",
    turno: "Turno mañana",
    estado: "Disponible",
    ultimoAcceso: "Último acceso: hoy 08:10"
  },

  indicadores: [
    {
      icono: "📥",
      valor: 14,
      titulo: "Casos asignados",
      descripcion: "En tu bandeja actual"
    },
    {
      icono: "⏱️",
      valor: 4,
      titulo: "Riesgo SLA",
      descripcion: "Requieren prioridad"
    },
    {
      icono: "💬",
      valor: 3,
      titulo: "Pendientes por cliente",
      descripcion: "Esperando respuesta"
    },
    {
      icono: "✅",
      valor: 8,
      titulo: "Atendidos hoy",
      descripcion: "Acciones registradas"
    }
  ],

  casosPrioritarios: [
    {
      id: 501,
      codigo: "CAS-2026-000245",
      icono: "⚠️",
      tipo: "Incidencia",
      cliente: "Cliente Empresa Demo",
      titulo: "Correo corporativo no disponible",
      descripcion: "Cliente empresarial reporta error de acceso en correo corporativo.",
      servicio: "Correo empresa",
      estado: "En atención",
      estadoTipo: "warning",
      prioridad: "Crítica",
      sla: "01h 20m",
      canal: "Portal empresas"
    },
    {
      id: 502,
      codigo: "CAS-2026-000123",
      icono: "📝",
      tipo: "Reclamo",
      cliente: "Cliente Persona Demo",
      titulo: "Lentitud recurrente en Internet hogar",
      descripcion: "Reclamo por bajo rendimiento del servicio en horario nocturno.",
      servicio: "Internet hogar",
      estado: "En atención",
      estadoTipo: "info",
      prioridad: "Alta",
      sla: "05h 42m",
      canal: "Web"
    },
    {
      id: 503,
      codigo: "CAS-2026-000184",
      icono: "💬",
      tipo: "Incidencia",
      cliente: "Cliente Persona Demo",
      titulo: "Cliente debe adjuntar evidencia",
      descripcion: "Se solicitó evidencia adicional para continuar el diagnóstico.",
      servicio: "Red móvil",
      estado: "Pendiente por cliente",
      estadoTipo: "purple",
      prioridad: "Media",
      sla: "12h 15m",
      canal: "App"
    }
  ],

  resumenIA: [
    {
      titulo: "Prioridad inmediata",
      texto: "Atiende primero el caso empresarial de correo corporativo por prioridad crítica y menor SLA restante."
    },
    {
      titulo: "Pendientes por cliente",
      texto: "Hay casos que no requieren acción directa hasta que el cliente adjunte evidencia."
    },
    {
      titulo: "Recomendación operativa",
      texto: "Registra avances claros, solicita evidencias específicas y evita cierres sin sustento."
    }
  ],

  actividad: [
    {
      icono: "✍️",
      titulo: "Actualización registrada",
      descripcion: "Se agregó avance técnico al caso CAS-2026-000123.",
      fecha: "Hoy 09:40"
    },
    {
      icono: "💬",
      titulo: "Solicitud enviada",
      descripcion: "Se solicitó evidencia al cliente para continuar la atención.",
      fecha: "Hoy 09:05"
    },
    {
      icono: "✅",
      titulo: "Caso cerrado",
      descripcion: "Se registró respuesta final en reclamo de facturación.",
      fecha: "Ayer 17:30"
    }
  ],

  alertasSla: [
    {
      codigo: "CAS-2026-000245",
      titulo: "Correo corporativo no disponible",
      riesgo: "Crítico",
      restante: "01h 20m",
      porcentaje: 85,
      color: "var(--danger)"
    },
    {
      codigo: "CAS-2026-000123",
      titulo: "Lentitud Internet hogar",
      riesgo: "Medio",
      restante: "05h 42m",
      porcentaje: 58,
      color: "var(--warning)"
    },
    {
      codigo: "CAS-2026-000184",
      titulo: "Intermitencia móvil",
      riesgo: "Bajo",
      restante: "12h 15m",
      porcentaje: 32,
      color: "var(--success)"
    }
  ],

  colaTrabajo: [
    {
      estado: "Nuevo",
      casos: [
        {
          codigo: "CAS-2026-000301",
          titulo: "Consulta por recibo",
          prioridad: "Media"
        },
        {
          codigo: "CAS-2026-000302",
          titulo: "Falla en TV+",
          prioridad: "Baja"
        }
      ]
    },
    {
      estado: "En atención",
      casos: [
        {
          codigo: "CAS-2026-000245",
          titulo: "Correo corporativo no disponible",
          prioridad: "Crítica"
        },
        {
          codigo: "CAS-2026-000123",
          titulo: "Lentitud Internet hogar",
          prioridad: "Alta"
        }
      ]
    },
    {
      estado: "Pendiente cliente",
      casos: [
        {
          codigo: "CAS-2026-000184",
          titulo: "Intermitencia móvil",
          prioridad: "Media"
        }
      ]
    },
    {
      estado: "Listo para cierre",
      casos: [
        {
          codigo: "CAS-2026-000097",
          titulo: "Cobro no reconocido",
          prioridad: "Media"
        }
      ]
    }
  ]
};

/* =========================================================
   API LAYER - CAMBIAR AQUÍ CUANDO EXISTA BACKEND
========================================================= */

const AdvisorApi = {
  async getDashboard() {
    await delay(500);

    return MockAdvisorDashboard;

    /*
    const response = await fetch("/api/asesor/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar el dashboard del asesor");
    }

    return await response.json();
    */
  }
};

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(AdvisorState.theme);
  bindLayout();
  bindTheme();
  bindUserMenu();
  bindSearch();
  bindBot();
  bindModals();
  bindLogout();

  const page = document.body.dataset.page;

  if (page === "asesor-dashboard") {
    loadAdvisorDashboard();
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

async function loadAdvisorDashboard() {
  try {
    renderAdvisorLoading();

    const data = await AdvisorApi.getDashboard();

    AdvisorState.dashboardData = data;

    renderAdvisorDashboard(data);
  } catch (error) {
    openGenericModal({
      icon: "!",
      title: "Error al cargar",
      text: "No se pudo cargar el dashboard del asesor."
    });
  }
}

function renderAdvisorLoading() {
  setText("#welcomeTitle", "Cargando bandeja operativa...");
  setText("#welcomeMessage", "Estamos preparando tu panel de atención.");
}

function renderAdvisorDashboard(data) {
  renderAdvisorUser(data.asesor);
  renderAdvisorWelcome(data.asesor);
  renderAdvisorKpis(data.indicadores);
  renderPriorityCases(data.casosPrioritarios);
  renderAdvisorAiSummary(data.resumenIA);
  renderAdvisorActivity(data.actividad);
  renderAdvisorSla(data.alertasSla);
  renderQueueBoard(data.colaTrabajo);
}

function renderAdvisorUser(user) {
  setText("#userAvatar", user.iniciales);
  setText("#userNameTop", user.nombre);
  setText("#userRoleTop", user.rol);
}

function renderAdvisorWelcome(user) {
  setText("#advisorShift", user.turno);
  setText("#welcomeTitle", `Hola, ${user.nombre}`);
  setText(
    "#welcomeMessage",
    "Desde este panel puedes revisar tu carga asignada, atender casos, solicitar información al cliente, actualizar avances y controlar riesgos SLA."
  );
  setText("#advisorStatus", user.estado);
  setText("#advisorLastAccess", user.ultimoAcceso);
}

function renderAdvisorKpis(items) {
  const grid = $("#advisorKpiGrid");
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

  const assigned = items.find((item) => item.titulo === "Casos asignados");
  setText("#sidebarAssignedCount", assigned ? assigned.valor : "");
}

function renderPriorityCases(cases) {
  const list = $("#priorityCasesList");
  if (!list) return;

  list.innerHTML = cases
    .map((caso) => {
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
            </div>
          </div>

          <div>
            <span class="status-pill status-pill--${caso.estadoTipo}">
              ${caso.estado}
            </span>
            <button type="button" data-case-id="${caso.id}">
              Abrir
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  $all("[data-case-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.caseId);
      const caso = cases.find((item) => item.id === id);

      if (caso) {
        openCaseModal(caso);
      }
    });
  });
}

function renderAdvisorAiSummary(items) {
  const container = $("#advisorAiSummary");
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

function renderAdvisorActivity(items) {
  const container = $("#advisorActivityTimeline");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <div class="activity-item">
          <span class="activity-icon">${item.icono}</span>
          <div class="activity-content">
            <strong>${item.titulo}</strong>
            <p>${item.descripcion}</p>
            <small>${item.fecha}</small>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderAdvisorSla(items) {
  const container = $("#advisorSlaList");
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

            <span class="status-pill ${item.riesgo === "Crítico" ? "status-pill--danger" : item.riesgo === "Medio" ? "status-pill--warning" : "status-pill--success"}">
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

function renderQueueBoard(columns) {
  const board = $("#queueBoard");
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
                  <span class="status-pill status-pill--info">
                    ${caso.prioridad}
                  </span>
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
   MODAL CASO
========================================================= */

function openCaseModal(caso) {
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

  $("#refreshActivityBtn")?.addEventListener("click", () => {
    if (AdvisorState.dashboardData) {
      renderAdvisorActivity(AdvisorState.dashboardData.actividad);
    }

    showToast({
      title: "Actividad actualizada",
      message: "Se refrescó el historial operativo.",
      type: "success"
    });
  });

  $("#refreshSlaBtn")?.addEventListener("click", () => {
    if (AdvisorState.dashboardData) {
      renderAdvisorSla(AdvisorState.dashboardData.alertasSla);
    }

    showToast({
      title: "SLA actualizado",
      message: "Se actualizaron las alertas de vencimiento.",
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
   TEMA
========================================================= */

function bindTheme() {
  $("#themeToggle")?.addEventListener("click", () => {
    const next = AdvisorState.theme === "light" ? "dark" : "light";
    applyTheme(next);

    showToast({
      title: "Tema actualizado",
      message: `Se activó el modo ${next === "dark" ? "oscuro" : "claro"}.`,
      type: "success"
    });
  });
}

function applyTheme(theme) {
  AdvisorState.theme = theme;
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
   BUSCADOR
========================================================= */

function bindSearch() {
  $("#globalSearchBtn")?.addEventListener("click", openSearch);
  $("#closeSearchBtn")?.addEventListener("click", closeSearch);

  $("#globalSearchInput")?.addEventListener("input", (event) => {
    AdvisorState.currentSearch = event.target.value.trim().toLowerCase();
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
  const data = AdvisorState.dashboardData;

  if (!container || !data) return;

  const q = AdvisorState.currentSearch;

  const cases = data.casosPrioritarios.map((item) => ({
    icon: item.icono,
    title: item.codigo,
    text: `${item.cliente} · ${item.titulo}`,
    href: "detalle-atencion.html",
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

  $("#analyzeAdvisorWorkBtn")?.addEventListener("click", () => {
    openBot();
    addBotMessage("Prioriza mi bandeja", "user");

    setTimeout(() => {
      addBotMessage(generateBotResponse("prioriza mi bandeja"), "bot");
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
  message.textContent = "Asistente IA está analizando la carga operativa...";

  container?.appendChild(message);

  if (container) {
    container.scrollTop = container.scrollHeight;
  }

  return message;
}

function generateBotResponse(prompt) {
  const text = prompt.toLowerCase();
  const data = AdvisorState.dashboardData;

  if (!data) {
    return "Aún estoy cargando tu información operativa. Intenta nuevamente en unos segundos.";
  }

  if (text.includes("prioriza")) {
    return "Prioriza primero los casos críticos con menor SLA restante. En este momento el caso CAS-2026-000245 debe atenderse antes que los demás.";
  }

  if (text.includes("sla")) {
    return "El principal riesgo SLA está en el caso CAS-2026-000245, con prioridad crítica y poco tiempo restante.";
  }

  if (text.includes("responder")) {
    return "Para responder al cliente, usa una estructura clara: confirmar recepción, explicar acción realizada, solicitar evidencia concreta si falta información y cerrar con el siguiente paso.";
  }

  return "Puedo ayudarte a priorizar casos, identificar riesgos SLA, redactar respuestas o resumir la atención.";
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
   PÁGINAS ASESOR: BANDEJA, DETALLE, ACTUALIZAR
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "asesor-bandeja") {
    initAdvisorQueuePage();
  }

  if (page === "asesor-detalle-atencion") {
    initAttentionDetailPage();
  }

  if (page === "asesor-actualizar-caso") {
    initAdvisorUpdatePage();
  }
});

/* =========================================================
   MOCK DATA - ELIMINAR CUANDO SE CONECTE AL BACKEND
========================================================= */

const MockAdvisorCases = [
  {
    id: 501,
    codigo: "CAS-2026-000245",
    icono: "⚠️",
    tipo: "Incidencia",
    cliente: "Cliente Empresa Demo",
    documento: "RUC 20123456789",
    titulo: "Correo corporativo no disponible",
    descripcion: "Cliente empresarial reporta error de acceso en correo corporativo.",
    servicio: "Correo empresa",
    estado: "En atención",
    estadoTipo: "warning",
    prioridad: "Crítica",
    sla: "01h 20m",
    canal: "Portal empresas"
  },
  {
    id: 502,
    codigo: "CAS-2026-000123",
    icono: "📝",
    tipo: "Reclamo",
    cliente: "Cliente Persona Demo",
    documento: "DNI 76543210",
    titulo: "Lentitud recurrente en Internet hogar",
    descripcion: "Reclamo por bajo rendimiento del servicio en horario nocturno.",
    servicio: "Internet hogar",
    estado: "En atención",
    estadoTipo: "info",
    prioridad: "Alta",
    sla: "05h 42m",
    canal: "Web"
  },
  {
    id: 503,
    codigo: "CAS-2026-000184",
    icono: "💬",
    tipo: "Incidencia",
    cliente: "Cliente Persona Demo",
    documento: "DNI 76543210",
    titulo: "Cliente debe adjuntar evidencia",
    descripcion: "Se solicitó evidencia adicional para continuar el diagnóstico.",
    servicio: "Red móvil",
    estado: "Pendiente por cliente",
    estadoTipo: "purple",
    prioridad: "Media",
    sla: "12h 15m",
    canal: "App"
  },
  {
    id: 504,
    codigo: "CAS-2026-000333",
    icono: "✅",
    tipo: "Reclamo",
    cliente: "Cliente Demo",
    documento: "DNI 70000000",
    titulo: "Respuesta final preparada",
    descripcion: "El caso ya cuenta con sustento y puede pasar a cierre.",
    servicio: "Facturación",
    estado: "Listo para cierre",
    estadoTipo: "success",
    prioridad: "Media",
    sla: "Cierre pendiente",
    canal: "Call center"
  }
];

const MockAttentionDetail = {
  caso: {
    codigo: "CAS-2026-000245",
    icono: "⚠️",
    tipo: "Incidencia",
    cliente: "Cliente Empresa Demo",
    documento: "RUC 20123456789",
    titulo: "Correo corporativo no disponible",
    descripcion: "Cliente empresarial reporta error de acceso en correo corporativo desde primeras horas del día.",
    servicio: "Correo empresa",
    estado: "En atención",
    estadoTipo: "warning",
    prioridad: "Crítica",
    sla: "01h 20m",
    canal: "Portal empresas",
    responsable: "Asesor Demo"
  },

  cliente: {
    nombre: "Cliente Empresa Demo",
    documento: "RUC 20123456789",
    segmento: "Empresa",
    contacto: "soporte.empresa@demo.com",
    telefono: "+51 999 000 111",
    contrato: "Contrato B2B activo"
  },

  historial: [
    {
      icono: "📥",
      titulo: "Caso recibido",
      descripcion: "El caso ingresó por portal empresas.",
      fecha: "Hoy 08:10"
    },
    {
      icono: "🏷️",
      titulo: "Clasificación aplicada",
      descripcion: "Se clasificó como incidencia crítica de correo empresarial.",
      fecha: "Hoy 08:18"
    },
    {
      icono: "🎧",
      titulo: "Asignado a asesor",
      descripcion: "El caso fue asignado a la bandeja operativa.",
      fecha: "Hoy 08:25"
    },
    {
      icono: "🔎",
      titulo: "Revisión iniciada",
      descripcion: "Se inició validación técnica y revisión de evidencias.",
      fecha: "Hoy 08:45"
    }
  ],

  evidencias: [
    {
      icono: "📷",
      nombre: "captura_error_correo.png",
      detalle: "Subido por cliente · Hoy 08:12"
    },
    {
      icono: "📄",
      nombre: "usuarios_afectados.xlsx",
      detalle: "Subido por cliente · Hoy 08:14"
    }
  ],

  resumenIA: [
    {
      titulo: "Prioridad",
      texto: "Caso crítico por tratarse de un servicio empresarial con impacto operativo."
    },
    {
      titulo: "Siguiente paso",
      texto: "Validar usuarios afectados, revisar evidencia y registrar derivación técnica si corresponde."
    },
    {
      titulo: "Riesgo SLA",
      texto: "Alto. El caso tiene poco tiempo restante para respuesta inicial."
    }
  ],

  checklist: [
    {
      icono: "✅",
      titulo: "Evidencia recibida",
      texto: "El cliente adjuntó capturas y listado de usuarios."
    },
    {
      icono: "⏱️",
      titulo: "SLA crítico",
      texto: "Se debe registrar avance antes del vencimiento."
    },
    {
      icono: "🧩",
      titulo: "Impacto validado",
      texto: "Pendiente confirmar si afecta a todos los usuarios."
    },
    {
      icono: "📨",
      titulo: "Respuesta pendiente",
      texto: "Falta comunicar siguiente paso al cliente."
    }
  ]
};

/* =========================================================
   API LAYER - CAMBIAR AQUÍ CUANDO EXISTA BACKEND
========================================================= */

const AdvisorCasesApi = {
  async getAssignedCases() {
    await delay(400);
    return MockAdvisorCases;

    /*
    const response = await fetch("/api/asesor/casos-asignados", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });

    return await response.json();
    */
  },

  async getAttentionDetail() {
    await delay(400);
    return MockAttentionDetail;

    /*
    const response = await fetch("/api/asesor/casos/{id}", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });

    return await response.json();
    */
  },

  async updateCase(payload) {
    await delay(700);

    return {
      ok: true,
      codigo: payload.caseCode || "CAS-2026-000245",
      estado: payload.status,
      operacion: "Actualización de atención"
    };

    /*
    const response = await fetch("/api/asesor/casos/{id}/actualizaciones", {
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
   BANDEJA ASIGNADA
========================================================= */

let AdvisorQueueState = {
  cases: [],
  filter: "todos",
  search: ""
};

async function initAdvisorQueuePage() {
  bindAdvisorQueueEvents();

  const cases = await AdvisorCasesApi.getAssignedCases();

  AdvisorQueueState.cases = cases;

  renderAdvisorQueue();
  renderAdvisorQueueAiSummary(cases);
}

function bindAdvisorQueueEvents() {
  $("#advisorQueueSearch")?.addEventListener("input", (event) => {
    AdvisorQueueState.search = event.target.value.trim().toLowerCase();
    renderAdvisorQueue();
  });

  $all("[data-advisor-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      AdvisorQueueState.filter = button.dataset.advisorFilter || "todos";

      $all("[data-advisor-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      renderAdvisorQueue();
    });
  });

  $("#refreshQueueBtn")?.addEventListener("click", async () => {
    AdvisorQueueState.cases = await AdvisorCasesApi.getAssignedCases();
    renderAdvisorQueue();

    showToast({
      title: "Bandeja actualizada",
      message: "Se actualizó la lista de casos asignados.",
      type: "success"
    });
  });

  $("#exportQueueBtn")?.addEventListener("click", () => {
    openGenericModal({
      icon: "📄",
      title: "Exportación preparada",
      text: "Cuando se conecte el backend, se generará un archivo con la bandeja filtrada."
    });
  });

  $("#prioritizeQueueBtn")?.addEventListener("click", () => {
    openGenericModal({
      icon: "🤖",
      title: "Priorización IA",
      text: "Atiende primero los casos críticos con menor SLA restante y luego los de prioridad alta en atención."
    });
  });

  $("#analyzeQueueBtn")?.addEventListener("click", () => {
    openBot();
    addBotMessage("Prioriza mi bandeja", "user");

    setTimeout(() => {
      addBotMessage(generateBotResponse("prioriza mi bandeja"), "bot");
    }, 500);
  });
}

function renderAdvisorQueue() {
  const list = $("#advisorQueueList");
  const empty = $("#emptyAdvisorQueueState");

  if (!list || !empty) return;

  const filtered = getFilteredAdvisorQueue();

  setText("#queueSummaryStatus", `${filtered.length} casos visibles`);
  setText("#queueSummaryText", `Filtro activo: ${AdvisorQueueState.filter}`);
  setText("#sidebarAssignedCount", AdvisorQueueState.cases.length);

  if (!filtered.length) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  list.innerHTML = filtered
    .map((caso) => {
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
            <button type="button" data-advisor-case-id="${caso.id}">
              Abrir
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  $all("[data-advisor-case-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.advisorCaseId);
      const caso = AdvisorQueueState.cases.find((item) => item.id === id);

      if (caso) openCaseModal(caso);
    });
  });
}

function getFilteredAdvisorQueue() {
  return AdvisorQueueState.cases.filter((caso) => {
    const q = AdvisorQueueState.search;

    const matchesSearch =
      !q ||
      caso.codigo.toLowerCase().includes(q) ||
      caso.cliente.toLowerCase().includes(q) ||
      caso.titulo.toLowerCase().includes(q) ||
      caso.servicio.toLowerCase().includes(q) ||
      caso.estado.toLowerCase().includes(q) ||
      caso.prioridad.toLowerCase().includes(q);

    const filter = AdvisorQueueState.filter;

    const matchesFilter =
      filter === "todos" ||
      caso.prioridad === filter ||
      caso.estado === filter;

    return matchesSearch && matchesFilter;
  });
}

function renderAdvisorQueueAiSummary(cases) {
  const container = $("#queueAiSummary");
  if (!container) return;

  const critical = cases.filter((item) => item.prioridad === "Crítica").length;
  const high = cases.filter((item) => item.prioridad === "Alta").length;
  const pending = cases.filter((item) => item.estado === "Pendiente por cliente").length;

  container.innerHTML = `
    <div class="ai-summary-item">
      <strong>Críticos</strong>
      <p>${critical} caso(s) requieren atención inmediata por prioridad crítica.</p>
    </div>

    <div class="ai-summary-item">
      <strong>Alta prioridad</strong>
      <p>${high} caso(s) deben mantenerse en seguimiento cercano.</p>
    </div>

    <div class="ai-summary-item">
      <strong>Pendientes por cliente</strong>
      <p>${pending} caso(s) dependen de información del cliente.</p>
    </div>
  `;
}

/* =========================================================
   DETALLE DE ATENCIÓN
========================================================= */

async function initAttentionDetailPage() {
  const detail = await AdvisorCasesApi.getAttentionDetail();

  renderAttentionDetail(detail);

  $("#attentionAiBtn")?.addEventListener("click", () => {
    openGenericModal({
      icon: "🤖",
      title: "Resumen IA",
      text: "El caso es crítico, tiene impacto empresarial y requiere avance antes del vencimiento de SLA."
    });
  });

  $("#attentionOpenBotBtn")?.addEventListener("click", openBot);

  $("#refreshAttentionHistoryBtn")?.addEventListener("click", async () => {
    const updated = await AdvisorCasesApi.getAttentionDetail();
    renderAttentionHistory(updated.historial);

    showToast({
      title: "Historial actualizado",
      message: "Se actualizó la línea de tiempo de atención.",
      type: "success"
    });
  });
}

function renderAttentionDetail(detail) {
  const caso = detail.caso;

  setText("#attentionCaseType", caso.tipo);
  setText("#attentionCaseTitle", `${caso.codigo} · ${caso.titulo}`);
  setText("#attentionCaseDescription", caso.descripcion);
  setText("#attentionCaseStatus", caso.estado);

  const status = $("#attentionCaseStatus");
  if (status) {
    status.className = `status-pill status-pill--${caso.estadoTipo}`;
  }

  const meta = $("#attentionCaseMeta");
  if (meta) {
    meta.innerHTML = `
      <span>${caso.cliente}</span>
      <span>${caso.documento}</span>
      <span>${caso.servicio}</span>
      <span>Prioridad ${caso.prioridad}</span>
      <span>SLA: ${caso.sla}</span>
      <span>${caso.canal}</span>
    `;
  }

  renderCustomerInfo(detail.cliente);
  renderAttentionHistory(detail.historial);
  renderAttentionEvidence(detail.evidencias);
  renderAttentionAiSummary(detail.resumenIA);
  renderAttentionChecklist(detail.checklist);
}

function renderCustomerInfo(cliente) {
  const grid = $("#customerInfoGrid");
  if (!grid) return;

  const rows = [
    ["Cliente", cliente.nombre],
    ["Documento", cliente.documento],
    ["Segmento", cliente.segmento],
    ["Correo", cliente.contacto],
    ["Teléfono", cliente.telefono],
    ["Contrato", cliente.contrato]
  ];

  grid.innerHTML = rows
    .map(([label, value]) => {
      return `
        <article class="info-card">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `;
    })
    .join("");
}

function renderAttentionHistory(items) {
  const container = $("#attentionHistoryTimeline");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <div class="activity-item">
          <span class="activity-icon">${item.icono}</span>
          <div class="activity-content">
            <strong>${item.titulo}</strong>
            <p>${item.descripcion}</p>
            <small>${item.fecha}</small>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderAttentionEvidence(items) {
  const container = $("#attentionEvidenceList");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <div class="evidence-row">
          <span>${item.icono}</span>
          <div>
            <strong>${item.nombre}</strong>
            <small>${item.detalle}</small>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderAttentionAiSummary(items) {
  const container = $("#attentionAiSummary");
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

function renderAttentionChecklist(items) {
  const container = $("#attentionChecklist");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <article class="check-card">
          <span>${item.icono}</span>
          <strong>${item.titulo}</strong>
          <p>${item.texto}</p>
        </article>
      `;
    })
    .join("");
}

/* =========================================================
   ACTUALIZAR CASO
========================================================= */

function initAdvisorUpdatePage() {
  bindAdvisorFileInput("#updateEvidence", "#updateFileList");
  bindAdvisorUpdateForm();

  $("#updateAnalyzeBtn")?.addEventListener("click", () => {
    const summary = $("#updateSummary")?.value.trim();
    const detail = $("#updateDetail")?.value.trim();

    if (!summary || !detail) {
      openGenericModal({
        icon: "🤖",
        title: "Análisis IA",
        text: "Ingresa un resumen y detalle de atención para analizar la calidad de la actualización."
      });
      return;
    }

    openGenericModal({
      icon: "🤖",
      title: "Análisis IA",
      text: "La actualización es comprensible. Se recomienda confirmar el estado seleccionado y dejar explícito el siguiente paso."
    });
  });

  $("#updateImproveTextBtn")?.addEventListener("click", () => {
    const detail = $("#updateDetail");

    if (!detail || !detail.value.trim()) {
      openGenericModal({
        icon: "✍️",
        title: "Sin texto",
        text: "Escribe primero el detalle de atención para que la IA pueda sugerir mejoras."
      });
      return;
    }

    detail.value =
      "Se realizó la revisión de la información disponible en el caso, validando la evidencia adjunta por el cliente y el estado actual del servicio. Como siguiente paso, se continuará con la verificación técnica correspondiente y se comunicará al cliente el avance registrado.";

    showToast({
      title: "Redacción mejorada",
      message: "Se aplicó una versión más clara y trazable.",
      type: "success"
    });
  });

  $("#updateSaveDraftBtn")?.addEventListener("click", () => {
    showToast({
      title: "Borrador guardado",
      message: "La actualización fue guardada temporalmente en el navegador.",
      type: "success"
    });
  });
}

function bindAdvisorUpdateForm() {
  $("#advisorUpdateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearAdvisorFormErrors();

    const payload = {
      caseCode: $("#updateCaseCode")?.value.trim(),
      status: $("#updateStatus")?.value,
      actionType: $("#updateActionType")?.value,
      visibility: $("#updateVisibility")?.value,
      summary: $("#updateSummary")?.value.trim(),
      detail: $("#updateDetail")?.value.trim(),
      declaration: $("#updateDeclaration")?.checked
    };

    const validation = validateAdvisorUpdatePayload(payload);

    if (!validation.ok) {
      showAdvisorFormErrors(validation.errors);

      showToast({
        title: "Formulario incompleto",
        message: validation.firstMessage,
        type: "warning"
      });

      return;
    }

    setAdvisorButtonLoading("#updateSubmitBtn", true);

    const result = await AdvisorCasesApi.updateCase(payload);

    setAdvisorButtonLoading("#updateSubmitBtn", false);

    if (result.ok) {
      window.location.href = `confirmacion-atencion.html?type=actualizacion&case=${encodeURIComponent(result.codigo)}`;
    }
  });
}

function validateAdvisorUpdatePayload(payload) {
  const errors = {};

  if (!payload.caseCode) errors.updateCaseCode = "Ingresa el código del caso.";
  if (!payload.status) errors.updateStatus = "Selecciona el nuevo estado.";
  if (!payload.actionType) errors.updateActionType = "Selecciona el tipo de acción.";
  if (!payload.visibility) errors.updateVisibility = "Selecciona la visibilidad.";
  if (!payload.summary) errors.updateSummary = "Ingresa el resumen de la acción.";
  if (!payload.detail) errors.updateDetail = "Ingresa el detalle de atención.";
  if (!payload.declaration) errors.updateDeclaration = "Debes confirmar la declaración.";

  return buildAdvisorValidation(errors);
}

/* =========================================================
   UTILIDADES FORMULARIOS ASESOR
========================================================= */

function buildAdvisorValidation(errors) {
  const messages = Object.values(errors);

  return {
    ok: messages.length === 0,
    errors,
    firstMessage: messages[0] || ""
  };
}

function showAdvisorFormErrors(errors) {
  Object.entries(errors).forEach(([key, value]) => {
    const element = $(`#${key}Error`);
    if (element) element.textContent = value;
  });
}

function clearAdvisorFormErrors() {
  $all(".form-error").forEach((item) => {
    item.textContent = "";
  });
}

function bindAdvisorFileInput(inputSelector, listSelector) {
  const input = $(inputSelector);
  const list = $(listSelector);

  if (!input || !list) return;

  input.addEventListener("change", () => {
    const files = Array.from(input.files || []);

    if (!files.length) {
      list.innerHTML = "";
      return;
    }

    list.innerHTML = files
      .map((file) => {
        return `
          <div class="file-chip">
            <span>📎 ${file.name}</span>
            <small>${formatAdvisorFileSize(file.size)}</small>
          </div>
        `;
      })
      .join("");
  });
}

function formatAdvisorFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setAdvisorButtonLoading(selector, value) {
  const button = $(selector);

  if (!button) return;

  button.disabled = value;
  button.classList.toggle("loading", value);
}

/* =========================================================
   PÁGINAS ASESOR: SOLICITAR INFORMACIÓN Y CONFIRMACIÓN
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "asesor-solicitar-informacion") {
    initAdvisorRequestInfoPage();
  }

  if (page === "asesor-confirmacion-atencion") {
    initAdvisorConfirmationPage();
  }
});

/* =========================================================
   API LAYER - SOLICITUD DE INFORMACIÓN
   CAMBIAR AQUÍ CUANDO EXISTA BACKEND
========================================================= */

const AdvisorRequestApi = {
  async sendInformationRequest(payload) {
    await delay(700);

    return {
      ok: true,
      codigo: payload.caseCode || "CAS-2026-000245",
      operacion: "Solicitud de información",
      estado: "Pendiente por cliente",
      payload
    };

    /*
    const response = await fetch("/api/asesor/casos/{id}/solicitudes", {
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
   SOLICITAR INFORMACIÓN
========================================================= */

function initAdvisorRequestInfoPage() {
  bindAdvisorRequestForm();

  $("#requestGenerateTextBtn")?.addEventListener("click", generateRequestMessage);
  $("#requestImproveTextBtn")?.addEventListener("click", improveRequestMessage);
  $("#requestPreviewBtn")?.addEventListener("click", previewRequestMessage);
}

function bindAdvisorRequestForm() {
  $("#advisorRequestForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearAdvisorFormErrors();

    const payload = getRequestPayload();

    const validation = validateRequestPayload(payload);

    if (!validation.ok) {
      showAdvisorFormErrors(validation.errors);

      showToast({
        title: "Formulario incompleto",
        message: validation.firstMessage,
        type: "warning"
      });

      return;
    }

    setAdvisorButtonLoading("#requestSubmitBtn", true);

    const result = await AdvisorRequestApi.sendInformationRequest(payload);

    setAdvisorButtonLoading("#requestSubmitBtn", false);

    if (result.ok) {
      window.location.href = `confirmacion-atencion.html?type=solicitud&case=${encodeURIComponent(result.codigo)}`;
    }
  });
}

function getRequestPayload() {
  return {
    caseCode: $("#requestCaseCode")?.value.trim(),
    channel: $("#requestChannel")?.value,
    type: $("#requestType")?.value,
    deadline: $("#requestDeadline")?.value,
    subject: $("#requestSubject")?.value.trim(),
    message: $("#requestMessage")?.value.trim(),
    allowFiles: $("#requestAllowFiles")?.checked,
    reminder: $("#requestReminder")?.checked,
    pauseFlow: $("#requestPauseFlow")?.checked,
    declaration: $("#requestDeclaration")?.checked
  };
}

function validateRequestPayload(payload) {
  const errors = {};

  if (!payload.caseCode) errors.requestCaseCode = "Ingresa el código del caso.";
  if (!payload.channel) errors.requestChannel = "Selecciona el canal de envío.";
  if (!payload.type) errors.requestType = "Selecciona el tipo de información requerida.";
  if (!payload.deadline) errors.requestDeadline = "Selecciona el plazo de respuesta.";
  if (!payload.subject) errors.requestSubject = "Ingresa el asunto de la solicitud.";
  if (!payload.message) errors.requestMessage = "Ingresa el mensaje para el cliente.";
  if (!payload.declaration) errors.requestDeclaration = "Debes confirmar la declaración.";

  return buildAdvisorValidation(errors);
}

function generateRequestMessage() {
  const type = $("#requestType")?.value;
  const deadline = $("#requestDeadline")?.value;

  const subject = $("#requestSubject");
  const message = $("#requestMessage");

  if (!subject || !message) return;

  const typeText = {
    evidencia: "evidencia adicional",
    datos: "datos del servicio",
    confirmacion: "confirmación del cliente",
    documento: "documento o comprobante",
    prueba: "prueba técnica"
  }[type] || "información adicional";

  const deadlineText = deadline || "el plazo indicado";

  subject.value = `Solicitud de ${typeText} para continuar la atención`;

  message.value =
    `Estimado cliente, para continuar con la atención de su caso necesitamos que nos envíe ${typeText}. ` +
    `Esta información nos permitirá validar correctamente la situación reportada y continuar con el análisis correspondiente. ` +
    `Le agradeceremos responder dentro del plazo de ${deadlineText}.`;

  showToast({
    title: "Mensaje generado",
    message: "Se generó un mensaje base para el cliente.",
    type: "success"
  });
}

function improveRequestMessage() {
  const message = $("#requestMessage");

  if (!message || !message.value.trim()) {
    openGenericModal({
      icon: "✍️",
      title: "Sin mensaje",
      text: "Escribe o genera primero un mensaje para que la IA pueda mejorarlo."
    });
    return;
  }

  message.value =
    "Estimado cliente, para poder continuar con la atención de su caso, necesitamos que nos remita la información o evidencia solicitada. " +
    "Esto nos permitirá validar adecuadamente lo reportado y avanzar con la revisión correspondiente. " +
    "Agradeceremos enviar la información dentro del plazo indicado en la solicitud. Quedamos atentos a su respuesta.";

  showToast({
    title: "Mensaje mejorado",
    message: "Se aplicó una redacción más clara y formal.",
    type: "success"
  });
}

function previewRequestMessage() {
  const payload = getRequestPayload();

  setText(
    "#requestPreviewText",
    payload.message || "Aún no se ha redactado un mensaje para el cliente."
  );

  const summary = $("#requestPreviewSummary");

  if (summary) {
    summary.innerHTML = `
      <div>
        <span>Caso</span>
        <strong>${payload.caseCode || "No indicado"}</strong>
      </div>
      <div>
        <span>Canal</span>
        <strong>${payload.channel || "No seleccionado"}</strong>
      </div>
      <div>
        <span>Tipo</span>
        <strong>${payload.type || "No seleccionado"}</strong>
      </div>
      <div>
        <span>Plazo</span>
        <strong>${payload.deadline || "No seleccionado"}</strong>
      </div>
    `;
  }

  openModal("#requestPreviewModal");
}

/* =========================================================
   CONFIRMACIÓN DE ATENCIÓN
========================================================= */

function initAdvisorConfirmationPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "actualizacion";
  const caseCode = params.get("case") || "CAS-2026-000245";

  const config = {
    actualizacion: {
      title: "Actualización registrada",
      text: "La actualización fue guardada correctamente en el historial del caso.",
      rows: [
        ["Operación", "Actualización de atención"],
        ["Caso", caseCode],
        ["Estado", "Registrado"],
        ["Fecha", new Date().toLocaleString("es-PE")]
      ]
    },
    solicitud: {
      title: "Solicitud enviada",
      text: "La solicitud de información fue enviada al cliente y registrada en el historial del caso.",
      rows: [
        ["Operación", "Solicitud de información"],
        ["Caso", caseCode],
        ["Nuevo estado", "Pendiente por cliente"],
        ["Fecha", new Date().toLocaleString("es-PE")]
      ]
    },
    cierre: {
      title: "Caso preparado para cierre",
      text: "El caso fue actualizado y quedó listo para revisión o cierre según corresponda.",
      rows: [
        ["Operación", "Cierre de atención"],
        ["Caso", caseCode],
        ["Estado", "Listo para cierre"],
        ["Fecha", new Date().toLocaleString("es-PE")]
      ]
    }
  }[type];

  setText("#advisorConfirmationTitle", config.title);
  setText("#advisorConfirmationText", config.text);

  const summary = $("#advisorConfirmationSummary");

  if (summary) {
    summary.innerHTML = config.rows
      .map(([label, value]) => {
        return `
          <div>
            <span>${label}</span>
            <strong>${value}</strong>
          </div>
        `;
      })
      .join("");
  }

  $("#advisorConfirmationBotBtn")?.addEventListener("click", openBot);
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