document.addEventListener("DOMContentLoaded", () => {
  const classifyCaseList = document.getElementById("classifyCaseList");
  const emptyClassify = document.getElementById("emptyClassify");

  const classifySearch = document.getElementById("classifySearch");
  const filterClassifyType = document.getElementById("filterClassifyType");
  const filterClassifyService = document.getElementById("filterClassifyService");

  const metricPendingClassify = document.getElementById("metricPendingClassify");
  const metricHighCriticality = document.getElementById("metricHighCriticality");
  const metricAvgSla = document.getElementById("metricAvgSla");
  const metricClassifiedToday = document.getElementById("metricClassifiedToday");
  const sidebarClassifyCount = document.getElementById("sidebarClassifyCount");

  const classifyForm = document.getElementById("classifyForm");

  const selectedCaseCode = document.getElementById("selectedCaseCode");
  const selectedCaseType = document.getElementById("selectedCaseType");
  const selectedService = document.getElementById("selectedService");
  const selectedStatus = document.getElementById("selectedStatus");
  const selectedSummary = document.getElementById("selectedSummary");

  const classificationCategory = document.getElementById("classificationCategory");
  const classificationPriority = document.getElementById("classificationPriority");
  const classificationSla = document.getElementById("classificationSla");
  const classificationRoute = document.getElementById("classificationRoute");
  const classificationObservation = document.getElementById("classificationObservation");
  const classificationCounter = document.getElementById("classificationCounter");

  const improveClassificationObservation = document.getElementById("improveClassificationObservation");
  const refreshClassifyCases = document.getElementById("refreshClassifyCases");
  const classifyRecommended = document.getElementById("classifyRecommended");
  const autoSuggestClassify = document.getElementById("autoSuggestClassify");
  const classifyAiTip = document.getElementById("classifyAiTip");

  const previewClassification = document.getElementById("previewClassification");
  const classificationPreviewModal = document.getElementById("classificationPreviewModal");
  const closeClassificationPreview = document.getElementById("closeClassificationPreview");
  const classificationPreviewContent = document.getElementById("classificationPreviewContent");
  const confirmClassificationFromPreview = document.getElementById("confirmClassificationFromPreview");

  const classificationSuccessModal = document.getElementById("classificationSuccessModal");
  const classificationSuccessCode = document.getElementById("classificationSuccessCode");

  const classifyBot = document.getElementById("classifyBot");
  const openClassifyBot = document.getElementById("openClassifyBot");
  const openClassifyHelp = document.getElementById("openClassifyHelp");
  const closeClassifyBot = document.getElementById("closeClassifyBot");

  let cases = [];
  let selectedCase = null;

  const fallbackCases = [
    {
      codigoCaso: "CL-IN-000140",
      tipo: "Incidencia",
      servicio: "Internet hogar",
      estado: "Registrado",
      resumen: "Cliente reporta caída total del servicio de internet hogar desde la mañana.",
      categoriaSugerida: "Sin servicio",
      prioridadSugerida: "Crítica",
      slaSugerido: "6",
      rutaSugerida: "Soporte técnico hogar"
    },
    {
      codigoCaso: "CL-RC-000137",
      tipo: "Reclamo",
      servicio: "Telefonía móvil",
      estado: "Registrado",
      resumen: "Cliente indica cobro no reconocido en su recibo mensual.",
      categoriaSugerida: "Cobro no reconocido",
      prioridadSugerida: "Alta",
      slaSugerido: "24",
      rutaSugerida: "Facturación y cobranza"
    },
    {
      codigoCaso: "CL-IN-000133",
      tipo: "Incidencia",
      servicio: "Claro TV+",
      estado: "Registrado",
      resumen: "Cliente reporta corte de señal y adjunta captura del error en pantalla.",
      categoriaSugerida: "Sin servicio",
      prioridadSugerida: "Alta",
      slaSugerido: "12",
      rutaSugerida: "Soporte técnico hogar"
    },
    {
      codigoCaso: "CL-RC-000128",
      tipo: "Reclamo",
      servicio: "Internet hogar",
      estado: "Registrado",
      resumen: "Cliente solicita revisión de condiciones del plan contratado.",
      categoriaSugerida: "Contrato o plan",
      prioridadSugerida: "Media",
      slaSugerido: "48",
      rutaSugerida: "Atención comercial"
    }
  ];

  async function initClassifyCases() {
    try {
      if (typeof getCasosPendientesClasificacion !== "function") {
        throw new Error("api.js no disponible.");
      }

      const response = await getCasosPendientesClasificacion();
      cases = response.casos || response.data || [];

      if (cases.length === 0) {
        throw new Error("Sin casos pendientes.");
      }
    } catch (error) {
      console.warn("Usando casos simulados para clasificación:", error.message);
      cases = fallbackCases;
    }

    renderCases();
    updateMetrics();

    if (cases.length > 0) {
      selectCase(cases[0].codigoCaso);
    }
  }

  function renderCases() {
    const filtered = getFilteredCases();
    classifyCaseList.innerHTML = "";

    filtered.forEach((item) => {
      const card = document.createElement("article");
      card.className = `classify-case-card ${selectedCase?.codigoCaso === item.codigoCaso ? "active" : ""}`;
      card.dataset.code = item.codigoCaso;

      card.innerHTML = `
        <h3>${item.codigoCaso} · ${item.tipo}</h3>
        <p>${item.resumen}</p>

        <div class="classify-case-meta">
          <span>${item.servicio}</span>
          <span>${item.estado}</span>
          <span>Sug.: ${item.prioridadSugerida || "Media"}</span>
        </div>
      `;

      card.addEventListener("click", () => {
        selectCase(item.codigoCaso);
      });

      classifyCaseList.appendChild(card);
    });

    emptyClassify.classList.toggle("hidden", filtered.length > 0);
  }

  function getFilteredCases() {
    const search = classifySearch.value.trim().toLowerCase();
    const type = filterClassifyType.value;
    const service = filterClassifyService.value;

    return cases.filter((item) => {
      const matchesSearch =
        !search ||
        item.codigoCaso.toLowerCase().includes(search) ||
        item.servicio.toLowerCase().includes(search) ||
        item.resumen.toLowerCase().includes(search);

      const matchesType = type === "all" || item.tipo === type;
      const matchesService = service === "all" || item.servicio === service;

      return matchesSearch && matchesType && matchesService;
    });
  }

  function selectCase(code) {
    selectedCase = cases.find((item) => item.codigoCaso === code);

    if (!selectedCase) return;

    selectedCaseCode.value = selectedCase.codigoCaso;
    selectedCaseType.value = selectedCase.tipo;
    selectedService.value = selectedCase.servicio;
    selectedStatus.value = selectedCase.estado;
    selectedSummary.value = selectedCase.resumen;

    applySuggestion(selectedCase);
    renderCases();
  }

  function applySuggestion(item) {
    classificationCategory.value = item.categoriaSugerida || "";
    classificationPriority.value = item.prioridadSugerida || "";
    classificationSla.value = item.slaSugerido || "";
    classificationRoute.value = item.rutaSugerida || "";

    classificationObservation.value =
      `El caso se clasifica como ${item.categoriaSugerida || "categoría pendiente"} debido a la información registrada por el cliente. Se asigna prioridad ${item.prioridadSugerida || "media"} considerando el servicio afectado y el impacto reportado.`;

    classificationCounter.textContent = `${classificationObservation.value.length}/700 caracteres`;

    classifyAiTip.textContent =
      `IA sugiere: ${classificationCategory.value}, prioridad ${classificationPriority.value}, SLA ${classificationSla.value} h.`;
  }

  function updateMetrics() {
    const pending = cases.length;
    const high = cases.filter((item) => item.prioridadSugerida === "Crítica" || item.prioridadSugerida === "Alta").length;

    metricPendingClassify.textContent = pending;
    metricHighCriticality.textContent = high;
    metricAvgSla.textContent = "24 h";
    metricClassifiedToday.textContent = 12;
    sidebarClassifyCount.textContent = pending;
  }

  classificationObservation.addEventListener("input", () => {
    classificationCounter.textContent = `${classificationObservation.value.length}/700 caracteres`;
  });

  improveClassificationObservation.addEventListener("click", () => {
    const text = classificationObservation.value.trim();

    if (!text) {
      showClassifyToast("Primero escribe una observación.", "error");
      return;
    }

    classificationObservation.value =
      `${text} La clasificación se sustenta en el tipo de servicio afectado, el impacto reportado, la criticidad estimada y la ruta operativa necesaria para asegurar una atención oportuna.`;

    classificationCounter.textContent = `${classificationObservation.value.length}/700 caracteres`;
    showClassifyToast("Observación mejorada con IA.");
  });

  [classifySearch, filterClassifyType, filterClassifyService].forEach((field) => {
    field.addEventListener("input", renderCases);
    field.addEventListener("change", renderCases);
  });

  refreshClassifyCases.addEventListener("click", () => {
    initClassifyCases();
    showClassifyToast("Casos actualizados.");
  });

  autoSuggestClassify.addEventListener("click", () => {
    if (!selectedCase) {
      showClassifyToast("Selecciona un caso primero.", "error");
      return;
    }

    applySuggestion(selectedCase);
    showClassifyToast("Sugerencia IA aplicada.");
  });

  classifyRecommended.addEventListener("click", () => {
    if (cases.length > 0) {
      selectCase(cases[0].codigoCaso);
      showClassifyToast("Caso recomendado seleccionado.");
    }
  });

  previewClassification.addEventListener("click", () => {
    if (!validateClassification(false)) {
      showClassifyToast("Completa los campos obligatorios.", "error");
      return;
    }

    renderPreview();
    classificationPreviewModal.classList.add("active");
  });

  closeClassificationPreview.addEventListener("click", () => {
    classificationPreviewModal.classList.remove("active");
  });

  confirmClassificationFromPreview.addEventListener("click", () => {
    classificationPreviewModal.classList.remove("active");
    submitClassification();
  });

  classifyForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateClassification(true)) {
      showClassifyToast("Revisa los campos obligatorios.", "error");
      return;
    }

    submitClassification();
  });

  function validateClassification(markInvalid) {
    const requiredFields = classifyForm.querySelectorAll("[required]");
    let valid = true;

    requiredFields.forEach((field) => {
      const fieldValid = field.type === "checkbox" ? field.checked : field.value.trim();

      if (!fieldValid) {
        valid = false;
        if (markInvalid) field.classList.add("invalid");
      } else {
        field.classList.remove("invalid");
      }
    });

    return valid;
  }

  function getClassificationData() {
    return {
      codigoCaso: selectedCaseCode.value.trim(),
      categoria: classificationCategory.value,
      prioridad: classificationPriority.value,
      slaHoras: Number(classificationSla.value),
      rutaAtencion: classificationRoute.value,
      observacion: classificationObservation.value.trim(),
      enviarAsignacion: document.getElementById("sendToAssignment").checked
    };
  }

  function renderPreview() {
    const data = getClassificationData();

    const rows = [
      ["Código", data.codigoCaso],
      ["Categoría", data.categoria],
      ["Prioridad", data.prioridad],
      ["SLA", `${data.slaHoras} horas`],
      ["Ruta", data.rutaAtencion],
      ["Observación", data.observacion],
      ["Enviar a asignación", data.enviarAsignacion ? "Sí" : "No"]
    ];

    classificationPreviewContent.innerHTML = rows
      .map(
        ([label, value]) => `
          <div class="preview-row">
            <strong>${label}</strong>
            <span>${value}</span>
          </div>
        `
      )
      .join("");
  }

  async function submitClassification() {
    const data = getClassificationData();

    try {
      if (typeof clasificarCaso === "function") {
        await clasificarCaso(data.codigoCaso, data);
      }
    } catch (error) {
      console.warn("Clasificación simulada:", error.message);
    }

    classificationSuccessCode.textContent = data.codigoCaso;
    classificationSuccessModal.classList.add("active");
    showClassifyToast("Caso clasificado correctamente.");
  }

  function toggleClassifyBot() {
    classifyBot.classList.toggle("active");
  }

  openClassifyBot.addEventListener("click", toggleClassifyBot);
  openClassifyHelp.addEventListener("click", toggleClassifyBot);

  closeClassifyBot.addEventListener("click", () => {
    classifyBot.classList.remove("active");
  });

  document.querySelectorAll(".chat-option").forEach((button) => {
    button.addEventListener("click", () => {
      const template = button.dataset.template;

      const templates = {
        "sin-servicio": {
          categoria: "Sin servicio",
          prioridad: "Crítica",
          sla: "6",
          ruta: "Soporte técnico hogar",
          observacion:
            "El caso se clasifica como incidencia sin servicio debido al impacto total sobre la continuidad del servicio. Se asigna prioridad crítica y atención técnica inmediata."
        },
        facturacion: {
          categoria: "Facturación",
          prioridad: "Alta",
          sla: "24",
          ruta: "Facturación y cobranza",
          observacion:
            "El caso se clasifica como reclamo de facturación debido a la observación del cliente sobre cobros o montos registrados en el recibo."
        },
        atencion: {
          categoria: "Atención recibida",
          prioridad: "Media",
          sla: "48",
          ruta: "Atención comercial",
          observacion:
            "El caso se clasifica como reclamo por atención recibida, orientado a revisar la respuesta o trato brindado previamente."
        }
      };

      const selected = templates[template];
      if (!selected) return;

      classificationCategory.value = selected.categoria;
      classificationPriority.value = selected.prioridad;
      classificationSla.value = selected.sla;
      classificationRoute.value = selected.ruta;
      classificationObservation.value = selected.observacion;
      classificationCounter.textContent = `${classificationObservation.value.length}/700 caracteres`;

      showClassifyToast("Plantilla IA aplicada.");
    });
  });

  function showClassifyToast(message, type = "success") {
    const existingToast = document.querySelector(".classify-toast");

    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "classify-toast";
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

  initClassifyCases();
});