document.addEventListener("DOMContentLoaded", () => {
  const requestInfoForm = document.getElementById("requestInfoForm");

  const requestCaseCode = document.getElementById("requestCaseCode");
  const requestType = document.getElementById("requestType");
  const requestUrgency = document.getElementById("requestUrgency");
  const requestDeadline = document.getElementById("requestDeadline");
  const notificationChannel = document.getElementById("notificationChannel");

  const requestSubject = document.getElementById("requestSubject");
  const requestMessage = document.getElementById("requestMessage");
  const requestInternalNote = document.getElementById("requestInternalNote");
  const requestMessageCounter = document.getElementById("requestMessageCounter");
  const requestInternalCounter = document.getElementById("requestInternalCounter");

  const generateRequestMessage = document.getElementById("generateRequestMessage");
  const improveRequestInternalNote = document.getElementById("improveRequestInternalNote");

  const runRequestQuality = document.getElementById("runRequestQuality");
  const requestQualitySummary = document.getElementById("requestQualitySummary");

  const saveRequestDraft = document.getElementById("saveRequestDraft");
  const previewRequestInfo = document.getElementById("previewRequestInfo");
  const requestPreviewModal = document.getElementById("requestPreviewModal");
  const closeRequestPreview = document.getElementById("closeRequestPreview");
  const requestPreviewContent = document.getElementById("requestPreviewContent");
  const confirmRequestFromPreview = document.getElementById("confirmRequestFromPreview");

  const requestSuccessModal = document.getElementById("requestSuccessModal");
  const requestSuccessCode = document.getElementById("requestSuccessCode");

  const requestBot = document.getElementById("requestBot");
  const openRequestBot = document.getElementById("openRequestBot");
  const openRequestHelp = document.getElementById("openRequestHelp");
  const closeRequestBot = document.getElementById("closeRequestBot");

  requestMessage.addEventListener("input", () => {
    requestMessageCounter.textContent = `${requestMessage.value.length}/900 caracteres`;
    updateRequestQuality();
  });

  requestInternalNote.addEventListener("input", () => {
    requestInternalCounter.textContent = `${requestInternalNote.value.length}/600 caracteres`;
  });

  [requestType, requestUrgency, requestDeadline, notificationChannel].forEach((field) => {
    field.addEventListener("change", updateRequestQuality);
  });

  document.querySelectorAll(".request-checklist input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", updateRequestQuality);
  });

  generateRequestMessage.addEventListener("click", () => {
    const selectedItems = getSelectedItems();
    const type = requestType.value || "información adicional";

    requestSubject.value = "Información adicional requerida para continuar con su caso";

    requestMessage.value = `
Estimado cliente, para continuar con la atención de su caso ${requestCaseCode.value}, necesitamos que nos brinde información adicional relacionada con: ${type}.

Por favor, adjunte o registre la siguiente información:
${selectedItems.length > 0 ? selectedItems.map((item) => `- ${item}`).join("\n") : "- Información complementaria del problema reportado."}

Esta información nos permitirá continuar con la revisión del caso y evitar retrasos en la atención.
    `.trim();

    requestMessageCounter.textContent = `${requestMessage.value.length}/900 caracteres`;
    updateRequestQuality();
    showRequestToast("Mensaje generado con IA.");
  });

  improveRequestInternalNote.addEventListener("click", () => {
    const note = requestInternalNote.value.trim();

    if (!note) {
      showRequestToast("Primero escribe una nota interna breve.", "error");
      return;
    }

    requestInternalNote.value =
      `Se registra solicitud de información adicional al cliente debido a que ${note}. Esta acción busca completar los datos necesarios para continuar con la evaluación del caso.`;

    requestInternalCounter.textContent = `${requestInternalNote.value.length}/600 caracteres`;
    showRequestToast("Nota interna mejorada con IA.");
  });

  runRequestQuality.addEventListener("click", () => {
    updateRequestQuality();

    const data = getRequestData();

    if (!data.tipoSolicitud || !data.fechaLimite || !data.mensajeCliente || data.elementosSolicitados.length === 0) {
      requestQualitySummary.innerHTML = `
        <strong>Validación pendiente:</strong><br>
        Falta definir el tipo, fecha límite, mensaje o elementos solicitados.
      `;

      showRequestToast("Falta información para validar la solicitud.", "error");
      return;
    }

    requestQualitySummary.innerHTML = `
      <strong>Solicitud válida:</strong><br>
      La solicitud es clara, tiene fecha límite y especifica la información requerida al cliente.
    `;

    showRequestToast("Solicitud validada correctamente.");
  });

  previewRequestInfo.addEventListener("click", () => {
    if (!validateRequestFields(false)) {
      showRequestToast("Completa los campos obligatorios antes de ver la vista previa.", "error");
      return;
    }

    renderRequestPreview();
    requestPreviewModal.classList.add("active");
  });

  closeRequestPreview.addEventListener("click", () => {
    requestPreviewModal.classList.remove("active");
  });

  confirmRequestFromPreview.addEventListener("click", () => {
    requestPreviewModal.classList.remove("active");
    submitRequestInfo();
  });

  requestInfoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateRequestFields(true)) {
      showRequestToast("Revisa los campos obligatorios marcados.", "error");
      return;
    }

    submitRequestInfo();
  });

  function validateRequestFields(markInvalid) {
    const requiredFields = requestInfoForm.querySelectorAll("[required]");
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

  function getSelectedItems() {
    return Array.from(document.querySelectorAll(".request-checklist input[type='checkbox']:checked"))
      .map((item) => item.value);
  }

  function getRequestData() {
    return {
      codigoCaso: requestCaseCode.value.trim(),
      cliente: document.getElementById("requestClient").value,
      servicio: document.getElementById("requestService").value,
      estadoActual: document.getElementById("requestCurrentStatus").value,
      tipoSolicitud: requestType.value,
      urgencia: requestUrgency.value,
      fechaLimite: requestDeadline.value,
      canalNotificacion: notificationChannel.value,
      elementosSolicitados: getSelectedItems(),
      asunto: requestSubject.value.trim(),
      mensajeCliente: requestMessage.value.trim(),
      notaInterna: requestInternalNote.value.trim(),
      cambiarEstadoPendiente: document.getElementById("changeStatusToPending").checked
    };
  }

  function renderRequestPreview() {
    const data = getRequestData();

    const rows = [
      ["Código de caso", data.codigoCaso],
      ["Cliente", data.cliente],
      ["Servicio", data.servicio],
      ["Tipo de solicitud", data.tipoSolicitud],
      ["Urgencia", data.urgencia],
      ["Fecha límite", data.fechaLimite],
      ["Canal", data.canalNotificacion],
      ["Elementos solicitados", data.elementosSolicitados.join(", ") || "No especificado"],
      ["Asunto", data.asunto],
      ["Mensaje al cliente", data.mensajeCliente],
      ["Nota interna", data.notaInterna || "No especificada"],
      ["Cambiar estado", data.cambiarEstadoPendiente ? "Sí, a Pendiente cliente" : "No"]
    ];

    requestPreviewContent.innerHTML = rows
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

  async function submitRequestInfo() {
    const data = getRequestData();

    try {
      /*
        CONEXIÓN FUTURA CON BACKEND:
        Esta acción debe registrar:
        1. Movimiento de historial.
        2. Notificación al cliente.
        3. Cambio de estado opcional a Pendiente cliente.
      */

      if (typeof actualizarSeguimientoCaso === "function") {
        await actualizarSeguimientoCaso(data.codigoCaso, {
          tipoActualizacion: "Solicitud de información",
          nuevoEstado: data.cambiarEstadoPendiente ? "Pendiente cliente" : data.estadoActual,
          visibilidad: "Cliente e interno",
          observacionInterna: data.notaInterna,
          mensajeCliente: data.mensajeCliente,
          canalNotificacion: data.canalNotificacion,
          fechaLimite: data.fechaLimite,
          elementosSolicitados: data.elementosSolicitados
        });
      }

      if (data.cambiarEstadoPendiente && typeof cambiarEstadoCaso === "function") {
        await cambiarEstadoCaso(data.codigoCaso, {
          estado: "Pendiente cliente",
          observacion: data.mensajeCliente
        });
      }
    } catch (error) {
      console.warn("Solicitud de información simulada:", error.message);
    }

    requestSuccessCode.textContent = data.codigoCaso;
    requestSuccessModal.classList.add("active");
    showRequestToast("Solicitud enviada correctamente.");
  }

  saveRequestDraft.addEventListener("click", () => {
    localStorage.setItem("draftRequestInfo", JSON.stringify(getRequestData()));
    showRequestToast("Borrador guardado.");
  });

  function updateRequestQuality() {
    setQualityState("qualityRequestType", Boolean(requestType.value && requestUrgency.value));
    setQualityState("qualityRequestItems", getSelectedItems().length > 0);
    setQualityState("qualityRequestMessage", requestMessage.value.trim().length >= 40);
    setQualityState("qualityRequestDeadline", Boolean(requestDeadline.value));
  }

  function setQualityState(id, completed) {
    const element = document.getElementById(id);
    if (!element) return;

    element.classList.toggle("completed", completed);

    const icon = element.querySelector("i");
    icon.className = completed ? "fa-solid fa-circle-check" : "fa-regular fa-circle";
  }

  function toggleRequestBot() {
    requestBot.classList.toggle("active");
  }

  openRequestBot.addEventListener("click", toggleRequestBot);
  openRequestHelp.addEventListener("click", toggleRequestBot);

  closeRequestBot.addEventListener("click", () => {
    requestBot.classList.remove("active");
  });

  document.querySelectorAll(".chat-option").forEach((button) => {
    button.addEventListener("click", () => {
      const template = button.dataset.template;

      const templates = {
        ubicacion: {
          type: "Ubicación exacta",
          urgency: "Alta",
          subject: "Ubicación exacta requerida para continuar con su caso",
          message:
            "Estimado cliente, para continuar con la revisión de su caso necesitamos que nos indique la ubicación exacta donde ocurre la falla, incluyendo distrito, zona o referencia. También agradeceremos confirmar si el problema ocurre en interiores, exteriores o en una zona específica."
        },
        recibo: {
          type: "Documento",
          urgency: "Media",
          subject: "Documento requerido para la revisión de su caso",
          message:
            "Estimado cliente, para continuar con la atención de su caso necesitamos que adjunte el recibo, contrato o documento relacionado con la situación reportada. Por favor asegúrese de que el periodo, monto y datos del servicio sean visibles."
        },
        evidencia: {
          type: "Evidencia visual",
          urgency: "Alta",
          subject: "Evidencia visual requerida para continuar la atención",
          message:
            "Estimado cliente, para poder validar el inconveniente reportado necesitamos que adjunte una captura, fotografía o video corto donde se observe claramente la falla o situación presentada."
        }
      };

      const selected = templates[template];

      if (!selected) return;

      requestType.value = selected.type;
      requestUrgency.value = selected.urgency;
      notificationChannel.value = "WebApp y correo";
      requestSubject.value = selected.subject;
      requestMessage.value = selected.message;

      requestMessageCounter.textContent = `${requestMessage.value.length}/900 caracteres`;

      updateRequestQuality();
      showRequestToast("Plantilla IA aplicada.");
    });
  });

  function showRequestToast(message, type = "success") {
    const existingToast = document.querySelector(".request-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "request-toast";
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

  updateRequestQuality();
});