document.addEventListener("DOMContentLoaded", () => {
  const incidentForm = document.getElementById("incidentForm");

  const incidentDescription = document.getElementById("incidentDescription");
  const incidentCharCounter = document.getElementById("incidentCharCounter");
  const generateTechnicalText = document.getElementById("generateTechnicalText");

  const serviceAffected = document.getElementById("serviceAffected");
  const failureType = document.getElementById("failureType");
  const frequency = document.getElementById("frequency");
  const impactLevel = document.getElementById("impactLevel");

  const incidentUploadZone = document.getElementById("incidentUploadZone");
  const incidentEvidenceInput = document.getElementById("incidentEvidenceInput");
  const selectIncidentFiles = document.getElementById("selectIncidentFiles");
  const incidentFileList = document.getElementById("incidentFileList");

  const runIncidentDiagnostic = document.getElementById("runIncidentDiagnostic");
  const prioritySuggestion = document.getElementById("prioritySuggestion");

  const previewIncident = document.getElementById("previewIncident");
  const incidentPreviewModal = document.getElementById("incidentPreviewModal");
  const closeIncidentPreview = document.getElementById("closeIncidentPreview");
  const incidentPreviewContent = document.getElementById("incidentPreviewContent");
  const confirmIncidentFromPreview = document.getElementById("confirmIncidentFromPreview");

  const incidentSuccessModal = document.getElementById("incidentSuccessModal");
  const generatedIncidentCode = document.getElementById("generatedIncidentCode");
  const saveIncidentDraft = document.getElementById("saveIncidentDraft");

  const incidentBot = document.getElementById("incidentBot");
  const openIncidentBot = document.getElementById("openIncidentBot");
  const openIncidentHelp = document.getElementById("openIncidentHelp");
  const closeIncidentBot = document.getElementById("closeIncidentBot");

  let selectedIncidentFiles = [];

  if (incidentDescription && incidentCharCounter) {
    incidentDescription.addEventListener("input", () => {
      incidentCharCounter.textContent = `${incidentDescription.value.length}/800 caracteres`;
      updateIncidentQuality();
    });
  }

  if (generateTechnicalText) {
    generateTechnicalText.addEventListener("click", () => {
      const currentText = incidentDescription.value.trim();

      if (!currentText) {
        showIncidentToast("Primero escribe una descripción breve de la falla.", "error");
        return;
      }

      incidentDescription.value = improveIncidentText(currentText);
      incidentCharCounter.textContent = `${incidentDescription.value.length}/800 caracteres`;
      showIncidentToast("La descripción fue mejorada con una sugerencia técnica IA.", "success");
      updateIncidentQuality();
    });
  }

  function improveIncidentText(text) {
    return `Reporto una incidencia debido a que ${text}. 
La falla afecta el uso normal del servicio y se presenta de manera que limita la continuidad de la atención contratada. 
Solicito la revisión técnica correspondiente y la actualización del estado del caso durante el proceso de atención.`;
  }

  if (selectIncidentFiles && incidentEvidenceInput) {
    selectIncidentFiles.addEventListener("click", () => {
      incidentEvidenceInput.click();
    });
  }

  if (incidentEvidenceInput) {
    incidentEvidenceInput.addEventListener("change", (event) => {
      addIncidentFiles(Array.from(event.target.files));
    });
  }

  if (incidentUploadZone) {
    incidentUploadZone.addEventListener("dragover", (event) => {
      event.preventDefault();
      incidentUploadZone.classList.add("drag-over");
    });

    incidentUploadZone.addEventListener("dragleave", () => {
      incidentUploadZone.classList.remove("drag-over");
    });

    incidentUploadZone.addEventListener("drop", (event) => {
      event.preventDefault();
      incidentUploadZone.classList.remove("drag-over");

      const files = Array.from(event.dataTransfer.files);
      addIncidentFiles(files);
    });
  }

  function addIncidentFiles(files) {
    const allowedExtensions = ["jpg", "jpeg", "png", "pdf", "mp4", "mov"];
    const maxSizeMb = 20;

    files.forEach((file) => {
      const extension = file.name.split(".").pop().toLowerCase();
      const sizeMb = file.size / (1024 * 1024);

      if (!allowedExtensions.includes(extension)) {
        showIncidentToast(`El archivo ${file.name} no tiene un formato permitido.`, "error");
        return;
      }

      if (sizeMb > maxSizeMb) {
        showIncidentToast(`El archivo ${file.name} supera los ${maxSizeMb} MB.`, "error");
        return;
      }

      selectedIncidentFiles.push(file);
    });

    renderIncidentFiles();
    updateIncidentQuality();
  }

  function renderIncidentFiles() {
    incidentFileList.innerHTML = "";

    selectedIncidentFiles.forEach((file, index) => {
      const fileItem = document.createElement("div");
      fileItem.className = "file-item";

      fileItem.innerHTML = `
        <i class="fa-solid fa-file-lines"></i>
        <div>
          <strong>${file.name}</strong>
          <span>${formatFileSize(file.size)}</span>
        </div>
        <button type="button" aria-label="Eliminar archivo" data-index="${index}">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;

      incidentFileList.appendChild(fileItem);
    });

    incidentFileList.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        selectedIncidentFiles.splice(index, 1);
        renderIncidentFiles();
        updateIncidentQuality();
      });
    });
  }

  function formatFileSize(bytes) {
    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(2)} MB`;
  }

  if (runIncidentDiagnostic) {
    runIncidentDiagnostic.addEventListener("click", () => {
      runDiagnostic();
      updateIncidentQuality();
      showIncidentToast("Diagnóstico inteligente ejecutado correctamente.", "success");
    });
  }

  [serviceAffected, failureType, frequency, impactLevel].forEach((element) => {
    if (element) {
      element.addEventListener("change", () => {
        runDiagnostic(false);
        updateIncidentQuality();
      });
    }
  });

  function runDiagnostic(showDefault = true) {
    const impact = impactLevel.value;
    const freq = frequency.value;
    const failure = failureType.value;

    if (!impact || !freq || !failure) {
      if (showDefault) {
        prioritySuggestion.textContent = "Completa tipo de falla, frecuencia e impacto para calcular.";
      }
      return;
    }

    const priority = calculatePriority(impact, freq, failure);
    const hours = calculateIncidentHours(priority);

    prioritySuggestion.innerHTML = `
      <strong>Prioridad sugerida: ${priority}</strong><br>
      Plazo estimado inicial: ${hours} horas hábiles.<br>
      La validación final será realizada por el equipo responsable.
    `;
  }

  function calculatePriority(impact, freq, failure) {
    if (impact === "Crítico") return "Crítica";
    if (impact === "Alto" && (freq === "Constante" || freq === "Recurrente")) return "Alta";
    if (failure === "Sin servicio" && impact !== "Bajo") return "Alta";
    if (impact === "Medio") return "Media";
    return "Baja";
  }

  function calculateIncidentHours(priority) {
    const hours = {
      "Crítica": 6,
      "Alta": 12,
      "Media": 24,
      "Baja": 48
    };

    return hours[priority] || 24;
  }

  if (previewIncident) {
    previewIncident.addEventListener("click", () => {
      if (!validateIncidentFields(false)) {
        showIncidentToast("Completa los campos obligatorios antes de ver la vista previa.", "error");
        return;
      }

      renderIncidentPreview();
      incidentPreviewModal.classList.add("active");
    });
  }

  if (closeIncidentPreview) {
    closeIncidentPreview.addEventListener("click", () => {
      incidentPreviewModal.classList.remove("active");
    });
  }

  if (confirmIncidentFromPreview) {
    confirmIncidentFromPreview.addEventListener("click", () => {
      incidentPreviewModal.classList.remove("active");
      submitIncident();
    });
  }

  if (incidentForm) {
    incidentForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!validateIncidentFields(true)) {
        showIncidentToast("Revisa los campos obligatorios marcados.", "error");
        return;
      }

      submitIncident();
    });
  }

  function validateIncidentFields(markInvalid) {
    const requiredFields = incidentForm.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      const validField = field.type === "checkbox" ? field.checked : field.value.trim();

      if (!validField) {
        isValid = false;

        if (markInvalid) {
          field.classList.add("invalid");
        }
      } else {
        field.classList.remove("invalid");
      }
    });

    return isValid;
  }

  function getIncidentData() {
    return {
      serviceAffected: document.getElementById("serviceAffected").value,
      serviceCode: document.getElementById("serviceCode").value,
      failureType: document.getElementById("failureType").value,
      startDate: document.getElementById("startDate").value,
      department: document.getElementById("department").value,
      district: document.getElementById("district").value,
      frequency: document.getElementById("frequency").value,
      impactLevel: document.getElementById("impactLevel").value,
      restartDevice: document.getElementById("restartDevice").checked,
      checkCables: document.getElementById("checkCables").checked,
      checkCoverage: document.getElementById("checkCoverage").checked,
      multipleUsers: document.getElementById("multipleUsers").checked,
      description: document.getElementById("incidentDescription").value,
      evidenceCount: selectedIncidentFiles.length
    };
  }

  function renderIncidentPreview() {
    const data = getIncidentData();

    const rows = [
      ["Servicio afectado", data.serviceAffected],
      ["N° línea / contrato", data.serviceCode],
      ["Tipo de falla", data.failureType],
      ["Fecha y hora de inicio", data.startDate],
      ["Departamento", data.department],
      ["Distrito / zona", data.district || "No especificado"],
      ["Frecuencia", data.frequency],
      ["Impacto", data.impactLevel],
      ["Reinició equipo", data.restartDevice ? "Sí" : "No"],
      ["Verificó cables", data.checkCables ? "Sí" : "No"],
      ["Verificó cobertura", data.checkCoverage ? "Sí" : "No"],
      ["Afecta a más usuarios", data.multipleUsers ? "Sí" : "No"],
      ["Descripción", data.description],
      ["Evidencias", `${data.evidenceCount} archivo(s) adjunto(s)`]
    ];

    incidentPreviewContent.innerHTML = rows
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

  function submitIncident() {
    const code = generateIncidentCode();
    generatedIncidentCode.textContent = code;

    /*
      CONEXIÓN FUTURA CON BACKEND:
      POST /api/incidencias

      const formData = new FormData();
      formData.append("data", JSON.stringify(getIncidentData()));
      selectedIncidentFiles.forEach(file => formData.append("evidencias", file));

      fetch("http://localhost:5000/api/incidencias", {
        method: "POST",
        body: formData
      });
    */

    showIncidentToast("Enviando incidencia...", "success");

    setTimeout(() => {
      incidentSuccessModal.classList.add("active");
    }, 700);
  }

  function generateIncidentCode() {
    const number = Math.floor(100000 + Math.random() * 900000);
    return `CL-IN-${number}`;
  }

  if (saveIncidentDraft) {
    saveIncidentDraft.addEventListener("click", () => {
      localStorage.setItem("draftIncident", JSON.stringify(getIncidentData()));
      showIncidentToast("Borrador de incidencia guardado correctamente.", "success");
    });
  }

  function updateIncidentQuality() {
    const data = getIncidentData();

    setIncidentQualityState(
      "incidentQualityService",
      data.serviceAffected && data.serviceCode && data.failureType
    );

    setIncidentQualityState(
      "incidentQualityImpact",
      data.frequency && data.impactLevel && data.department
    );

    setIncidentQualityState(
      "incidentQualityDescription",
      data.description.length >= 40
    );

    setIncidentQualityState(
      "incidentQualityEvidence",
      selectedIncidentFiles.length > 0
    );
  }

  function setIncidentQualityState(id, completed) {
    const element = document.getElementById(id);

    if (!element) return;

    element.classList.toggle("completed", Boolean(completed));

    const icon = element.querySelector("i");

    icon.className = completed
      ? "fa-solid fa-circle-check"
      : "fa-regular fa-circle";
  }

  function toggleIncidentBot() {
    incidentBot.classList.toggle("active");
  }

  if (openIncidentBot) {
    openIncidentBot.addEventListener("click", toggleIncidentBot);
  }

  if (openIncidentHelp) {
    openIncidentHelp.addEventListener("click", toggleIncidentBot);
  }

  if (closeIncidentBot) {
    closeIncidentBot.addEventListener("click", () => {
      incidentBot.classList.remove("active");
    });
  }

  document.querySelectorAll(".chat-option").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.incident;

      const suggestions = {
        internet:
          "Reporto una incidencia porque el servicio de internet no está funcionando correctamente. La falla inició recientemente y afecta la navegación normal, por lo que solicito revisión técnica y actualización del estado del caso.",
        movil:
          "Reporto una incidencia porque mi línea móvil presenta problemas de señal o conectividad. La falla impide usar correctamente llamadas, mensajes o datos móviles, por lo que solicito verificación del servicio.",
        tv:
          "Reporto una incidencia porque el servicio Claro TV+ presenta interrupciones, imagen congelada o problemas de reproducción. Solicito revisión técnica y orientación para restablecer el servicio."
      };

      incidentDescription.value = suggestions[type] || incidentDescription.value;
      incidentCharCounter.textContent = `${incidentDescription.value.length}/800 caracteres`;
      updateIncidentQuality();
      showIncidentToast("Se insertó una descripción sugerida por IA.", "success");
    });
  });

  function showIncidentToast(message, type = "success") {
    const existingToast = document.querySelector(".incident-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "incident-toast";
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

  updateIncidentQuality();
});