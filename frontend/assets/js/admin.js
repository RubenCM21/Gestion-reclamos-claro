"use strict";

/* =========================================================
   ESTADO GLOBAL
========================================================= */

const AdminState = {
  theme: localStorage.getItem("claro360-theme") || "light",
  dashboardData: null,
  currentSearch: ""
};

/* =========================================================
   MOCK DATA - ELIMINAR CUANDO SE CONECTE AL BACKEND
========================================================= */

const MockAdminDashboard = {
  admin: {
    id: 1,
    nombre: "Administrador Demo",
    iniciales: "AD",
    rol: "Administrador General",
    alcance: "Control global de plataforma",
    estado: "Sistema operativo",
    ultimoAcceso: "Último acceso: hoy 08:00"
  },

  indicadores: [
    {
      icono: "👤",
      valor: 186,
      titulo: "Usuarios",
      descripcion: "Registrados en plataforma"
    },
    {
      icono: "🟢",
      valor: 142,
      titulo: "Usuarios activos",
      descripcion: "Con acceso habilitado"
    },
    {
      icono: "🔌",
      valor: 6,
      titulo: "Integraciones",
      descripcion: "Servicios conectados"
    },
    {
      icono: "🛡️",
      valor: 12,
      titulo: "Eventos críticos",
      descripcion: "Pendientes de revisión"
    }
  ],

  modulos: [
    {
      icono: "🎫",
      nombre: "Gestión de casos",
      descripcion: "Reclamos, incidencias y seguimiento.",
      estado: "Operativo",
      estadoTipo: "success"
    },
    {
      icono: "👥",
      nombre: "Usuarios y roles",
      descripcion: "Control de accesos internos y clientes.",
      estado: "Operativo",
      estadoTipo: "success"
    },
    {
      icono: "🔔",
      nombre: "Notificaciones",
      descripcion: "Canales de correo, SMS y portal.",
      estado: "Advertencia",
      estadoTipo: "warning"
    },
    {
      icono: "🔌",
      nombre: "Integraciones",
      descripcion: "Conectores externos y APIs.",
      estado: "Revisión",
      estadoTipo: "info"
    }
  ],

  resumenIA: [
    {
      titulo: "Estado general",
      texto: "La plataforma opera correctamente, pero conviene revisar alertas de notificación y eventos críticos."
    },
    {
      titulo: "Accesos",
      texto: "Existen usuarios bloqueados y cuentas pendientes que deben revisarse."
    },
    {
      titulo: "Configuración",
      texto: "Las reglas SLA y auditoría están activas; se recomienda mantener doble autenticación para usuarios internos."
    }
  ],

  actividad: [
    {
      icono: "👤",
      titulo: "Usuario actualizado",
      descripcion: "Se modificó el rol de un usuario interno.",
      fecha: "Hoy 09:20"
    },
    {
      icono: "⚙️",
      titulo: "Parámetro modificado",
      descripcion: "Se actualizó una regla de alerta SLA.",
      fecha: "Hoy 08:45"
    },
    {
      icono: "🛡️",
      titulo: "Evento de seguridad",
      descripcion: "Se detectaron intentos fallidos de acceso.",
      fecha: "Ayer 18:30"
    }
  ],

  alertas: [
    {
      icono: "🚫",
      titulo: "Usuarios bloqueados",
      descripcion: "Hay cuentas bloqueadas pendientes de revisión.",
      estado: "Atención",
      estadoTipo: "warning"
    },
    {
      icono: "🔔",
      titulo: "Canal WhatsApp inactivo",
      descripcion: "El canal no está habilitado para notificaciones.",
      estado: "Configurar",
      estadoTipo: "info"
    },
    {
      icono: "🛡️",
      titulo: "Eventos críticos",
      descripcion: "Se recomienda revisar la auditoría de accesos.",
      estado: "Crítico",
      estadoTipo: "danger"
    }
  ],

  roles: [
    {
      icono: "👥",
      rol: "Clientes",
      cantidad: 120,
      descripcion: "Usuarios externos con acceso al portal."
    },
    {
      icono: "🎧",
      rol: "Asesores",
      cantidad: 42,
      descripcion: "Personal encargado de atención de casos."
    },
    {
      icono: "📊",
      rol: "Supervisores",
      cantidad: 12,
      descripcion: "Gestión de clasificación y asignación."
    },
    {
      icono: "🛡️",
      rol: "Administradores",
      cantidad: 12,
      descripcion: "Control de configuración y seguridad."
    }
  ]
};

const MockAdminUsers = [
  {
    id: 1,
    nombre: "Cliente Persona Demo",
    email: "cliente.persona@demo.com",
    rol: "Cliente",
    equipo: "Personas",
    estado: "Activo",
    iniciales: "CP"
  },
  {
    id: 2,
    nombre: "Cliente Empresa Demo",
    email: "cliente.empresa@demo.com",
    rol: "Cliente",
    equipo: "Empresas",
    estado: "Activo",
    iniciales: "CE"
  },
  {
    id: 3,
    nombre: "Asesor Demo",
    email: "asesor@demo.com",
    rol: "Asesor",
    equipo: "Técnico Hogar",
    estado: "Activo",
    iniciales: "AS"
  },
  {
    id: 4,
    nombre: "Supervisor Demo",
    email: "supervisor@demo.com",
    rol: "Supervisor",
    equipo: "Atención General",
    estado: "Activo",
    iniciales: "SD"
  },
  {
    id: 5,
    nombre: "Administrador Demo",
    email: "admin@demo.com",
    rol: "Administrador",
    equipo: "Administración",
    estado: "Activo",
    iniciales: "AD"
  },
  {
    id: 6,
    nombre: "Usuario Bloqueado Demo",
    email: "bloqueado@demo.com",
    rol: "Asesor",
    equipo: "Facturación",
    estado: "Bloqueado",
    iniciales: "UB"
  }
];

/* =========================================================
   API LAYER - CAMBIAR AQUÍ CUANDO EXISTA BACKEND
========================================================= */

const AdminApi = {
  async getDashboard() {
    await delay(500);
    return MockAdminDashboard;

    /*
    const response = await fetch("/api/admin/dashboard", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });

    return await response.json();
    */
  },

  async getUsers() {
    await delay(450);
    return MockAdminUsers;

    /*
    const response = await fetch("/api/admin/usuarios", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });

    return await response.json();
    */
  },

  async saveUser(payload) {
    await delay(700);

    return {
      ok: true,
      user: payload
    };

    /*
    const response = await fetch("/api/admin/usuarios", {
      method: payload.id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
    */
  },

  async saveSettings(payload) {
    await delay(700);

    return {
      ok: true,
      settings: payload
    };

    /*
    const response = await fetch("/api/admin/configuracion", {
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
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(AdminState.theme);
  bindLayout();
  bindTheme();
  bindUserMenu();
  bindSearch();
  bindBot();
  bindModals();
  bindLogout();

  const page = document.body.dataset.page;

  if (page === "admin-dashboard") {
    initAdminDashboard();
  }

  if (page === "admin-usuarios") {
    initAdminUsersPage();
  }

  if (page === "admin-configuracion") {
    initAdminSettingsPage();
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
   DASHBOARD ADMIN
========================================================= */

async function initAdminDashboard() {
  setText("#welcomeTitle", "Cargando administración...");
  setText("#welcomeMessage", "Estamos preparando el estado general de la plataforma.");

  const data = await AdminApi.getDashboard();

  AdminState.dashboardData = data;

  renderAdminDashboard(data);
}

function renderAdminDashboard(data) {
  const admin = data.admin;

  setText("#userAvatar", admin.iniciales);
  setText("#userNameTop", admin.nombre);
  setText("#userRoleTop", admin.rol);
  setText("#adminScope", admin.alcance);
  setText("#welcomeTitle", `Hola, ${admin.nombre}`);
  setText(
    "#welcomeMessage",
    "Desde este panel puedes gestionar usuarios, configurar reglas de atención, revisar auditoría y administrar integraciones."
  );
  setText("#adminStatus", admin.estado);
  setText("#adminLastAccess", admin.ultimoAcceso);

  renderAdminKpis(data.indicadores);
  renderModuleStatus(data.modulos);
  renderAdminAi(data.resumenIA);
  renderAdminActivity(data.actividad);
  renderAdminAlerts(data.alertas);
  renderRoleGrid(data.roles);
}

function renderAdminKpis(items) {
  const grid = $("#adminKpiGrid");
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

  const users = items.find((item) => item.titulo === "Usuarios");
  setText("#sidebarUsersCount", users ? users.valor : "");
}

function renderModuleStatus(items) {
  const list = $("#moduleStatusList");
  if (!list) return;

  list.innerHTML = items
    .map((item) => {
      return `
        <article class="module-card">
          <span class="module-icon">${item.icono}</span>
          <div>
            <strong>${item.nombre}</strong>
            <p>${item.descripcion}</p>
          </div>
          <span class="status-pill status-pill--${item.estadoTipo}">
            ${item.estado}
          </span>
        </article>
      `;
    })
    .join("");
}

function renderAdminAi(items) {
  const container = $("#adminAiSummary");
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

function renderAdminActivity(items) {
  const container = $("#adminActivityTimeline");
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

function renderAdminAlerts(items) {
  const list = $("#adminAlertList");
  if (!list) return;

  list.innerHTML = items
    .map((item) => {
      return `
        <article class="alert-card">
          <div class="module-card">
            <span class="alert-icon">${item.icono}</span>
            <div>
              <strong>${item.titulo}</strong>
              <p>${item.descripcion}</p>
            </div>
            <span class="status-pill status-pill--${item.estadoTipo}">
              ${item.estado}
            </span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderRoleGrid(items) {
  const grid = $("#roleGrid");
  if (!grid) return;

  grid.innerHTML = items
    .map((item) => {
      return `
        <article class="role-card">
          <span class="role-icon">${item.icono}</span>
          <div>
            <strong>${item.rol}</strong>
            <p>${item.descripcion}</p>
            <small>${item.cantidad} usuarios</small>
          </div>
        </article>
      `;
    })
    .join("");
}

/* =========================================================
   USUARIOS
========================================================= */

let UsersState = {
  users: [],
  filter: "todos",
  search: ""
};

async function initAdminUsersPage() {
  bindUsersEvents();

  const users = await AdminApi.getUsers();

  UsersState.users = users;

  renderUsersList();
}

function bindUsersEvents() {
  $("#usersSearchInput")?.addEventListener("input", (event) => {
    UsersState.search = event.target.value.trim().toLowerCase();
    renderUsersList();
  });

  $all("[data-user-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      UsersState.filter = button.dataset.userFilter || "todos";

      $all("[data-user-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      renderUsersList();
    });
  });

  $("#refreshUsersBtn")?.addEventListener("click", async () => {
    UsersState.users = await AdminApi.getUsers();
    renderUsersList();

    showToast({
      title: "Usuarios actualizados",
      message: "Se actualizó el listado de usuarios.",
      type: "success"
    });
  });

  $("#syncUsersBtn")?.addEventListener("click", () => {
    showToast({
      title: "Sincronización simulada",
      message: "Cuando exista backend, se sincronizará con el repositorio real de usuarios.",
      type: "success"
    });
  });

  $("#openCreateUserBtn")?.addEventListener("click", clearUserForm);
  $("#clearUserFormBtn")?.addEventListener("click", clearUserForm);

  $("#adminUserForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearAdminFormErrors();

    const payload = getUserFormPayload();
    const validation = validateUserPayload(payload);

    if (!validation.ok) {
      showAdminFormErrors(validation.errors);

      showToast({
        title: "Formulario incompleto",
        message: validation.firstMessage,
        type: "warning"
      });

      return;
    }

    setAdminButtonLoading("#userSubmitBtn", true);

    const result = await AdminApi.saveUser(payload);

    setAdminButtonLoading("#userSubmitBtn", false);

    if (result.ok) {
      showToast({
        title: "Usuario guardado",
        message: "La información del usuario fue registrada correctamente.",
        type: "success"
      });

      upsertLocalUser(payload);
      clearUserForm();
      renderUsersList();
    }
  });
}

function renderUsersList() {
  const list = $("#usersList");
  const empty = $("#emptyUsersState");

  if (!list || !empty) return;

  const filtered = getFilteredUsers();

  setText("#usersSummaryStatus", `${filtered.length} usuarios visibles`);
  setText("#usersSummaryText", `Filtro activo: ${UsersState.filter}`);
  setText("#sidebarUsersCount", UsersState.users.length);

  if (!filtered.length) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  list.innerHTML = filtered
    .map((user) => {
      return `
        <article class="user-row">
          <span class="user-avatar-card">${user.iniciales}</span>

          <div>
            <strong>${user.nombre}</strong>
            <p>${user.email} · ${user.rol} · ${user.equipo}</p>
            <span class="status-pill ${user.estado === "Activo" ? "status-pill--success" : user.estado === "Bloqueado" ? "status-pill--danger" : "status-pill--warning"}">
              ${user.estado}
            </span>
          </div>

          <div class="user-row__actions">
            <button type="button" data-edit-user="${user.id}">Editar</button>
            <button type="button" data-lock-user="${user.id}">
              ${user.estado === "Bloqueado" ? "Activar" : "Bloquear"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  $all("[data-edit-user]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.editUser);
      const user = UsersState.users.find((item) => item.id === id);
      if (user) fillUserForm(user);
    });
  });

  $all("[data-lock-user]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.lockUser);
      toggleUserStatus(id);
    });
  });
}

function getFilteredUsers() {
  return UsersState.users.filter((user) => {
    const q = UsersState.search;

    const matchesSearch =
      !q ||
      user.nombre.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.rol.toLowerCase().includes(q) ||
      user.equipo.toLowerCase().includes(q) ||
      user.estado.toLowerCase().includes(q);

    const filter = UsersState.filter;

    const matchesFilter =
      filter === "todos" ||
      user.rol === filter ||
      user.estado === filter;

    return matchesSearch && matchesFilter;
  });
}

function fillUserForm(user) {
  setText("#userFormTitle", "Editar usuario");

  $("#adminUserId").value = user.id;
  $("#adminUserName").value = user.nombre;
  $("#adminUserEmail").value = user.email;
  $("#adminUserRole").value = user.rol;
  $("#adminUserTeam").value = user.equipo;
  $("#adminUserStatus").value = user.estado;

  showToast({
    title: "Usuario seleccionado",
    message: "Puedes editar los datos en el formulario lateral.",
    type: "success"
  });
}

function clearUserForm() {
  setText("#userFormTitle", "Nuevo usuario");

  $("#adminUserId").value = "";
  $("#adminUserName").value = "";
  $("#adminUserEmail").value = "";
  $("#adminUserRole").value = "";
  $("#adminUserTeam").value = "";
  $("#adminUserStatus").value = "";
  $("#adminUserNotify").checked = true;

  clearAdminFormErrors();
}

function getUserFormPayload() {
  return {
    id: $("#adminUserId")?.value ? Number($("#adminUserId").value) : Date.now(),
    nombre: $("#adminUserName")?.value.trim(),
    email: $("#adminUserEmail")?.value.trim(),
    rol: $("#adminUserRole")?.value,
    equipo: $("#adminUserTeam")?.value,
    estado: $("#adminUserStatus")?.value,
    notify: $("#adminUserNotify")?.checked,
    iniciales: getInitials($("#adminUserName")?.value.trim())
  };
}

function validateUserPayload(payload) {
  const errors = {};

  if (!payload.nombre) errors.adminUserName = "Ingresa el nombre del usuario.";
  if (!payload.email) errors.adminUserEmail = "Ingresa el correo electrónico.";
  if (!payload.rol) errors.adminUserRole = "Selecciona el rol.";
  if (!payload.equipo) errors.adminUserTeam = "Selecciona el equipo o segmento.";
  if (!payload.estado) errors.adminUserStatus = "Selecciona el estado.";

  return buildAdminValidation(errors);
}

function upsertLocalUser(user) {
  const index = UsersState.users.findIndex((item) => item.id === user.id);

  if (index >= 0) {
    UsersState.users[index] = user;
  } else {
    UsersState.users.unshift(user);
  }
}

function toggleUserStatus(id) {
  UsersState.users = UsersState.users.map((user) => {
    if (user.id !== id) return user;

    return {
      ...user,
      estado: user.estado === "Bloqueado" ? "Activo" : "Bloqueado"
    };
  });

  renderUsersList();

  showToast({
    title: "Estado actualizado",
    message: "El estado del usuario fue modificado.",
    type: "success"
  });
}

function getInitials(name) {
  if (!name) return "US";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/* =========================================================
   CONFIGURACIÓN
========================================================= */

function initAdminSettingsPage() {
  renderSettingsAi();

  $("#settingsForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveSettings();
  });

  $("#saveSettingsTopBtn")?.addEventListener("click", saveSettings);
  $("#previewSettingsBtn")?.addEventListener("click", previewSettings);

  $("#restoreSettingsBtn")?.addEventListener("click", () => {
    restoreSettingsDefaults();

    showToast({
      title: "Valores restaurados",
      message: "Se restauraron los parámetros recomendados.",
      type: "success"
    });
  });

  $("#settingsAnalyzeBtn")?.addEventListener("click", () => {
    openGenericModal({
      icon: "🤖",
      title: "Análisis IA",
      text: "La configuración es consistente: SLA crítico activo, clasificación automática habilitada, auditoría obligatoria y doble autenticación para usuarios internos."
    });
  });
}

function renderSettingsAi() {
  const container = $("#settingsAiSummary");
  if (!container) return;

  container.innerHTML = `
    <div class="ai-summary-item">
      <strong>Seguridad</strong>
      <p>Mantén doble autenticación y auditoría activa para usuarios internos.</p>
    </div>

    <div class="ai-summary-item">
      <strong>SLA</strong>
      <p>El SLA crítico debe ser menor para servicios empresariales o incidencias masivas.</p>
    </div>

    <div class="ai-summary-item">
      <strong>Automatización</strong>
      <p>La clasificación automática ayuda a reducir tiempos de triage.</p>
    </div>
  `;
}

async function saveSettings() {
  const payload = getSettingsPayload();

  setAdminButtonLoading("#settingsSubmitBtn", true);

  const result = await AdminApi.saveSettings(payload);

  setAdminButtonLoading("#settingsSubmitBtn", false);

  if (result.ok) {
    openGenericModal({
      icon: "✓",
      title: "Configuración guardada",
      text: "Los parámetros de la plataforma fueron registrados correctamente."
    });
  }
}

function getSettingsPayload() {
  return {
    standardClaimSla: $("#settingStandardClaimSla")?.value,
    criticalIncidentSla: $("#settingCriticalIncidentSla")?.value,
    autoClassification: $("#settingAutoClassification")?.checked,
    smartAssignment: $("#settingSmartAssignment")?.checked,
    slaAlertTime: $("#settingSlaAlertTime")?.value,
    auditRequired: $("#settingAuditRequired")?.checked,
    emailEnabled: $("#settingEmailEnabled")?.checked,
    smsEnabled: $("#settingSmsEnabled")?.checked,
    whatsappEnabled: $("#settingWhatsappEnabled")?.checked,
    mfaEnabled: $("#settingMfaEnabled")?.checked,
    sessionTimeout: $("#settingSessionTimeout")?.value,
    loginAttempts: $("#settingLoginAttempts")?.value
  };
}

function previewSettings() {
  const payload = getSettingsPayload();
  const summary = $("#settingsPreviewSummary");

  if (summary) {
    summary.innerHTML = `
      <div>
        <span>SLA reclamo estándar</span>
        <strong>${payload.standardClaimSla}</strong>
      </div>
      <div>
        <span>SLA incidencia crítica</span>
        <strong>${payload.criticalIncidentSla}</strong>
      </div>
      <div>
        <span>Clasificación automática</span>
        <strong>${payload.autoClassification ? "Activa" : "Inactiva"}</strong>
      </div>
      <div>
        <span>Asignación inteligente</span>
        <strong>${payload.smartAssignment ? "Activa" : "Inactiva"}</strong>
      </div>
      <div>
        <span>Doble autenticación</span>
        <strong>${payload.mfaEnabled ? "Activa" : "Inactiva"}</strong>
      </div>
    `;
  }

  openModal("#settingsPreviewModal");
}

function restoreSettingsDefaults() {
  $("#settingStandardClaimSla").value = "48h";
  $("#settingCriticalIncidentSla").value = "4h";
  $("#settingAutoClassification").checked = true;
  $("#settingSmartAssignment").checked = true;
  $("#settingSlaAlertTime").value = "1h";
  $("#settingAuditRequired").checked = true;
  $("#settingEmailEnabled").checked = true;
  $("#settingSmsEnabled").checked = true;
  $("#settingWhatsappEnabled").checked = false;
  $("#settingMfaEnabled").checked = true;
  $("#settingSessionTimeout").value = "30";
  $("#settingLoginAttempts").value = "5";
}

/* =========================================================
   VALIDACIÓN Y UTILIDADES DE FORMULARIO
========================================================= */

function buildAdminValidation(errors) {
  const messages = Object.values(errors);

  return {
    ok: messages.length === 0,
    errors,
    firstMessage: messages[0] || ""
  };
}

function showAdminFormErrors(errors) {
  Object.entries(errors).forEach(([key, value]) => {
    const element = $(`#${key}Error`);
    if (element) element.textContent = value;
  });
}

function clearAdminFormErrors() {
  $all(".form-error").forEach((item) => {
    item.textContent = "";
  });
}

function setAdminButtonLoading(selector, value) {
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

  $("#refreshModulesBtn")?.addEventListener("click", () => {
    if (AdminState.dashboardData) {
      renderModuleStatus(AdminState.dashboardData.modulos);
    }

    showToast({
      title: "Módulos actualizados",
      message: "Se actualizó el estado de los módulos.",
      type: "success"
    });
  });

  $("#refreshAdminAlertsBtn")?.addEventListener("click", () => {
    if (AdminState.dashboardData) {
      renderAdminAlerts(AdminState.dashboardData.alertas);
    }

    showToast({
      title: "Alertas actualizadas",
      message: "Se refrescaron las alertas administrativas.",
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
    const next = AdminState.theme === "light" ? "dark" : "light";
    applyTheme(next);

    showToast({
      title: "Tema actualizado",
      message: `Se activó el modo ${next === "dark" ? "oscuro" : "claro"}.`,
      type: "success"
    });
  });
}

function applyTheme(theme) {
  AdminState.theme = theme;
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
    AdminState.currentSearch = event.target.value.trim().toLowerCase();
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

  const q = AdminState.currentSearch;

  const users = MockAdminUsers.map((item) => ({
    icon: "👤",
    title: item.nombre,
    text: `${item.email} · ${item.rol} · ${item.estado}`,
    href: "usuarios.html",
    keywords: `${item.nombre} ${item.email} ${item.rol} ${item.equipo} ${item.estado}`.toLowerCase()
  }));

  const modules = MockAdminDashboard.modulos.map((item) => ({
    icon: item.icono,
    title: item.nombre,
    text: `${item.descripcion} · ${item.estado}`,
    href: "dashboard.html",
    keywords: `${item.nombre} ${item.descripcion} ${item.estado}`.toLowerCase()
  }));

  const all = [...users, ...modules];

  const results = q ? all.filter((item) => item.keywords.includes(q)) : all.slice(0, 7);

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

  $("#analyzeAdminBtn")?.addEventListener("click", () => {
    openBot();
    addBotMessage("Resume el estado de la plataforma", "user");

    setTimeout(() => {
      addBotMessage(generateBotResponse("resume el estado de la plataforma"), "bot");
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
  message.textContent = "IA Admin está analizando la configuración...";

  container?.appendChild(message);

  if (container) {
    container.scrollTop = container.scrollHeight;
  }

  return message;
}

function generateBotResponse(prompt) {
  const text = prompt.toLowerCase();

  if (text.includes("plataforma") || text.includes("resumen")) {
    return "La plataforma está operativa. Se recomienda revisar usuarios bloqueados, eventos críticos y canales de notificación pendientes.";
  }

  if (text.includes("riesgo") || text.includes("seguridad")) {
    return "Los principales riesgos están en usuarios bloqueados, intentos fallidos de acceso y canales de notificación sin configurar.";
  }

  if (text.includes("usuarios") || text.includes("acceso")) {
    return "Revisa usuarios bloqueados, cuentas pendientes y roles administrativos con permisos elevados.";
  }

  if (text.includes("sla")) {
    return "Para reclamos estándar puedes usar 48 horas, y para incidencias críticas conviene mantener 4 horas o menos.";
  }

  return "Puedo ayudarte con usuarios, roles, configuración, auditoría, integraciones o riesgos administrativos.";
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
   PÁGINAS ADMIN: AUDITORÍA E INTEGRACIONES
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "admin-auditoria") {
    initAdminAuditPage();
  }

  if (page === "admin-integraciones") {
    initAdminIntegrationsPage();
  }
});

/* =========================================================
   MOCK DATA - ELIMINAR CUANDO SE CONECTE AL BACKEND
========================================================= */

const MockAdminAudit = {
  kpis: [
    {
      icono: "🛡️",
      valor: 248,
      titulo: "Eventos",
      descripcion: "Registrados en el periodo"
    },
    {
      icono: "🚨",
      valor: 12,
      titulo: "Críticos",
      descripcion: "Requieren revisión"
    },
    {
      icono: "👤",
      valor: 34,
      titulo: "Usuarios auditados",
      descripcion: "Con actividad reciente"
    },
    {
      icono: "🔐",
      valor: 9,
      titulo: "Accesos fallidos",
      descripcion: "Intentos no exitosos"
    }
  ],

  eventos: [
    {
      id: 1,
      icono: "🔐",
      tipo: "Acceso",
      usuario: "admin@demo.com",
      accion: "Inicio de sesión exitoso",
      modulo: "Autenticación",
      ip: "192.168.1.10",
      resultado: "Exitoso",
      riesgo: "Bajo",
      fecha: "21/05/2026 09:10",
      descripcion: "Acceso correcto desde navegador registrado."
    },
    {
      id: 2,
      icono: "🚫",
      tipo: "Seguridad",
      usuario: "bloqueado@demo.com",
      accion: "Intentos fallidos consecutivos",
      modulo: "Autenticación",
      ip: "192.168.1.44",
      resultado: "Bloqueado",
      riesgo: "Crítico",
      fecha: "21/05/2026 08:40",
      descripcion: "El usuario superó el número permitido de intentos fallidos."
    },
    {
      id: 3,
      icono: "⚙️",
      tipo: "Configuración",
      usuario: "admin@demo.com",
      accion: "Cambio de SLA crítico",
      modulo: "Configuración",
      ip: "192.168.1.10",
      resultado: "Aplicado",
      riesgo: "Alto",
      fecha: "20/05/2026 17:25",
      descripcion: "Se modificó un parámetro de SLA para incidencias críticas."
    },
    {
      id: 4,
      icono: "👤",
      tipo: "Usuario",
      usuario: "supervisor@demo.com",
      accion: "Actualización de rol",
      modulo: "Usuarios",
      ip: "192.168.1.22",
      resultado: "Aplicado",
      riesgo: "Medio",
      fecha: "20/05/2026 16:10",
      descripcion: "Se actualizó el rol de un usuario interno."
    },
    {
      id: 5,
      icono: "🔌",
      tipo: "Integración",
      usuario: "sistema",
      accion: "Prueba de conexión API",
      modulo: "Integraciones",
      ip: "internal",
      resultado: "Advertencia",
      riesgo: "Medio",
      fecha: "20/05/2026 15:05",
      descripcion: "Una integración respondió con latencia mayor a la esperada."
    }
  ],

  resumenIA: [
    {
      titulo: "Evento crítico",
      texto: "El principal riesgo está en intentos fallidos consecutivos y bloqueo de usuario."
    },
    {
      titulo: "Cambios sensibles",
      texto: "Los cambios de SLA y roles deben revisarse por impacto operativo."
    },
    {
      titulo: "Acción recomendada",
      texto: "Validar usuario bloqueado, confirmar cambio de SLA y revisar latencia de integración."
    }
  ],

  riesgos: [
    { nombre: "Bajo", cantidad: 82, porcentaje: 45 },
    { nombre: "Medio", cantidad: 96, porcentaje: 52 },
    { nombre: "Alto", cantidad: 58, porcentaje: 66 },
    { nombre: "Crítico", cantidad: 12, porcentaje: 85 }
  ],

  modulos: [
    { nombre: "Autenticación", valor: 88, detalle: "Mayor cantidad de eventos de acceso" },
    { nombre: "Usuarios", valor: 64, detalle: "Cambios de roles y estados" },
    { nombre: "Configuración", valor: 38, detalle: "Parámetros modificados" },
    { nombre: "Integraciones", valor: 42, detalle: "Pruebas y advertencias técnicas" }
  ]
};

const MockAdminIntegrations = {
  kpis: [
    {
      icono: "🔌",
      valor: 8,
      titulo: "Integraciones",
      descripcion: "Configuradas"
    },
    {
      icono: "🟢",
      valor: 6,
      titulo: "Activas",
      descripcion: "Servicios disponibles"
    },
    {
      icono: "⚠️",
      valor: 2,
      titulo: "En revisión",
      descripcion: "Con advertencias"
    },
    {
      icono: "⏱️",
      valor: "180ms",
      titulo: "Latencia media",
      descripcion: "Respuesta estimada"
    }
  ],

  integraciones: [
    {
      id: 1,
      icono: "🔐",
      nombre: "SSO Corporativo",
      tipo: "Autenticación",
      endpoint: "https://auth.demo.local",
      auth: "OAuth 2.0",
      estado: "Activa",
      estadoTipo: "success",
      latencia: "120ms",
      disponibilidad: 99
    },
    {
      id: 2,
      icono: "📧",
      nombre: "Servicio de correo",
      tipo: "Notificaciones",
      endpoint: "https://mail.demo.local",
      auth: "API Key",
      estado: "Activa",
      estadoTipo: "success",
      latencia: "180ms",
      disponibilidad: 97
    },
    {
      id: 3,
      icono: "💬",
      nombre: "WhatsApp Gateway",
      tipo: "Notificaciones",
      endpoint: "https://wa.demo.local",
      auth: "JWT",
      estado: "En prueba",
      estadoTipo: "warning",
      latencia: "340ms",
      disponibilidad: 89
    },
    {
      id: 4,
      icono: "🤖",
      nombre: "Motor IA",
      tipo: "IA",
      endpoint: "https://ai.demo.local",
      auth: "API Key",
      estado: "Activa",
      estadoTipo: "success",
      latencia: "260ms",
      disponibilidad: 95
    },
    {
      id: 5,
      icono: "📊",
      nombre: "Analytics BI",
      tipo: "Analítica",
      endpoint: "https://bi.demo.local",
      auth: "Interna",
      estado: "Activa",
      estadoTipo: "success",
      latencia: "210ms",
      disponibilidad: 96
    },
    {
      id: 6,
      icono: "🗄️",
      nombre: "Base operacional",
      tipo: "Base de datos",
      endpoint: "db://operacional",
      auth: "Interna",
      estado: "Activa",
      estadoTipo: "success",
      latencia: "90ms",
      disponibilidad: 99
    }
  ],

  resumenIA: [
    {
      titulo: "Estado general",
      texto: "Las integraciones principales están activas, pero WhatsApp Gateway requiere validación."
    },
    {
      titulo: "Disponibilidad",
      texto: "SSO y base operacional presentan el mejor comportamiento."
    },
    {
      titulo: "Recomendación",
      texto: "Monitorear latencia de servicios de IA y notificaciones antes de producción."
    }
  ]
};

/* =========================================================
   API LAYER - AUDITORÍA / INTEGRACIONES
========================================================= */

const AdminAuditApi = {
  async getAudit() {
    await delay(450);
    return MockAdminAudit;

    /*
    const response = await fetch("/api/admin/auditoria", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });
    return await response.json();
    */
  }
};

const AdminIntegrationsApi = {
  async getIntegrations() {
    await delay(450);
    return MockAdminIntegrations;

    /*
    const response = await fetch("/api/admin/integraciones", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      }
    });
    return await response.json();
    */
  },

  async saveIntegration(payload) {
    await delay(700);

    return {
      ok: true,
      integration: payload
    };

    /*
    const response = await fetch("/api/admin/integraciones", {
      method: payload.id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("claro360-token")}`
      },
      body: JSON.stringify(payload)
    });
    return await response.json();
    */
  },

  async testIntegration(payload) {
    await delay(600);

    return {
      ok: true,
      latency: "185ms",
      status: "Conexión exitosa",
      payload
    };

    /*
    const response = await fetch("/api/admin/integraciones/probar", {
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
   AUDITORÍA
========================================================= */

let AuditState = {
  data: null,
  search: "",
  type: "todos",
  risk: "todos"
};

async function initAdminAuditPage() {
  bindAuditEvents();

  const data = await AdminAuditApi.getAudit();

  AuditState.data = data;

  renderAuditPage(data);
}

function bindAuditEvents() {
  $("#auditSearchInput")?.addEventListener("input", (event) => {
    AuditState.search = event.target.value.trim().toLowerCase();
    renderAuditList();
  });

  $("#auditTypeFilter")?.addEventListener("change", (event) => {
    AuditState.type = event.target.value;
    renderAuditList();
  });

  $("#auditRiskFilter")?.addEventListener("change", (event) => {
    AuditState.risk = event.target.value;
    renderAuditList();
  });

  $("#applyAuditFiltersBtn")?.addEventListener("click", renderAuditList);

  $("#refreshAuditBtn")?.addEventListener("click", async () => {
    AuditState.data = await AdminAuditApi.getAudit();
    renderAuditPage(AuditState.data);

    showToast({
      title: "Auditoría actualizada",
      message: "Se actualizó la bitácora de eventos.",
      type: "success"
    });
  });

  $("#auditAnalyzeBtn")?.addEventListener("click", openAuditAnalysis);
  $("#auditAiBtn")?.addEventListener("click", openAuditAnalysis);

  $("#auditExportBtn")?.addEventListener("click", () => {
    openGenericModal({
      icon: "📄",
      title: "Exportación preparada",
      text: "Cuando se conecte el backend, se exportará la bitácora filtrada en Excel o PDF."
    });
  });
}

function renderAuditPage(data) {
  renderAuditKpis(data.kpis);
  renderAuditList();
  renderAuditAi(data.resumenIA);
  renderAuditRisks(data.riesgos);
  renderAuditModules(data.modulos);

  setText("#auditSummaryStatus", `${data.eventos.length} eventos cargados`);
  setText("#auditSummaryText", "Auditoría disponible");
}

function renderAuditKpis(items) {
  const grid = $("#auditKpiGrid");
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

function renderAuditList() {
  const list = $("#auditList");
  const empty = $("#emptyAuditState");

  if (!list || !empty || !AuditState.data) return;

  const events = getFilteredAuditEvents();

  setText("#auditSummaryStatus", `${events.length} eventos visibles`);
  setText("#auditSummaryText", `Tipo: ${AuditState.type} · Riesgo: ${AuditState.risk}`);

  if (!events.length) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  list.innerHTML = events
    .map((event) => {
      return `
        <article class="audit-item">
          <span class="audit-item__icon">${event.icono}</span>

          <div>
            <h3>${event.accion}</h3>
            <p>${event.descripcion}</p>

            <div class="audit-meta">
              <span>${event.tipo}</span>
              <span>${event.usuario}</span>
              <span>${event.modulo}</span>
              <span>${event.ip}</span>
              <span>${event.fecha}</span>
            </div>
          </div>

          <div class="audit-item__actions">
            <span class="status-pill ${getRiskClass(event.riesgo)}">${event.riesgo}</span>
            <button type="button" data-audit-id="${event.id}">Ver</button>
          </div>
        </article>
      `;
    })
    .join("");

  $all("[data-audit-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.auditId);
      const event = AuditState.data.eventos.find((item) => item.id === id);
      if (event) openAuditDetail(event);
    });
  });
}

function getFilteredAuditEvents() {
  return AuditState.data.eventos.filter((event) => {
    const q = AuditState.search;

    const matchesSearch =
      !q ||
      event.usuario.toLowerCase().includes(q) ||
      event.accion.toLowerCase().includes(q) ||
      event.modulo.toLowerCase().includes(q) ||
      event.ip.toLowerCase().includes(q) ||
      event.resultado.toLowerCase().includes(q);

    const matchesType = AuditState.type === "todos" || event.tipo === AuditState.type;
    const matchesRisk = AuditState.risk === "todos" || event.riesgo === AuditState.risk;

    return matchesSearch && matchesType && matchesRisk;
  });
}

function renderAuditAi(items) {
  const container = $("#auditAiSummary");
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

function renderAuditRisks(items) {
  const container = $("#auditRiskDistribution");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <article class="risk-card">
          <div class="risk-card__top">
            <div>
              <strong>${item.nombre}</strong>
              <p>${item.cantidad} evento(s)</p>
            </div>
            <span class="status-pill ${getRiskClass(item.nombre)}">${item.nombre}</span>
          </div>

          <div class="risk-bar">
            <span style="width:${item.porcentaje}%"></span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAuditModules(items) {
  const container = $("#auditModuleRanking");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <article class="metric-row">
          <div class="metric-row__top">
            <div>
              <strong>${item.nombre}</strong>
              <small>${item.detalle}</small>
            </div>
            <span class="status-pill status-pill--info">${item.valor}</span>
          </div>

          <div class="metric-bar">
            <span style="width:${item.valor}%"></span>
          </div>
        </article>
      `;
    })
    .join("");
}

function openAuditDetail(event) {
  setText("#auditModalIcon", event.icono);
  setText("#auditModalTitle", event.accion);
  setText("#auditModalText", event.descripcion);

  const summary = $("#auditModalSummary");

  if (summary) {
    summary.innerHTML = `
      <div>
        <span>Usuario</span>
        <strong>${event.usuario}</strong>
      </div>
      <div>
        <span>Tipo</span>
        <strong>${event.tipo}</strong>
      </div>
      <div>
        <span>Módulo</span>
        <strong>${event.modulo}</strong>
      </div>
      <div>
        <span>Resultado</span>
        <strong>${event.resultado}</strong>
      </div>
      <div>
        <span>Riesgo</span>
        <strong>${event.riesgo}</strong>
      </div>
      <div>
        <span>Fecha</span>
        <strong>${event.fecha}</strong>
      </div>
    `;
  }

  openModal("#auditDetailModal");
}

function openAuditAnalysis() {
  openGenericModal({
    icon: "🤖",
    title: "Análisis IA de auditoría",
    text: "Se identifican eventos críticos por intentos fallidos, cambios sensibles de SLA y modificaciones de roles. Se recomienda revisar usuarios bloqueados y confirmar cambios administrativos recientes."
  });
}

function getRiskClass(risk) {
  if (risk === "Crítico") return "status-pill--danger";
  if (risk === "Alto") return "status-pill--warning";
  if (risk === "Medio") return "status-pill--info";
  return "status-pill--success";
}

/* =========================================================
   INTEGRACIONES
========================================================= */

let IntegrationState = {
  data: null,
  integrations: []
};

async function initAdminIntegrationsPage() {
  bindIntegrationEvents();

  const data = await AdminIntegrationsApi.getIntegrations();

  IntegrationState.data = data;
  IntegrationState.integrations = data.integraciones;

  renderIntegrationsPage(data);
}

function bindIntegrationEvents() {
  $("#refreshIntegrationsBtn")?.addEventListener("click", async () => {
    const data = await AdminIntegrationsApi.getIntegrations();

    IntegrationState.data = data;
    IntegrationState.integrations = data.integraciones;

    renderIntegrationsPage(data);

    showToast({
      title: "Integraciones actualizadas",
      message: "Se actualizó el estado de los conectores.",
      type: "success"
    });
  });

  $("#integrationNewBtn")?.addEventListener("click", clearIntegrationForm);
  $("#clearIntegrationFormBtn")?.addEventListener("click", clearIntegrationForm);

  $("#integrationTestAllBtn")?.addEventListener("click", () => {
    openGenericModal({
      icon: "🔌",
      title: "Prueba de conexiones",
      text: "Las conexiones principales respondieron correctamente. WhatsApp Gateway mantiene advertencia por latencia."
    });
  });

  $("#integrationAnalyzeBtn")?.addEventListener("click", () => {
    openGenericModal({
      icon: "🤖",
      title: "Análisis IA de integraciones",
      text: "La mayoría de integraciones está operativa. Se recomienda revisar latencia de WhatsApp Gateway y monitorear servicios de IA y notificaciones."
    });
  });

  $("#testIntegrationBtn")?.addEventListener("click", async () => {
    const payload = getIntegrationPayload();

    if (!payload.name || !payload.endpoint) {
      openGenericModal({
        icon: "🔌",
        title: "Datos insuficientes",
        text: "Ingresa al menos el nombre y endpoint para probar la integración."
      });
      return;
    }

    const result = await AdminIntegrationsApi.testIntegration(payload);

    if (result.ok) {
      openGenericModal({
        icon: "✓",
        title: "Conexión exitosa",
        text: `La integración respondió correctamente. Latencia estimada: ${result.latency}.`
      });
    }
  });

  $("#integrationForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearAdminFormErrors();

    const payload = getIntegrationPayload();
    const validation = validateIntegrationPayload(payload);

    if (!validation.ok) {
      showAdminFormErrors(validation.errors);

      showToast({
        title: "Formulario incompleto",
        message: validation.firstMessage,
        type: "warning"
      });

      return;
    }

    setAdminButtonLoading("#integrationSubmitBtn", true);

    const result = await AdminIntegrationsApi.saveIntegration(payload);

    setAdminButtonLoading("#integrationSubmitBtn", false);

    if (result.ok) {
      upsertLocalIntegration(payload);
      clearIntegrationForm();
      renderIntegrationsPage({
        ...IntegrationState.data,
        integraciones: IntegrationState.integrations
      });

      showToast({
        title: "Integración guardada",
        message: "La integración fue registrada correctamente.",
        type: "success"
      });
    }
  });
}

function renderIntegrationsPage(data) {
  setText("#integrationSummaryStatus", `${data.integraciones.length} integraciones`);
  setText("#integrationSummaryText", "Servicios preparados para monitoreo");

  renderIntegrationKpis(data.kpis);
  renderIntegrationGrid(data.integraciones);
  renderIntegrationHealth(data.integraciones);
  renderIntegrationAi(data.resumenIA);
}

function renderIntegrationKpis(items) {
  const grid = $("#integrationKpiGrid");
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

function renderIntegrationGrid(items) {
  const grid = $("#integrationGrid");
  if (!grid) return;

  grid.innerHTML = items
    .map((item) => {
      return `
        <article class="integration-card">
          <div class="integration-card__top">
            <div class="integration-card__identity">
              <span class="integration-card__icon">${item.icono}</span>
              <div>
                <h3>${item.nombre}</h3>
                <p>${item.tipo}</p>
              </div>
            </div>

            <span class="status-pill status-pill--${item.estadoTipo}">
              ${item.estado}
            </span>
          </div>

          <div class="integration-card__meta">
            <span>${item.auth}</span>
            <span>${item.latencia}</span>
            <span>${item.disponibilidad}% disponible</span>
          </div>

          <p>${item.endpoint}</p>

          <div class="integration-card__actions">
            <button type="button" data-integration-view="${item.id}">Ver</button>
            <button type="button" data-integration-edit="${item.id}">Editar</button>
            <button type="button" data-integration-test="${item.id}">Probar</button>
          </div>
        </article>
      `;
    })
    .join("");

  $all("[data-integration-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = getIntegrationById(Number(button.dataset.integrationView));
      if (item) openIntegrationDetail(item);
    });
  });

  $all("[data-integration-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = getIntegrationById(Number(button.dataset.integrationEdit));
      if (item) fillIntegrationForm(item);
    });
  });

  $all("[data-integration-test]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = getIntegrationById(Number(button.dataset.integrationTest));
      if (item) {
        openGenericModal({
          icon: "🔌",
          title: "Prueba de integración",
          text: `${item.nombre} respondió con latencia ${item.latencia} y disponibilidad ${item.disponibilidad}%.`
        });
      }
    });
  });
}

function renderIntegrationHealth(items) {
  const container = $("#integrationHealthRanking");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      return `
        <article class="metric-row">
          <div class="metric-row__top">
            <div>
              <strong>${item.nombre}</strong>
              <small>${item.tipo} · ${item.latencia}</small>
            </div>

            <span class="status-pill ${item.disponibilidad >= 97 ? "status-pill--success" : item.disponibilidad >= 90 ? "status-pill--warning" : "status-pill--danger"}">
              ${item.disponibilidad}%
            </span>
          </div>

          <div class="metric-bar">
            <span style="width:${item.disponibilidad}%"></span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderIntegrationAi(items) {
  const container = $("#integrationAiSummary");
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

function getIntegrationById(id) {
  return IntegrationState.integrations.find((item) => item.id === id);
}

function openIntegrationDetail(item) {
  setText("#integrationModalIcon", item.icono);
  setText("#integrationModalTitle", item.nombre);
  setText("#integrationModalText", `Conector de tipo ${item.tipo} con estado ${item.estado}.`);

  const summary = $("#integrationModalSummary");

  if (summary) {
    summary.innerHTML = `
      <div>
        <span>Tipo</span>
        <strong>${item.tipo}</strong>
      </div>
      <div>
        <span>Endpoint</span>
        <strong>${item.endpoint}</strong>
      </div>
      <div>
        <span>Autenticación</span>
        <strong>${item.auth}</strong>
      </div>
      <div>
        <span>Estado</span>
        <strong>${item.estado}</strong>
      </div>
      <div>
        <span>Latencia</span>
        <strong>${item.latencia}</strong>
      </div>
      <div>
        <span>Disponibilidad</span>
        <strong>${item.disponibilidad}%</strong>
      </div>
    `;
  }

  openModal("#integrationDetailModal");
}

function fillIntegrationForm(item) {
  setText("#integrationFormTitle", "Editar integración");

  $("#integrationId").value = item.id;
  $("#integrationName").value = item.nombre;
  $("#integrationType").value = item.tipo;
  $("#integrationEndpoint").value = item.endpoint;
  $("#integrationAuth").value = item.auth;
  $("#integrationStatus").value = item.estado;
  $("#integrationMonitor").checked = true;

  showToast({
    title: "Integración seleccionada",
    message: "Puedes editar los datos en el formulario lateral.",
    type: "success"
  });
}

function clearIntegrationForm() {
  setText("#integrationFormTitle", "Nueva integración");

  $("#integrationId").value = "";
  $("#integrationName").value = "";
  $("#integrationType").value = "";
  $("#integrationEndpoint").value = "";
  $("#integrationAuth").value = "";
  $("#integrationStatus").value = "";
  $("#integrationMonitor").checked = true;

  clearAdminFormErrors();
}

function getIntegrationPayload() {
  const id = $("#integrationId")?.value;

  return {
    id: id ? Number(id) : Date.now(),
    icono: getIntegrationIcon($("#integrationType")?.value),
    nombre: $("#integrationName")?.value.trim(),
    tipo: $("#integrationType")?.value,
    endpoint: $("#integrationEndpoint")?.value.trim(),
    auth: $("#integrationAuth")?.value,
    estado: $("#integrationStatus")?.value,
    estadoTipo: getIntegrationStatusType($("#integrationStatus")?.value),
    latencia: "180ms",
    disponibilidad: 96,
    monitor: $("#integrationMonitor")?.checked
  };
}

function validateIntegrationPayload(payload) {
  const errors = {};

  if (!payload.nombre) errors.integrationName = "Ingresa el nombre de la integración.";
  if (!payload.tipo) errors.integrationType = "Selecciona el tipo.";
  if (!payload.endpoint) errors.integrationEndpoint = "Ingresa el endpoint.";
  if (!payload.auth) errors.integrationAuth = "Selecciona el método de autenticación.";
  if (!payload.estado) errors.integrationStatus = "Selecciona el estado.";

  return buildAdminValidation(errors);
}

function upsertLocalIntegration(item) {
  const index = IntegrationState.integrations.findIndex((integration) => integration.id === item.id);

  if (index >= 0) {
    IntegrationState.integrations[index] = item;
  } else {
    IntegrationState.integrations.unshift(item);
  }
}

function getIntegrationIcon(type) {
  const icons = {
    "Autenticación": "🔐",
    "CRM": "🧩",
    "Notificaciones": "🔔",
    "Base de datos": "🗄️",
    "IA": "🤖",
    "Analítica": "📊"
  };

  return icons[type] || "🔌";
}

function getIntegrationStatusType(status) {
  if (status === "Activa") return "success";
  if (status === "En prueba") return "warning";
  return "danger";
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