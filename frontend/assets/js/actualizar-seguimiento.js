document.addEventListener("DOMContentLoaded", () => {
  const trackingForm = document.getElementById("trackingForm");

  const trackingCaseCode = document.getElementById("trackingCaseCode");
  const newStatus = document.getElementById("newStatus");
  const trackingType = document.getElementById("trackingType");
  const visibility = document.getElementById("visibility");

  const internalObservation = document.getElementById("internalObservation");
  const clientMessage = document.getElementById("clientMessage");
  const internalCounter = document.getElementById("internalCounter");
  const clientCounter = document.getElementById("clientCounter");

  const improveInternalObservation = document.getElementById("improveInternalObservation");
  const generateClientMessage = document.getElementById("generateClientMessage");

  const trackingUploadZone = document.getElementById("trackingUploadZone");
  const trackingFiles = document.getElementById("trackingFiles");
  const selectTrackingFiles = document.getElementById("selectTrackingFiles");
  const trackingFileList = document.getElementById("trackingFileList");

  const saveTrackingDraft = document.getElementById("saveTrackingDraft");
  const previewTracking = document.getElementById("previewTracking");
  const trackingPreviewModal = document.getElementById("trackingPreviewModal");
  const closeTrackingPreview = document.getElementById("closeTrackingPreview");
  const trackingPreviewContent = document.getElementById("trackingPreviewContent");
  const confirmTrackingFromPreview = document.getElementById("confirmTrackingFromPreview");

  const trackingSuccessModal = document.getElementById("trackingSuccessModal");
  const trackingSuccessCode = document.getElementById("trackingSuccessCode");

  const runTrackingQuality = document.getElementById("runTrackingQuality");
  const trackingQualitySummary = document.getElementById("trackingQualitySummary");

  const trackingBot = document.getElementById("trackingBot");
  const openTrackingBot = document.getElementById("openTrackingBot");
  const openTrackingHelp = document.getElementById("openTrackingHelp");
  const closeTrackingBot = document.getElementById("closeTrackingBot");

  let selectedTrackingFiles = [];

  internalObservation.addEventListener("input", () => {
    internalCounter.textContent = `${internalObservation.value.length}/700 caracteres`;
    updateTrackingQuality();
  });

  clientMessage.addEventListener("input", () => {
    clientCounter.textContent = `${clientMessage.value.length}/700 caracteres`;
    updateTrackingQuality();
  });

  [newStatus, trackingType, visibility].forEach((field) => {
    field.addEventListener("change", updateTrackingQuality);
  });

  improveInternalObservation.addEventListener("click", () => {
    const text = internalObservation.value.trim();

    if (!text) {
      showTrackingToast("Primero escribe una observación breve.", "error");
      return;
    }

    internalObservation.value = `Se registra avance del caso indicando que ${text}. La información será considerada para la continuidad de la atención y quedará como parte de la trazabilidad operativa.`;
    internalCounter.textContent = `${internalObservation.value.length}/700 caracteres`;

    updateTrackingQuality();
    showTrackingToast("Observación interna mejorada con IA.");
  });

  generateClientMessage.addEventListener("click", () => {
    const status = newStatus.value;

    const messages = {
      "En atención":
        "Estimado cliente, le informamos que su caso se encuentra en atención por el equipo responsable. Le estaremos notificando cualquier avance o solicitud adicional.",
      "Pendiente cliente":
        "Estimado cliente, para continuar con la atención de su caso necesitamos que nos brinde información adicional. Puede adjuntar la documentación solicitada desde la WebApp.",
      "Escalado":
        "Estimado cliente, su caso ha sido derivado a un área especializada para una revisión más detallada. Le notificaremos cuando tengamos una actualización.",
      "Resuelto":
        "Estimado cliente, su caso ha sido revisado y se ha registrado una respuesta final. Puede consultar el detalle en el historial de su caso.",
      "Cerrado":
        "Estimado cliente, su caso ha sido cerrado luego de completarse la atención correspondiente."
    };

    clientMessage.value =
      messages[status] ||
      "Estimado cliente, registramos una actualización en su caso. Puede revisar el detalle desde la sección de seguimiento.";

    clientCounter.textContent = `${clientMessage.value.length}/700 caracteres`;

    updateTrackingQuality();
    showTrackingToast("Mensaje al cliente generado con IA.");
  });

  selectTrackingFiles.addEventListener("click", () => {
    trackingFiles.click();
  });

  trackingFiles.addEventListener("change", (event) => {
    addTrackingFiles(Array.from(event.target.files));
  });

  trackingUploadZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    trackingUploadZone.classList.add("drag-over");
  });

  trackingUploadZone.addEventListener("dragleave", () => {
    trackingUploadZone.classList.remove("drag-over");
  });

  trackingUploadZone.addEventListener("drop", (event) => {
    event.preventDefault();
    trackingUploadZone.classList.remove("drag-over");

    addTrackingFiles(Array.from(event.dataTransfer.files));
  });

  function addTrackingFiles(files) {
    const allowedExtensions = ["jpg", "jpeg", "png", "pdf", "doc", "docx"];
    const maxSizeMb = 15;

    files.forEach((file) => {
      const extension = file.name.split(".").pop().toLowerCase();
      const sizeMb = file.size / (1024 * 1024);

      if (!allowedExtensions.includes(extension)) {
        showTrackingToast(`Formato no permitido: ${file.name}`, "error");
        return;
      }

      if (sizeMb > maxSizeMb) {
        showTrackingToast(`El archivo ${file.name} supera los ${maxSizeMb} MB.`, "error");
        return;
      }

      selectedTrackingFiles.push(file);
    });

    renderTrackingFiles();
  }

  function renderTrackingFiles() {
    trackingFileList.innerHTML = "";

    selectedTrackingFiles.forEach((file, index) => {
      const item = document.createElement("div");
      item.className = "file-item";

      item.innerHTML = `
        <i class="fa-solid fa-file-lines"></i>
        <div>
          <strong>${file.name}</strong>
          <span>${formatFileSize(file.size)}</span>
        </div>
        <button type="button" data-index="${index}">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;

      trackingFileList.appendChild(item);
    });

    trackingFileList.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        selectedTrackingFiles.splice(index, 1);
        renderTrackingFiles();
      });
    });
  }

  function formatFileSize(bytes) {
    const kb = bytes / 1024;

    if (kb < 1024) return `${kb.toFixed(1)} KB`;

    return `${(kb / 1024).toFixed(2)} MB`;
  }

  runTrackingQuality.addEventListener("click", () => {
    updateTrackingQuality();

    const data = getTrackingData();

    if (!data.nuevoEstado || !data.tipoActualizacion || !data.observacionInterna) {
      trackingQualitySummary.innerHTML = `
        <strong>Validación pendiente:</strong><br>
        Falta completar estado, tipo de actualización u observación interna.
      `;

      showTrackingToast("Falta información para validar el seguimiento.", "error");
      return;
    }

    trackingQualitySummary.innerHTML = `
      <strong>Seguimiento válido:</strong><br>
      La actualización cuenta con estado, tipo, observación y visibilidad.
      Puede registrarse en la trazabilidad del caso.
    `;

    showTrackingToast("Seguimiento validado correctamente.");
  });

  previewTracking.addEventListener("click", () => {
    if (!validateTrackingFields(false)) {
      showTrackingToast("Completa los campos obligatorios antes de ver la vista previa.", "error");
      return;
    }

    renderTrackingPreview();
    trackingPreviewModal.classList.add("active");
  });

  closeTrackingPreview.addEventListener("click", () => {
    trackingPreviewModal.classList.remove("active");
  });

  confirmTrackingFromPreview.addEventListener("click", () => {
    trackingPreviewModal.classList.remove("active");
    submitTracking();
  });

  trackingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateTrackingFields(true)) {
      showTrackingToast("Revisa los campos obligatorios marcados.", "error");
      return;
    }

    submitTracking();
  });

  function validateTrackingFields(markInvalid) {
    const requiredFields = trackingForm.querySelectorAll("[required]");
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

    return isValid;
  }

  function getTrackingData() {
    return {
      codigoCaso: trackingCaseCode.value.trim(),
      estadoActual: document.getElementById("currentStatus").value,
      nuevoEstado: newStatus.value,
      tipoActualizacion: trackingType.value,
      visibilidad: visibility.value,
      observacionInterna: internalObservation.value.trim(),
      mensajeCliente: clientMessage.value.trim(),
      notificarCliente: document.getElementById("notifyClient").checked,
      archivos: selectedTrackingFiles.length
    };
  }

  function renderTrackingPreview() {
    const data = getTrackingData();

    const rows = [
      ["Código de caso", data.codigoCaso],
      ["Estado actual", data.estadoActual],
      ["Nuevo estado", data.nuevoEstado],
      ["Tipo de actualización", data.tipoActualizacion],
      ["Visibilidad", data.visibilidad],
      ["Observación interna", data.observacionInterna],
      ["Mensaje al cliente", data.mensajeCliente || "No especificado"],
      ["Notificar cliente", data.notificarCliente ? "Sí" : "No"],
      ["Archivos adjuntos", `${data.archivos} archivo(s)`]
    ];

    trackingPreviewContent.innerHTML = rows
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

  async function submitTracking() {
    const data = getTrackingData();

    try {
      const formData = new FormData();
      formData.append("datos", JSON.stringify(data));

      selectedTrackingFiles.forEach((file) => {
        formData.append("archivos", file);
      });

      if (typeof actualizarSeguimientoCaso === "function") {
        await actualizarSeguimientoCaso(data.codigoCaso, data);
      }

      if (typeof cambiarEstadoCaso === "function") {
        await cambiarEstadoCaso(data.codigoCaso, {
          estado: data.nuevoEstado,
          observacion: data.observacionInterna
        });
      }
    } catch (error) {
      console.warn("Registro de seguimiento simulado:", error.message);
    }

    trackingSuccessCode.textContent = data.codigoCaso;
    trackingSuccessModal.classList.add("active");
    showTrackingToast("Seguimiento registrado correctamente.");
  }

  saveTrackingDraft.addEventListener("click", () => {
    localStorage.setItem("draftTracking", JSON.stringify(getTrackingData()));
    showTrackingToast("Borrador de seguimiento guardado.");
  });

  function updateTrackingQuality() {
    setQualityState("qualityStatus", Boolean(newStatus.value && trackingType.value));
    setQualityState("qualityObservation", internalObservation.value.trim().length >= 30);
    setQualityState("qualityVisibility", Boolean(visibility.value));
    setQualityState("qualityClientMsg", clientMessage.value.trim().length >= 30 || visibility.value === "Solo interno");
  }

  function setQualityState(id, completed) {
    const element = document.getElementById(id);
    if (!element) return;

    element.classList.toggle("completed", completed);

    const icon = element.querySelector("i");
    icon.className = completed ? "fa-solid fa-circle-check" : "fa-regular fa-circle";
  }

  function toggleTrackingBot() {
    trackingBot.classList.toggle("active");
  }

  openTrackingBot.addEventListener("click", toggleTrackingBot);
  openTrackingHelp.addEventListener("click", toggleTrackingBot);

  closeTrackingBot.addEventListener("click", () => {
    trackingBot.classList.remove("active");
  });

  document.querySelectorAll(".chat-option").forEach((button) => {
    button.addEventListener("click", () => {
      const template = button.dataset.template;

      const templates = {
        pendiente: {
          estado: "Pendiente cliente",
          tipo: "Solicitud de información",
          observacion:
            "Se requiere información adicional del cliente para continuar con la atención del caso. Se solicita precisar ubicación, recurrencia de la falla y si afecta a más servicios.",
          mensaje:
            "Estimado cliente, para continuar con la atención necesitamos que nos brinde información adicional sobre la ubicación de la falla, desde cuándo ocurre y si afecta a más servicios."
        },
        revision: {
          estado: "En atención",
          tipo: "Validación técnica",
          observacion:
            "El caso continúa en revisión técnica. Se está validando la información registrada y las evidencias adjuntas por el cliente.",
          mensaje:
            "Estimado cliente, su caso continúa en revisión por el equipo responsable. Le notificaremos cualquier avance o solicitud adicional."
        },
        resuelto: {
          estado: "Resuelto",
          tipo: "Respuesta final",
          observacion:
            "Se registra respuesta final del caso luego de la revisión correspondiente. La solución será comunicada al cliente.",
          mensaje:
            "Estimado cliente, su caso ha sido revisado y se ha registrado una respuesta final. Puede consultar el detalle en el seguimiento de su caso."
        }
      };

      const selected = templates[template];

      if (!selected) return;

      newStatus.value = selected.estado;
      trackingType.value = selected.tipo;
      visibility.value = "Cliente e interno";
      internalObservation.value = selected.observacion;
      clientMessage.value = selected.mensaje;

      internalCounter.textContent = `${internalObservation.value.length}/700 caracteres`;
      clientCounter.textContent = `${clientMessage.value.length}/700 caracteres`;

      updateTrackingQuality();
      showTrackingToast("Plantilla IA aplicada.");
    });
  });

  function showTrackingToast(message, type = "success") {
    const existingToast = document.querySelector(".tracking-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "tracking-toast";
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

  updateTrackingQuality();
});