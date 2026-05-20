document.addEventListener("DOMContentLoaded", () => {
  const evidenceForm = document.getElementById("evidenceForm");

  const caseSelect = document.getElementById("caseSelect");
  const evidenceType = document.getElementById("evidenceType");
  const evidenceDescription = document.getElementById("evidenceDescription");
  const evidenceCharCounter = document.getElementById("evidenceCharCounter");
  const improveEvidenceText = document.getElementById("improveEvidenceText");

  const evidenceUploadZone = document.getElementById("evidenceUploadZone");
  const evidenceFiles = document.getElementById("evidenceFiles");
  const selectEvidenceFiles = document.getElementById("selectEvidenceFiles");
  const evidenceFileList = document.getElementById("evidenceFileList");

  const runEvidenceCheck = document.getElementById("runEvidenceCheck");
  const generateEvidenceRecommendation = document.getElementById("generateEvidenceRecommendation");
  const evidenceRecommendation = document.getElementById("evidenceRecommendation");

  const saveEvidenceDraft = document.getElementById("saveEvidenceDraft");
  const previewEvidence = document.getElementById("previewEvidence");
  const evidencePreviewModal = document.getElementById("evidencePreviewModal");
  const closeEvidencePreview = document.getElementById("closeEvidencePreview");
  const evidencePreviewContent = document.getElementById("evidencePreviewContent");
  const confirmEvidenceFromPreview = document.getElementById("confirmEvidenceFromPreview");

  const evidenceSuccessModal = document.getElementById("evidenceSuccessModal");
  const evidenceCaseCode = document.getElementById("evidenceCaseCode");

  const evidenceBot = document.getElementById("evidenceBot");
  const openEvidenceBot = document.getElementById("openEvidenceBot");
  const openEvidenceHelp = document.getElementById("openEvidenceHelp");
  const closeEvidenceBot = document.getElementById("closeEvidenceBot");

  let selectedEvidenceFiles = [];

  if (evidenceDescription && evidenceCharCounter) {
    evidenceDescription.addEventListener("input", () => {
      evidenceCharCounter.textContent = `${evidenceDescription.value.length}/500 caracteres`;
      updateEvidenceQuality();
    });
  }

  if (improveEvidenceText) {
    improveEvidenceText.addEventListener("click", () => {
      const text = evidenceDescription.value.trim();

      if (!text) {
        showEvidenceToast("Primero escribe una breve descripción de la evidencia.", "error");
        return;
      }

      evidenceDescription.value = improveEvidenceDescription(text);
      evidenceCharCounter.textContent = `${evidenceDescription.value.length}/500 caracteres`;
      showEvidenceToast("Descripción mejorada con una sugerencia IA.");
      updateEvidenceQuality();
    });
  }

  function improveEvidenceDescription(text) {
    return `Adjunto esta evidencia porque muestra ${text}. 
El archivo está relacionado con el caso seleccionado y permite sustentar la revisión solicitada por el cliente.`;
  }

  if (selectEvidenceFiles && evidenceFiles) {
    selectEvidenceFiles.addEventListener("click", () => {
      evidenceFiles.click();
    });
  }

  if (evidenceFiles) {
    evidenceFiles.addEventListener("change", (event) => {
      addEvidenceFiles(Array.from(event.target.files));
    });
  }

  if (evidenceUploadZone) {
    evidenceUploadZone.addEventListener("dragover", (event) => {
      event.preventDefault();
      evidenceUploadZone.classList.add("drag-over");
    });

    evidenceUploadZone.addEventListener("dragleave", () => {
      evidenceUploadZone.classList.remove("drag-over");
    });

    evidenceUploadZone.addEventListener("drop", (event) => {
      event.preventDefault();
      evidenceUploadZone.classList.remove("drag-over");

      addEvidenceFiles(Array.from(event.dataTransfer.files));
    });
  }

  function addEvidenceFiles(files) {
    const allowedExtensions = ["jpg", "jpeg", "png", "pdf", "doc", "docx", "mp4", "mov"];
    const maxSizeMb = 20;

    files.forEach((file) => {
      const extension = file.name.split(".").pop().toLowerCase();
      const sizeMb = file.size / (1024 * 1024);

      if (!allowedExtensions.includes(extension)) {
        showEvidenceToast(`Formato no permitido: ${file.name}`, "error");
        return;
      }

      if (sizeMb > maxSizeMb) {
        showEvidenceToast(`El archivo ${file.name} supera los ${maxSizeMb} MB.`, "error");
        return;
      }

      selectedEvidenceFiles.push(file);
    });

    renderEvidenceFiles();
    updateEvidenceQuality();
  }

  function renderEvidenceFiles() {
    evidenceFileList.innerHTML = "";

    selectedEvidenceFiles.forEach((file, index) => {
      const item = document.createElement("div");
      item.className = "file-item";

      item.innerHTML = `
        <i class="fa-solid fa-file-lines"></i>
        <div>
          <strong>${file.name}</strong>
          <span>${formatFileSize(file.size)}</span>
        </div>
        <button type="button" aria-label="Eliminar archivo" data-index="${index}">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;

      evidenceFileList.appendChild(item);
    });

    evidenceFileList.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        selectedEvidenceFiles.splice(index, 1);
        renderEvidenceFiles();
        updateEvidenceQuality();
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

  if (runEvidenceCheck) {
    runEvidenceCheck.addEventListener("click", () => {
      updateEvidenceQuality();
      showEvidenceToast("Validación de evidencia completada.");
    });
  }

  if (generateEvidenceRecommendation) {
    generateEvidenceRecommendation.addEventListener("click", () => {
      const type = evidenceType.value;
      const filesCount = selectedEvidenceFiles.length;

      if (!caseSelect.value || !type || filesCount === 0) {
        evidenceRecommendation.innerHTML = `
          Completa el caso, tipo de evidencia y adjunta al menos un archivo para generar una recomendación.
        `;
        showEvidenceToast("Falta información para generar la recomendación.", "error");
        return;
      }

      evidenceRecommendation.innerHTML = `
        <strong>Recomendación generada:</strong><br>
        La evidencia de tipo ${type} fue asociada al caso ${caseSelect.value}.
        Se recomienda verificar que el archivo sea legible y que muestre claramente el dato observado.
      `;

      showEvidenceToast("Recomendación IA generada.");
    });
  }

  if (previewEvidence) {
    previewEvidence.addEventListener("click", () => {
      if (!validateEvidenceFields(false)) {
        showEvidenceToast("Completa los campos obligatorios antes de ver la vista previa.", "error");
        return;
      }

      renderEvidencePreview();
      evidencePreviewModal.classList.add("active");
    });
  }

  if (closeEvidencePreview) {
    closeEvidencePreview.addEventListener("click", () => {
      evidencePreviewModal.classList.remove("active");
    });
  }

  if (confirmEvidenceFromPreview) {
    confirmEvidenceFromPreview.addEventListener("click", () => {
      evidencePreviewModal.classList.remove("active");
      submitEvidence();
    });
  }

  if (evidenceForm) {
    evidenceForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!validateEvidenceFields(true)) {
        showEvidenceToast("Revisa los campos obligatorios marcados.", "error");
        return;
      }

      submitEvidence();
    });
  }

  function validateEvidenceFields(markInvalid) {
    const requiredFields = evidenceForm.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      const valid = field.type === "checkbox" ? field.checked : field.value.trim();

      if (!valid) {
        isValid = false;

        if (markInvalid) {
          field.classList.add("invalid");
        }
      } else {
        field.classList.remove("invalid");
      }
    });

    if (selectedEvidenceFiles.length === 0) {
      isValid = false;
      if (markInvalid) {
        evidenceUploadZone.classList.add("drag-over");
      }
    } else {
      evidenceUploadZone.classList.remove("drag-over");
    }

    return isValid;
  }

  function getEvidenceData() {
    return {
      caseCode: caseSelect.value,
      evidenceType: evidenceType.value,
      description: evidenceDescription.value,
      fileCount: selectedEvidenceFiles.length
    };
  }

  function renderEvidencePreview() {
    const data = getEvidenceData();

    const rows = [
      ["Caso asociado", data.caseCode],
      ["Tipo de evidencia", data.evidenceType],
      ["Descripción", data.description],
      ["Cantidad de archivos", `${data.fileCount} archivo(s)`],
      ["Notificación", document.getElementById("notifyEvidence").checked ? "Sí" : "No"]
    ];

    evidencePreviewContent.innerHTML = rows
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

  function submitEvidence() {
    const data = getEvidenceData();
    evidenceCaseCode.textContent = data.caseCode || "CL-RC-000123";

    /*
      CONEXIÓN FUTURA CON BACKEND:
      POST /api/evidencias

      const formData = new FormData();
      formData.append("data", JSON.stringify(getEvidenceData()));
      selectedEvidenceFiles.forEach(file => formData.append("archivos", file));

      fetch("http://localhost:5000/api/evidencias", {
        method: "POST",
        body: formData
      });
    */

    showEvidenceToast("Subiendo evidencia...");

    setTimeout(() => {
      evidenceSuccessModal.classList.add("active");
    }, 700);
  }

  if (saveEvidenceDraft) {
    saveEvidenceDraft.addEventListener("click", () => {
      localStorage.setItem("draftEvidence", JSON.stringify(getEvidenceData()));
      showEvidenceToast("Borrador de evidencia guardado.");
    });
  }

  function updateEvidenceQuality() {
    const data = getEvidenceData();

    setQuality("evidenceQualityCase", Boolean(data.caseCode));
    setQuality("evidenceQualityType", Boolean(data.evidenceType));
    setQuality("evidenceQualityDescription", data.description.length >= 25);
    setQuality("evidenceQualityFiles", selectedEvidenceFiles.length > 0);
  }

  function setQuality(id, completed) {
    const element = document.getElementById(id);
    if (!element) return;

    element.classList.toggle("completed", completed);

    const icon = element.querySelector("i");
    icon.className = completed
      ? "fa-solid fa-circle-check"
      : "fa-regular fa-circle";
  }

  function toggleEvidenceBot() {
    evidenceBot.classList.toggle("active");
  }

  if (openEvidenceBot) {
    openEvidenceBot.addEventListener("click", toggleEvidenceBot);
  }

  if (openEvidenceHelp) {
    openEvidenceHelp.addEventListener("click", toggleEvidenceBot);
  }

  if (closeEvidenceBot) {
    closeEvidenceBot.addEventListener("click", () => {
      evidenceBot.classList.remove("active");
    });
  }

  document.querySelectorAll(".chat-option").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.evidence;

      const suggestions = {
        recibo:
          "Adjunto el recibo observado donde se visualiza el monto reclamado, el periodo de facturación y el servicio asociado.",
        falla:
          "Adjunto evidencia visual de la falla técnica presentada, donde se observa la interrupción, error o comportamiento anormal del servicio.",
        contrato:
          "Adjunto el documento relacionado con el contrato o plan contratado, para sustentar la revisión de las condiciones aplicadas."
      };

      evidenceDescription.value = suggestions[type] || evidenceDescription.value;
      evidenceCharCounter.textContent = `${evidenceDescription.value.length}/500 caracteres`;
      updateEvidenceQuality();
      showEvidenceToast("Se insertó una descripción sugerida por IA.");
    });
  });

  function showEvidenceToast(message, type = "success") {
    const existingToast = document.querySelector(".evidence-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "evidence-toast";
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

  updateEvidenceQuality();
});