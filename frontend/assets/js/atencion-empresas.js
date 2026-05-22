document.addEventListener("DOMContentLoaded", () => {
  const enterpriseNeed = document.getElementById("enterpriseNeed");
  const enterpriseSize = document.getElementById("enterpriseSize");
  const enterprisePriority = document.getElementById("enterprisePriority");
  const clearEnterpriseFilters = document.getElementById("clearEnterpriseFilters");
  const serviceCards = document.querySelectorAll(".enterprise-service-card");
  const emptyEnterpriseServices = document.getElementById("emptyEnterpriseServices");
  const openEnterpriseAssistant = document.getElementById("openEnterpriseAssistant");
  const calculateEnterpriseSla = document.getElementById("calculateEnterpriseSla");
  const slaService = document.getElementById("slaService");
  const slaImpact = document.getElementById("slaImpact");
  const enterpriseSlaResult = document.getElementById("enterpriseSlaResult");

  function applyEnterpriseFilters() {
    const need = enterpriseNeed.value;
    const size = enterpriseSize.value;
    const priority = enterprisePriority.value;
    let visible = 0;

    serviceCards.forEach((card) => {
      const matchesNeed = need === "all" || card.dataset.need === need;
      const matchesSize = size === "all" || card.dataset.size === size || card.dataset.size === "all";
      const matchesPriority = priority === "all" || card.dataset.priority === priority;
      const shouldShow = matchesNeed && matchesSize && matchesPriority;

      card.classList.toggle("hidden", !shouldShow);
      if (shouldShow) visible++;
    });

    emptyEnterpriseServices.classList.toggle("hidden", visible > 0);
  }

  [enterpriseNeed, enterpriseSize, enterprisePriority].forEach((select) => {
    select.addEventListener("change", applyEnterpriseFilters);
  });

  clearEnterpriseFilters.addEventListener("click", () => {
    enterpriseNeed.value = "all";
    enterpriseSize.value = "all";
    enterprisePriority.value = "all";
    applyEnterpriseFilters();
    showEnterpriseToast("Filtros limpiados.");
  });

  openEnterpriseAssistant.addEventListener("click", () => {
    document.getElementById("diagnostico").scrollIntoView({ behavior: "smooth" });
  });

  calculateEnterpriseSla.addEventListener("click", () => {
    const impact = slaImpact.value;
    const service = slaService.options[slaService.selectedIndex].text;

    const recommendation = {
      bajo: {
        priority: "Prioridad baja",
        sla: "72 horas hábiles",
        action: "Registrar solicitud y adjuntar detalle del usuario afectado."
      },
      medio: {
        priority: "Prioridad media",
        sla: "48 horas hábiles",
        action: "Reportar incidencia, indicar sede afectada y validar si existe intermitencia."
      },
      alto: {
        priority: "Prioridad alta",
        sla: "24 horas hábiles",
        action: "Escalar como afectación operativa y adjuntar evidencias de indisponibilidad."
      },
      critico: {
        priority: "Prioridad crítica",
        sla: "12 horas hábiles",
        action: "Activar soporte especializado, indicar impacto en ventas, seguridad o atención."
      }
    }[impact];

    enterpriseSlaResult.innerHTML = `
      <strong>${recommendation.priority}</strong>
      <span>${service}</span>
      <p>Plazo estimado: ${recommendation.sla}. ${recommendation.action}</p>
    `;

    showEnterpriseToast("Estimación generada.");
  });

  function showEnterpriseToast(message, type = "success") {
    const existingToast = document.querySelector(".enterprise-toast");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "enterprise-toast";
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
});
