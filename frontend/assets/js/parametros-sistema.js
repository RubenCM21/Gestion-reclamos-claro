document.addEventListener("DOMContentLoaded", () => {
  /*
    Estándar aplicado:
    - Primero consume api.js.
    - Si el backend no existe, usa demo temporal.
    - Si el backend respeta el contrato, no se modifica esta pantalla.
  */

  const paramsRows = document.getElementById("paramsRows");
  const emptyParams = document.getElementById("emptyParams");

  const paramSearch = document.getElementById("paramSearch");
  const filterParamCategory = document.getElementById("filterParamCategory");
  const filterParamStatus = document.getElementById("filterParamStatus");
  const filterParamCriticality = document.getElementById("filterParamCriticality");

  const metricTotalParams = document.getElementById("metricTotalParams");
  const metricActiveParams = document.getElementById("metricActiveParams");
  const metricCriticalParams = document.getElementById("metricCriticalParams");
  const metricSecurityParams = document.getElementById("metricSecurityParams");
  const sidebarParamsCount = document.getElementById("sidebarParamsCount");

  const paramsAiTip = document.getElementById("paramsAiTip");
  const paramsSummaryBox = document.getElementById("paramsSummaryBox");

  const clearParamFilters = document.getElementById("clearParamFilters");
  const refreshParams = document.getElementById("refreshParams");
  const exportParams = document.getElementById("exportParams");
  const analyzeParamsAi = document.getElementById("analyzeParamsAi");
  const generateParamsSummary = document.getElementById("generateParamsSummary");

  const paramModal = document.getElementById("paramModal");
  const openCreateParamModal = document.getElementById("openCreateParamModal");
  const openCreateParamModalHero = document.getElementById("openCreateParamModalHero");
  const closeParamModal = document.getElementById("closeParamModal");
  const cancelParamForm = document.getElementById("cancelParamForm");
  const paramForm = document.getElementById("paramForm");

  const paramModalTitle = document.getElementById("paramModalTitle");
  const paramId = document.getElementById("paramId");
  const paramCode = document.getElementById("paramCode");
  const paramName = document.getElementById("paramName");
  const paramCategory = document.getElementById("paramCategory");
  const paramValue = document.getElementById("paramValue");
  const paramDataType = document.getElementById("paramDataType");
  const paramCriticality = document.getElementById("paramCriticality");
  const paramStatus = document.getElementById("paramStatus");
  const paramRequiresAudit = document.getElementById("paramRequiresAudit");
  const paramDescription = document.getElementById("paramDescription");
  const paramObservation = document.getElementById("paramObservation");

  const paramDetailModal = document.getElementById("paramDetailModal");
  const closeParamDetailModal = document.getElementById("closeParamDetailModal");
  const paramDetailTitle = document.getElementById("paramDetailTitle");
  const paramDetailSubtitle = document.getElementById("paramDetailSubtitle");
  const paramDetailContent = document.getElementById("paramDetailContent");

  const paramsBot = document.getElementById("paramsBot");
  const openParamsBot = document.getElementById("openParamsBot");
  const openParamsHelp = document.getElementById("openParamsHelp");
  const closeParamsBot = document.getElementById("closeParamsBot");

  let parameters = [];

  const demoParameters = [
    {
      id: 1,
      codigo: "SLA_CRITICO_HORAS",
      nombre: "SLA para casos críticos",
      categoria: "SLA",
      valor: "6",
      tipoDato: "Tiempo",
      criticidad: "Alta",
      estado: "Activo",
      requiereAuditoria: "Sí",
      descripcion: "Tiempo máximo en horas para atención de casos críticos."
    },
    {
      id: 2,
      codigo: "SLA_ALTO_HORAS",
      nombre: "SLA para casos de prioridad alta",
      categoria: "SLA",
      valor: "12",
      tipoDato: "Tiempo",
      criticidad: "Alta",
      estado: "Activo",
      requiereAuditoria: "Sí",
      descripcion: "Tiempo máximo en horas para atención de casos de prioridad alta."
    },
    {
      id: 3,
      codigo: "MAX_ADJUNTO_MB",
      nombre: "Tamaño máximo de adjunto",
      categoria: "Adjuntos",
      valor: "15",
      tipoDato: "Número",
      criticidad: "Media",
      estado: "Activo",
      requiereAuditoria: "Sí",
      descripcion: "Límite máximo en MB para archivos adjuntos."
    },
    {
      id: 4,
      codigo: "CANAL_WEBAPP_ACTIVO",
      nombre: "Canal WebApp activo",
      categoria: "Canales",
      valor: "true",
      tipoDato: "Booleano",
      criticidad: "Alta",
      estado: "Activo",
      requiereAuditoria: "Sí",
      descripcion: "Habilita o deshabilita el canal WebApp."
    },
    {
      id: 5,
      codigo: "NOTIF_CORREO_ACTIVA",
      nombre: "Notificaciones por correo",
      categoria: "Notificaciones",
      valor: "true",
      tipoDato: "Booleano",
      criticidad: "Media",
      estado: "Activo",
      requiereAuditoria: "No",
      descripcion: "Controla el envío de notificaciones por correo."
    },
    {
      id: 6,
      codigo: "SESSION_TIMEOUT_MIN",
      nombre: "Tiempo de sesión",
      categoria: "Seguridad",
      valor: "30",
      tipoDato: "Tiempo",
      criticidad: "Alta",
      estado: "Activo",
      requiereAuditoria: "Sí",
      descripcion: "Tiempo máximo de inactividad antes de cerrar sesión."
    }
  ];

  async function initParameters() {
    try {
      /*
        Contrato esperado:
        GET /api/admin/parametros

        Respuesta:
        {
          "success": true,
          "parametros": [
            {
              "id": 1,
              "codigo": "SLA_CRITICO_HORAS",
              "nombre": "SLA para casos críticos",
              "categoria": "SLA",
              "valor": "6",
              "tipoDato": "Tiempo",
              "criticidad": "Alta",
              "estado": "Activo",
              "requiereAuditoria": "Sí",
              "descripcion": "Tiempo máximo en horas para atención de casos críticos."
            }
          ]
        }
      */

      if (typeof getParametros !== "function") {
        throw new Error("api.js no disponible.");
      }

      const response = await getParametros();
      parameters = response.parametros || response.data || [];

      if (!Array.isArray(parameters)) {
        throw new Error("El backend no devolvió una lista válida de parámetros.");
      }

      if (parameters.length === 0) {
        throw new Error("No hay parámetros registrados en backend.");
      }
    } catch (error) {
      console.warn("Backend no disponible. Usando parámetros demo temporales:", error.message);
      parameters = demoParameters;
    }

    renderParameters();
    updateParameterMetrics();
  }

  function renderParameters() {
    const filtered = getFilteredParameters();

    paramsRows.innerHTML = "";

    filtered.forEach((item) => {
      const row = document.createElement("div");
      row.className = "param-row";

      row.innerHTML = `
        <span class="case-code">${item.codigo}</span>
        <span>${item.nombre}</span>
        <span>${item.categoria}</span>
        <span>${item.valor}</span>
        <span class="param-pill ${getCriticalityClass(item.criticidad)}">${item.criticidad}</span>
        <span class="param-pill ${getStatusClass(item.estado)}">${item.estado}</span>

        <div class="param-actions">
          <button class="view-param" data-id="${item.id}">Ver</button>
          <button class="ghost edit-param" data-id="${item.id}">Editar</button>
          <button class="ghost toggle-param" data-id="${item.id}">
            ${item.estado === "Activo" ? "Desactivar" : "Activar"}
          </button>
        </div>
      `;

      paramsRows.appendChild(row);
    });

    emptyParams.classList.toggle("hidden", filtered.length > 0);
    attachParameterEvents();
  }

  function getFilteredParameters() {
    const search = paramSearch.value.trim().toLowerCase();
    const category = filterParamCategory.value;
    const status = filterParamStatus.value;
    const criticality = filterParamCriticality.value;

    return parameters.filter((item) => {
      const matchesSearch =
        !search ||
        String(item.codigo || "").toLowerCase().includes(search) ||
        String(item.nombre || "").toLowerCase().includes(search) ||
        String(item.valor || "").toLowerCase().includes(search) ||
        String(item.descripcion || "").toLowerCase().includes(search);

      const matchesCategory = category === "all" || item.categoria === category;
      const matchesStatus = status === "all" || item.estado === status;
      const matchesCriticality = criticality === "all" || item.criticidad === criticality;

      return matchesSearch && matchesCategory && matchesStatus && matchesCriticality;
    });
  }

  function attachParameterEvents() {
    document.querySelectorAll(".view-param").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const selected = parameters.find((item) => Number(item.id) === id);

        if (selected) {
          openParameterDetail(selected);
        }
      });
    });

    document.querySelectorAll(".edit-param").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const selected = parameters.find((item) => Number(item.id) === id);

        if (selected) {
          openParameterForm(selected);
        }
      });
    });

    document.querySelectorAll(".toggle-param").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.dataset.id);
        const selected = parameters.find((item) => Number(item.id) === id);

        if (selected) {
          await toggleParameterStatus(selected);
        }
      });
    });
  }

  function openParameterDetail(item) {
    paramDetailTitle.textContent = item.nombre;
    paramDetailSubtitle.textContent = `${item.categoria} · ${item.criticidad}`;

    const rows = [
      ["ID", item.id],
      ["Código", item.codigo],
      ["Nombre", item.nombre],
      ["Categoría", item.categoria],
      ["Valor", item.valor],
      ["Tipo de dato", item.tipoDato],
      ["Criticidad", item.criticidad],
      ["Estado", item.estado],
      ["Requiere auditoría", item.requiereAuditoria],
      ["Descripción", item.descripcion || "No registrada"]
    ];

    paramDetailContent.innerHTML = rows
      .map(
        ([label, value]) => `
          <div class="preview-row">
            <strong>${label}</strong>
            <span>${value}</span>
          </div>
        `
      )
      .join("");

    paramDetailModal.classList.add("active");
  }

  function openParameterForm(item = null) {
    paramForm.reset();

    if (item) {
      paramModalTitle.textContent = "Editar parámetro";
      paramId.value = item.id;
      paramCode.value = item.codigo;
      paramName.value = item.nombre;
      paramCategory.value = item.categoria;
      paramValue.value = item.valor;
      paramDataType.value = item.tipoDato;
      paramCriticality.value = item.criticidad;
      paramStatus.value = item.estado;
      paramRequiresAudit.value = item.requiereAuditoria;
      paramDescription.value = item.descripcion || "";
      paramObservation.value = "";
    } else {
      paramModalTitle.textContent = "Nuevo parámetro";
      paramId.value = "";
      paramStatus.value = "Activo";
      paramRequiresAudit.value = "Sí";
    }

    paramModal.classList.add("active");
  }

  async function saveParameter() {
    const data = {
      id: paramId.value ? Number(paramId.value) : null,
      codigo: paramCode.value.trim(),
      nombre: paramName.value.trim(),
      categoria: paramCategory.value,
      valor: paramValue.value.trim(),
      tipoDato: paramDataType.value,
      criticidad: paramCriticality.value,
      estado: paramStatus.value,
      requiereAuditoria: paramRequiresAudit.value,
      descripcion: paramDescription.value.trim(),
      observacion: paramObservation.value.trim()
    };

    try {
      if (!data.id && typeof createParametro === "function") {
        const response = await createParametro(data);
        const createdParam = response.parametro || response.data || data;

        parameters.push({
          ...createdParam,
          id: createdParam.id || Date.now()
        });
      } else if (data.id && typeof updateParametro === "function") {
        const response = await updateParametro(data.id, data);
        const updatedParam = response.parametro || response.data || data;

        parameters = parameters.map((item) =>
          Number(item.id) === Number(data.id)
            ? { ...item, ...updatedParam }
            : item
        );
      } else {
        throw new Error("Endpoint de guardado de parámetro no disponible todavía.");
      }
    } catch (error) {
      console.warn("Guardado simulado de parámetro:", error.message);

      if (data.id) {
        parameters = parameters.map((item) =>
          Number(item.id) === Number(data.id)
            ? { ...item, ...data }
            : item
        );
      } else {
        parameters.push({
          ...data,
          id: Date.now()
        });
      }
    }

    paramModal.classList.remove("active");
    renderParameters();
    updateParameterMetrics();
    showParamsToast("Parámetro guardado correctamente.");
  }

  async function toggleParameterStatus(item) {
    const newStatus = item.estado === "Activo" ? "Inactivo" : "Activo";

    try {
      if (typeof updateParametro === "function") {
        await updateParametro(item.id, { estado: newStatus });
      } else {
        throw new Error("updateParametro no disponible en api.js.");
      }
    } catch (error) {
      console.warn("Cambio de estado simulado:", error.message);
    }

    item.estado = newStatus;
    renderParameters();
    updateParameterMetrics();
    showParamsToast(`Parámetro ${newStatus.toLowerCase()} correctamente.`);
  }

  function updateParameterMetrics() {
    const total = parameters.length;
    const active = parameters.filter((item) => item.estado === "Activo").length;
    const critical = parameters.filter((item) => item.criticidad === "Alta").length;
    const security = parameters.filter((item) => item.categoria === "Seguridad").length;

    metricTotalParams.textContent = total;
    metricActiveParams.textContent = active;
    metricCriticalParams.textContent = critical;
    metricSecurityParams.textContent = security;
    sidebarParamsCount.textContent = total;

    paramsAiTip.textContent =
      `Se registran ${total} parámetros: ${active} activos, ${critical} críticos y ${security} de seguridad.`;
  }

  function getCriticalityClass(value) {
    if (value === "Alta") return "param-high";
    if (value === "Media") return "param-medium";
    return "param-low";
  }

  function getStatusClass(value) {
    return value === "Activo" ? "param-active" : "param-inactive";
  }

  [paramSearch, filterParamCategory, filterParamStatus, filterParamCriticality].forEach((field) => {
    field.addEventListener("input", renderParameters);
    field.addEventListener("change", renderParameters);
  });

  clearParamFilters.addEventListener("click", () => {
    paramSearch.value = "";
    filterParamCategory.value = "all";
    filterParamStatus.value = "all";
    filterParamCriticality.value = "all";

    renderParameters();
    showParamsToast("Filtros limpiados.");
  });

  refreshParams.addEventListener("click", () => {
    initParameters();
    showParamsToast("Parámetros actualizados.");
  });

  exportParams.addEventListener("click", () => {
    showParamsToast("Exportación de parámetros generada de forma simulada.");
  });

  analyzeParamsAi.addEventListener("click", () => {
    const critical = parameters.filter((item) => item.criticidad === "Alta").length;
    const security = parameters.filter((item) => item.categoria === "Seguridad").length;
    const inactive = parameters.filter((item) => item.estado === "Inactivo").length;

    paramsAiTip.textContent =
      `IA: revisar ${critical} parámetro(s) críticos, ${security} de seguridad y ${inactive} inactivo(s).`;

    showParamsToast("Análisis IA de parámetros generado.");
  });

  generateParamsSummary.addEventListener("click", () => {
    const byCategory = parameters.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1;
      return acc;
    }, {});

    const summary = Object.entries(byCategory)
      .map(([category, count]) => `${category}: ${count}`)
      .join(", ");

    paramsSummaryBox.innerHTML = `
      <strong>Análisis generado:</strong><br>
      Parámetros registrados por categoría: ${summary || "sin información"}.
      Se recomienda auditar cambios en SLA, seguridad y límites de adjuntos.
    `;

    showParamsToast("Resumen IA generado.");
  });

  openCreateParamModal.addEventListener("click", () => openParameterForm());
  openCreateParamModalHero.addEventListener("click", () => openParameterForm());

  closeParamModal.addEventListener("click", () => paramModal.classList.remove("active"));
  cancelParamForm.addEventListener("click", () => paramModal.classList.remove("active"));

  paramModal.addEventListener("click", (event) => {
    if (event.target === paramModal) {
      paramModal.classList.remove("active");
    }
  });

  paramForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveParameter();
  });

  closeParamDetailModal.addEventListener("click", () => {
    paramDetailModal.classList.remove("active");
  });

  paramDetailModal.addEventListener("click", (event) => {
    if (event.target === paramDetailModal) {
      paramDetailModal.classList.remove("active");
    }
  });

  function toggleParamsBot() {
    paramsBot.classList.toggle("active");
  }

  openParamsBot.addEventListener("click", toggleParamsBot);
  openParamsHelp.addEventListener("click", toggleParamsBot);

  closeParamsBot.addEventListener("click", () => {
    paramsBot.classList.remove("active");
  });

  function showParamsToast(message, type = "success") {
    const existingToast = document.querySelector(".params-toast");

    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "params-toast";
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

  initParameters();
});