document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".case-filter");
  const caseRows = document.querySelectorAll(".case-row");

  const openClientBot = document.getElementById("openClientBot");
  const openHelpClient = document.getElementById("openHelpClient");
  const closeClientBot = document.getElementById("closeClientBot");
  const clientBot = document.getElementById("clientBot");

  const miniSimulator = document.getElementById("miniSimulator");
  const simCaseType = document.getElementById("simCaseType");
  const simPriority = document.getElementById("simPriority");
  const simulatorResult = document.getElementById("simulatorResult");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const selectedFilter = button.dataset.filter;

      caseRows.forEach((row) => {
        const rowStatus = row.dataset.status;

        if (selectedFilter === "all" || selectedFilter === rowStatus) {
          row.classList.remove("hidden");
        } else {
          row.classList.add("hidden");
        }
      });
    });
  });

  function toggleClientBot() {
    if (!clientBot) return;
    clientBot.classList.toggle("active");
  }

  if (openClientBot) {
    openClientBot.addEventListener("click", toggleClientBot);
  }

  if (openHelpClient) {
    openHelpClient.addEventListener("click", toggleClientBot);
  }

  if (closeClientBot) {
    closeClientBot.addEventListener("click", () => {
      clientBot.classList.remove("active");
    });
  }

  if (miniSimulator) {
    miniSimulator.addEventListener("submit", (event) => {
      event.preventDefault();

      const caseType = simCaseType.value;
      const priority = simPriority.value;

      if (!caseType || !priority) {
        simulatorResult.textContent = "Selecciona el tipo de caso y prioridad para estimar el plazo.";
        simulatorResult.style.background = "#fff4df";
        simulatorResult.style.color = "#9a5b00";
        return;
      }

      const estimatedHours = calculateEstimatedHours(caseType, priority);

      simulatorResult.innerHTML = `
        <strong>Plazo estimado:</strong> ${estimatedHours} horas hábiles.<br>
        Te recomendamos adjuntar evidencias claras para evitar observaciones.
      `;

      simulatorResult.style.background = "#e8f8ef";
      simulatorResult.style.color = "#14844a";
    });
  }

  function calculateEstimatedHours(caseType, priority) {
    const matrix = {
      reclamo: {
        baja: 72,
        media: 48,
        alta: 24,
        critica: 12
      },
      incidencia: {
        baja: 48,
        media: 24,
        alta: 12,
        critica: 6
      }
    };

    return matrix[caseType][priority];
  }
});