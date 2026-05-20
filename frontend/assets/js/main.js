document.addEventListener("DOMContentLoaded", () => {
  const openSearch = document.getElementById("openSearch");
  const closeSearch = document.getElementById("closeSearch");
  const searchOverlay = document.getElementById("searchOverlay");

  const openChatbot = document.getElementById("openChatbot");
  const closeChatbot = document.getElementById("closeChatbot");
  const chatbot = document.getElementById("chatbot");
  const floatingHelp = document.getElementById("floatingHelp");

  const quickForm = document.getElementById("quickForm");
  const caseCode = document.getElementById("caseCode");
  const serviceType = document.getElementById("serviceType");
  const actionType = document.getElementById("actionType");

  const segmentButtons = document.querySelectorAll(".segment-btn");
  const chatOptions = document.querySelectorAll(".chat-option");
  const chips = document.querySelectorAll(".chips button");
  const trendTags = document.querySelectorAll(".trend-tags span");
  const smartCards = document.querySelectorAll(".smart-card");
  const ratingTab = document.getElementById("ratingTab");

  const routes = {
    reclamo: "pages/cliente/registrar-reclamo.html",
    incidencia: "pages/cliente/reportar-incidencia.html",
    seguimiento: "public/consulta-rapida.html",
    evidencia: "pages/cliente/subir-evidencia.html",
    asesor: "public/centro-ayuda.html",
    empresas: "public/atencion-empresas.html",
    asistente: "public/asistente-ia.html",
    ayuda: "public/centro-ayuda.html",
    historial: "pages/cliente/historial-caso.html"
  };

  function openSearchOverlay() {
    if (searchOverlay) {
      searchOverlay.classList.add("active");
    }
  }

  function closeSearchOverlay() {
    if (searchOverlay) {
      searchOverlay.classList.remove("active");
    }
  }

  function toggleChatbot() {
    if (chatbot) {
      chatbot.classList.toggle("active");
    }
  }

  function openChatbotBox() {
    if (chatbot) {
      chatbot.classList.add("active");
    }
  }

  function closeChatbotBox() {
    if (chatbot) {
      chatbot.classList.remove("active");
    }
  }

  function showHomeToast(message, type = "success") {
    const existingToast = document.querySelector(".home-toast");

    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "home-toast";
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

  function goToRoute(url, params = {}) {
    const query = new URLSearchParams(params).toString();
    window.location.href = query ? `${url}?${query}` : url;
  }

  if (openSearch) {
    openSearch.addEventListener("click", openSearchOverlay);
  }

  if (closeSearch) {
    closeSearch.addEventListener("click", closeSearchOverlay);
  }

  if (searchOverlay) {
    searchOverlay.addEventListener("click", (event) => {
      if (event.target === searchOverlay) {
        closeSearchOverlay();
      }
    });
  }

  if (openChatbot) {
    openChatbot.addEventListener("click", openChatbotBox);
  }

  if (floatingHelp) {
    floatingHelp.addEventListener("click", openChatbotBox);
  }

  if (closeChatbot) {
    closeChatbot.addEventListener("click", closeChatbotBox);
  }

  segmentButtons.forEach((button) => {
    button.addEventListener("click", () => {
      segmentButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const segment = button.dataset.segment;

      if (segment === "empresas") {
        serviceType.value = "Servicios empresas";
        showHomeToast("Modo empresas seleccionado.");
      } else {
        serviceType.value = "";
        showHomeToast("Modo personas seleccionado.");
      }
    });
  });

  if (quickForm) {
    quickForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const selectedAction = actionType.value;
      const selectedService = serviceType.value;
      const code = caseCode.value.trim();

      if (!selectedAction) {
        showHomeToast("Selecciona una acción para continuar.", "error");
        return;
      }

      if (selectedAction === "Registrar reclamo") {
        goToRoute(routes.reclamo, {
          servicio: selectedService
        });
        return;
      }

      if (selectedAction === "Reportar incidencia") {
        goToRoute(routes.incidencia, {
          servicio: selectedService
        });
        return;
      }

      if (selectedAction === "Consultar seguimiento") {
        goToRoute(routes.seguimiento, {
          codigo: code
        });
        return;
      }

      if (selectedAction === "Subir evidencia") {
        goToRoute(routes.evidencia, {
          codigo: code
        });
        return;
      }

      if (selectedAction === "Hablar con asesor") {
        goToRoute(routes.ayuda, {
          canal: "asesor"
        });
      }
    });
  }

  chatOptions.forEach((button) => {
    button.addEventListener("click", () => {
      const text = button.textContent.trim().toLowerCase();

      if (text.includes("reclamo")) {
        goToRoute(routes.reclamo);
        return;
      }

      if (text.includes("falla")) {
        goToRoute(routes.incidencia);
        return;
      }

      if (text.includes("estado")) {
        goToRoute(routes.seguimiento);
      }
    });
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const text = chip.textContent.trim().toLowerCase();

      if (text.includes("internet")) {
        goToRoute(routes.incidencia, {
          motivo: "No tengo internet"
        });
        return;
      }

      if (text.includes("recibo")) {
        goToRoute(routes.reclamo, {
          motivo: "Problemas con mi recibo"
        });
        return;
      }

      if (text.includes("seguimiento")) {
        goToRoute(routes.seguimiento);
        return;
      }

      if (text.includes("asesor")) {
        goToRoute(routes.ayuda, {
          canal: "asesor"
        });
      }
    });
  });

  trendTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      const text = tag.textContent.trim().toLowerCase();

      if (text.includes("internet")) {
        goToRoute(routes.incidencia, {
          motivo: "No tengo internet"
        });
        return;
      }

      if (text.includes("recibo")) {
        goToRoute(routes.reclamo, {
          motivo: "Problemas con mi recibo"
        });
        return;
      }

      if (text.includes("consultar")) {
        goToRoute(routes.seguimiento);
        return;
      }

      goToRoute(routes.ayuda);
    });
  });

  smartCards.forEach((card) => {
    card.addEventListener("click", () => {
      const title = card.querySelector("h3")?.textContent.trim().toLowerCase();

      if (title.includes("chatbot")) {
        goToRoute(routes.asistente);
        return;
      }

      if (title.includes("simulador")) {
        goToRoute(routes.ayuda, {
          herramienta: "simulador-plazo"
        });
        return;
      }

      if (title.includes("diagnóstico")) {
        goToRoute(routes.asistente, {
          herramienta: "diagnostico"
        });
      }
    });
  });

  if (ratingTab) {
    ratingTab.addEventListener("click", () => {
      showHomeToast("Gracias. Próximamente se abrirá la encuesta de satisfacción.");
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSearchOverlay();
      closeChatbotBox();
    }
  });
});