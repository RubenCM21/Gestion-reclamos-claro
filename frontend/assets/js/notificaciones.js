document.addEventListener("DOMContentLoaded", () => {
  const notificationsList = document.getElementById("notificationsList");
  const emptyNotifications = document.getElementById("emptyNotifications");

  const notificationSearch = document.getElementById("notificationSearch");
  const filterNotificationType = document.getElementById("filterNotificationType");
  const filterReadStatus = document.getElementById("filterReadStatus");
  const filterCaseCode = document.getElementById("filterCaseCode");
  const clearNotificationFilters = document.getElementById("clearNotificationFilters");

  const markAllRead = document.getElementById("markAllRead");
  const refreshNotifications = document.getElementById("refreshNotifications");

  const metricUnread = document.getElementById("metricUnread");
  const metricStatus = document.getElementById("metricStatus");
  const metricRequests = document.getElementById("metricRequests");
  const metricResolved = document.getElementById("metricResolved");
  const sidebarNotificationCount = document.getElementById("sidebarNotificationCount");
  const notificationAiSummary = document.getElementById("notificationAiSummary");

  const notificationDetailModal = document.getElementById("notificationDetailModal");
  const closeNotificationDetail = document.getElementById("closeNotificationDetail");
  const notificationDetailTitle = document.getElementById("notificationDetailTitle");
  const notificationDetailSubtitle = document.getElementById("notificationDetailSubtitle");
  const notificationDetailContent = document.getElementById("notificationDetailContent");

  const notificationSummaryBox = document.getElementById("notificationSummaryBox");
  const generateNotificationSummary = document.getElementById("generateNotificationSummary");
  const saveNotificationPrefs = document.getElementById("saveNotificationPrefs");

  const notificationBot = document.getElementById("notificationBot");
  const openNotificationBot = document.getElementById("openNotificationBot");
  const openNotificationHelp = document.getElementById("openNotificationHelp");
  const closeNotificationBot = document.getElementById("closeNotificationBot");

  let notifications = [];

  const fallbackNotifications = [
    {
      id: 1,
      codigoCaso: "CL-RC-000123",
      tipo: "Cambio de estado",
      titulo: "Tu reclamo pasó a estado En atención",
      mensaje: "El asesor responsable está revisando la información registrada y las evidencias adjuntas.",
      fecha: "Hoy, 10:35",
      leida: false,
      icono: "status"
    },
    {
      id: 2,
      codigoCaso: "CL-IN-000099",
      tipo: "Solicitud de información",
      titulo: "Se requiere información adicional",
      mensaje: "Adjunta una captura o descripción adicional para continuar con la atención de la incidencia.",
      fecha: "Ayer, 18:20",
      leida: false,
      icono: "request"
    },
    {
      id: 3,
      codigoCaso: "CL-RC-000123",
      tipo: "Evidencia",
      titulo: "Evidencia registrada correctamente",
      mensaje: "El archivo recibo_mayo_2026.pdf fue asociado al caso y está disponible para revisión.",
      fecha: "18/05/2026, 09:12",
      leida: true,
      icono: "evidence"
    },
    {
      id: 4,
      codigoCaso: "CL-IN-000074",
      tipo: "Resolución",
      titulo: "Incidencia resuelta",
      mensaje: "La incidencia técnica fue atendida correctamente. Puedes revisar el detalle y calificar la atención.",
      fecha: "14/05/2026, 16:45",
      leida: false,
      icono: "resolution"
    },
    {
      id: 5,
      codigoCaso: "CL-RC-000088",
      tipo: "SLA",
      titulo: "Caso escalado por control de plazo",
      mensaje: "El caso fue derivado a un área especializada para evitar retrasos en la atención.",
      fecha: "16/05/2026, 11:30",
      leida: true,
      icono: "sla"
    }
  ];

  async function initNotifications() {
    try {
      const usuario = typeof getUsuarioActual === "function" ? getUsuarioActual() : null;
      const clienteId = usuario?.id || 1;

      if (typeof getNotificacionesByCliente !== "function") {
        throw new Error("api.js no está disponible todavía.");
      }

      const response = await getNotificacionesByCliente(clienteId);

      notifications = response.notificaciones || response.data || [];
    } catch (error) {
      console.warn("Usando notificaciones simuladas:", error.message);
      notifications = fallbackNotifications;
    }

    renderNotifications();
    updateNotificationMetrics();
  }

  function renderNotifications() {
    const filtered = getFilteredNotifications();

    notificationsList.innerHTML = "";

    filtered.forEach((item) => {
      const element = document.createElement("article");
      element.className = `notification-item ${item.leida ? "" : "unread"}`;
      element.dataset.id = item.id;

      element.innerHTML = `
        <div class="notification-icon ${item.icono || getIconClassByType(item.tipo)}">
          <i class="${getIconByType(item.tipo)}"></i>
        </div>

        <div class="notification-content">
          <h3>${item.titulo}</h3>
          <p>${item.mensaje}</p>

          <div class="notification-meta">
            <span><i class="fa-solid fa-ticket"></i> ${item.codigoCaso}</span>
            <span><i class="fa-solid fa-tag"></i> ${item.tipo}</span>
            <span><i class="fa-solid fa-clock"></i> ${item.fecha}</span>
            <span>${item.leida ? "Leída" : "No leída"}</span>
          </div>
        </div>

        <div class="notification-actions">
          <button class="view-notification" data-id="${item.id}">Ver</button>
          <button class="ghost mark-read" data-id="${item.id}">
            ${item.leida ? "Leída" : "Marcar leída"}
          </button>
        </div>
      `;

      notificationsList.appendChild(element);
    });

    emptyNotifications.classList.toggle("hidden", filtered.length > 0);

    attachNotificationEvents();
  }

  function getFilteredNotifications() {
    const search = notificationSearch.value.trim().toLowerCase();
    const type = filterNotificationType.value;
    const readStatus = filterReadStatus.value;
    const caseCode = filterCaseCode.value;

    return notifications.filter((item) => {
      const matchesSearch =
        !search ||
        item.codigoCaso.toLowerCase().includes(search) ||
        item.titulo.toLowerCase().includes(search) ||
        item.mensaje.toLowerCase().includes(search) ||
        item.tipo.toLowerCase().includes(search);

      const matchesType = type === "all" || item.tipo === type;
      const matchesCase = caseCode === "all" || item.codigoCaso === caseCode;

      const matchesRead =
        readStatus === "all" ||
        (readStatus === "read" && item.leida) ||
        (readStatus === "unread" && !item.leida);

      return matchesSearch && matchesType && matchesCase && matchesRead;
    });
  }

  function attachNotificationEvents() {
    document.querySelectorAll(".view-notification").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const item = notifications.find((n) => n.id === id);

        if (item) {
          openNotificationDetail(item);
        }
      });
    });

    document.querySelectorAll(".mark-read").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.dataset.id);
        await markOneAsRead(id);
      });
    });
  }

  function openNotificationDetail(item) {
    notificationDetailTitle.textContent = item.titulo;
    notificationDetailSubtitle.textContent = `Notificación asociada al caso ${item.codigoCaso}.`;

    const rows = [
      ["Código de caso", item.codigoCaso],
      ["Tipo", item.tipo],
      ["Fecha", item.fecha],
      ["Estado", item.leida ? "Leída" : "No leída"],
      ["Mensaje", item.mensaje],
      ["Sugerencia IA", getSuggestionByType(item.tipo)]
    ];

    notificationDetailContent.innerHTML = rows
      .map(
        ([label, value]) => `
          <div class="preview-row">
            <strong>${label}</strong>
            <span>${value}</span>
          </div>
        `
      )
      .join("");

    notificationDetailModal.classList.add("active");
  }

  async function markOneAsRead(id) {
    const item = notifications.find((n) => n.id === id);

    if (!item || item.leida) return;

    try {
      if (typeof marcarNotificacionLeida === "function") {
        await marcarNotificacionLeida(id);
      }
    } catch (error) {
      console.warn("Marcado como leído simulado:", error.message);
    }

    item.leida = true;
    renderNotifications();
    updateNotificationMetrics();
    showNotificationToast("Notificación marcada como leída.");
  }

  function updateNotificationMetrics() {
    const unread = notifications.filter((n) => !n.leida).length;
    const status = notifications.filter((n) => n.tipo === "Cambio de estado").length;
    const requests = notifications.filter((n) => n.tipo === "Solicitud de información").length;
    const resolved = notifications.filter((n) => n.tipo === "Resolución").length;

    metricUnread.textContent = unread;
    metricStatus.textContent = status;
    metricRequests.textContent = requests;
    metricResolved.textContent = resolved;
    sidebarNotificationCount.textContent = unread;

    notificationAiSummary.textContent =
      unread > 0
        ? `Tienes ${unread} notificación(es) pendiente(s) de lectura.`
        : "No tienes notificaciones pendientes.";
  }

  function getIconByType(type) {
    const icons = {
      "Cambio de estado": "fa-solid fa-arrows-rotate",
      "Solicitud de información": "fa-solid fa-circle-exclamation",
      "Evidencia": "fa-solid fa-paperclip",
      "SLA": "fa-solid fa-hourglass-half",
      "Resolución": "fa-solid fa-circle-check"
    };

    return icons[type] || "fa-solid fa-bell";
  }

  function getIconClassByType(type) {
    const classes = {
      "Cambio de estado": "status",
      "Solicitud de información": "request",
      "Evidencia": "evidence",
      "SLA": "sla",
      "Resolución": "resolution"
    };

    return classes[type] || "status";
  }

  function getSuggestionByType(type) {
    const suggestions = {
      "Cambio de estado": "Revisa el detalle del caso para conocer el avance actualizado.",
      "Solicitud de información": "Adjunta la información solicitada para evitar retrasos.",
      "Evidencia": "Verifica que los archivos estén correctamente asociados al caso.",
      "SLA": "Revisa el plazo de atención y el estado actual del caso.",
      "Resolución": "Lee la solución registrada y califica la atención recibida."
    };

    return suggestions[type] || "Revisa el caso relacionado para mayor información.";
  }

  [notificationSearch, filterNotificationType, filterReadStatus, filterCaseCode].forEach((element) => {
    element.addEventListener("input", renderNotifications);
    element.addEventListener("change", renderNotifications);
  });

  clearNotificationFilters.addEventListener("click", () => {
    notificationSearch.value = "";
    filterNotificationType.value = "all";
    filterReadStatus.value = "all";
    filterCaseCode.value = "all";

    renderNotifications();
    showNotificationToast("Filtros limpiados correctamente.");
  });

  markAllRead.addEventListener("click", async () => {
    notifications.forEach((item) => {
      item.leida = true;
    });

    renderNotifications();
    updateNotificationMetrics();
    showNotificationToast("Todas las notificaciones fueron marcadas como leídas.");
  });

  refreshNotifications.addEventListener("click", () => {
    initNotifications();
    showNotificationToast("Notificaciones actualizadas.");
  });

  generateNotificationSummary.addEventListener("click", () => {
    const unread = notifications.filter((n) => !n.leida);
    const request = unread.find((n) => n.tipo === "Solicitud de información");

    notificationSummaryBox.innerHTML = request
      ? `<strong>Prioridad sugerida:</strong><br>Revisa primero la solicitud del caso ${request.codigoCaso}, porque puede retrasar la atención si no se responde.`
      : `<strong>Resumen generado:</strong><br>No hay solicitudes críticas pendientes. Puedes revisar los cambios de estado recientes.`;

    showNotificationToast("Resumen IA generado.");
  });

  saveNotificationPrefs.addEventListener("click", () => {
    showNotificationToast("Preferencias de notificación guardadas.");
  });

  closeNotificationDetail.addEventListener("click", () => {
    notificationDetailModal.classList.remove("active");
  });

  notificationDetailModal.addEventListener("click", (event) => {
    if (event.target === notificationDetailModal) {
      notificationDetailModal.classList.remove("active");
    }
  });

  function toggleNotificationBot() {
    notificationBot.classList.toggle("active");
  }

  openNotificationBot.addEventListener("click", toggleNotificationBot);
  openNotificationHelp.addEventListener("click", toggleNotificationBot);

  closeNotificationBot.addEventListener("click", () => {
    notificationBot.classList.remove("active");
  });

  function showNotificationToast(message, type = "success") {
    const existingToast = document.querySelector(".notification-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "notification-toast";
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

  initNotifications();
});