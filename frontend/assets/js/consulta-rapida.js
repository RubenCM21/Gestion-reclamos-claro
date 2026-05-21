document.addEventListener("DOMContentLoaded", () => {
  /*
    Estándar aplicado:
    - Primero intenta consultar backend mediante api.js.
    - Si el backend todavía no existe, usa resultado demo temporal.
    - Cuando el backend esté listo, no se modifica esta pantalla.
  */

  const quickTrackingForm = document.getElementById("quickTrackingForm");
  const trackingCode = document.getElementById("trackingCode");
  const trackingDocument = document.getElementById("trackingDocument");
  const trackingEmail = document.getElementById("trackingEmail");

  const trackingResultSection = document.getElementById("trackingResultSection");
  const trackingEmptySection = document.getElementById("trackingEmptySection");
  const retryTracking = document.getElementById("retryTracking");

  const resultCaseType = document.getElementById("resultCaseType");
  const resultCaseCode = document.getElementById("resultCaseCode");
  const resultCaseStatus = document.getElementById("resultCaseStatus");
  const resultCaseSummary = document.getElementById("resultCaseSummary");
  const resultService = document.getElementById("resultService");
  const resultPriority = document.getElementById("resultPriority");
  const resultCreatedAt = document.getElementById("resultCreatedAt");
  const resultEstimatedTime = document.getElementById("resultEstimatedTime");
  const resultProgressText = document.getElementById("resultProgressText");
  const resultProgressBar = document.getElementById("resultProgressBar");
  const trackingTimeline = document.getElementById("trackingTimeline");

  const uploadEvidenceLink = document.getElementById("uploadEvidenceLink");
  const historyLink = document.getElementById("historyLink");

  const trackingBot = document.getElementById("trackingBot");
  const openTrackingHelp = document.getElementById("openTrackingHelp");
  const closeTrackingBot = document.getElementById("closeTrackingBot");
  const chatOptions = document.querySelectorAll(".chat-option");

  const queryParams = new URLSearchParams(window.location.search);
  const codeFromUrl = queryParams.get("codigo");

  const demoCase = {
    codigoCaso: "CL-RC-000123",
    tipo: "Reclamo",
    estado: "En atención",
    servicio: "Internet hogar",
    prioridad: "Alta",
    fechaRegistro: "2026-05-19",
    plazoEstimado: "24 horas",
    avance: 60,
    resumen: "El caso fue registrado correctamente y se encuentra en revisión por el equipo de atención.",
    historial: [
      {
        titulo: "Caso registrado",
        descripcion: "Se recibió la solicitud del cliente mediante la WebApp.",
        fecha: "2026-05-19 09:20",
        icono: "fa-solid fa-file-circle-plus"
      },
      {
        titulo: "Clasificación inicial",
        descripcion: "El sistema clasificó el caso como reclamo de servicio.",
        fecha: "2026-05-19 09:35",
        icono: "fa-solid fa-tags"
      },
      {
        titulo: "En atención",
        descripcion: "Un asesor revisa la información registrada.",
        fecha: "2026-05-19 10:10",
        icono: "fa-solid fa-user-check"
      }
    ]
  };

  if (codeFromUrl) {
    trackingCode.value = codeFromUrl;
  }

  quickTrackingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
      codigoCaso: trackingCode.value.trim(),
      documento: trackingDocument.value.trim(),
      correo: trackingEmail.value.trim()
    };

    if (!data.codigoCaso && (!data.documento || !data.correo)) {
      showTrackingToast(
        "Ingresa tu código de caso o completa documento y correo.",
        "error"
      );
      return;
    }

    await searchCase(data);
  });

  async function searchCase(data) {
    let result = null;

    try {
      if (typeof consultarCasoRapido !== "function") {
        throw new Error("consultarCasoRapido no está disponible en api.js.");
      }

      const response = await consultarCasoRapido(data);

      result = response.caso || response.data || null;

      if (!result) {
        showEmptyResult();
        return;
      }
    } catch (error) {
      console.warn("Consulta demo temporal:", error.message);

      if (
        data.codigoCaso ||
        data.documento ||
        data.correo
      ) {
        result = {
          ...demoCase,
          codigoCaso: data.codigoCaso || demoCase.codigoCaso
        };
      }
    }

    renderCaseResult(result);
  }

  function renderCaseResult(item) {
    trackingEmptySection.classList.add("hidden");
    trackingResultSection.classList.remove("hidden");

    resultCaseType.textContent = item.tipo || "Caso";
    resultCaseCode.textContent = item.codigoCaso || item.codigo || "Sin código";
    resultCaseStatus.textContent = item.estado || "En revisión";
    resultCaseSummary.textContent = item.resumen || "Caso registrado en el sistema.";

    resultService.textContent = item.servicio || "No especificado";
    resultPriority.textContent = item.prioridad || "Media";
    resultCreatedAt.textContent = item.fechaRegistro || item.createdAt || "Sin fecha";
    resultEstimatedTime.textContent = item.plazoEstimado || item.sla || "Por definir";

    const progress = Number(item.avance || item.progreso || 0);

    resultProgressText.textContent = `${progress}%`;
    resultProgressBar.style.width = `${Math.min(progress, 100)}%`;

    uploadEvidenceLink.href = `../cliente/subir-evidencia.html?codigo=${encodeURIComponent(item.codigoCaso || "")}`;
    historyLink.href = `../cliente/historial-caso.html?codigo=${encodeURIComponent(item.codigoCaso || "")}`;

    renderTimeline(item.historial || []);

    trackingResultSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    showTrackingToast("Caso encontrado correctamente.");
  }

  function renderTimeline(items) {
    trackingTimeline.innerHTML = "";

    if (!items.length) {
      trackingTimeline.innerHTML = `
        <div class="public-timeline-content">
          <strong>Sin movimientos recientes</strong>
          <p>Cuando el backend esté conectado, aquí aparecerá el historial real del caso.</p>
        </div>
      `;
      return;
    }

    items.forEach((item) => {
      const timelineItem = document.createElement("article");
      timelineItem.className = "public-timeline-item";

      timelineItem.innerHTML = `
        <div class="public-timeline-dot">
          <i class="${item.icono || "fa-solid fa-circle-check"}"></i>
        </div>

        <div class="public-timeline-content">
          <strong>${item.titulo}</strong>
          <p>${item.descripcion}</p>
          <span>${item.fecha}</span>
        </div>
      `;

      trackingTimeline.appendChild(timelineItem);
    });
  }

  function showEmptyResult() {
    trackingResultSection.classList.add("hidden");
    trackingEmptySection.classList.remove("hidden");

    trackingEmptySection.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  if (retryTracking) {
    retryTracking.addEventListener("click", () => {
      trackingEmptySection.classList.add("hidden");
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  function openBot() {
    trackingBot.classList.add("active");
  }

  function closeBot() {
    trackingBot.classList.remove("active");
  }

  openTrackingHelp.addEventListener("click", openBot);
  closeTrackingBot.addEventListener("click", closeBot);

  chatOptions.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      if (action === "codigo") {
        showTrackingToast("Puedes consultar con documento y correo si no tienes el código.");
      }

      if (action === "estado") {
        showTrackingToast("“En atención” significa que un asesor está revisando tu caso.");
      }

      if (action === "evidencia") {
        window.location.href = "../cliente/subir-evidencia.html";
      }
    });
  });

  function showTrackingToast(message, type = "success") {
    const existingToast = document.querySelector(".tracking-toast");

    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "tracking-toast";
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
      zIndex: "9999",
      fontWeight: "800"
    });

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  if (codeFromUrl) {
    quickTrackingForm.dispatchEvent(new Event("submit"));
  }
});
