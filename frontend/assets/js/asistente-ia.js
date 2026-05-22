document.addEventListener("DOMContentLoaded", () => {
  const assistantForm = document.getElementById("assistantForm");
  const caseType = document.getElementById("caseType");
  const impactLevel = document.getElementById("impactLevel");
  const serviceRelated = document.getElementById("serviceRelated");
  const caseDescription = document.getElementById("caseDescription");
  const improveAssistantText = document.getElementById("improveAssistantText");
  const resetAssistant = document.getElementById("resetAssistant");
  const quickOptions = document.querySelectorAll(".quick-ai-option");
  const heroAssistantMessage = document.getElementById("heroAssistantMessage");

  const resultTitle = document.getElementById("resultTitle");
  const resultDescription = document.getElementById("resultDescription");
  const resultPriority = document.getElementById("resultPriority");
  const resultSla = document.getElementById("resultSla");
  const resultSteps = document.getElementById("resultSteps");
  const resultAction = document.getElementById("resultAction");

  const presets = {
    internet: {
      type: "internet",
      impact: "alto",
      service: "internet hogar",
      text: "No tengo internet desde hace varias horas. Reinicie el router, revise los cables y el problema continua."
    },
    recibo: {
      type: "recibo",
      impact: "medio",
      service: "telefonia movil",
      text: "Tengo un cobro en mi recibo que no reconozco y necesito que revisen el detalle de facturacion."
    },
    seguimiento: {
      type: "seguimiento",
      impact: "bajo",
      service: "internet hogar",
      text: "Ya registre un caso y quiero conocer el estado actual, responsable y fecha estimada de respuesta."
    }
  };

  quickOptions.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = presets[button.dataset.type];
      if (!selected) return;

      caseType.value = selected.type;
      impactLevel.value = selected.impact;
      serviceRelated.value = selected.service;
      caseDescription.value = selected.text;

      heroAssistantMessage.textContent = "Perfecto. Complete la informacion y presione Analizar caso.";
      document.getElementById("diagnostico").scrollIntoView({ behavior: "smooth" });
    });
  });

  if (improveAssistantText) {
    improveAssistantText.addEventListener("click", () => {
      const currentText = caseDescription.value.trim();

      if (!currentText) {
        showAssistantToast("Escribe una descripcion antes de mejorarla.", "error");
        return;
      }

      caseDescription.value =
        `Solicito orientacion sobre mi caso porque ${currentText}. ` +
        "El inconveniente afecta el uso normal del servicio y necesito confirmar la ruta correcta de atencion, prioridad y evidencias recomendadas.";

      showAssistantToast("Descripcion mejorada para el diagnostico.");
    });
  }

  assistantForm.addEventListener("submit", (event) => {
    event.preventDefault();
    analyzeCase();
  });

  resetAssistant.addEventListener("click", () => {
    assistantForm.reset();
    resultTitle.textContent = "Esperando informacion";
    resultDescription.textContent =
      "Completa el formulario y el asistente te indicara la accion mas conveniente para continuar.";
    resultPriority.textContent = "-";
    resultSla.textContent = "-";
    resultSteps.innerHTML = "<strong>Siguientes pasos</strong><p>El resultado aparecera aqui luego del analisis.</p>";
    resultAction.href = "../cliente/registrar-reclamo.html";
    resultAction.textContent = "Registrar reclamo";
    heroAssistantMessage.textContent = "Hola, selecciona una situacion frecuente o describe tu problema.";
  });

  function analyzeCase() {
    const type = caseType.value;
    const impact = impactLevel.value;
    const service = serviceRelated.value;
    const description = caseDescription.value.trim();

    if (!type || !impact || !service || !description) {
      showAssistantToast("Completa todos los campos para analizar el caso.", "error");
      return;
    }

    const diagnosis = getDiagnosis(type, impact, service);

    resultTitle.textContent = diagnosis.title;
    resultDescription.textContent = diagnosis.description;
    resultPriority.textContent = diagnosis.priority;
    resultSla.textContent = diagnosis.sla;
    resultAction.href = diagnosis.href;
    resultAction.innerHTML = `${diagnosis.action} <i class="fa-solid fa-arrow-right"></i>`;

    resultSteps.innerHTML = `
      <strong>Siguientes pasos</strong>
      <ul>
        ${diagnosis.steps.map((step) => `<li>${step}</li>`).join("")}
      </ul>
    `;

    heroAssistantMessage.textContent = `Ruta sugerida: ${diagnosis.action}.`;
    showAssistantToast("Diagnostico generado.");
  }

  function getDiagnosis(type, impact, service) {
    const priorityByImpact = {
      bajo: "Baja",
      medio: "Media",
      alto: "Alta",
      critico: "Critica"
    };

    const slaByImpact = {
      bajo: "72 h",
      medio: "48 h",
      alto: "24 h",
      critico: "12 h"
    };

    const base = {
      priority: priorityByImpact[impact] || "Media",
      sla: slaByImpact[impact] || "48 h"
    };

    if (type === "internet" || type === "movil") {
      return {
        ...base,
        title: "Reportar incidencia tecnica",
        description: `El problema parece afectar el servicio de ${service}. Conviene registrarlo como incidencia para que sea revisado por soporte tecnico.`,
        action: "Reportar incidencia",
        href: "../cliente/reportar-incidencia.html",
        steps: [
          "Indica desde cuando ocurre la falla.",
          "Adjunta capturas, fotos del equipo o pruebas de velocidad.",
          "Mantente atento al codigo de seguimiento."
        ]
      };
    }

    if (type === "recibo" || type === "atencion") {
      return {
        ...base,
        title: "Registrar reclamo",
        description: "La situacion corresponde a una disconformidad comercial o de atencion. La mejor ruta es registrar un reclamo formal.",
        action: "Registrar reclamo",
        href: "../cliente/registrar-reclamo.html",
        steps: [
          "Incluye el periodo, monto o canal de atencion relacionado.",
          "Adjunta recibos, capturas o documentos de soporte.",
          "Guarda el codigo generado para consultar el avance."
        ]
      };
    }

    if (type === "seguimiento") {
      return {
        ...base,
        priority: "Consulta",
        sla: "Inmediato",
        title: "Consultar seguimiento",
        description: "Ya existe un caso registrado. Lo mas util es consultar el estado actual con el codigo de seguimiento.",
        action: "Consultar caso",
        href: "consulta-rapida.html",
        steps: [
          "Ten a la mano el codigo del caso.",
          "Verifica el estado y la fecha estimada.",
          "Si falta informacion, adjunta evidencia adicional."
        ]
      };
    }

    return {
      ...base,
      title: "Adjuntar evidencia",
      description: "La informacion indicada puede fortalecer un caso existente. Adjunta evidencia al codigo correspondiente.",
      action: "Subir evidencia",
      href: "../cliente/subir-evidencia.html",
      steps: [
        "Confirma el codigo del caso.",
        "Carga archivos claros y relacionados.",
        "Describe que demuestra cada evidencia."
      ]
    };
  }

  function showAssistantToast(message, type = "success") {
    const existingToast = document.querySelector(".assistant-toast");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "assistant-toast";
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
