"use strict";

/* =========================================================
   ESTADO GLOBAL
========================================================= */

const ClienteState = {
  theme: localStorage.getItem("claro360-theme") || "light",
  dashboardData: null,
  currentSearch: ""
};

/* =========================================================
   MOCK DATA - ELIMINAR CUANDO SE CONECTE AL BACKEND
   Estos datos son SOLO para visualizar y probar el frontend.
========================================================= */

const MockClienteDashboard = {
  usuario: {
    id: 1,
    nombre: "Cliente Demo",
    iniciales: "CD",
    tipo: "Cliente Persona",
    segmento: "Personas",
    documento: "76543210",
    estadoCuenta: "Cuenta activa",
    ultimoAcceso: "Último acceso: hoy 09:45"
  },

  indicadores: [
    {
      icono: "🎫",
      valor: 5,
      titulo: "Casos totales",
      descripcion: "Registrados históricamente"
    },
    {
      icono: "⏳",
      valor: 2,
      titulo: "En atención",
      descripcion: "Pendientes de resolución"
    },
    {
      icono: "✅",
      valor: 3,
      titulo: "Resueltos",
      descripcion: "Cerrados correctamente"
    },
    {
      icono: "🔔",
      valor: 4,
      titulo: "Notificaciones",
      descripcion: "Alertas recientes"
    }
  ],

  casosRecientes: [
    {
      id: 101,
      codigo: "CAS-2026-000123",
      tipo: "Reclamo",
      icono: "📝",
      titulo: "Lentitud recurrente en Internet hogar",
      descripcion: "Caso registrado por bajo rendimiento del servicio en horario nocturno.",
      servicio: "Internet hogar",
      estado: "En atención",
      estadoTipo: "info",
      prioridad: "Alta",
      fecha: "21/05/2026",
      sla: "05h 42m"
    },
    {
      id: 102,
      codigo: "CAS-2026-000184",
      tipo: "Incidencia",
      icono: "⚠️",
      titulo: "Intermitencia en servicio móvil",
      descripcion: "Reporte de cortes breves de datos móviles en zona frecuente.",
      servicio: "Red móvil",
      estado: "Pendiente por cliente",
      estadoTipo: "warning",
      prioridad: "Media",
      fecha: "20/05/2026",
      sla: "12h 15m"
    },
    {
      id: 103,
      codigo: "CAS-2026-000097",
      tipo: "Reclamo",
      icono: "💳",
      titulo: "Revisión de cobro no reconocido",
      descripcion: "Solicitud de revisión por cargo observado en recibo mensual.",
      servicio: "Facturación",
      estado: "Resuelto",
      estadoTipo: "success",
      prioridad: "Media",
      fecha: "18/05/2026",
      sla: "Cerrado"
    }
  ],

  resumenIA: [
    {
      titulo: "Caso con acción pendiente",
      texto: "Tienes un caso en estado Pendiente por cliente. Revisa si el asesor solicitó información adicional."
    },
    {
      titulo: "Riesgo SLA",
      texto: "El reclamo de Internet hogar aún está dentro del plazo, pero requiere seguimiento cercano."
    },
    {
      titulo: "Recomendación",
      texto: "Adjunta evidencias claras como capturas, recibos o pruebas de velocidad para acelerar la atención."
    }
  ],

  actividad: [
    {
      icono: "🔎",
      titulo: "Revisión técnica iniciada",
      descripcion: "El asesor inició la revisión del caso de Internet hogar.",
      fecha: "Hoy 09:30"
    },
    {
      icono: "💬",
      titulo: "Solicitud de información",
      descripcion: "Se solicitó evidencia adicional para continuar una incidencia móvil.",
      fecha: "Ayer 18:20"
    },
    {
      icono: "✅",
      titulo: "Caso resuelto",
      descripcion: "Se cerró el reclamo de facturación con respuesta final.",
      fecha: "18/05/2026"
    },
    {
      icono: "📝",
      titulo: "Nuevo caso registrado",
      descripcion: "Se registró un reclamo asociado al servicio de internet.",
      fecha: "17/05/2026"
    }
  ],

  notificaciones: [
    {
      id: 1,
      icono: "🔔",
      titulo: "Actualización de caso",
      mensaje: "Tu caso CAS-2026-000123 cambió a En atención.",
      fecha: "Hace 15 min",
      leida: false
    },
    {
      id: 2,
      icono: "💬",
      titulo: "Información requerida",
      mensaje: "El asesor solicitó evidencia adicional para continuar.",
      fecha: "Ayer",
      leida: false
    },
    {
      id: 3,
      icono: "✅",
      titulo: "Caso resuelto",
      mensaje: "Tu reclamo de facturación fue resuelto.",
      fecha: "18/05/2026",
      leida: true
    }
  ],

  servicios: [
    {
      icono: "📱",
      nombre: "Línea móvil",
      descripcion: "Servicio móvil asociado a la cuenta.",
      estado: "Operativo",
      estadoTipo: "success",
      codigo: "SRV-MOV-001"
    },
    {
      icono: "🏠",
      nombre: "Internet hogar",
      descripcion: "Servicio hogar vinculado para reclamos técnicos.",
      estado: "Intermitencia",
      estadoTipo: "warning",
      codigo: "SRV-HOG-002"
    },
    {
      icono: "📺",
      nombre: "Claro TV+",
      descripcion: "Servicio de televisión asociado.",
      estado: "Operativo",
      estadoTipo: "success",
      codigo: "SRV-TV-003"
    },
    {
      icono: "💳",
      nombre: "Facturación",
      descripcion: "Recibos, pagos y cargos vinculados.",
      estado: "Disponible",
      estadoTipo: "info",
      codigo: "FAC-CLI-004"
    }
  ]
};

/* =========================================================
   API LAYER - CAMBIAR AQUÍ CUANDO EXISTA BACKEND
========================================================= */

const ClienteApi = {
  async getDashboard() {
    await delay(500);

    return MockClienteDashboard;

    /*
    const response = await fetch("/api/cliente/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar el dashboard del cliente");
    }

    return await response.json();
    */
  }
};

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(ClienteState.theme);
  bindLayout();
  bindTheme();
  bindUserMenu();
  bindSearch();
  bindBot();
  bindModals();
  bindLogout();
  loadDashboard();
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
   CARGA DASHBOARD
========================================================= */

async function loadDashboard() {
  try {
    renderLoadingState();

    const data = await ClienteApi.getDashboard();

    ClienteState.dashboardData = data;

    renderDashboard(data);
  } catch (error) {
    openGenericModal({
      icon: "!",
      title: "Error al cargar",
      text: "No se pudo cargar la información del dashboard. Intenta nuevamente."
    });
  }
}

function renderLoadingState() {
  setText("#welcomeTitle", "Cargando información...");
  setText("#welcomeMessage", "Estamos preparando tu panel personalizado.");
}

function renderDashboard(data) {
  renderUser(data.usuario);
  renderWelcome(data.usuario);
  renderKpis(data.indicadores);
  renderRecentCases(data.casosRecientes);
  renderAiSummary(data.resumenIA);
  renderActivity(data.actividad);
  renderNotifications(data.notificaciones);
  renderServices(data.servicios);
}

function renderUser(user) {
  setText("#userNameTop", user.nombre);
  setText("#userTypeTop", user.tipo);
  setText("#userAvatar", user.iniciales);
}

function renderWelcome(user) {
  setText("#welcomeSegment", user.segmento);
  setText("#welcomeTitle", `Hola, ${user.nombre}`);
  setText(
    "#welcomeMessage",
    "Desde este panel puedes registrar reclamos, reportar incidencias, consultar el seguimiento de tus casos y revisar tus notificaciones."
  );
  setText("#accountStatus", user.estadoCuenta);
  setText("#lastAccess", user.ultimoAcceso);
}

function renderKpis(indicadores) {
  const grid = $("#kpiGrid");
  if (!grid) return;

  grid.innerHTML = indicadores
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

function renderRecentCases(casos) {
  const list = $("#recentCasesList");
  const empty = $("#emptyCasesState");

  if (!list || !empty) return;

  if (!casos || casos.length === 0) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  list.innerHTML = casos
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
              Ver
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  $all("[data-case-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.caseId);
      const caso = casos.find((item) => item.id === id);

      if (caso) {
        openCaseModal(caso);
      }
    });
  });
}

function renderAiSummary(items) {
  const container = $("#aiSummary");
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

function renderActivity(items) {
  const container = $("#activityTimeline");
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

function renderNotifications(items) {
  const container = $("#notificationsList");
  if (!container) return;

  const unread = items.filter((item) => !item.leida).length;

  setText("#notificationBadge", unread > 0 ? unread : "");
  setText("#sidebarNotificationCount", unread > 0 ? unread : "");

  container.innerHTML = items
    .slice(0, 3)
    .map((item) => {
      return `
        <article class="notification-item">
          <span class="notification-item__icon">${item.icono}</span>

          <div>
            <strong>${item.titulo}</strong>
            <p>${item.mensaje}</p>
            <small>${item.fecha}</small>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderServices(items) {
  const grid = $("#servicesGrid");
  if (!grid) return;

  grid.innerHTML = items
    .map((item) => {
      return `
        <article class="service-card">
          <div class="service-card__top">
            <span class="service-icon">${item.icono}</span>
            <span class="status-pill status-pill--${item.estadoTipo}">
              ${item.estado}
            </span>
          </div>

          <h3>${item.nombre}</h3>
          <p>${item.descripcion}</p>
          <small>${item.codigo}</small>
        </article>
      `;
    })
    .join("");
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
    showToast({
      title: "Actividad actualizada",
      message: "Se refrescó la línea de tiempo del cliente.",
      type: "success"
    });

    if (ClienteState.dashboardData) {
      renderActivity(ClienteState.dashboardData.actividad);
    }
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
    const next = ClienteState.theme === "light" ? "dark" : "light";
    applyTheme(next);

    showToast({
      title: "Tema actualizado",
      message: `Se activó el modo ${next === "dark" ? "oscuro" : "claro"}.`,
      type: "success"
    });
  });
}

function applyTheme(theme) {
  ClienteState.theme = theme;
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
   MODALES
========================================================= */

function openCaseModal(caso) {
  setText("#caseModalIcon", caso.icono);
  setText("#caseModalTitle", caso.codigo);
  setText("#caseModalText", caso.descripcion);

  const summary = $("#caseModalSummary");

  if (summary) {
    summary.innerHTML = `
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
   BUSCADOR
========================================================= */

function bindSearch() {
  $("#globalSearchBtn")?.addEventListener("click", openSearch);
  $("#closeSearchBtn")?.addEventListener("click", closeSearch);

  $("#globalSearchInput")?.addEventListener("input", (event) => {
    ClienteState.currentSearch = event.target.value.trim().toLowerCase();
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
  const data = ClienteState.dashboardData;

  if (!container || !data) return;

  const q = ClienteState.currentSearch;

  const cases = data.casosRecientes.map((item) => ({
    icon: item.icono,
    title: item.codigo,
    text: item.titulo,
    href: "detalle-caso.html",
    keywords: `${item.codigo} ${item.titulo} ${item.estado} ${item.servicio}`.toLowerCase()
  }));

  const services = data.servicios.map((item) => ({
    icon: item.icono,
    title: item.nombre,
    text: item.descripcion,
    href: "../estado-servicios.html",
    keywords: `${item.nombre} ${item.descripcion} ${item.estado}`.toLowerCase()
  }));

  const notifications = data.notificaciones.map((item) => ({
    icon: item.icono,
    title: item.titulo,
    text: item.mensaje,
    href: "notificaciones.html",
    keywords: `${item.titulo} ${item.mensaje}`.toLowerCase()
  }));

  const all = [...cases, ...services, ...notifications];

  const results = q ? all.filter((item) => item.keywords.includes(q)) : all.slice(0, 6);

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
   BOT IA
========================================================= */

function bindBot() {
  $("#openBotSidebar")?.addEventListener("click", openBot);
  $("#openBotWelcome")?.addEventListener("click", openBot);
  $("#askAiAboutCases")?.addEventListener("click", () => {
    openBot();
    addBotMessage("Analiza mis casos", "user");

    setTimeout(() => {
      addBotMessage(generateBotResponse("analiza mis casos"), "bot");
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
  message.textContent = "ClaroBot está analizando tu información...";

  container?.appendChild(message);

  if (container) {
    container.scrollTop = container.scrollHeight;
  }

  return message;
}

function generateBotResponse(prompt) {
  const text = prompt.toLowerCase();
  const data = ClienteState.dashboardData;

  if (!data) {
    return "Aún estoy cargando tu información. Intenta nuevamente en unos segundos.";
  }

  const pending = data.casosRecientes.filter((item) => item.estado !== "Resuelto");
  const needsClient = data.casosRecientes.filter((item) => item.estado === "Pendiente por cliente");

  if (text.includes("resume") || text.includes("analiza")) {
    return `Tienes ${data.casosRecientes.length} casos recientes. ${pending.length} siguen abiertos y ${needsClient.length} requiere acción del cliente. Revisa especialmente los casos con SLA activo.`;
  }

  if (text.includes("pendiente") || text.includes("atención")) {
    if (needsClient.length > 0) {
      return `El caso ${needsClient[0].codigo} requiere tu atención. El asesor solicitó información adicional para continuar.`;
    }

    return "No tienes casos marcados como Pendiente por cliente en este momento.";
  }

  if (text.includes("evidencia")) {
    return "Para acelerar la atención, adjunta capturas, recibos, fotos del equipo, mensajes de error o pruebas de velocidad, según el tipo de caso.";
  }

  return "Puedo ayudarte a resumir tus casos, identificar pendientes, explicar estados o sugerir evidencias.";
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
   PÁGINAS CLIENTE: RECLAMO, INCIDENCIA Y MIS CASOS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "registrar-reclamo") {
    initClaimPage();
  }

  if (page === "registrar-incidencia") {
    initIncidentPage();
  }

  if (page === "mis-casos") {
    initMyCasesPage();
  }
});

/* =========================================================
   MOCK DATA - ELIMINAR CUANDO SE CONECTE AL BACKEND
========================================================= */

const MockAllCasesCliente = [
  {
    id: 101,
    codigo: "CAS-2026-000123",
    tipo: "Reclamo",
    icono: "📝",
    titulo: "Lentitud recurrente en Internet hogar",
    descripcion: "Caso registrado por bajo rendimiento del servicio en horario nocturno.",
    servicio: "Internet hogar",
    estado: "En atención",
    estadoTipo: "info",
    prioridad: "Alta",
    fecha: "21/05/2026",
    sla: "05h 42m"
  },
  {
    id: 102,
    codigo: "CAS-2026-000184",
    tipo: "Incidencia",
    icono: "⚠️",
    titulo: "Intermitencia en servicio móvil",
    descripcion: "Reporte de cortes breves de datos móviles en zona frecuente.",
    servicio: "Red móvil",
    estado: "Pendiente por cliente",
    estadoTipo: "warning",
    prioridad: "Media",
    fecha: "20/05/2026",
    sla: "12h 15m"
  },
  {
    id: 103,
    codigo: "CAS-2026-000097",
    tipo: "Reclamo",
    icono: "💳",
    titulo: "Revisión de cobro no reconocido",
    descripcion: "Solicitud de revisión por cargo observado en recibo mensual.",
    servicio: "Facturación",
    estado: "Resuelto",
    estadoTipo: "success",
    prioridad: "Media",
    fecha: "18/05/2026",
    sla: "Cerrado"
  },
  {
    id: 104,
    codigo: "CAS-2026-000211",
    tipo: "Incidencia",
    icono: "📡",
    titulo: "Problema de señal en zona frecuente",
    descripcion: "El cliente reporta baja señal en una zona habitual.",
    servicio: "Red móvil",
    estado: "En atención",
    estadoTipo: "info",
    prioridad: "Alta",
    fecha: "21/05/2026",
    sla: "08h 30m"
  }
];

/* =========================================================
   API LAYER - CAMBIAR AQUÍ CUANDO EXISTA BACKEND
========================================================= */

const ClienteCasesApi = {
  async createClaim(payload) {
    await delay(700);

    return {
      ok: true,
      codigo: "CAS-2026-RECLAMO-DEMO",
      estado: "Registrado",
      tipo: "Reclamo",
      payload
    };

    /*
    const response = await fetch("/api/cliente/reclamos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
    */
  },

  async createIncident(payload) {
    await delay(700);

    return {
      ok: true,
      codigo: "CAS-2026-INCIDENCIA-DEMO",
      estado: "Registrado",
      tipo: "Incidencia",
      payload
    };

    /*
    const response = await fetch("/api/cliente/incidencias", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
    */
  },

  async getCases() {
    await delay(400);

    return MockAllCasesCliente;

    /*
    const response = await fetch("/api/cliente/casos", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });

    return await response.json();
    */
  }
};

/* =========================================================
   REGISTRAR RECLAMO
========================================================= */

function initClaimPage() {
  bindFileInput("#claimEvidence", "#claimFileList");
  bindClaimForm();

  $("#claimAnalyzeBtn")?.addEventListener("click", () => {
    const title = $("#claimTitle")?.value.trim();
    const description = $("#claimDescription")?.value.trim();

    if (!title || !description) {
      openGenericModal({
        icon: "🤖",
        title: "Análisis IA",
        text: "Para analizar el reclamo, primero ingresa un título y una descripción."
      });
      return;
    }

    openGenericModal({
      icon: "🤖",
      title: "Análisis IA del reclamo",
      text: "El reclamo tiene una estructura válida. Se recomienda adjuntar evidencia y precisar fecha, servicio afectado y solución esperada."
    });
  });

  $("#claimSaveDraft")?.addEventListener("click", () => {
    showToast({
      title: "Borrador guardado",
      message: "El reclamo fue guardado temporalmente en el navegador.",
      type: "success"
    });
  });
}

function bindClaimForm() {
  $("#claimForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearClientFormErrors();

    const payload = {
      service: $("#claimService")?.value,
      category: $("#claimCategory")?.value,
      priority: $("#claimPriority")?.value,
      contact: $("#claimContact")?.value,
      title: $("#claimTitle")?.value.trim(),
      description: $("#claimDescription")?.value.trim(),
      declaration: $("#claimDeclaration")?.checked
    };

    const validation = validateClaimPayload(payload);

    if (!validation.ok) {
      showClientFormErrors(validation.errors);
      showToast({
        title: "Formulario incompleto",
        message: validation.firstMessage,
        type: "warning"
      });
      return;
    }

    setButtonLoading("#claimSubmitBtn", true);

    const result = await ClienteCasesApi.createClaim(payload);

    setButtonLoading("#claimSubmitBtn", false);

    if (result.ok) {
      showSuccessCaseModal(result);
    }
  });
}

function validateClaimPayload(payload) {
  const errors = {};

  if (!payload.service) errors.claimService = "Selecciona el servicio asociado.";
  if (!payload.category) errors.claimCategory = "Selecciona la categoría del reclamo.";
  if (!payload.priority) errors.claimPriority = "Selecciona la prioridad.";
  if (!payload.contact) errors.claimContact = "Selecciona el medio de contacto.";
  if (!payload.title) errors.claimTitle = "Ingresa un título para el reclamo.";
  if (!payload.description) errors.claimDescription = "Describe el reclamo.";
  if (!payload.declaration) errors.claimDeclaration = "Debes aceptar la declaración.";

  return buildValidation(errors);
}

/* =========================================================
   REGISTRAR INCIDENCIA
========================================================= */

function initIncidentPage() {
  bindFileInput("#incidentEvidence", "#incidentFileList");
  bindIncidentForm();

  $("#incidentDiagnosticBtn")?.addEventListener("click", () => {
    const service = $("#incidentService")?.value;
    const symptom = $("#incidentSymptom")?.value;

    if (!service || !symptom) {
      openGenericModal({
        icon: "🤖",
        title: "Diagnóstico IA",
        text: "Selecciona el servicio afectado y el síntoma principal para ejecutar el diagnóstico."
      });
      return;
    }

    openGenericModal({
      icon: "🤖",
      title: "Diagnóstico IA",
      text: getIncidentDiagnosticText(service, symptom)
    });
  });
}

function bindIncidentForm() {
  $("#incidentForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearClientFormErrors();

    const payload = {
      service: $("#incidentService")?.value,
      symptom: $("#incidentSymptom")?.value,
      impact: $("#incidentImpact")?.value,
      urgency: $("#incidentUrgency")?.value,
      address: $("#incidentAddress")?.value.trim(),
      description: $("#incidentDescription")?.value.trim(),
      declaration: $("#incidentDeclaration")?.checked
    };

    const validation = validateIncidentPayload(payload);

    if (!validation.ok) {
      showClientFormErrors(validation.errors);
      showToast({
        title: "Formulario incompleto",
        message: validation.firstMessage,
        type: "warning"
      });
      return;
    }

    setButtonLoading("#incidentSubmitBtn", true);

    const result = await ClienteCasesApi.createIncident(payload);

    setButtonLoading("#incidentSubmitBtn", false);

    if (result.ok) {
      showSuccessCaseModal(result);
    }
  });
}

function validateIncidentPayload(payload) {
  const errors = {};

  if (!payload.service) errors.incidentService = "Selecciona el servicio afectado.";
  if (!payload.symptom) errors.incidentSymptom = "Selecciona el síntoma principal.";
  if (!payload.impact) errors.incidentImpact = "Selecciona el impacto.";
  if (!payload.urgency) errors.incidentUrgency = "Selecciona la urgencia.";
  if (!payload.address) errors.incidentAddress = "Ingresa la ubicación afectada.";
  if (!payload.description) errors.incidentDescription = "Describe la incidencia.";
  if (!payload.declaration) errors.incidentDeclaration = "Debes confirmar la declaración.";

  return buildValidation(errors);
}

function getIncidentDiagnosticText(service, symptom) {
  if (symptom === "sin-servicio") {
    return "La incidencia podría ser crítica si afecta a varios usuarios. Adjunta evidencia y registra hora aproximada de inicio.";
  }

  if (symptom === "lento") {
    return "Se recomienda adjuntar prueba de velocidad, reiniciar el equipo y registrar si la lentitud ocurre en varios dispositivos.";
  }

  if (symptom === "intermitente") {
    return "La intermitencia requiere indicar frecuencia, horarios y evidencia del comportamiento irregular.";
  }

  if (symptom === "error-acceso") {
    return "Adjunta captura del error, usuario afectado y servicio exacto donde ocurre el problema.";
  }

  return "Describe claramente la falla, adjunta evidencia y registra el impacto.";
}

/* =========================================================
   MIS CASOS
========================================================= */

let MyCasesState = {
  filter: "todos",
  search: "",
  cases: []
};

async function initMyCasesPage() {
  bindMyCasesEvents();

  const cases = await ClienteCasesApi.getCases();

  MyCasesState.cases = cases;

  renderAllCases();
  renderCasesAiSummary(cases);
}

function bindMyCasesEvents() {
  $("#casesSearchInput")?.addEventListener("input", (event) => {
    MyCasesState.search = event.target.value.trim().toLowerCase();
    renderAllCases();
  });

  $all("[data-case-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      MyCasesState.filter = button.dataset.caseFilter || "todos";

      $all("[data-case-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      renderAllCases();
    });
  });

  $("#refreshCasesBtn")?.addEventListener("click", async () => {
    MyCasesState.cases = await ClienteCasesApi.getCases();
    renderAllCases();

    showToast({
      title: "Casos actualizados",
      message: "La lista de casos fue actualizada correctamente.",
      type: "success"
    });
  });

  $("#analyzeAllCasesBtn")?.addEventListener("click", () => {
    openBot();
    addBotMessage("Resume mis casos", "user");

    setTimeout(() => {
      addBotMessage(generateBotResponse("resume mis casos"), "bot");
    }, 500);
  });
}

function renderAllCases() {
  const list = $("#allCasesList");
  const empty = $("#emptyAllCasesState");

  if (!list || !empty) return;

  const filtered = getFilteredCases();

  setText("#casesSummaryStatus", `${filtered.length} casos visibles`);
  setText("#casesSummaryText", `Filtro activo: ${MyCasesState.filter}`);

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
              <span>${caso.servicio}</span>
              <span>Prioridad ${caso.prioridad}</span>
              <span>${caso.fecha}</span>
              <span>SLA: ${caso.sla}</span>
            </div>
          </div>

          <div>
            <span class="status-pill status-pill--${caso.estadoTipo}">
              ${caso.estado}
            </span>
            <button type="button" data-my-case-id="${caso.id}">
              Ver
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  $all("[data-my-case-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.myCaseId);
      const caso = MyCasesState.cases.find((item) => item.id === id);

      if (caso) {
        openCaseModal(caso);
      }
    });
  });
}

function getFilteredCases() {
  return MyCasesState.cases.filter((caso) => {
    const q = MyCasesState.search;

    const matchesSearch =
      !q ||
      caso.codigo.toLowerCase().includes(q) ||
      caso.titulo.toLowerCase().includes(q) ||
      caso.servicio.toLowerCase().includes(q) ||
      caso.estado.toLowerCase().includes(q);

    const filter = MyCasesState.filter;

    const matchesFilter =
      filter === "todos" ||
      caso.tipo === filter ||
      caso.estado === filter;

    return matchesSearch && matchesFilter;
  });
}

function renderCasesAiSummary(cases) {
  const container = $("#casesAiSummary");
  if (!container) return;

  const open = cases.filter((item) => item.estado !== "Resuelto").length;
  const pendingClient = cases.filter((item) => item.estado === "Pendiente por cliente").length;
  const resolved = cases.filter((item) => item.estado === "Resuelto").length;

  container.innerHTML = `
    <div class="ai-summary-item">
      <strong>Casos abiertos</strong>
      <p>Tienes ${open} casos abiertos que requieren seguimiento.</p>
    </div>

    <div class="ai-summary-item">
      <strong>Pendientes por cliente</strong>
      <p>${pendingClient} caso(s) requieren una acción o evidencia de tu parte.</p>
    </div>

    <div class="ai-summary-item">
      <strong>Casos resueltos</strong>
      <p>${resolved} caso(s) se encuentran cerrados o resueltos.</p>
    </div>
  `;
}

/* =========================================================
   UTILIDADES FORMULARIOS
========================================================= */

function buildValidation(errors) {
  const messages = Object.values(errors);

  return {
    ok: messages.length === 0,
    errors,
    firstMessage: messages[0] || ""
  };
}

function showClientFormErrors(errors) {
  Object.entries(errors).forEach(([key, value]) => {
    const element = $(`#${key}Error`);
    if (element) element.textContent = value;
  });
}

function clearClientFormErrors() {
  $all(".form-error").forEach((item) => {
    item.textContent = "";
  });
}

function bindFileInput(inputSelector, listSelector) {
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
            <small>${formatFileSize(file.size)}</small>
          </div>
        `;
      })
      .join("");
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setButtonLoading(selector, value) {
  const button = $(selector);

  if (!button) return;

  button.disabled = value;
  button.classList.toggle("loading", value);
}

function showSuccessCaseModal(result) {
  setText("#successCaseText", `Tu ${result.tipo.toLowerCase()} fue registrado correctamente con código ${result.codigo}.`);

  const summary = $("#successCaseSummary");

  if (summary) {
    summary.innerHTML = `
      <div>
        <span>Código</span>
        <strong>${result.codigo}</strong>
      </div>
      <div>
        <span>Tipo</span>
        <strong>${result.tipo}</strong>
      </div>
      <div>
        <span>Estado</span>
        <strong>${result.estado}</strong>
      </div>
      <div>
        <span>Fecha</span>
        <strong>${new Date().toLocaleDateString("es-PE")}</strong>
      </div>
    `;
  }

  openModal("#successCaseModal");
}

/* =========================================================
   PÁGINAS CLIENTE: DETALLE, NOTIFICACIONES, CONFIRMACIÓN
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "detalle-caso") {
    initCaseDetailPage();
  }

  if (page === "notificaciones") {
    initNotificationsPage();
  }

  if (page === "confirmacion-actualizacion") {
    initConfirmationPage();
  }
});

/* =========================================================
   MOCK DATA - ELIMINAR CUANDO SE CONECTE AL BACKEND
========================================================= */

const MockCaseDetailCliente = {
  id: 101,
  codigo: "CAS-2026-000123",
  tipo: "Reclamo",
  icono: "📝",
  titulo: "Lentitud recurrente en Internet hogar",
  descripcion: "Caso registrado por bajo rendimiento del servicio en horario nocturno.",
  servicio: "Internet hogar",
  estado: "En atención",
  estadoTipo: "info",
  prioridad: "Alta",
  fechaRegistro: "21/05/2026",
  sla: "05h 42m",
  responsable: "Atención técnica hogar",
  progreso: [
    { nombre: "Registrado", detalle: "Caso recibido por la plataforma.", estado: "done" },
    { nombre: "Clasificado", detalle: "Se asignó tipo, categoría y prioridad.", estado: "done" },
    { nombre: "Asignado", detalle: "Derivado al equipo responsable.", estado: "done" },
    { nombre: "En atención", detalle: "El asesor revisa la información.", estado: "active" },
    { nombre: "Cierre", detalle: "Pendiente de respuesta final.", estado: "pending" }
  ],
  timeline: [
    {
      icono: "📝",
      titulo: "Caso registrado",
      descripcion: "El reclamo fue ingresado correctamente.",
      fecha: "21/05/2026 08:15"
    },
    {
      icono: "🏷️",
      titulo: "Caso clasificado",
      descripcion: "Se clasificó como reclamo técnico de prioridad alta.",
      fecha: "21/05/2026 08:40"
    },
    {
      icono: "🎧",
      titulo: "Asignado a asesor",
      descripcion: "El caso fue asignado al equipo de atención técnica hogar.",
      fecha: "21/05/2026 09:05"
    },
    {
      icono: "🔎",
      titulo: "Revisión en curso",
      descripcion: "El asesor inició la validación de evidencias y estado del servicio.",
      fecha: "21/05/2026 09:30"
    }
  ],
  evidencias: [
    {
      icono: "📷",
      nombre: "captura_velocidad.png",
      detalle: "Subido por cliente · 21/05/2026"
    },
    {
      icono: "📄",
      nombre: "recibo_servicio.pdf",
      detalle: "Subido por cliente · 21/05/2026"
    }
  ],
  resumenIA: [
    {
      titulo: "Estado actual",
      texto: "El caso se encuentra en atención y aún está dentro del plazo de respuesta."
    },
    {
      titulo: "Acción recomendada",
      texto: "Mantener evidencias disponibles y revisar notificaciones por si el asesor solicita información adicional."
    },
    {
      titulo: "Riesgo SLA",
      texto: "Riesgo medio. El caso requiere seguimiento, pero no está vencido."
    }
  ]
};

const MockNotificationsCliente = [
  {
    id: 1,
    icono: "🔔",
    tipo: "caso",
    titulo: "Actualización de caso",
    mensaje: "Tu caso CAS-2026-000123 cambió a En atención.",
    fecha: "Hace 15 min",
    leida: false,
    accion: "Ver caso"
  },
  {
    id: 2,
    icono: "💬",
    tipo: "caso",
    titulo: "Información requerida",
    mensaje: "El asesor solicitó evidencia adicional para continuar la atención.",
    fecha: "Ayer 18:20",
    leida: false,
    accion: "Responder"
  },
  {
    id: 3,
    icono: "⏱️",
    tipo: "sla",
    titulo: "SLA próximo a vencer",
    mensaje: "Un caso en atención se aproxima a su plazo estimado.",
    fecha: "Ayer 10:00",
    leida: false,
    accion: "Revisar"
  },
  {
    id: 4,
    icono: "✅",
    tipo: "caso",
    titulo: "Caso resuelto",
    mensaje: "Tu reclamo de facturación fue resuelto correctamente.",
    fecha: "18/05/2026",
    leida: true,
    accion: "Ver respuesta"
  },
  {
    id: 5,
    icono: "🛡️",
    tipo: "sistema",
    titulo: "Inicio de sesión seguro",
    mensaje: "Se registró un nuevo acceso a tu cuenta.",
    fecha: "17/05/2026",
    leida: true,
    accion: "Ver detalle"
  }
];

/* =========================================================
   API LAYER - CAMBIAR AQUÍ CUANDO EXISTA BACKEND
========================================================= */

const ClienteDetailApi = {
  async getCaseDetail() {
    await delay(400);
    return MockCaseDetailCliente;

    /*
    const response = await fetch("/api/cliente/casos/{id}", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });
    return await response.json();
    */
  },

  async uploadEvidence(files) {
    await delay(600);
    return { ok: true, files };

    /*
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    const response = await fetch("/api/cliente/casos/{id}/evidencias", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      },
      body: formData
    });

    return await response.json();
    */
  }
};

const ClienteNotificationsApi = {
  async getNotifications() {
    await delay(400);
    return MockNotificationsCliente;

    /*
    const response = await fetch("/api/cliente/notificaciones", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });
    return await response.json();
    */
  },

  async markAllRead() {
    await delay(300);
    return { ok: true };

    /*
    const response = await fetch("/api/cliente/notificaciones/marcar-leidas", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });
    return await response.json();
    */
  }
};

/* =========================================================
   DETALLE DE CASO
========================================================= */

async function initCaseDetailPage() {
  bindFileInput("#detailEvidenceInput", "#detailFileList");

  const detail = await ClienteDetailApi.getCaseDetail();
  renderCaseDetail(detail);

  $("#detailRefreshBtn")?.addEventListener("click", async () => {
    const updated = await ClienteDetailApi.getCaseDetail();
    renderCaseDetail(updated);

    showToast({
      title: "Seguimiento actualizado",
      message: "La información del caso fue actualizada correctamente.",
      type: "success"
    });
  });

  $("#detailAskAiBtn")?.addEventListener("click", () => {
    openGenericModal({
      icon: "🤖",
      title: "Resumen IA del caso",
      text: "El caso está en atención, dentro del plazo y con evidencia suficiente para continuar la revisión."
    });
  });

  $("#detailDownloadBtn")?.addEventListener("click", () => {
    openGenericModal({
      icon: "📄",
      title: "Constancia generada",
      text: "En la versión con backend se descargará una constancia PDF del seguimiento del caso."
    });
  });

  $("#detailOpenBotBtn")?.addEventListener("click", openBot);

  $("#detailSendEvidenceBtn")?.addEventListener("click", async () => {
    const input = $("#detailEvidenceInput");
    const files = Array.from(input?.files || []);

    if (!files.length) {
      openGenericModal({
        icon: "📎",
        title: "Sin archivos",
        text: "Selecciona al menos un archivo para enviarlo como evidencia."
      });
      return;
    }

    const response = await ClienteDetailApi.uploadEvidence(files);

    if (response.ok) {
      window.location.href = "confirmacion-actualizacion.html?type=evidencia";
    }
  });
}

function renderCaseDetail(detail) {
  setText("#detailCaseType", detail.tipo);
  setText("#detailCaseTitle", `${detail.codigo} · ${detail.titulo}`);
  setText("#detailCaseDescription", detail.descripcion);
  setText("#detailCaseStatus", detail.estado);

  const status = $("#detailCaseStatus");
  if (status) {
    status.className = `status-pill status-pill--${detail.estadoTipo}`;
  }

  const meta = $("#detailCaseMeta");
  if (meta) {
    meta.innerHTML = `
      <span>${detail.servicio}</span>
      <span>Prioridad ${detail.prioridad}</span>
      <span>Registro: ${detail.fechaRegistro}</span>
      <span>SLA: ${detail.sla}</span>
      <span>Responsable: ${detail.responsable}</span>
    `;
  }

  renderDetailProgress(detail.progreso);
  renderDetailTimeline(detail.timeline);
  renderDetailEvidence(detail.evidencias);
  renderDetailAiSummary(detail.resumenIA);
}

function renderDetailProgress(items) {
  const container = $("#detailProgress");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <div class="progress-step ${item.estado === "done" ? "done" : ""} ${item.estado === "active" ? "active" : ""}">
          <span></span>
          <strong>${item.nombre}</strong>
          <small>${item.detalle}</small>
        </div>
      `;
    })
    .join("");
}

function renderDetailTimeline(items) {
  const container = $("#detailTimeline");
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

function renderDetailEvidence(items) {
  const container = $("#detailEvidenceList");
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

function renderDetailAiSummary(items) {
  const container = $("#detailAiSummary");
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

/* =========================================================
   NOTIFICACIONES
========================================================= */

let NotificationsState = {
  items: [],
  filter: "todas",
  search: ""
};

async function initNotificationsPage() {
  bindNotificationEvents();

  const items = await ClienteNotificationsApi.getNotifications();

  NotificationsState.items = items;

  renderNotificationsPage();
  renderNotificationsAiSummary();
}

function bindNotificationEvents() {
  $("#notificationsSearchInput")?.addEventListener("input", (event) => {
    NotificationsState.search = event.target.value.trim().toLowerCase();
    renderNotificationsPage();
  });

  $all("[data-notification-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      NotificationsState.filter = button.dataset.notificationFilter || "todas";

      $all("[data-notification-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      renderNotificationsPage();
    });
  });

  $("#refreshNotificationsBtn")?.addEventListener("click", async () => {
    NotificationsState.items = await ClienteNotificationsApi.getNotifications();
    renderNotificationsPage();

    showToast({
      title: "Notificaciones actualizadas",
      message: "Se actualizó el centro de alertas.",
      type: "success"
    });
  });

  $("#markAllReadBtn")?.addEventListener("click", async () => {
    const result = await ClienteNotificationsApi.markAllRead();

    if (result.ok) {
      NotificationsState.items = NotificationsState.items.map((item) => ({
        ...item,
        leida: true
      }));

      renderNotificationsPage();
      renderNotificationsAiSummary();

      showToast({
        title: "Notificaciones leídas",
        message: "Todas las notificaciones fueron marcadas como leídas.",
        type: "success"
      });
    }
  });

  $("#analyzeNotificationsBtn")?.addEventListener("click", () => {
    openBot();
    addBotMessage("Resume mis notificaciones", "user");

    setTimeout(() => {
      addBotMessage("Tienes alertas relacionadas con casos, SLA y solicitudes de información. Prioriza las no leídas.", "bot");
    }, 500);
  });
}

function renderNotificationsPage() {
  const list = $("#notificationsFullList");
  const empty = $("#emptyNotificationsState");

  if (!list || !empty) return;

  const filtered = getFilteredNotifications();
  const unread = NotificationsState.items.filter((item) => !item.leida).length;

  setText("#notificationSummaryStatus", `${filtered.length} notificaciones visibles`);
  setText("#notificationSummaryText", `${unread} notificación(es) no leída(s)`);
  setText("#notificationBadge", unread > 0 ? unread : "");
  setText("#sidebarNotificationCount", unread > 0 ? unread : "");

  if (!filtered.length) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  list.innerHTML = filtered
    .map((item) => {
      return `
        <article class="notification-full-item ${item.leida ? "" : "unread"}">
          <span class="notification-full-icon">${item.icono}</span>

          <div>
            <h3>${item.titulo}</h3>
            <p>${item.mensaje}</p>
            <small>${item.fecha} · ${item.tipo}</small>
          </div>

          <div class="notification-full-actions">
            <button type="button" data-notification-action="${item.id}">
              ${item.accion}
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  $all("[data-notification-action]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = "detalle-caso.html";
    });
  });
}

function getFilteredNotifications() {
  return NotificationsState.items.filter((item) => {
    const q = NotificationsState.search;

    const matchesSearch =
      !q ||
      item.titulo.toLowerCase().includes(q) ||
      item.mensaje.toLowerCase().includes(q) ||
      item.tipo.toLowerCase().includes(q);

    const filter = NotificationsState.filter;

    const matchesFilter =
      filter === "todas" ||
      (filter === "no-leidas" && !item.leida) ||
      item.tipo === filter;

    return matchesSearch && matchesFilter;
  });
}

function renderNotificationsAiSummary() {
  const container = $("#notificationsAiSummary");
  if (!container) return;

  const unread = NotificationsState.items.filter((item) => !item.leida).length;
  const sla = NotificationsState.items.filter((item) => item.tipo === "sla").length;
  const caseAlerts = NotificationsState.items.filter((item) => item.tipo === "caso").length;

  container.innerHTML = `
    <div class="ai-summary-item">
      <strong>No leídas</strong>
      <p>Tienes ${unread} notificación(es) pendiente(s) de revisión.</p>
    </div>

    <div class="ai-summary-item">
      <strong>Alertas SLA</strong>
      <p>${sla} alerta(s) están asociadas a plazos de atención.</p>
    </div>

    <div class="ai-summary-item">
      <strong>Casos</strong>
      <p>${caseAlerts} notificación(es) están relacionadas con reclamos o incidencias.</p>
    </div>
  `;
}

/* =========================================================
   CONFIRMACIÓN DE ACTUALIZACIÓN
========================================================= */

function initConfirmationPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "actualizacion";

  const config = {
    evidencia: {
      title: "Evidencia enviada correctamente",
      text: "El archivo fue asociado al caso y quedará disponible para revisión del asesor.",
      rows: [
        ["Operación", "Carga de evidencia"],
        ["Estado", "Registrado"],
        ["Destino", "Seguimiento del caso"],
        ["Fecha", new Date().toLocaleString("es-PE")]
      ]
    },
    actualizacion: {
      title: "Tu información fue actualizada",
      text: "La operación se registró correctamente en la plataforma.",
      rows: [
        ["Operación", "Actualización"],
        ["Estado", "Completado"],
        ["Fecha", new Date().toLocaleString("es-PE")]
      ]
    }
  }[type];

  setText("#confirmationTitle", config.title);
  setText("#confirmationText", config.text);

  const summary = $("#confirmationSummary");
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

  $("#confirmationBotBtn")?.addEventListener("click", openBot);
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