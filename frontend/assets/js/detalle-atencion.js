document.addEventListener("DOMContentLoaded", () => {
  const copyAttentionCode = document.getElementById("copyAttentionCode");
  const caseCodeText = document.getElementById("caseCodeText");

  const expandAttentionTimeline = document.getElementById("expandAttentionTimeline");
  const timelineItems = document.querySelectorAll(".detail-timeline-item");
  const timelineToggles = document.querySelectorAll(".timeline-toggle");

  const quickUpdate = document.getElementById("quickUpdate");
  const validateEvidenceWithAi = document.getElementById("validateEvidenceWithAi");
  const saveInternalNote = document.getElementById("saveInternalNote");
  const internalNote = document.getElementById("internalNote");

  const attentionAiSummary = document.getElementById("attentionAiSummary");
  const generateAttentionSummary = document.getElementById("generateAttentionSummary");

  const openEscalateModal = document.getElementById("openEscalateModal");
  const escalateModal = document.getElementById("escalateModal");
  const closeEscalateModal = document.getElementById("closeEscalateModal");
  const confirmEscalate = document.getElementById("confirmEscalate");
  const escalateArea = document.getElementById("escalateArea");
  const escalateReason = document.getElementById("escalateReason");

  const openResolveModal = document.getElementById("openResolveModal");
  const resolveModal = document.getElementById("resolveModal");
  const closeResolveModal = document.getElementById("closeResolveModal");
  const confirmResolve = document.getElementById("confirmResolve");
  const resolveResult = document.getElementById("resolveResult");
  const resolveMessage = document.getElementById("resolveMessage");

  const attentionBot = document.getElementById("attentionBot");
  const openAttentionBot = document.getElementById("openAttentionBot");
  const openAttentionHelp = document.getElementById("openAttentionHelp");
  const closeAttentionBot = document.getElementById("closeAttentionBot");

  const codigoCaso = "CL-IN-000099";

  async function initAttentionDetail() {
    try {
      if (typeof getCasoByCodigo !== "function") {
        throw new Error("api.js no disponible.");
      }

      const response = await getCasoByCodigo(codigoCaso);
      console.log("Caso cargado desde backend:", response);

      /*
        Cuando tengamos backend, aquí llenaremos dinámicamente:
        - datos del caso
        - datos del cliente
        - SLA
        - evidencias
        - historial
      */

      if (typeof getHistorialCaso === "function") {
        const historial = await getHistorialCaso(codigoCaso);
        console.log("Historial cargado desde backend:", historial);
      }
    } catch (error) {
      console.warn("Usando detalle de atención simulado:", error.message);
    }
  }

  if (copyAttentionCode) {
    copyAttentionCode.addEventListener("click", async () => {
      const code = caseCodeText?.textContent || codigoCaso;

      try {
        await navigator.clipboard.writeText(code);
        showAttentionToast("Código copiado al portapapeles.");
      } catch {
        showAttentionToast("No se pudo copiar el código.", "error");
      }
    });
  }

  timelineToggles.forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".detail-timeline-item");
      item.classList.toggle("expanded");

      button.textContent = item.classList.contains("expanded")
        ? "Ocultar detalle"
        : "Ver detalle";
    });
  });

  if (expandAttentionTimeline) {
    expandAttentionTimeline.addEventListener("click", () => {
      const shouldExpand = expandAttentionTimeline.textContent.trim() === "Expandir todo";

      timelineItems.forEach((item) => {
        const extra = item.querySelector(".timeline-extra");
        const toggle = item.querySelector(".timeline-toggle");

        if (extra) {
          item.classList.toggle("expanded", shouldExpand);
        }

        if (toggle) {
          toggle.textContent = shouldExpand ? "Ocultar detalle" : "Ver detalle";
        }
      });

      expandAttentionTimeline.textContent = shouldExpand ? "Contraer todo" : "Expandir todo";
    });
  }

  if (quickUpdate) {
    quickUpdate.addEventListener("click", () => {
      window.location.href = "actualizar-seguimiento.html";
    });
  }

  if (validateEvidenceWithAi) {
    validateEvidenceWithAi.addEventListener("click", () => {
      showAttentionToast("IA: las evidencias son útiles, pero se recomienda pedir ubicación exacta.");
    });
  }

  if (saveInternalNote) {
    saveInternalNote.addEventListener("click", () => {
      const note = internalNote.value.trim();

      if (!note) {
        showAttentionToast("Escribe una nota interna antes de guardar.", "error");
        return;
      }

      /*
        CONEXIÓN FUTURA CON BACKEND:
        POST /api/casos/:codigoCaso/seguimiento
        tipo: "nota interna"
      */

      localStorage.setItem(`notaInterna_${codigoCaso}`, note);
      showAttentionToast("Nota interna guardada correctamente.");
    });
  }

  if (generateAttentionSummary) {
    generateAttentionSummary.addEventListener("click", () => {
      attentionAiSummary.innerHTML = `
        <strong>Resumen generado:</strong><br>
        El caso ${codigoCaso} es una incidencia crítica por ausencia de servicio móvil.
        Está pendiente por información del cliente. Se recomienda solicitar ubicación,
        validar cobertura y confirmar si afecta a más líneas antes de escalar.
      `;

      showAttentionToast("Resumen IA generado.");
    });
  }

  if (openEscalateModal) {
    openEscalateModal.addEventListener("click", () => {
      escalateModal.classList.add("active");
    });
  }

  if (closeEscalateModal) {
    closeEscalateModal.addEventListener("click", () => {
      escalateModal.classList.remove("active");
    });
  }

  if (confirmEscalate) {
    confirmEscalate.addEventListener("click", async () => {
      const area = escalateArea.value;
      const reason = escalateReason.value.trim();

      if (!area || !reason) {
        showAttentionToast("Completa el área y motivo del escalamiento.", "error");
        return;
      }

      try {
        if (typeof cambiarEstadoCaso === "function") {
          await cambiarEstadoCaso(codigoCaso, {
            estado: "Escalado",
            area,
            observacion: reason
          });
        }
      } catch (error) {
        console.warn("Escalamiento simulado:", error.message);
      }

      escalateModal.classList.remove("active");
      showAttentionToast("Caso escalado correctamente.");
    });
  }

  if (openResolveModal) {
    openResolveModal.addEventListener("click", () => {
      resolveModal.classList.add("active");
    });
  }

  if (closeResolveModal) {
    closeResolveModal.addEventListener("click", () => {
      resolveModal.classList.remove("active");
    });
  }

  if (confirmResolve) {
    confirmResolve.addEventListener("click", async () => {
      const result = resolveResult.value;
      const message = resolveMessage.value.trim();

      if (!result || !message) {
        showAttentionToast("Completa el resultado y la respuesta al cliente.", "error");
        return;
      }

      try {
        if (typeof cambiarEstadoCaso === "function") {
          await cambiarEstadoCaso(codigoCaso, {
            estado: "Resuelto",
            resultado: result,
            respuestaCliente: message
          });
        }
      } catch (error) {
        console.warn("Resolución simulada:", error.message);
      }

      resolveModal.classList.remove("active");
      showAttentionToast("Caso marcado como resuelto.");
    });
  }

  [escalateModal, resolveModal].forEach((modal) => {
    if (!modal) return;

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("active");
      }
    });
  });

  function toggleAttentionBot() {
    attentionBot.classList.toggle("active");
  }

  if (openAttentionBot) {
    openAttentionBot.addEventListener("click", toggleAttentionBot);
  }

  if (openAttentionHelp) {
    openAttentionHelp.addEventListener("click", toggleAttentionBot);
  }

  if (closeAttentionBot) {
    closeAttentionBot.addEventListener("click", () => {
      attentionBot.classList.remove("active");
    });
  }

  function showAttentionToast(message, type = "success") {
    const existingToast = document.querySelector(".attention-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "attention-toast";
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

  initAttentionDetail();
});