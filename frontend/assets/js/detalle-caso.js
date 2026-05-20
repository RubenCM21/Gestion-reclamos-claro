document.addEventListener("DOMContentLoaded", () => {
  const copyCaseCode = document.getElementById("copyCaseCode");
  const expandTimeline = document.getElementById("expandTimeline");
  const timelineToggles = document.querySelectorAll(".timeline-toggle");
  const timelineItems = document.querySelectorAll(".detail-timeline-item");

  const generateAiSummary = document.getElementById("generateAiSummary");
  const aiCaseSummary = document.getElementById("aiCaseSummary");

  const downloadProof = document.getElementById("downloadProof");
  const requestReview = document.getElementById("requestReview");
  const rateAttention = document.getElementById("rateAttention");

  const ratingModal = document.getElementById("ratingModal");
  const closeRatingModal = document.getElementById("closeRatingModal");

  const detailBot = document.getElementById("detailBot");
  const openDetailBot = document.getElementById("openDetailBot");
  const openDetailHelp = document.getElementById("openDetailHelp");
  const closeDetailBot = document.getElementById("closeDetailBot");

  if (copyCaseCode) {
    copyCaseCode.addEventListener("click", async () => {
      const code = "CL-RC-000123";

      try {
        await navigator.clipboard.writeText(code);
        showDetailToast("Código copiado al portapapeles.");
      } catch {
        showDetailToast("No se pudo copiar el código.", "error");
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

  if (expandTimeline) {
    expandTimeline.addEventListener("click", () => {
      const shouldExpand = expandTimeline.textContent.trim() === "Expandir todo";

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

      expandTimeline.textContent = shouldExpand ? "Contraer todo" : "Expandir todo";
    });
  }

  if (generateAiSummary) {
    generateAiSummary.addEventListener("click", () => {
      aiCaseSummary.innerHTML = `
        <strong>Resumen generado:</strong><br>
        El caso CL-RC-000123 se encuentra en atención por el área responsable.
        La información registrada es suficiente para continuar la evaluación.
        Por el momento, no se requiere una acción adicional del cliente.
      `;

      showDetailToast("Resumen IA actualizado correctamente.");
    });
  }

  if (downloadProof) {
    downloadProof.addEventListener("click", () => {
      showDetailToast("Descarga simulada de constancia generada.");
    });
  }

  if (requestReview) {
    requestReview.addEventListener("click", () => {
      showDetailToast("Solicitud de revisión registrada de forma simulada.");
    });
  }

  if (rateAttention) {
    rateAttention.addEventListener("click", () => {
      ratingModal.classList.add("active");
    });
  }

  if (closeRatingModal) {
    closeRatingModal.addEventListener("click", () => {
      ratingModal.classList.remove("active");
    });
  }

  if (ratingModal) {
    ratingModal.addEventListener("click", (event) => {
      if (event.target === ratingModal) {
        ratingModal.classList.remove("active");
      }
    });
  }

  function toggleDetailBot() {
    detailBot.classList.toggle("active");
  }

  if (openDetailBot) {
    openDetailBot.addEventListener("click", toggleDetailBot);
  }

  if (openDetailHelp) {
    openDetailHelp.addEventListener("click", toggleDetailBot);
  }

  if (closeDetailBot) {
    closeDetailBot.addEventListener("click", () => {
      detailBot.classList.remove("active");
    });
  }

  function showDetailToast(message, type = "success") {
    const existingToast = document.querySelector(".detail-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "detail-toast";
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
});