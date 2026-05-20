document.addEventListener("DOMContentLoaded", () => {
  /*
    Estándar aplicado:
    - Primero consume api.js.
    - Si el backend todavía no existe, usa demo temporal.
    - Si el backend respeta el contrato, no se modifica esta pantalla.
  */

  const catalogRows = document.getElementById("catalogRows");
  const emptyCatalogs = document.getElementById("emptyCatalogs");

  const catalogSearch = document.getElementById("catalogSearch");
  const filterCatalogType = document.getElementById("filterCatalogType");
  const filterCatalogStatus = document.getElementById("filterCatalogStatus");
  const filterCatalogUsage = document.getElementById("filterCatalogUsage");

  const metricTotalCatalogs = document.getElementById("metricTotalCatalogs");
  const metricActiveCatalogs = document.getElementById("metricActiveCatalogs");
  const metricInactiveCatalogs = document.getElementById("metricInactiveCatalogs");
  const metricReviewCatalogs = document.getElementById("metricReviewCatalogs");
  const sidebarCatalogsCount = document.getElementById("sidebarCatalogsCount");

  const catalogAiTip = document.getElementById("catalogAiTip");
  const catalogSummaryBox = document.getElementById("catalogSummaryBox");

  const clearCatalogFilters = document.getElementById("clearCatalogFilters");
  const refreshCatalogs = document.getElementById("refreshCatalogs");
  const exportCatalogs = document.getElementById("exportCatalogs");
  const analyzeCatalogsAi = document.getElementById("analyzeCatalogsAi");
  const generateCatalogSummary = document.getElementById("generateCatalogSummary");

  const catalogModal = document.getElementById("catalogModal");
  const openCreateCatalogModal = document.getElementById("openCreateCatalogModal");
  const openCreateCatalogModalHero = document.getElementById("openCreateCatalogModalHero");
  const closeCatalogModal = document.getElementById("closeCatalogModal");
  const cancelCatalogForm = document.getElementById("cancelCatalogForm");
  const catalogForm = document.getElementById("catalogForm");

  const catalogModalTitle = document.getElementById("catalogModalTitle");
  const catalogId = document.getElementById("catalogId");
  const catalogCode = document.getElementById("catalogCode");
  const catalogName = document.getElementById("catalogName");
  const catalogType = document.getElementById("catalogType");
  const catalogUsage = document.getElementById("catalogUsage");
  const catalogOrder = document.getElementById("catalogOrder");
  const catalogStatus = document.getElementById("catalogStatus");
  const catalogDescription = document.getElementById("catalogDescription");
  const catalogObservation = document.getElementById("catalogObservation");

  const catalogDetailModal = document.getElementById("catalogDetailModal");
  const closeCatalogDetailModal = document.getElementById("closeCatalogDetailModal");
  const catalogDetailTitle = document.getElementById("catalogDetailTitle");
  const catalogDetailSubtitle = document.getElementById("catalogDetailSubtitle");
  const catalogDetailContent = document.getElementById("catalogDetailContent");

  const catalogBot = document.getElementById("catalogBot");
  const openCatalogBot = document.getElementById("openCatalogBot");
  const openCatalogHelp = document.getElementById("openCatalogHelp");
  const closeCatalogBot = document.getElementById("closeCatalogBot");

  let catalogs = [];

  const demoCatalogs = [
    {
      id: 1,
      codigo: "SRV-INTERNET-HOGAR",
      nombre: "Internet hogar",
      tipo: "Servicio",
      uso: "Formulario cliente",
      orden: 1,
      estado: "Activo",
      descripcion: "Servicio de internet fijo para hogares.",
      requiereRevision: false
    },
    {
      id: 2,
      codigo: "SRV-MOVIL",
      nombre: "Telefonía móvil",
      tipo: "Servicio",
      uso: "Formulario cliente",
      orden: 2,
      estado: "Activo",
      descripcion: "Servicio de línea móvil.",
      requiereRevision: false
    },
    {
      id: 3,
      codigo: "TIP-RECLAMO",
      nombre: "Reclamo",
      tipo: "Tipo de caso",
      uso: "Clasificación",
      orden: 1,
      estado: "Activo",
      descripcion: "Caso asociado a disconformidad del cliente.",
      requiereRevision: false
    },
    {
      id: 4,
      codigo: "TIP-INCIDENCIA",
      nombre: "Incidencia",
      tipo: "Tipo de caso",
      uso: "Clasificación",
      orden: 2,
      estado: "Activo",
      descripcion: "Caso asociado a falla o interrupción de servicio.",
      requiereRevision: false
    },
    {
      id: 5,
      codigo: "PRI-CRITICA",
      nombre: "Crítica",
      tipo: "Prioridad",
      uso: "SLA",
      orden: 1,
      estado: "Activo",
      descripcion: "Atención inmediata por alto impacto.",
      requiereRevision: true
    },
    {
      id: 6,
      codigo: "EST-ESCALADO",
      nombre: "Escalado",
      tipo: "Estado de caso",
      uso: "Asignación",
      orden: 4,
      estado: "Activo",
      descripcion: "Caso derivado a área especializada.",
      requiereRevision: false
    },
    {
      id: 7,
      codigo: "CAN-WEBAPP",
      nombre: "WebApp",
      tipo: "Canal",
      uso: "Reportes",
      orden: 1,
      estado: "Activo",
      descripcion: "Canal digital de registro de casos.",
      requiereRevision: false
    }
  ];

  async function initCatalogs() {
    try {
      /*
        Contrato esperado:
        GET /api/admin/catalogos

        Respuesta:
        {
          "success": true,
          "catalogos": [
            {
              "id": 1,
              "codigo": "SRV-INTERNET-HOGAR",
              "nombre": "Internet hogar",
              "tipo": "Servicio",
              "uso": "Formulario cliente",
              "orden": 1,
              "estado": "Activo",
              "descripcion": "Servicio de internet fijo.",
              "requiereRevision": false
            }
          ]
        }
      */

      if (typeof getCatalogos !== "function") {
        throw new Error("api.js no disponible.");
      }

      const response = await getCatalogos();
      catalogs = response.catalogos || response.data || [];

      if (!Array.isArray(catalogs)) {
        throw new Error("El backend no devolvió una lista válida de catálogos.");
      }

      if (catalogs.length === 0) {
        throw new Error("No hay catálogos registrados en backend.");
      }
    } catch (error) {
      console.warn("Backend no disponible. Usando catálogos demo temporales:", error.message);
      catalogs = demoCatalogs;
    }

    renderCatalogs();
    updateCatalogMetrics();
  }

  function renderCatalogs() {
    const filtered = getFilteredCatalogs();

    catalogRows.innerHTML = "";

    filtered.forEach((item) => {
      const row = document.createElement("div");
      row.className = "catalog-row";

      row.innerHTML = `
        <span class="case-code">${item.codigo}</span>
        <span>${item.nombre}</span>
        <span>${item.tipo}</span>
        <span>${item.uso}</span>
        <span>${item.orden}</span>
        <span class="catalog-status-pill ${getCatalogStatusClass(item.estado)}">${item.estado}</span>

        <div class="catalog-actions">
          <button class="view-catalog" data-id="${item.id}">Ver</button>
          <button class="ghost edit-catalog" data-id="${item.id}">Editar</button>
          <button class="ghost toggle-catalog" data-id="${item.id}">
            ${item.estado === "Activo" ? "Desactivar" : "Activar"}
          </button>
        </div>
      `;

      catalogRows.appendChild(row);
    });

    emptyCatalogs.classList.toggle("hidden", filtered.length > 0);
    attachCatalogEvents();
  }

  function getFilteredCatalogs() {
    const search = catalogSearch.value.trim().toLowerCase();
    const type = filterCatalogType.value;
    const status = filterCatalogStatus.value;
    const usage = filterCatalogUsage.value;

    return catalogs.filter((item) => {
      const matchesSearch =
        !search ||
        String(item.codigo || "").toLowerCase().includes(search) ||
        String(item.nombre || "").toLowerCase().includes(search) ||
        String(item.descripcion || "").toLowerCase().includes(search) ||
        String(item.tipo || "").toLowerCase().includes(search);

      const matchesType = type === "all" || item.tipo === type;
      const matchesStatus = status === "all" || item.estado === status;
      const matchesUsage = usage === "all" || item.uso === usage;

      return matchesSearch && matchesType && matchesStatus && matchesUsage;
    });
  }

  function attachCatalogEvents() {
    document.querySelectorAll(".view-catalog").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const selected = catalogs.find((item) => Number(item.id) === id);

        if (selected) {
          openCatalogDetail(selected);
        }
      });
    });

    document.querySelectorAll(".edit-catalog").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const selected = catalogs.find((item) => Number(item.id) === id);

        if (selected) {
          openCatalogForm(selected);
        }
      });
    });

    document.querySelectorAll(".toggle-catalog").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.dataset.id);
        const selected = catalogs.find((item) => Number(item.id) === id);

        if (selected) {
          await toggleCatalogStatus(selected);
        }
      });
    });
  }

  function openCatalogDetail(item) {
    catalogDetailTitle.textContent = item.nombre;
    catalogDetailSubtitle.textContent = `${item.tipo} · ${item.uso}`;

    const rows = [
      ["ID", item.id],
      ["Código", item.codigo],
      ["Nombre", item.nombre],
      ["Tipo", item.tipo],
      ["Uso", item.uso],
      ["Orden", item.orden],
      ["Estado", item.estado],
      ["Descripción", item.descripcion || "No registrada"],
      ["Requiere revisión", item.requiereRevision ? "Sí" : "No"]
    ];

    catalogDetailContent.innerHTML = rows
      .map(
        ([label, value]) => `
          <div class="preview-row">
            <strong>${label}</strong>
            <span>${value}</span>
          </div>
        `
      )
      .join("");

    catalogDetailModal.classList.add("active");
  }

  function openCatalogForm(item = null) {
    catalogForm.reset();

    if (item) {
      catalogModalTitle.textContent = "Editar registro de catálogo";
      catalogId.value = item.id;
      catalogCode.value = item.codigo;
      catalogName.value = item.nombre;
      catalogType.value = item.tipo;
      catalogUsage.value = item.uso;
      catalogOrder.value = item.orden;
      catalogStatus.value = item.estado;
      catalogDescription.value = item.descripcion || "";
      catalogObservation.value = "";
    } else {
      catalogModalTitle.textContent = "Nuevo registro de catálogo";
      catalogId.value = "";
      catalogStatus.value = "Activo";
      catalogOrder.value = getNextOrder();
    }

    catalogModal.classList.add("active");
  }

  function getNextOrder() {
    if (!catalogs.length) return 1;
    return Math.max(...catalogs.map((item) => Number(item.orden) || 0)) + 1;
  }

  async function saveCatalog() {
    const data = {
      id: catalogId.value ? Number(catalogId.value) : null,
      codigo: catalogCode.value.trim(),
      nombre: catalogName.value.trim(),
      tipo: catalogType.value,
      uso: catalogUsage.value,
      orden: Number(catalogOrder.value),
      estado: catalogStatus.value,
      descripcion: catalogDescription.value.trim(),
      observacion: catalogObservation.value.trim(),
      requiereRevision: false
    };

    try {
      if (!data.id && typeof createCatalogo === "function") {
        const response = await createCatalogo(data);
        const createdCatalog = response.catalogo || response.data || data;

        catalogs.push({
          ...createdCatalog,
          id: createdCatalog.id || Date.now()
        });
      } else if (data.id && typeof updateCatalogo === "function") {
        const response = await updateCatalogo(data.id, data);
        const updatedCatalog = response.catalogo || response.data || data;

        catalogs = catalogs.map((item) =>
          Number(item.id) === Number(data.id)
            ? { ...item, ...updatedCatalog }
            : item
        );
      } else {
        throw new Error("Endpoint de guardado de catálogo no disponible todavía.");
      }
    } catch (error) {
      console.warn("Guardado simulado de catálogo:", error.message);

      if (data.id) {
        catalogs = catalogs.map((item) =>
          Number(item.id) === Number(data.id)
            ? { ...item, ...data }
            : item
        );
      } else {
        catalogs.push({
          ...data,
          id: Date.now()
        });
      }
    }

    catalogModal.classList.remove("active");
    renderCatalogs();
    updateCatalogMetrics();
    showCatalogToast("Registro de catálogo guardado correctamente.");
  }

  async function toggleCatalogStatus(item) {
    const newStatus = item.estado === "Activo" ? "Inactivo" : "Activo";

    try {
      if (typeof updateCatalogo === "function") {
        await updateCatalogo(item.id, { estado: newStatus });
      } else {
        throw new Error("updateCatalogo no disponible en api.js.");
      }
    } catch (error) {
      console.warn("Cambio de estado simulado:", error.message);
    }

    item.estado = newStatus;
    renderCatalogs();
    updateCatalogMetrics();
    showCatalogToast(`Registro ${newStatus.toLowerCase()} correctamente.`);
  }

  function updateCatalogMetrics() {
    const total = catalogs.length;
    const active = catalogs.filter((item) => item.estado === "Activo").length;
    const inactive = catalogs.filter((item) => item.estado === "Inactivo").length;
    const review = catalogs.filter((item) => item.requiereRevision).length;

    metricTotalCatalogs.textContent = total;
    metricActiveCatalogs.textContent = active;
    metricInactiveCatalogs.textContent = inactive;
    metricReviewCatalogs.textContent = review;
    sidebarCatalogsCount.textContent = total;

    catalogAiTip.textContent =
      `Se registran ${total} valores de catálogo: ${active} activos, ${inactive} inactivos y ${review} requieren revisión.`;
  }

  function getCatalogStatusClass(status) {
    return status === "Activo" ? "catalog-status-active" : "catalog-status-inactive";
  }

  [catalogSearch, filterCatalogType, filterCatalogStatus, filterCatalogUsage].forEach((field) => {
    field.addEventListener("input", renderCatalogs);
    field.addEventListener("change", renderCatalogs);
  });

  clearCatalogFilters.addEventListener("click", () => {
    catalogSearch.value = "";
    filterCatalogType.value = "all";
    filterCatalogStatus.value = "all";
    filterCatalogUsage.value = "all";

    renderCatalogs();
    showCatalogToast("Filtros limpiados.");
  });

  refreshCatalogs.addEventListener("click", () => {
    initCatalogs();
    showCatalogToast("Catálogos actualizados.");
  });

  exportCatalogs.addEventListener("click", () => {
    showCatalogToast("Exportación de catálogos generada de forma simulada.");
  });

  analyzeCatalogsAi.addEventListener("click", () => {
    const inactive = catalogs.filter((item) => item.estado === "Inactivo").length;
    const review = catalogs.filter((item) => item.requiereRevision).length;

    catalogAiTip.textContent =
      `IA: revisar ${inactive} registro(s) inactivo(s), ${review} con alerta y posibles duplicados por tipo/nombre.`;

    showCatalogToast("Análisis IA de catálogos generado.");
  });

  generateCatalogSummary.addEventListener("click", () => {
    const byType = catalogs.reduce((acc, item) => {
      acc[item.tipo] = (acc[item.tipo] || 0) + 1;
      return acc;
    }, {});

    const summary = Object.entries(byType)
      .map(([type, count]) => `${type}: ${count}`)
      .join(", ");

    catalogSummaryBox.innerHTML = `
      <strong>Análisis generado:</strong><br>
      Catálogos registrados por tipo: ${summary || "sin información"}.
      Se recomienda validar duplicados, registros inactivos y valores críticos de prioridad/SLA.
    `;

    showCatalogToast("Resumen IA generado.");
  });

  openCreateCatalogModal.addEventListener("click", () => openCatalogForm());
  openCreateCatalogModalHero.addEventListener("click", () => openCatalogForm());

  closeCatalogModal.addEventListener("click", () => catalogModal.classList.remove("active"));
  cancelCatalogForm.addEventListener("click", () => catalogModal.classList.remove("active"));

  catalogModal.addEventListener("click", (event) => {
    if (event.target === catalogModal) {
      catalogModal.classList.remove("active");
    }
  });

  catalogForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveCatalog();
  });

  closeCatalogDetailModal.addEventListener("click", () => {
    catalogDetailModal.classList.remove("active");
  });

  catalogDetailModal.addEventListener("click", (event) => {
    if (event.target === catalogDetailModal) {
      catalogDetailModal.classList.remove("active");
    }
  });

  function toggleCatalogBot() {
    catalogBot.classList.toggle("active");
  }

  openCatalogBot.addEventListener("click", toggleCatalogBot);
  openCatalogHelp.addEventListener("click", toggleCatalogBot);

  closeCatalogBot.addEventListener("click", () => {
    catalogBot.classList.remove("active");
  });

  function showCatalogToast(message, type = "success") {
    const existingToast = document.querySelector(".catalog-toast");

    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "catalog-toast";
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
      zIndex: "999",
      fontWeight: "800"
    });

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  initCatalogs();
});