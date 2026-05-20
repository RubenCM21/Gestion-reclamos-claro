document.addEventListener("DOMContentLoaded", () => {
  const assignCaseList = document.getElementById("assignCaseList");
  const emptyAssign = document.getElementById("emptyAssign");

  const assignSearch = document.getElementById("assignSearch");
  const filterAssignPriority = document.getElementById("filterAssignPriority");
  const filterAssignService = document.getElementById("filterAssignService");

  const metricPendingAssign = document.getElementById("metricPendingAssign");
  const metricCriticalAssign = document.getElementById("metricCriticalAssign");
  const metricAvailableAdvisors = document.getElementById("metricAvailableAdvisors");
  const metricAssignedToday = document.getElementById("metricAssignedToday");
  const sidebarAssignCount = document.getElementById("sidebarAssignCount");

  const assignForm = document.getElementById("assignForm");

  const assignCaseCode = document.getElementById("assignCaseCode");
  const assignCaseType = document.getElementById("assignCaseType");
  const assignService = document.getElementById("assignService");
  const assignPriority = document.getElementById("assignPriority");
  const assignSla = document.getElementById("assignSla");
  const assignRoute = document.getElementById("assignRoute");
  const assignSummary = document.getElementById("assignSummary");

  const advisorSelectionGrid = document.getElementById("advisorSelectionGrid");
  const selectedAdvisorId = document.getElementById("selectedAdvisorId");

  const assignmentType = document.getElementById("assignmentType");
  const assignmentUrgency = document.getElementById("assignmentUrgency");
  const assignmentObservation = document.getElementById("assignmentObservation");
  const assignmentCounter = document.getElementById("assignmentCounter");
  const improveAssignmentObservation = document.getElementById("improveAssignmentObservation");

  const refreshAssignCases = document.getElementById("refreshAssignCases");
  const assignRecommended = document.getElementById("assignRecommended");
  const suggestAdvisorAi = document.getElementById("suggestAdvisorAi");
  const assignAiTip = document.getElementById("assignAiTip");

  const previewAssignment = document.getElementById("previewAssignment");
  const assignmentPreviewModal = document.getElementById("assignmentPreviewModal");
  const closeAssignmentPreview = document.getElementById("closeAssignmentPreview");
  const assignmentPreviewContent = document.getElementById("assignmentPreviewContent");
  const confirmAssignmentFromPreview = document.getElementById("confirmAssignmentFromPreview");

  const assignmentSuccessModal = document.getElementById("assignmentSuccessModal");
  const assignmentSuccessCode = document.getElementById("assignmentSuccessCode");

  const assignBot = document.getElementById("assignBot");
  const openAssignBot = document.getElementById("openAssignBot");
  const openAssignHelp = document.getElementById("openAssignHelp");
  const closeAssignBot = document.getElementById("closeAssignBot");

  let cases = [];
  let advisors = [];
  let selectedCase = null;
  let selectedAdvisor = null;

  const fallbackCases = [
    {
      codigoCaso: "CL-IN-000140",
      tipo: "Incidencia",
      servicio: "Internet hogar",
      prioridad: "Crítica",
      slaRestante: 5,
      ruta: "Soporte técnico hogar",
      resumen: "Cliente reporta caída total del servicio de internet hogar."
    },
    {
      codigoCaso: "CL-RC-000137",
      tipo: "Reclamo",
      servicio: "Telefonía móvil",
      prioridad: "Alta",
      slaRestante: 10,
      ruta: "Facturación y cobranza",
      resumen: "Cliente indica cobro no reconocido en su recibo mensual."
    },
    {
      codigoCaso: "CL-IN-000133",
      tipo: "Incidencia",
      servicio: "Claro TV+",
      prioridad: "Alta",
      slaRestante: 8,
      ruta: "Soporte técnico hogar",
      resumen: "Cliente reporta corte de señal y adjunta captura del error."
    },
    {
      codigoCaso: "CL-RC-000128",
      tipo: "Reclamo",
      servicio: "Internet hogar",
      prioridad: "Media",
      slaRestante: 24,
      ruta: "Atención comercial",
      resumen: "Cliente solicita revisión de condiciones del plan contratado."
    }
  ];

  const fallbackAdvisors = [
    {
      id: 1,
      nombre: "Asesor Técnico Hogar",
      carga: 5,
      especialidades: ["Internet hogar", "Claro TV+", "Soporte técnico hogar"],
      desempeno: "Alto"
    },
    {
      id: 2,
      nombre: "Asesor Móvil",
      carga: 7,
      especialidades: ["Telefonía móvil", "Soporte técnico móvil"],
      desempeno: "Alto"
    },
    {
      id: 3,
      nombre: "Asesor Facturación",
      carga: 4,
      especialidades: ["Facturación y cobranza", "Cobro no reconocido"],
      desempeno: "Medio"
    },
    {
      id: 4,
      nombre: "Asesor Comercial",
      carga: 9,
      especialidades: ["Atención comercial", "Contrato o plan"],
      desempeno: "Medio"
    }
  ];

  async function initAssignment() {
    try {
      if (typeof getCasosPendientesClasificacion === "function") {
        const response = await getCasosPendientesClasificacion();
        cases = response.casos || response.data || [];
      }

      if (!cases.length) {
        throw new Error("Sin casos clasificados pendientes.");
      }
    } catch (error) {
      console.warn("Usando casos simulados para asignación:", error.message);
      cases = fallbackCases;
    }

    advisors = fallbackAdvisors;

    renderCases();
    renderAdvisors();
    updateMetrics();

    if (cases.length > 0) {
      selectCase(cases[0].codigoCaso);
    }
  }

  function renderCases() {
    const filtered = getFilteredCases();
    assignCaseList.innerHTML = "";

    filtered.forEach((item) => {
      const card = document.createElement("article");
      card.className = `assign-case-card ${selectedCase?.codigoCaso === item.codigoCaso ? "active" : ""}`;
      card.dataset.code = item.codigoCaso;

      card.innerHTML = `
        <h3>${item.codigoCaso} · ${item.tipo}</h3>
        <p>${item.resumen}</p>

        <div class="assign-case-meta">
          <span>${item.servicio}</span>
          <span>${item.prioridad}</span>
          <span>SLA: ${item.slaRestante} h</span>
          <span>${item.ruta}</span>
        </div>
      `;

      card.addEventListener("click", () => selectCase(item.codigoCaso));
      assignCaseList.appendChild(card);
    });

    emptyAssign.classList.toggle("hidden", filtered.length > 0);
  }

  function getFilteredCases() {
    const search = assignSearch.value.trim().toLowerCase();
    const priority = filterAssignPriority.value;
    const service = filterAssignService.value;

    return cases.filter((item) => {
      const matchesSearch =
        !search ||
        item.codigoCaso.toLowerCase().includes(search) ||
        item.servicio.toLowerCase().includes(search) ||
        item.resumen.toLowerCase().includes(search) ||
        item.ruta.toLowerCase().includes(search);

      const matchesPriority = priority === "all" || item.prioridad === priority;
      const matchesService = service === "all" || item.servicio === service;

      return matchesSearch && matchesPriority && matchesService;
    });
  }

  function selectCase(code) {
    selectedCase = cases.find((item) => item.codigoCaso === code);

    if (!selectedCase) return;

    assignCaseCode.value = selectedCase.codigoCaso;
    assignCaseType.value = selectedCase.tipo;
    assignService.value = selectedCase.servicio;
    assignPriority.value = selectedCase.prioridad;
    assignSla.value = `${selectedCase.slaRestante} horas`;
    assignRoute.value = selectedCase.ruta;
    assignSummary.value = selectedCase.resumen;

    assignmentUrgency.value = selectedCase.prioridad === "Crítica" || selectedCase.prioridad === "Alta"
      ? "Alta"
      : "Media";

    suggestBestAdvisor();
    renderCases();
  }

  function renderAdvisors() {
    advisorSelectionGrid.innerHTML = "";

    advisors.forEach((advisor) => {
      const card = document.createElement("article");
      card.className = `advisor-option-card ${selectedAdvisor?.id === advisor.id ? "active" : ""}`;
      card.dataset.id = advisor.id;

      card.innerHTML = `
        <div class="advisor-option-top">
          <strong>${advisor.nombre}</strong>
          <span class="advisor-load ${getLoadClass(advisor.carga)}">
            Carga: ${advisor.carga}
          </span>
        </div>

        <p>Desempeño: ${advisor.desempeno}</p>

        <div class="advisor-specialties">
          ${advisor.especialidades.map((item) => `<span>${item}</span>`).join("")}
        </div>
      `;

      card.addEventListener("click", () => {
        selectAdvisor(advisor.id);
      });

      advisorSelectionGrid.appendChild(card);
    });
  }

  function selectAdvisor(id) {
    selectedAdvisor = advisors.find((item) => item.id === Number(id));

    if (!selectedAdvisor) return;

    selectedAdvisorId.value = selectedAdvisor.id;

    assignmentType.value = "Asignación directa";

    assignmentObservation.value =
      `Se asigna el caso ${assignCaseCode.value} a ${selectedAdvisor.nombre}, considerando su especialidad, carga actual y relación con la ruta de atención ${assignRoute.value}.`;

    assignmentCounter.textContent = `${assignmentObservation.value.length}/700 caracteres`;

    renderAdvisors();
  }

  function suggestBestAdvisor() {
    if (!selectedCase) return;

    const scored = advisors
      .map((advisor) => {
        const specialtyMatch =
          advisor.especialidades.includes(selectedCase.servicio) ||
          advisor.especialidades.includes(selectedCase.ruta);

        const loadScore = 10 - advisor.carga;
        const specialtyScore = specialtyMatch ? 10 : 0;
        const performanceScore = advisor.desempeno === "Alto" ? 5 : 2;

        return {
          ...advisor,
          score: loadScore + specialtyScore + performanceScore
        };
      })
      .sort((a, b) => b.score - a.score);

    const best = scored[0];

    if (best) {
      selectAdvisor(best.id);

      assignmentType.value = "Asignación por especialidad";

      assignAiTip.textContent =
        `IA sugiere asignar ${selectedCase.codigoCaso} a ${best.nombre} por especialidad y carga actual.`;
    }
  }

  function getLoadClass(load) {
    if (load <= 5) return "load-low";
    if (load <= 8) return "load-medium";
    return "load-high";
  }

  function updateMetrics() {
    const pending = cases.length;
    const critical = cases.filter((item) => item.prioridad === "Crítica" || item.prioridad === "Alta").length;

    metricPendingAssign.textContent = pending;
    metricCriticalAssign.textContent = critical;
    metricAvailableAdvisors.textContent = advisors.length;
    metricAssignedToday.textContent = 15;
    sidebarAssignCount.textContent = pending;
  }

  assignmentObservation.addEventListener("input", () => {
    assignmentCounter.textContent = `${assignmentObservation.value.length}/700 caracteres`;
  });

  improveAssignmentObservation.addEventListener("click", () => {
    const text = assignmentObservation.value.trim();

    if (!text) {
      showAssignToast("Primero escribe una observación.", "error");
      return;
    }

    assignmentObservation.value =
      `${text} La asignación se sustenta en criterios de carga operativa, especialidad del asesor, prioridad del caso y tiempo restante de SLA.`;

    assignmentCounter.textContent = `${assignmentObservation.value.length}/700 caracteres`;

    showAssignToast("Observación mejorada con IA.");
  });

  [assignSearch, filterAssignPriority, filterAssignService].forEach((field) => {
    field.addEventListener("input", renderCases);
    field.addEventListener("change", renderCases);
  });

  refreshAssignCases.addEventListener("click", () => {
    initAssignment();
    showAssignToast("Casos actualizados.");
  });

  suggestAdvisorAi.addEventListener("click", () => {
    suggestBestAdvisor();
    showAssignToast("Asesor sugerido con IA.");
  });

  assignRecommended.addEventListener("click", () => {
    if (cases.length > 0) {
      selectCase(cases[0].codigoCaso);
      suggestBestAdvisor();
      showAssignToast("Caso y asesor recomendados seleccionados.");
    }
  });

  previewAssignment.addEventListener("click", () => {
    if (!validateAssignment(false)) {
      showAssignToast("Completa los campos obligatorios.", "error");
      return;
    }

    renderPreview();
    assignmentPreviewModal.classList.add("active");
  });

  closeAssignmentPreview.addEventListener("click", () => {
    assignmentPreviewModal.classList.remove("active");
  });

  confirmAssignmentFromPreview.addEventListener("click", () => {
    assignmentPreviewModal.classList.remove("active");
    submitAssignment();
  });

  assignForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateAssignment(true)) {
      showAssignToast("Revisa los campos obligatorios.", "error");
      return;
    }

    submitAssignment();
  });

  function validateAssignment(markInvalid) {
    const requiredFields = assignForm.querySelectorAll("[required]");
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

  function getAssignmentData() {
    return {
      codigoCaso: assignCaseCode.value.trim(),
      asesorId: Number(selectedAdvisorId.value),
      asesorNombre: selectedAdvisor?.nombre || "",
      tipoAsignacion: assignmentType.value,
      urgencia: assignmentUrgency.value,
      observacion: assignmentObservation.value.trim(),
      notificarAsesor: document.getElementById("notifyAssignedAdvisor").checked
    };
  }

  function renderPreview() {
    const data = getAssignmentData();

    const rows = [
      ["Código", data.codigoCaso],
      ["Asesor", data.asesorNombre],
      ["Tipo de asignación", data.tipoAsignacion],
      ["Urgencia", data.urgencia],
      ["Observación", data.observacion],
      ["Notificar asesor", data.notificarAsesor ? "Sí" : "No"]
    ];

    assignmentPreviewContent.innerHTML = rows
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

  async function submitAssignment() {
    const data = getAssignmentData();

    try {
      if (typeof asignarCaso === "function") {
        await asignarCaso(data.codigoCaso, data);
      }
    } catch (error) {
      console.warn("Asignación simulada:", error.message);
    }

    assignmentSuccessCode.textContent = data.codigoCaso;
    assignmentSuccessModal.classList.add("active");
    showAssignToast("Caso asignado correctamente.");
  }

  function toggleAssignBot() {
    assignBot.classList.toggle("active");
  }

  openAssignBot.addEventListener("click", toggleAssignBot);
  openAssignHelp.addEventListener("click", toggleAssignBot);

  closeAssignBot.addEventListener("click", () => {
    assignBot.classList.remove("active");
  });

  document.querySelectorAll(".chat-option").forEach((button) => {
    button.addEventListener("click", () => {
      const template = button.dataset.template;

      if (template === "carga") {
        assignmentType.value = "Asignación por carga";
        assignAiTip.textContent = "IA sugiere elegir al asesor con menor carga activa.";
        suggestBestAdvisor();
      }

      if (template === "tecnico") {
        assignmentType.value = "Asignación por especialidad";
        assignAiTip.textContent = "IA sugiere asignar a un asesor técnico según el servicio afectado.";
        suggestBestAdvisor();
      }

      if (template === "critico") {
        assignmentUrgency.value = "Alta";
        assignAiTip.textContent = "Caso crítico: asignar a asesor con alta experiencia y baja carga.";
        suggestBestAdvisor();
      }

      showAssignToast("Criterio IA aplicado.");
    });
  });

  function showAssignToast(message, type = "success") {
    const existingToast = document.querySelector(".assign-toast");

    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "assign-toast";
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

  initAssignment();
});