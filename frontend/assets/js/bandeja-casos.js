document.addEventListener("DOMContentLoaded", () => {
  const inboxRows = document.getElementById("inboxRows");
  const emptyInbox = document.getElementById("emptyInbox");

  const inboxSearch = document.getElementById("inboxSearch");
  const filterInboxType = document.getElementById("filterInboxType");
  const filterInboxStatus = document.getElementById("filterInboxStatus");
  const filterInboxPriority = document.getElementById("filterInboxPriority");
  const filterInboxService = document.getElementById("filterInboxService");
  const filterInboxSla = document.getElementById("filterInboxSla");

  const clearInboxFilters = document.getElementById("clearInboxFilters");
  const prioritizeWithAi = document.getElementById("prioritizeWithAi");
  const refreshInbox = document.getElementById("refreshInbox");
  const exportInbox = document.getElementById("exportInbox");
  const openNextRecommended = document.getElementById("openNextRecommended");

  const metricInboxTotal = document.getElementById("metricInboxTotal");
  const metricCriticalSla = document.getElementById("metricCriticalSla");
  const metricPendingClient = document.getElementById("metricPendingClient");
  const metricAttendedToday = document.getElementById("metricAttendedToday");
  const sidebarInboxCount = document.getElementById("sidebarInboxCount");
  const nextCaseSuggestion = document.getElementById("nextCaseSuggestion");

  const tabButtons = document.querySelectorAll(".inbox-tabs .case-filter");

  const inboxDetailModal = document.getElementById("inboxDetailModal");
  const closeInboxDetail = document.getElementById("closeInboxDetail");
  const inboxDetailTitle = document.getElementById("inboxDetailTitle");
  const inboxDetailSubtitle = document.getElementById("inboxDetailSubtitle");
  const inboxDetailContent = document.getElementById("inboxDetailContent");

  const inboxBot = document.getElementById("inboxBot");
  const openInboxBot = document.getElementById("openInboxBot");
  const openInboxHelp = document.getElementById("openInboxHelp");
  const closeInboxBot = document.getElementById("closeInboxBot");

  let inboxCases = [];

  const fallbackCases = [
    {
      codigoCaso: "CL-IN-000099",
      cliente: "Cliente Claro",
      tipo: "Incidencia",
      servicio: "Telefonía móvil",
      categoria: "Sin servicio",
      prioridad: "Crítica",
      estado: "Pendiente cliente",
      slaRestante: 4,
      resumen: "Cliente reporta ausencia total de señal móvil."
    },
    {
      codigoCaso: "CL-RC-000123",
      cliente: "Cliente Claro",
      tipo: "Reclamo",
      servicio: "Internet hogar",
      categoria: "Facturación",
      prioridad: "Alta",
      estado: "En atención",
      slaRestante: 18,
      resumen: "Cliente observa monto mayor al esperado en recibo mensual."
    },
    {
      codigoCaso: "CL-RC-000088",
      cliente: "Cliente Claro",
      tipo: "Reclamo",
      servicio: "Claro TV+",
      categoria: "Atención recibida",
      prioridad: "Media",
      estado: "Escalado",
      slaRestante: 10,
      resumen: "Disconformidad con respuesta previa recibida."
    },
    {
      codigoCaso: "CL-IN-000074",
      cliente: "Cliente Claro",
      tipo: "Incidencia",
      servicio: "Internet hogar",
      categoria: "Intermitencia",
      prioridad: "Alta",
      estado: "En atención",
      slaRestante: 7,
      resumen: "Internet intermitente durante horarios específicos."
    },
    {
      codigoCaso: "CL-RC-000061",
      cliente: "Cliente Claro",
      tipo: "Reclamo",
      servicio: "Telefonía fija",
      categoria: "Contrato o plan",
      prioridad: "Baja",
      estado: "Registrado",
      slaRestante: 36,
      resumen: "Solicitud de revisión de condiciones del plan contratado."
    }
  ];

  async function initInbox() {
    try {
      const usuario = typeof getUsuarioActual === "function" ? getUsuarioActual() : null;
      const asesorId = usuario?.id || 1;

      if (typeof getCasosByAsesor !== "function") {
        throw new Error("api.js no disponible.");
      }

      const response = await getCasosByAsesor(asesorId);
      inboxCases = response.casos || response.data || [];
    } catch (error) {
      console.warn("Usando bandeja simulada:", error.message);
      inboxCases = fallbackCases;
    }

    prioritizeCases();
    renderInbox();
    updateInboxMetrics();
  }

  function prioritizeCases() {
    inboxCases.sort((a, b) => {
      const priorityDiff = getPriorityScore(b.prioridad) - getPriorityScore(a.prioridad);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return Number(a.slaRestante) - Number(b.slaRestante);
    });

    const first = inboxCases[0];

    if (first) {
      nextCaseSuggestion.textContent =
        `${first.codigoCaso} por prioridad ${first.prioridad.toLowerCase()} y SLA de ${first.slaRestante} horas.`;
    }
  }

  function renderInbox() {
    const filtered = getFilteredCases();

    inboxRows.innerHTML = "";

    filtered.forEach((item) => {
      const row = document.createElement("div");
      row.className = "inbox-row";

      row.innerHTML = `
        <span class="case-code">${item.codigoCaso}</span>
        <span>${item.cliente}</span>
        <span>${item.tipo}</span>
        <span>${item.servicio}</span>
        <span class="priority-pill ${getPriorityClass(item.prioridad)}">${item.prioridad}</span>
        <span class="status-pill ${getStatusClass(item.estado)}">${item.estado}</span>
        <span class="sla-tag ${getSlaClass(item.slaRestante)}">${item.slaRestante} h</span>

        <div class="inbox-actions">
          <a href="detalle-atencion.html">Atender</a>
          <button class="ghost view-inbox-detail" data-code="${item.codigoCaso}">
            Ver
          </button>
          <a href="actualizar-seguimiento.html">Actualizar</a>
        </div>
      `;

      inboxRows.appendChild(row);
    });

    emptyInbox.classList.toggle("hidden", filtered.length > 0);
    attachInboxEvents();
  }

  function getFilteredCases() {
    const search = inboxSearch.value.trim().toLowerCase();
    const type = filterInboxType.value;
    const status = filterInboxStatus.value;
    const priority = filterInboxPriority.value;
    const service = filterInboxService.value;
    const sla = filterInboxSla.value;

    return inboxCases.filter((item) => {
      const matchesSearch =
        !search ||
        item.codigoCaso.toLowerCase().includes(search) ||
        item.cliente.toLowerCase().includes(search) ||
        item.servicio.toLowerCase().includes(search) ||
        item.categoria.toLowerCase().includes(search);

      const matchesType = type === "all" || item.tipo === type;
      const matchesStatus = status === "all" || item.estado === status;
      const matchesPriority = priority === "all" || item.prioridad === priority;
      const matchesService = service === "all" || item.servicio === service;

      const matchesSla =
        sla === "all" ||
        (sla === "critical" && Number(item.slaRestante) <= 6) ||
        (sla === "risk" && Number(item.slaRestante) <= 12) ||
        (sla === "normal" && Number(item.slaRestante) > 12);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesPriority &&
        matchesService &&
        matchesSla
      );
    });
  }

  function attachInboxEvents() {
    document.querySelectorAll(".view-inbox-detail").forEach((button) => {
      button.addEventListener("click", () => {
        const code = button.dataset.code;
        const selected = inboxCases.find((item) => item.codigoCaso === code);

        if (selected) {
          openInboxDetail(selected);
        }
      });
    });
  }

  function openInboxDetail(item) {
    inboxDetailTitle.textContent = `Detalle rápido ${item.codigoCaso}`;
    inboxDetailSubtitle.textContent = `${item.tipo} · ${item.servicio}`;

    const rows = [
      ["Código", item.codigoCaso],
      ["Cliente", item.cliente],
      ["Tipo", item.tipo],
      ["Servicio", item.servicio],
      ["Categoría", item.categoria],
      ["Prioridad", item.prioridad],
      ["Estado", item.estado],
      ["SLA restante", `${item.slaRestante} horas`],
      ["Resumen", item.resumen],
      ["Sugerencia IA", getAiSuggestion(item)]
    ];

    inboxDetailContent.innerHTML = rows
      .map(
        ([label, value]) => `
          <div class="preview-row">
            <strong>${label}</strong>
            <span>${value}</span>
          </div>
        `
      )
      .join("");

    inboxDetailModal.classList.add("active");
  }

  function getAiSuggestion(item) {
    if (item.prioridad === "Crítica" || Number(item.slaRestante) <= 6) {
      return "Atender de inmediato y verificar si se requiere información adicional del cliente.";
    }

    if (item.estado === "Pendiente cliente") {
      return "Enviar recordatorio o revisar si la solicitud de información fue clara.";
    }

    if (item.estado === "Escalado") {
      return "Revisar la respuesta del área especializada antes de actualizar al cliente.";
    }

    return "Continuar con revisión normal y registrar avance en el seguimiento.";
  }

  function updateInboxMetrics() {
    const total = inboxCases.length;
    const criticalSla = inboxCases.filter((item) => Number(item.slaRestante) <= 6).length;
    const pendingClient = inboxCases.filter((item) => item.estado === "Pendiente cliente").length;

    metricInboxTotal.textContent = total;
    metricCriticalSla.textContent = criticalSla;
    metricPendingClient.textContent = pendingClient;
    metricAttendedToday.textContent = 7;
    sidebarInboxCount.textContent = total;
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

  function getStatusClass(status) {
    const classes = {
      "Registrado": "status-blue",
      "En atención": "status-blue",
      "Pendiente cliente": "status-orange",
      "Escalado": "status-red",
      "Resuelto": "status-green"
    };

    return classes[status] || "status-blue";
  }

  function getSlaClass(hours) {
    if (Number(hours) <= 6) return "sla-critical";
    if (Number(hours) <= 12) return "sla-risk";
    return "sla-normal";
  }

  [
    inboxSearch,
    filterInboxType,
    filterInboxStatus,
    filterInboxPriority,
    filterInboxService,
    filterInboxSla
  ].forEach((element) => {
    element.addEventListener("input", renderInbox);
    element.addEventListener("change", renderInbox);
  });

  clearInboxFilters.addEventListener("click", () => {
    inboxSearch.value = "";
    filterInboxType.value = "all";
    filterInboxStatus.value = "all";
    filterInboxPriority.value = "all";
    filterInboxService.value = "all";
    filterInboxSla.value = "all";

    tabButtons.forEach((button) => button.classList.remove("active"));
    tabButtons[0].classList.add("active");

    renderInbox();
    showInboxToast("Filtros limpiados.");
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const tab = button.dataset.tab;

      filterInboxPriority.value = "all";
      filterInboxStatus.value = "all";

      if (tab === "Crítica" || tab === "Alta") {
        filterInboxPriority.value = tab;
      } else if (tab !== "all") {
        filterInboxStatus.value = tab;
      }

      renderInbox();
    });
  });

  prioritizeWithAi.addEventListener("click", () => {
    prioritizeCases();
    renderInbox();
    showInboxToast("Bandeja priorizada con IA.");
  });

  refreshInbox.addEventListener("click", () => {
    initInbox();
    showInboxToast("Bandeja actualizada.");
  });

  exportInbox.addEventListener("click", () => {
    showInboxToast("Exportación de bandeja generada de forma simulada.");
  });

  openNextRecommended.addEventListener("click", () => {
    const first = inboxCases[0];

    if (first) {
      openInboxDetail(first);
    }
  });

  closeInboxDetail.addEventListener("click", () => {
    inboxDetailModal.classList.remove("active");
  });

  inboxDetailModal.addEventListener("click", (event) => {
    if (event.target === inboxDetailModal) {
      inboxDetailModal.classList.remove("active");
    }
  });

  function toggleInboxBot() {
    inboxBot.classList.toggle("active");
  }

  openInboxBot.addEventListener("click", toggleInboxBot);
  openInboxHelp.addEventListener("click", toggleInboxBot);

  closeInboxBot.addEventListener("click", () => {
    inboxBot.classList.remove("active");
  });

  function showInboxToast(message, type = "success") {
    const existingToast = document.querySelector(".inbox-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "inbox-toast";
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

  initInbox();
});