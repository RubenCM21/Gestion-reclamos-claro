document.addEventListener("DOMContentLoaded", () => {
  /*
    Estándar aplicado:
    - Primero consume api.js.
    - Si el backend no existe, usa demo temporal.
    - Si el backend respeta el contrato, no se modifica esta pantalla.
  */

  const auditRows = document.getElementById("auditRows");
  const emptyAudit = document.getElementById("emptyAudit");

  const auditSearch = document.getElementById("auditSearch");
  const filterAuditModule = document.getElementById("filterAuditModule");
  const filterAuditLevel = document.getElementById("filterAuditLevel");
  const filterAuditResult = document.getElementById("filterAuditResult");
  const filterAuditFrom = document.getElementById("filterAuditFrom");
  const filterAuditTo = document.getElementById("filterAuditTo");

  const metricTotalAudit = document.getElementById("metricTotalAudit");
  const metricInfoAudit = document.getElementById("metricInfoAudit");
  const metricSensitiveAudit = document.getElementById("metricSensitiveAudit");
  const metricCriticalAudit = document.getElementById("metricCriticalAudit");
  const sidebarAuditCount = document.getElementById("sidebarAuditCount");

  const auditAiTip = document.getElementById("auditAiTip");
  const auditSummaryBox = document.getElementById("auditSummaryBox");
  const auditModuleList = document.getElementById("auditModuleList");

  const clearAuditFilters = document.getElementById("clearAuditFilters");
  const refreshAudit = document.getElementById("refreshAudit");
  const exportAudit = document.getElementById("exportAudit");
  const analyzeAuditAi = document.getElementById("analyzeAuditAi");
  const showSensitiveEvents = document.getElementById("showSensitiveEvents");
  const prioritizeAuditAi = document.getElementById("prioritizeAuditAi");
  const generateAuditSummary = document.getElementById("generateAuditSummary");

  const auditTabs = document.querySelectorAll(".audit-tabs .case-filter");

  const auditDetailModal = document.getElementById("auditDetailModal");
  const closeAuditDetailModal = document.getElementById("closeAuditDetailModal");
  const auditDetailTitle = document.getElementById("auditDetailTitle");
  const auditDetailSubtitle = document.getElementById("auditDetailSubtitle");
  const auditDetailContent = document.getElementById("auditDetailContent");

  const auditBot = document.getElementById("auditBot");
  const openAuditBot = document.getElementById("openAuditBot");
  const openAuditHelp = document.getElementById("openAuditHelp");
  const closeAuditBot = document.getElementById("closeAuditBot");

  let auditEvents = [];

  const demoAuditEvents = [
    {
      id: 1,
      fecha: "Demo · 2026-05-19 09:20",
      usuario: "admin.sistema",
      modulo: "Usuarios",
      accion: "Crear usuario",
      nivel: "Sensible",
      resultado: "Exitoso",
      ip: "192.168.1.20",
      descripcion: "Se registró un nuevo usuario asesor en el sistema.",
      entidadAfectada: "usuarios",
      idEntidad: "USR-001"
    },
    {
      id: 2,
      fecha: "Demo · 2026-05-19 09:35",
      usuario: "admin.sistema",
      modulo: "Roles",
      accion: "Editar permisos",
      nivel: "Crítico",
      resultado: "Exitoso",
      ip: "192.168.1.20",
      descripcion: "Se modificaron permisos del rol Supervisor.",
      entidadAfectada: "roles",
      idEntidad: "ROL-003"
    },
    {
      id: 3,
      fecha: "Demo · 2026-05-19 10:05",
      usuario: "supervisor.atencion",
      modulo: "Casos",
      accion: "Asignar caso",
      nivel: "Informativo",
      resultado: "Exitoso",
      ip: "192.168.1.34",
      descripcion: "Se asignó el caso CL-IN-000140 a un asesor técnico.",
      entidadAfectada: "casos",
      idEntidad: "CL-IN-000140"
    },
    {
      id: 4,
      fecha: "Demo · 2026-05-19 10:20",
      usuario: "usuario.desconocido",
      modulo: "Autenticación",
      accion: "Intento de inicio de sesión",
      nivel: "Sensible",
      resultado: "Fallido",
      ip: "192.168.1.80",
      descripcion: "Intento de acceso con credenciales inválidas.",
      entidadAfectada: "login",
      idEntidad: "N/A"
    },
    {
      id: 5,
      fecha: "Demo · 2026-05-19 11:10",
      usuario: "admin.sistema",
      modulo: "Parámetros",
      accion: "Editar parámetro crítico",
      nivel: "Crítico",
      resultado: "Exitoso",
      ip: "192.168.1.20",
      descripcion: "Se modificó el SLA para casos críticos.",
      entidadAfectada: "parametros",
      idEntidad: "SLA_CRITICO_HORAS"
    },
    {
      id: 6,
      fecha: "Demo · 2026-05-19 11:40",
      usuario: "cliente.demo",
      modulo: "Autenticación",
      accion: "Acceso bloqueado",
      nivel: "Crítico",
      resultado: "Bloqueado",
      ip: "192.168.1.90",
      descripcion: "Cuenta bloqueada temporalmente por múltiples intentos fallidos.",
      entidadAfectada: "login",
      idEntidad: "cliente.demo"
    }
  ];

  async function initAudit() {
    try {
      /*
        Contrato esperado:
        GET /api/admin/auditoria

        Respuesta:
        {
          "success": true,
          "eventos": [
            {
              "id": 1,
              "fecha": "2026-05-19 09:20",
              "usuario": "admin.sistema",
              "modulo": "Usuarios",
              "accion": "Crear usuario",
              "nivel": "Sensible",
              "resultado": "Exitoso",
              "ip": "192.168.1.20",
              "descripcion": "Se registró un nuevo usuario asesor.",
              "entidadAfectada": "usuarios",
              "idEntidad": "USR-001"
            }
          ]
        }
      */

      if (typeof getAuditoria !== "function") {
        throw new Error("api.js no disponible.");
      }

      const response = await getAuditoria(getAuditParams());
      auditEvents = response.eventos || response.data || [];

      if (!Array.isArray(auditEvents)) {
        throw new Error("El backend no devolvió una lista válida de auditoría.");
      }

      if (auditEvents.length === 0) {
        throw new Error("No hay eventos registrados en backend.");
      }
    } catch (error) {
      console.warn("Backend no disponible. Usando auditoría demo temporal:", error.message);
      auditEvents = demoAuditEvents;
    }

    prioritizeAuditEvents();
    renderAuditRows();
    updateAuditMetrics();
    renderAuditModules();
  }

  function getAuditParams() {
    return {
      modulo: filterAuditModule.value,
      nivel: filterAuditLevel.value,
      resultado: filterAuditResult.value,
      desde: filterAuditFrom.value,
      hasta: filterAuditTo.value,
      busqueda: auditSearch.value.trim()
    };
  }

  function prioritizeAuditEvents() {
    auditEvents.sort((a, b) => {
      const levelDiff = getAuditLevelScore(b.nivel) - getAuditLevelScore(a.nivel);

      if (levelDiff !== 0) return levelDiff;

      return Number(b.id) - Number(a.id);
    });

    const first = auditEvents[0];

    if (first) {
      auditAiTip.textContent =
        `Priorizar revisión de ${first.modulo}: ${first.accion}, nivel ${first.nivel}, resultado ${first.resultado}.`;
    }
  }

  function renderAuditRows() {
    const filtered = getFilteredAudit();

    auditRows.innerHTML = "";

    filtered.forEach((item) => {
      const row = document.createElement("div");
      row.className = "audit-row";

      row.innerHTML = `
        <span>${item.fecha}</span>
        <span class="case-code">${item.usuario}</span>
        <span>${item.modulo}</span>
        <span>${item.accion}</span>
        <span class="audit-pill ${getAuditLevelClass(item.nivel)}">${item.nivel}</span>
        <span class="audit-pill ${getAuditResultClass(item.resultado)}">${item.resultado}</span>

        <div class="audit-actions">
          <button class="view-audit" data-id="${item.id}">Ver</button>
        </div>
      `;

      auditRows.appendChild(row);
    });

    emptyAudit.classList.toggle("hidden", filtered.length > 0);
    attachAuditEvents();
  }

  function getFilteredAudit() {
    const search = auditSearch.value.trim().toLowerCase();
    const module = filterAuditModule.value;
    const level = filterAuditLevel.value;
    const result = filterAuditResult.value;
    const from = filterAuditFrom.value;
    const to = filterAuditTo.value;

    return auditEvents.filter((item) => {
      const matchesSearch =
        !search ||
        String(item.usuario || "").toLowerCase().includes(search) ||
        String(item.accion || "").toLowerCase().includes(search) ||
        String(item.modulo || "").toLowerCase().includes(search) ||
        String(item.ip || "").toLowerCase().includes(search) ||
        String(item.descripcion || "").toLowerCase().includes(search);

      const matchesModule = module === "all" || item.modulo === module;
      const matchesLevel = level === "all" || item.nivel === level;
      const matchesResult = result === "all" || item.resultado === result;

      const cleanDate = String(item.fecha || "").replace("Demo · ", "").slice(0, 10);
      const matchesFrom = !from || cleanDate >= from;
      const matchesTo = !to || cleanDate <= to;

      return matchesSearch && matchesModule && matchesLevel && matchesResult && matchesFrom && matchesTo;
    });
  }

  function attachAuditEvents() {
    document.querySelectorAll(".view-audit").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const selected = auditEvents.find((item) => Number(item.id) === id);

        if (selected) {
          openAuditDetail(selected);
        }
      });
    });
  }

  function openAuditDetail(item) {
    auditDetailTitle.textContent = `${item.modulo} · ${item.accion}`;
    auditDetailSubtitle.textContent = `${item.nivel} · ${item.resultado}`;

    const rows = [
      ["ID", item.id],
      ["Fecha", item.fecha],
      ["Usuario", item.usuario],
      ["Módulo", item.modulo],
      ["Acción", item.accion],
      ["Nivel", item.nivel],
      ["Resultado", item.resultado],
      ["IP", item.ip || "No registrada"],
      ["Entidad afectada", item.entidadAfectada || "No registrada"],
      ["ID entidad", item.idEntidad || "No registrado"],
      ["Descripción", item.descripcion || "No registrada"]
    ];

    auditDetailContent.innerHTML = rows
      .map(
        ([label, value]) => `
          <div class="preview-row">
            <strong>${label}</strong>
            <span>${value}</span>
          </div>
        `
      )
      .join("");

    auditDetailModal.classList.add("active");
  }

  function updateAuditMetrics() {
    const total = auditEvents.length;
    const info = auditEvents.filter((item) => item.nivel === "Informativo").length;
    const sensitive = auditEvents.filter((item) => item.nivel === "Sensible").length;
    const critical = auditEvents.filter((item) => item.nivel === "Crítico").length;

    metricTotalAudit.textContent = total;
    metricInfoAudit.textContent = info;
    metricSensitiveAudit.textContent = sensitive;
    metricCriticalAudit.textContent = critical;
    sidebarAuditCount.textContent = total;

    auditAiTip.textContent =
      `Se registran ${total} eventos: ${info} informativos, ${sensitive} sensibles y ${critical} críticos.`;
  }

  function renderAuditModules() {
    const grouped = auditEvents.reduce((acc, item) => {
      acc[item.modulo] = (acc[item.modulo] || 0) + 1;
      return acc;
    }, {});

    auditModuleList.innerHTML = Object.entries(grouped)
      .map(
        ([module, count]) => `
          <div class="audit-module-item">
            <strong>${module}</strong>
            <span>${count} evento(s) registrados</span>
          </div>
        `
      )
      .join("");
  }

  function getAuditLevelScore(level) {
    const scores = {
      Informativo: 1,
      Sensible: 2,
      Crítico: 3
    };

    return scores[level] || 1;
  }

  function getAuditLevelClass(level) {
    const classes = {
      Informativo: "audit-info",
      Sensible: "audit-sensitive",
      Crítico: "audit-critical"
    };

    return classes[level] || "audit-info";
  }

  function getAuditResultClass(result) {
    const classes = {
      Exitoso: "audit-result-ok",
      Fallido: "audit-result-fail",
      Bloqueado: "audit-result-blocked"
    };

    return classes[result] || "audit-result-ok";
  }

  [
    auditSearch,
    filterAuditModule,
    filterAuditLevel,
    filterAuditResult,
    filterAuditFrom,
    filterAuditTo
  ].forEach((field) => {
    field.addEventListener("input", renderAuditRows);
    field.addEventListener("change", renderAuditRows);
  });

  clearAuditFilters.addEventListener("click", () => {
    auditSearch.value = "";
    filterAuditModule.value = "all";
    filterAuditLevel.value = "all";
    filterAuditResult.value = "all";
    filterAuditFrom.value = "";
    filterAuditTo.value = "";

    auditTabs.forEach((button) => button.classList.remove("active"));
    auditTabs[0].classList.add("active");

    renderAuditRows();
    showAuditToast("Filtros limpiados.");
  });

  auditTabs.forEach((button) => {
    button.addEventListener("click", () => {
      auditTabs.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      filterAuditLevel.value = button.dataset.level || "all";
      filterAuditModule.value = button.dataset.module || "all";

      renderAuditRows();
    });
  });

  refreshAudit.addEventListener("click", () => {
    initAudit();
    showAuditToast("Auditoría actualizada.");
  });

  exportAudit.addEventListener("click", () => {
    showAuditToast("Exportación de auditoría generada de forma simulada.");
  });

  showSensitiveEvents.addEventListener("click", () => {
    filterAuditLevel.value = "Sensible";
    renderAuditRows();
    showAuditToast("Mostrando eventos sensibles.");
  });

  prioritizeAuditAi.addEventListener("click", () => {
    prioritizeAuditEvents();
    renderAuditRows();
    showAuditToast("Eventos priorizados por riesgo.");
  });

  analyzeAuditAi.addEventListener("click", () => {
    const failed = auditEvents.filter((item) => item.resultado === "Fallido").length;
    const blocked = auditEvents.filter((item) => item.resultado === "Bloqueado").length;
    const critical = auditEvents.filter((item) => item.nivel === "Crítico").length;

    auditAiTip.textContent =
      `IA: revisar ${critical} evento(s) crítico(s), ${failed} fallido(s) y ${blocked} bloqueado(s).`;

    showAuditToast("Análisis IA de auditoría generado.");
  });

  generateAuditSummary.addEventListener("click", () => {
    const critical = auditEvents.filter((item) => item.nivel === "Crítico").length;
    const authEvents = auditEvents.filter((item) => item.modulo === "Autenticación").length;
    const paramEvents = auditEvents.filter((item) => item.modulo === "Parámetros").length;

    auditSummaryBox.innerHTML = `
      <strong>Análisis generado:</strong><br>
      Se identificaron ${critical} evento(s) críticos, ${authEvents} evento(s) de autenticación
      y ${paramEvents} cambio(s) asociados a parámetros. Se recomienda revisar accesos fallidos y cambios sensibles.
    `;

    showAuditToast("Resumen IA generado.");
  });

  closeAuditDetailModal.addEventListener("click", () => {
    auditDetailModal.classList.remove("active");
  });

  auditDetailModal.addEventListener("click", (event) => {
    if (event.target === auditDetailModal) {
      auditDetailModal.classList.remove("active");
    }
  });

  function toggleAuditBot() {
    auditBot.classList.toggle("active");
  }

  openAuditBot.addEventListener("click", toggleAuditBot);
  openAuditHelp.addEventListener("click", toggleAuditBot);

  closeAuditBot.addEventListener("click", () => {
    auditBot.classList.remove("active");
  });

  function showAuditToast(message, type = "success") {
    const existingToast = document.querySelector(".audit-toast");

    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "audit-toast";
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

  initAudit();
});