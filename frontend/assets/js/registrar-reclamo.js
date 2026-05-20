document.addEventListener("DOMContentLoaded", () => {
  const claimForm = document.getElementById("claimForm");

  const description = document.getElementById("description");
  const charCounter = document.getElementById("charCounter");
  const improveText = document.getElementById("improveText");

  const uploadZone = document.getElementById("uploadZone");
  const evidenceInput = document.getElementById("evidenceInput");
  const selectFiles = document.getElementById("selectFiles");
  const fileList = document.getElementById("fileList");

  const previewClaim = document.getElementById("previewClaim");
  const previewModal = document.getElementById("previewModal");
  const closePreview = document.getElementById("closePreview");
  const previewContent = document.getElementById("previewContent");
  const confirmFromPreview = document.getElementById("confirmFromPreview");

  const successModal = document.getElementById("successModal");
  const generatedCode = document.getElementById("generatedCode");

  const saveDraft = document.getElementById("saveDraft");
  const runQualityCheck = document.getElementById("runQualityCheck");

  const category = document.getElementById("category");
  const priority = document.getElementById("priority");
  const estimateBox = document.getElementById("estimateBox");

  const claimBot = document.getElementById("claimBot");
  const openClaimBot = document.getElementById("openClaimBot");
  const openClaimHelp = document.getElementById("openClaimHelp");
  const closeClaimBot = document.getElementById("closeClaimBot");

  let selectedFiles = [];

  if (description && charCounter) {
    description.addEventListener("input", () => {
      charCounter.textContent = `${description.value.length}/800 caracteres`;
      updateQualityIndicators();
    });
  }

  if (improveText) {
    improveText.addEventListener("click", () => {
      const currentText = description.value.trim();

      if (!currentText) {
        showToast("Primero escribe una descripción breve del problema.", "error");
        return;
      }

      description.value = improveClaimText(currentText);
      charCounter.textContent = `${description.value.length}/800 caracteres`;
      showToast("La descripción fue mejorada con una sugerencia de IA.", "success");
      updateQualityIndicators();
    });
  }

  function improveClaimText(text) {
    return `Solicito la revisión de mi caso debido a que ${text}. 
El inconveniente afecta el uso normal del servicio contratado, por lo que solicito una evaluación detallada y una solución o respuesta formal. 
Adjunto la información disponible para facilitar la atención del reclamo.`;
  }

  if (selectFiles && evidenceInput) {
    selectFiles.addEventListener("click", () => evidenceInput.click());
  }

  if (evidenceInput) {
    evidenceInput.addEventListener("change", (event) => {
      addFiles(Array.from(event.target.files));
    });
  }

  if (uploadZone) {
    uploadZone.addEventListener("dragover", (event) => {
      event.preventDefault();
      uploadZone.classList.add("drag-over");
    });

    uploadZone.addEventListener("dragleave", () => {
      uploadZone.classList.remove("drag-over");
    });

    uploadZone.addEventListener("drop", (event) => {
      event.preventDefault();
      uploadZone.classList.remove("drag-over");

      const droppedFiles = Array.from(event.dataTransfer.files);
      addFiles(droppedFiles);
    });
  }

  function addFiles(files) {
    const allowedExtensions = ["jpg", "jpeg", "png", "pdf", "doc", "docx"];
    const maxSizeMb = 8;

    files.forEach((file) => {
      const extension = file.name.split(".").pop().toLowerCase();
      const sizeMb = file.size / (1024 * 1024);

      if (!allowedExtensions.includes(extension)) {
        showToast(`El archivo ${file.name} no tiene un formato permitido.`, "error");
        return;
      }

      if (sizeMb > maxSizeMb) {
        showToast(`El archivo ${file.name} supera los ${maxSizeMb} MB.`, "error");
        return;
      }

      selectedFiles.push(file);
    });

    renderFileList();
    updateQualityIndicators();
  }

  function renderFileList() {
    fileList.innerHTML = "";

    selectedFiles.forEach((file, index) => {
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

      fileList.appendChild(fileItem);
    });

    const removeButtons = fileList.querySelectorAll("button");

    removeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        selectedFiles.splice(index, 1);
        renderFileList();
        updateQualityIndicators();
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

  if (previewClaim) {
    previewClaim.addEventListener("click", () => {
      if (!validateRequiredFields(false)) {
        showToast("Completa los campos obligatorios antes de ver la vista previa.", "error");
        return;
      }

      renderPreview();
      previewModal.classList.add("active");
    });
  }

  if (closePreview) {
    closePreview.addEventListener("click", () => {
      previewModal.classList.remove("active");
    });
  }

  if (confirmFromPreview) {
    confirmFromPreview.addEventListener("click", () => {
      previewModal.classList.remove("active");
      submitClaim();
    });
  }

  if (claimForm) {
    claimForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!validateRequiredFields(true)) {
        showToast("Revisa los campos obligatorios marcados.", "error");
        return;
      }

      submitClaim();
    });
  }

  function validateRequiredFields(markInvalid) {
    const requiredFields = claimForm.querySelectorAll("[required]");
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

  function getClaimData() {
    return {
      documentType: document.getElementById("documentType").value,
      documentNumber: document.getElementById("documentNumber").value,
      fullName: document.getElementById("fullName").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      service: document.getElementById("service").value,
      serviceNumber: document.getElementById("serviceNumber").value,
      channel: document.getElementById("channel").value,
      location: document.getElementById("location").value,
      category: document.getElementById("category").value,
      problemDate: document.getElementById("problemDate").value,
      claimedAmount: document.getElementById("claimedAmount").value,
      priority: document.getElementById("priority").value,
      description: document.getElementById("description").value,
      evidenceCount: selectedFiles.length
    };
  }

  function renderPreview() {
    const data = getClaimData();

    const rows = [
      ["Cliente", data.fullName],
      ["Documento", `${data.documentType} - ${data.documentNumber}`],
      ["Teléfono", data.phone],
      ["Correo", data.email],
      ["Servicio", data.service],
      ["N° línea / contrato", data.serviceNumber || "No especificado"],
      ["Canal", data.channel],
      ["Categoría", data.category],
      ["Fecha del problema", data.problemDate],
      ["Monto reclamado", data.claimedAmount ? `S/ ${data.claimedAmount}` : "No aplica"],
      ["Prioridad", data.priority],
      ["Descripción", data.description],
      ["Evidencias", `${data.evidenceCount} archivo(s) adjunto(s)`]
    ];

    previewContent.innerHTML = rows
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

  function submitClaim() {
    const code = generateClaimCode();
    generatedCode.textContent = code;

    /*
      CONEXIÓN FUTURA CON BACKEND:
      Cuando tengas backend en Python, aquí se enviará al endpoint:
      POST /api/reclamos

      Ejemplo:
      const formData = new FormData();
      formData.append("data", JSON.stringify(getClaimData()));
      selectedFiles.forEach(file => formData.append("evidencias", file));

      fetch("http://localhost:5000/api/reclamos", {
        method: "POST",
        body: formData
      });
    */

    showToast("Enviando reclamo...", "success");

    setTimeout(() => {
      successModal.classList.add("active");
    }, 700);
  }

  function generateClaimCode() {
    const number = Math.floor(100000 + Math.random() * 900000);
    return `CL-RC-${number}`;
  }

  if (saveDraft) {
    saveDraft.addEventListener("click", () => {
      const draftData = getClaimData();

      localStorage.setItem("draftClaim", JSON.stringify(draftData));
      showToast("Borrador guardado correctamente.", "success");
    });
  }

  if (runQualityCheck) {
    runQualityCheck.addEventListener("click", () => {
      updateQualityIndicators();
      showToast("Verificación de información completada.", "success");
    });
  }

  function updateQualityIndicators() {
    const data = getClaimData();

    setQualityState("qualityClient", data.documentNumber && data.fullName && data.phone && data.email);
    setQualityState("qualityService", data.service && data.channel);
    setQualityState("qualityDescription", data.category && data.description.length >= 40);
    setQualityState("qualityEvidence", selectedFiles.length > 0);
  }

  function setQualityState(id, completed) {
    const element = document.getElementById(id);

    if (!element) return;

    element.classList.toggle("completed", Boolean(completed));

    const icon = element.querySelector("i");

    if (completed) {
      icon.className = "fa-solid fa-circle-check";
    } else {
      icon.className = "fa-regular fa-circle";
    }
  }

  function updateEstimate() {
    const categoryValue = category.value;
    const priorityValue = priority.value;

    if (!categoryValue || !priorityValue) {
      estimateBox.textContent = "Completa la categoría y prioridad para calcular.";
      return;
    }

    const hoursByPriority = {
      "Baja": 72,
      "Media": 48,
      "Alta": 24,
      "Crítica": 12
    };

    const hours = hoursByPriority[priorityValue] || 48;

    estimateBox.innerHTML = `
      <strong>${hours} horas hábiles estimadas</strong><br>
      La estimación puede variar según validación del asesor.
    `;
  }

  if (category) {
    category.addEventListener("change", updateEstimate);
  }

  if (priority) {
    priority.addEventListener("change", updateEstimate);
  }

  function toggleClaimBot() {
    claimBot.classList.toggle("active");
  }

  if (openClaimBot) {
    openClaimBot.addEventListener("click", toggleClaimBot);
  }

  if (openClaimHelp) {
    openClaimHelp.addEventListener("click", toggleClaimBot);
  }

  if (closeClaimBot) {
    closeClaimBot.addEventListener("click", () => {
      claimBot.classList.remove("active");
    });
  }

  document.querySelectorAll(".chat-option").forEach((button) => {
    button.addEventListener("click", () => {
      const suggestion = button.dataset.suggestion;

      const suggestions = {
        facturacion:
          "Deseo presentar un reclamo porque he identificado un monto en mi recibo que no reconozco o que no corresponde al servicio contratado. Solicito la revisión del cargo y la regularización correspondiente.",
        atencion:
          "Deseo presentar un reclamo por la atención recibida, debido a que la respuesta brindada no resolvió adecuadamente mi solicitud. Solicito una nueva revisión del caso y una solución formal.",
        contrato:
          "Deseo presentar un reclamo relacionado con mi contrato o plan, debido a que las condiciones aplicadas no coinciden con lo ofrecido o solicitado. Solicito la verificación y corrección correspondiente."
      };

      description.value = suggestions[suggestion] || description.value;
      charCounter.textContent = `${description.value.length}/800 caracteres`;
      updateQualityIndicators();
      showToast("Se insertó una descripción sugerida por IA.", "success");
    });
  });

  function showToast(message, type = "success") {
    const existingToast = document.querySelector(".claim-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "claim-toast";
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

  updateEstimate();
  updateQualityIndicators();
});