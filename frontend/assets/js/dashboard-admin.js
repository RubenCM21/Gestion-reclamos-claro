document.addEventListener("DOMContentLoaded", () => {
  /*
    IMPORTANTE:
    Esta pantalla queda preparada para backend.
    La prioridad siempre será consumir api.js.
    Los datos demo solo funcionan como respaldo temporal si el backend aún no existe.
  */

  const metricActiveUsers = document.getElementById("metricActiveUsers");
  const metricRoles = document.getElementById("metricRoles");
  const metricCatalogs = document.getElementById("metricCatalogs");
  const metricAuditEvents = document.getElementById("metricAuditEvents");
  const sidebarUsersCount = document.getElementById("sidebarUsersCount");

  const adminAiTip = document.getElementById("adminAiTip");

  const adminEventList = document.getElementById("adminEventList");
  const emptyAdminEvents = document.getElementById("emptyAdminEvents");
  const adminModuleList = document.getElementById("adminModuleList");

  const healthBackend = document.getElementById("healthBackend");
  const healthDatabase = document.getElementById("healthDatabase");
  const healthAuth = document.getElementById("healthAuth");
  const healthAudit = document.getElementById("healthAudit");

  const healthBackendText = document.getElementById("healthBackendText");
  const healthDatabaseText = document.getElementById("healthDatabaseText");
  const healthAuthText = document.getElementById("healthAuthText");
  const healthAuditText = document.getElementById("healthAuditText");

  const refreshAdminDashboard = document.getElementById("refreshAdminDashboard");
  const analyzeSystemHealth = document.getElementById("analyzeSystemHealth");
  const generateAdminSummary = document.getElementById("generateAdminSummary");

  const checkInactiveUsers = document.getElementById("checkInactiveUsers");
  const checkMissingCatalogs = document.getElementById("checkMissingCatalogs");
  const checkAuditRisks = document.getElementById("checkAuditRisks");

  const adminBot = document.getElementById("adminBot");
  const openAdminBot = document.getElementById("openAdminBot");
  const openAdminHelp = document.getElementById("openAdminHelp");
  const openAdminAssistant = document.getElementById("openAdminAssistant");
  const closeAdminBot = document.getElementById("closeAdminBot");

  let adminData = null;

  const demoAdminData = {
    resumen: {
      usuariosActivos: 24,
      rolesConfigurados: 4,
      catalogos: 8,
      eventosAuditoria: 37
    },
    salud: {
      backend: "Operativo",
      database: "Operativo",
      auth: "Operativo",
      audit: "Activo"
    },
    eventos: [
      {
        tipo: "Usuario",
        titulo: "Nuevo usuario creado",
        descripcion: "Se registró un nuevo asesor en el sistema.",
        fecha: "Demo · Hoy 09:20",
        icono: "fa-solid fa-user-plus"
      },
      {
        tipo: "Catálogo",
        titulo: "Catálogo actualizado",
        descripcion: "Se modificó el catálogo de prioridades de atención.",
        fecha: "Demo · Ayer 16:45",
        icono: "fa-solid fa-layer-group"
      },
      {
        tipo: "Auditoría",
        titulo: "Cambio de permisos",
        descripcion: "Se actualizó un rol de acceso del módulo supervisor.",
        fecha: "Demo · 18/05/2026",
        icono: "fa-solid fa-user-lock"
      }
    ],
    modulos: [
      {
        nombre: "Usuarios",
        descripcion: "Gestión de cuentas y estados de acceso.",
        estado: "Configurado"
      },
      {
        nombre: "Roles y permisos",
        descripcion: "Control de accesos por perfil funcional.",
        estado: "Configurado"
      },
      {
        nombre: "Catálogos",
        descripcion: "Tablas maestras para casos, servicios y estados.",
        estado: "Pendiente"
      },
      {
        nombre: "Auditoría",
        descripcion: "Registro de acciones y trazabilidad.",
        estado: "Activo"
      }
    ]
  };

  async function initAdminDashboard() {
    try {
      /*
        Contrato esperado en backend:
        GET /api/reportes/casos?tipo=admin_dashboard

        Respuesta esperada:
        {
          "success": true,
          "reporte": {
            "resumen": {
              "usuariosActivos": 24,
              "rolesConfigurados": 4,
              "catalogos": 8,
              "eventosAuditoria": 37
            },
            "salud": {
              "backend": "Operativo",
              "database": "Operativo",
              "auth": "Operativo",
              "audit": "Activo"
            },
            "eventos": [...],
            "modulos": [...]
          }
        }
      */

      if (typeof getReporteCasos !== "function") {
        throw new Error("api.js no disponible.");
      }

      const response = await getReporteCasos({ tipo: "admin_dashboard" });
      adminData = response.reporte || response.data || null;

      if (!adminData) {
        throw new Error("El backend no devolvió datos del dashboard admin.");
      }
    } catch (error) {
      console.warn("Backend no disponible. Usando datos demo temporales:", error.message);
      adminData = demoAdminData;
    }

    renderAdminDashboard();
  }

  function renderAdminDashboard() {
    updateAdminMetrics();
    renderSystemHealth();
    renderAdminEvents();
    renderAdminModules();
  }

  function updateAdminMetrics() {
    const resumen = adminData.resumen || {};

    metricActiveUsers.textContent = resumen.usuariosActivos ?? 0;
    metricRoles.textContent = resumen.rolesConfigurados ?? 0;
    metricCatalogs.textContent = resumen.catalogos ?? 0;
    metricAuditEvents.textContent = resumen.eventosAuditoria ?? 0;
    sidebarUsersCount.textContent = resumen.usuariosActivos ?? 0;

    adminAiTip.textContent =
      `Sistema con ${resumen.usuariosActivos ?? 0} usuarios activos, ${resumen.rolesConfigurados ?? 0} roles y ${resumen.eventosAuditoria ?? 0} eventos de auditoría.`;
  }

  function renderSystemHealth() {
    const salud = adminData.salud || {};

    healthBackend.textContent = salud.backend || "Pendiente";
    healthDatabase.textContent = salud.database || "Pendiente";
    healthAuth.textContent = salud.auth || "Pendiente";
    healthAudit.textContent = salud.audit || "Pendiente";

    healthBackendText.textContent =
      salud.backend === "Operativo"
        ? "El backend responde correctamente."
        : "Esperando respuesta del backend.";

    healthDatabaseText.textContent =
      salud.database === "Operativo"
        ? "SQL Server responde correctamente."
        : "Esperando validación de base de datos.";

    healthAuthText.textContent =
      salud.auth === "Operativo"
        ? "El módulo de autenticación está disponible."
        : "Esperando validación del módulo de autenticación.";

    healthAuditText.textContent =
      salud.audit === "Activo"
        ? "La auditoría se encuentra registrando eventos."
        : "Esperando registros de auditoría.";
  }

  function renderAdminEvents() {
    const eventos = adminData.eventos || [];

    adminEventList.innerHTML = "";

    eventos.forEach((item) => {
      const event = document.createElement("article");
      event.className = "admin-event-item";

      event.innerHTML = `
        <div class="admin-event-icon">
          <i class="${item.icono || "fa-solid fa-file-shield"}"></i>
        </div>

        <div class="admin-event-content">
          <h3>${item.titulo}</h3>
          <p>${item.descripcion}</p>
        </div>

        <span class="admin-event-date">${item.fecha}</span>
      `;

      adminEventList.appendChild(event);
    });

    emptyAdminEvents.classList.toggle("hidden", eventos.length > 0);
  }

  function renderAdminModules() {
    const modulos = adminData.modulos || [];

    adminModuleList.innerHTML = modulos
      .map((item) => {
        const statusClass = getModuleStatusClass(item.estado);

        return `
          <article class="admin-module-item">
            <div>
              <strong>${item.nombre}</strong>
              <span>${item.descripcion}</span>
            </div>

            <span class="admin-module-status ${statusClass}">
              ${item.estado}
            </span>
          </article>
        `;
      })
      .join("");
  }

  function getModuleStatusClass(status) {
    if (status === "Configurado" || status === "Activo") return "";
    if (status === "Pendiente") return "warning";
    return "danger";
  }

  refreshAdminDashboard.addEventListener("click", () => {
    initAdminDashboard();
    showAdminToast("Dashboard actualizado.");
  });

  analyzeSystemHealth.addEventListener("click", () => {
    adminAiTip.textContent =
      "Análisis IA: verificar que backend, autenticación, SQL Server y auditoría respondan correctamente antes de pasar a producción.";

    showAdminToast("Salud del sistema analizada.");
  });

  generateAdminSummary.addEventListener("click", () => {
    const resumen = adminData.resumen || {};

    adminAiTip.textContent =
      `Resumen IA: existen ${resumen.usuariosActivos ?? 0} usuarios activos, ${resumen.catalogos ?? 0} catálogos y ${resumen.eventosAuditoria ?? 0} eventos auditados.`;

    showAdminToast("Resumen IA generado.");
  });

  checkInactiveUsers.addEventListener("click", () => {
    adminAiTip.textContent =
      "IA: cuando el backend esté conectado, se validarán usuarios inactivos, bloqueados o sin acceso reciente.";

    showAdminToast("Revisión de usuarios preparada.");
  });

  checkMissingCatalogs.addEventListener("click", () => {
    adminAiTip.textContent =
      "IA: cuando el backend esté conectado, se revisarán catálogos incompletos o sin parámetros obligatorios.";

    showAdminToast("Revisión de catálogos preparada.");
  });

  checkAuditRisks.addEventListener("click", () => {
    adminAiTip.textContent =
      "IA: cuando el backend esté conectado, se detectarán cambios sensibles en permisos, usuarios y parámetros.";

    showAdminToast("Revisión de auditoría preparada.");
  });

  function toggleAdminBot() {
    adminBot.classList.toggle("active");
  }

  openAdminBot.addEventListener("click", toggleAdminBot);
  openAdminHelp.addEventListener("click", toggleAdminBot);
  openAdminAssistant.addEventListener("click", toggleAdminBot);

  closeAdminBot.addEventListener("click", () => {
    adminBot.classList.remove("active");
  });

  function showAdminToast(message, type = "success") {
    const existingToast = document.querySelector(".admin-toast");

    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "admin-toast";
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

  initAdminDashboard();
});