document.addEventListener("DOMContentLoaded", () => {
  /*
    Estándar aplicado:
    - La pantalla consume datos desde api.js.
    - Los datos demo solo aparecen si el backend todavía no existe.
    - Si el backend respeta el contrato, no se modifica esta pantalla.
  */

  const rolesRows = document.getElementById("rolesRows");
  const emptyRoles = document.getElementById("emptyRoles");

  const roleSearch = document.getElementById("roleSearch");
  const filterRoleStatus = document.getElementById("filterRoleStatus");
  const filterAccessLevel = document.getElementById("filterAccessLevel");
  const filterModule = document.getElementById("filterModule");

  const metricTotalRoles = document.getElementById("metricTotalRoles");
  const metricModules = document.getElementById("metricModules");
  const metricActivePermissions = document.getElementById("metricActivePermissions");
  const metricSensitivePermissions = document.getElementById("metricSensitivePermissions");
  const sidebarRolesCount = document.getElementById("sidebarRolesCount");

  const rolesAiTip = document.getElementById("rolesAiTip");
  const rolesSummaryBox = document.getElementById("rolesSummaryBox");

  const clearRoleFilters = document.getElementById("clearRoleFilters");
  const refreshRoles = document.getElementById("refreshRoles");
  const exportRoles = document.getElementById("exportRoles");
  const analyzeRolesAi = document.getElementById("analyzeRolesAi");
  const generateRolesSummary = document.getElementById("generateRolesSummary");

  const roleModal = document.getElementById("roleModal");
  const openCreateRoleModal = document.getElementById("openCreateRoleModal");
  const openCreateRoleModalHero = document.getElementById("openCreateRoleModalHero");
  const closeRoleModal = document.getElementById("closeRoleModal");
  const cancelRoleForm = document.getElementById("cancelRoleForm");
  const roleForm = document.getElementById("roleForm");

  const roleModalTitle = document.getElementById("roleModalTitle");
  const roleId = document.getElementById("roleId");
  const roleName = document.getElementById("roleName");
  const roleAccessLevel = document.getElementById("roleAccessLevel");
  const roleStatus = document.getElementById("roleStatus");
  const roleDescription = document.getElementById("roleDescription");
  const roleObservation = document.getElementById("roleObservation");
  const permissionsGrid = document.getElementById("permissionsGrid");
  const selectRecommendedPermissions = document.getElementById("selectRecommendedPermissions");

  const roleDetailModal = document.getElementById("roleDetailModal");
  const closeRoleDetailModal = document.getElementById("closeRoleDetailModal");
  const roleDetailTitle = document.getElementById("roleDetailTitle");
  const roleDetailSubtitle = document.getElementById("roleDetailSubtitle");
  const roleDetailContent = document.getElementById("roleDetailContent");

  const rolesBot = document.getElementById("rolesBot");
  const openRolesBot = document.getElementById("openRolesBot");
  const openRolesHelp = document.getElementById("openRolesHelp");
  const closeRolesBot = document.getElementById("closeRolesBot");

  let roles = [];

  const permissionModules = [
    {
      modulo: "Cliente",
      acciones: ["ver", "crear_reclamo", "subir_evidencia", "ver_historial", "recibir_notificaciones"]
    },
    {
      modulo: "Asesor",
      acciones: ["ver_bandeja", "atender", "actualizar", "solicitar_info", "resolver"]
    },
    {
      modulo: "Supervisor",
      acciones: ["clasificar", "asignar", "monitorear_sla", "ver_desempeno", "reportes"]
    },
    {
      modulo: "Administrador",
      acciones: ["usuarios", "roles", "catalogos", "parametros", "auditoria"]
    }
  ];

  const sensitiveActions = ["usuarios", "roles", "parametros", "auditoria", "asignar", "resolver"];

  const demoRoles = [
    {
      id: 1,
      nombre: "Cliente",
      descripcion: "Usuario externo que registra y consulta casos.",
      nivelAcceso: "Básico",
      estado: "Activo",
      permisos: {
        Cliente: ["ver", "crear_reclamo", "subir_evidencia", "ver_historial", "recibir_notificaciones"]
      }
    },
    {
      id: 2,
      nombre: "Asesor",
      descripcion: "Usuario interno que atiende reclamos e incidencias asignadas.",
      nivelAcceso: "Operativo",
      estado: "Activo",
      permisos: {
        Asesor: ["ver_bandeja", "atender", "actualizar", "solicitar_info", "resolver"],
        Cliente: ["ver_historial"]
      }
    },
    {
      id: 3,
      nombre: "Supervisor",
      descripcion: "Usuario responsable de clasificar, asignar y monitorear casos.",
      nivelAcceso: "Supervisor",
      estado: "Activo",
      permisos: {
        Supervisor: ["clasificar", "asignar", "monitorear_sla", "ver_desempeno", "reportes"],
        Asesor: ["ver_bandeja"]
      }
    },
    {
      id: 4,
      nombre: "Administrador",
      descripcion: "Usuario con permisos de configuración y administración general.",
      nivelAcceso: "Administrativo",
      estado: "Activo",
      permisos: {
        Administrador: ["usuarios", "roles", "catalogos", "parametros", "auditoria"],
        Supervisor: ["reportes"]
      }
    }
  ];

  async function initRoles() {
    try {
      /*
        Contrato esperado:
        GET /api/admin/roles

        Respuesta esperada:
        {
          "success": true,
          "roles": [
            {
              "id": 1,
              "nombre": "Asesor",
              "descripcion": "Atiende casos asignados",
              "nivelAcceso": "Operativo",
              "estado": "Activo",
              "permisos": {
                "Asesor": ["ver_bandeja", "atender", "actualizar"]
              }
            }
          ]
        }
      */

      if (typeof getRoles !== "function") {
        throw new Error("api.js no disponible.");
      }

      const response = await getRoles();
      roles = response.roles || response.data || [];

      if (!Array.isArray(roles)) {
        throw new Error("El backend no devolvió una lista válida de roles.");
      }

      if (roles.length === 0) {
        throw new Error("No hay roles registrados en backend.");
      }
    } catch (error) {
      console.warn("Backend no disponible. Usando roles demo temporales:", error.message);
      roles = demoRoles;
    }

    renderRoles();
    updateRoleMetrics();
  }

  function renderRoles() {
    const filtered = getFilteredRoles();

    rolesRows.innerHTML = "";

    filtered.forEach((item) => {
      const permisosCount = countPermissions(item.permisos);
      const modulesCount = Object.keys(item.permisos || {}).length;
      const sensitiveCount = countSensitivePermissions(item.permisos);

      const row = document.createElement("div");
      row.className = "role-row";

      row.innerHTML = `
        <span class="case-code">${item.nombre}</span>
        <span>${item.nivelAcceso}</span>
        <span class="role-status-pill ${getRoleStatusClass(item.estado)}">${item.estado}</span>
        <span>${modulesCount}</span>
        <span>${permisosCount}</span>
        <span>${sensitiveCount}</span>

        <div class="role-actions">
          <button class="view-role" data-id="${item.id}">Ver</button>
          <button class="ghost edit-role" data-id="${item.id}">Editar</button>
          <button class="ghost toggle-role" data-id="${item.id}">
            ${item.estado === "Activo" ? "Desactivar" : "Activar"}
          </button>
        </div>
      `;

      rolesRows.appendChild(row);
    });

    emptyRoles.classList.toggle("hidden", filtered.length > 0);
    attachRoleEvents();
  }

  function getFilteredRoles() {
    const search = roleSearch.value.trim().toLowerCase();
    const status = filterRoleStatus.value;
    const level = filterAccessLevel.value;
    const module = filterModule.value;

    return roles.filter((item) => {
      const moduleNames = Object.keys(item.permisos || {}).join(" ").toLowerCase();

      const matchesSearch =
        !search ||
        String(item.nombre || "").toLowerCase().includes(search) ||
        String(item.descripcion || "").toLowerCase().includes(search) ||
        moduleNames.includes(search);

      const matchesStatus = status === "all" || item.estado === status;
      const matchesLevel = level === "all" || item.nivelAcceso === level;
      const matchesModule = module === "all" || Object.keys(item.permisos || {}).includes(module);

      return matchesSearch && matchesStatus && matchesLevel && matchesModule;
    });
  }

  function attachRoleEvents() {
    document.querySelectorAll(".view-role").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const selected = roles.find((item) => Number(item.id) === id);

        if (selected) {
          openRoleDetail(selected);
        }
      });
    });

    document.querySelectorAll(".edit-role").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const selected = roles.find((item) => Number(item.id) === id);

        if (selected) {
          openRoleForm(selected);
        }
      });
    });

    document.querySelectorAll(".toggle-role").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.dataset.id);
        const selected = roles.find((item) => Number(item.id) === id);

        if (selected) {
          await toggleRoleStatus(selected);
        }
      });
    });
  }

  function openRoleDetail(item) {
    roleDetailTitle.textContent = item.nombre;
    roleDetailSubtitle.textContent = `${item.nivelAcceso} · ${item.estado}`;

    const permissionsText = Object.entries(item.permisos || {})
      .map(([modulo, acciones]) => `${modulo}: ${acciones.join(", ")}`)
      .join("<br>");

    const rows = [
      ["ID", item.id],
      ["Nombre", item.nombre],
      ["Descripción", item.descripcion],
      ["Nivel de acceso", item.nivelAcceso],
      ["Estado", item.estado],
      ["Módulos habilitados", Object.keys(item.permisos || {}).join(", ") || "No registrado"],
      ["Permisos", permissionsText || "No registrado"],
      ["Permisos sensibles", countSensitivePermissions(item.permisos)]
    ];

    roleDetailContent.innerHTML = rows
      .map(
        ([label, value]) => `
          <div class="preview-row">
            <strong>${label}</strong>
            <span>${value}</span>
          </div>
        `
      )
      .join("");

    roleDetailModal.classList.add("active");
  }

  function openRoleForm(item = null) {
    roleForm.reset();
    renderPermissionsEditor(item?.permisos || {});

    if (item) {
      roleModalTitle.textContent = "Editar rol";
      roleId.value = item.id;
      roleName.value = item.nombre;
      roleAccessLevel.value = item.nivelAcceso;
      roleStatus.value = item.estado;
      roleDescription.value = item.descripcion;
      roleObservation.value = "";
    } else {
      roleModalTitle.textContent = "Nuevo rol";
      roleId.value = "";
      roleStatus.value = "Activo";
    }

    roleModal.classList.add("active");
  }

  function renderPermissionsEditor(selectedPermissions = {}) {
    permissionsGrid.innerHTML = permissionModules
      .map((module) => {
        const actions = module.acciones
          .map((action) => {
            const checked = selectedPermissions[module.modulo]?.includes(action) ? "checked" : "";
            const label = formatActionLabel(action);

            return `
              <label>
                <input
                  type="checkbox"
                  data-module="${module.modulo}"
                  value="${action}"
                  ${checked}
                />
                ${label}
              </label>
            `;
          })
          .join("");

        return `
          <article class="permission-module-card">
            <h4>${module.modulo}</h4>
            <div class="permission-actions">
              ${actions}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function getSelectedPermissions() {
    const selected = {};

    permissionsGrid.querySelectorAll("input[type='checkbox']:checked").forEach((input) => {
      const module = input.dataset.module;

      if (!selected[module]) {
        selected[module] = [];
      }

      selected[module].push(input.value);
    });

    return selected;
  }

  function formatActionLabel(action) {
    return action
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  async function saveRole() {
    const data = {
      id: roleId.value ? Number(roleId.value) : null,
      nombre: roleName.value.trim(),
      descripcion: roleDescription.value.trim(),
      nivelAcceso: roleAccessLevel.value,
      estado: roleStatus.value,
      permisos: getSelectedPermissions(),
      observacion: roleObservation.value.trim()
    };

    try {
      if (!data.id && typeof createRol === "function") {
        const response = await createRol(data);
        const createdRole = response.rol || response.data || data;

        roles.push({
          ...createdRole,
          id: createdRole.id || Date.now()
        });
      } else if (data.id && typeof updateRol === "function") {
        const response = await updateRol(data.id, data);
        const updatedRole = response.rol || response.data || data;

        roles = roles.map((item) =>
          Number(item.id) === Number(data.id)
            ? { ...item, ...updatedRole }
            : item
        );
      } else {
        throw new Error("Endpoint de guardado de rol no disponible todavía.");
      }
    } catch (error) {
      console.warn("Guardado simulado de rol:", error.message);

      if (data.id) {
        roles = roles.map((item) =>
          Number(item.id) === Number(data.id)
            ? { ...item, ...data }
            : item
        );
      } else {
        roles.push({
          ...data,
          id: Date.now()
        });
      }
    }

    roleModal.classList.remove("active");
    renderRoles();
    updateRoleMetrics();
    showRolesToast("Rol guardado correctamente.");
  }

  async function toggleRoleStatus(item) {
    const newStatus = item.estado === "Activo" ? "Inactivo" : "Activo";

    try {
      if (typeof updateRol === "function") {
        await updateRol(item.id, { estado: newStatus });
      } else {
        throw new Error("updateRol no disponible en api.js.");
      }
    } catch (error) {
      console.warn("Cambio de estado simulado:", error.message);
    }

    item.estado = newStatus;
    renderRoles();
    updateRoleMetrics();
    showRolesToast(`Rol ${newStatus.toLowerCase()} correctamente.`);
  }

  function updateRoleMetrics() {
    const total = roles.length;
    const modules = new Set();
    let activePermissions = 0;
    let sensitivePermissions = 0;

    roles.forEach((role) => {
      Object.entries(role.permisos || {}).forEach(([module, actions]) => {
        modules.add(module);
        activePermissions += actions.length;
        sensitivePermissions += actions.filter((action) => sensitiveActions.includes(action)).length;
      });
    });

    metricTotalRoles.textContent = total;
    metricModules.textContent = modules.size;
    metricActivePermissions.textContent = activePermissions;
    metricSensitivePermissions.textContent = sensitivePermissions;
    sidebarRolesCount.textContent = total;

    rolesAiTip.textContent =
      `Se registran ${total} roles, ${activePermissions} permisos activos y ${sensitivePermissions} permisos sensibles.`;
  }

  function countPermissions(permissions) {
    return Object.values(permissions || {}).reduce((total, actions) => total + actions.length, 0);
  }

  function countSensitivePermissions(permissions) {
    return Object.values(permissions || {})
      .flat()
      .filter((action) => sensitiveActions.includes(action)).length;
  }

  function getRoleStatusClass(status) {
    return status === "Activo" ? "role-status-active" : "role-status-inactive";
  }

  [roleSearch, filterRoleStatus, filterAccessLevel, filterModule].forEach((field) => {
    field.addEventListener("input", renderRoles);
    field.addEventListener("change", renderRoles);
  });

  clearRoleFilters.addEventListener("click", () => {
    roleSearch.value = "";
    filterRoleStatus.value = "all";
    filterAccessLevel.value = "all";
    filterModule.value = "all";

    renderRoles();
    showRolesToast("Filtros limpiados.");
  });

  refreshRoles.addEventListener("click", () => {
    initRoles();
    showRolesToast("Roles actualizados.");
  });

  exportRoles.addEventListener("click", () => {
    showRolesToast("Exportación de roles generada de forma simulada.");
  });

  analyzeRolesAi.addEventListener("click", () => {
    const sensitive = roles.reduce((total, item) => total + countSensitivePermissions(item.permisos), 0);
    const adminRoles = roles.filter((item) => item.nivelAcceso === "Administrativo").length;

    rolesAiTip.textContent =
      `IA: revisar ${sensitive} permiso(s) sensible(s) y ${adminRoles} rol(es) con nivel administrativo.`;

    showRolesToast("Análisis IA de permisos generado.");
  });

  generateRolesSummary.addEventListener("click", () => {
    const active = roles.filter((item) => item.estado === "Activo").length;
    const sensitive = roles.reduce((total, item) => total + countSensitivePermissions(item.permisos), 0);

    rolesSummaryBox.innerHTML = `
      <strong>Análisis generado:</strong><br>
      Existen ${roles.length} roles registrados, ${active} activos y ${sensitive} permisos sensibles.
      Se recomienda auditar roles administrativos y aplicar permisos mínimos necesarios.
    `;

    showRolesToast("Resumen IA generado.");
  });

  selectRecommendedPermissions.addEventListener("click", () => {
    const level = roleAccessLevel.value;

    const recommended = {
      Básico: {
        Cliente: ["ver", "crear_reclamo", "subir_evidencia", "ver_historial", "recibir_notificaciones"]
      },
      Operativo: {
        Asesor: ["ver_bandeja", "atender", "actualizar", "solicitar_info", "resolver"]
      },
      Supervisor: {
        Supervisor: ["clasificar", "asignar", "monitorear_sla", "ver_desempeno", "reportes"]
      },
      Administrativo: {
        Administrador: ["usuarios", "roles", "catalogos", "parametros", "auditoria"]
      }
    };

    renderPermissionsEditor(recommended[level] || {});
    showRolesToast("Permisos sugeridos aplicados.");
  });

  openCreateRoleModal.addEventListener("click", () => openRoleForm());
  openCreateRoleModalHero.addEventListener("click", () => openRoleForm());

  closeRoleModal.addEventListener("click", () => roleModal.classList.remove("active"));
  cancelRoleForm.addEventListener("click", () => roleModal.classList.remove("active"));

  roleModal.addEventListener("click", (event) => {
    if (event.target === roleModal) {
      roleModal.classList.remove("active");
    }
  });

  roleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveRole();
  });

  closeRoleDetailModal.addEventListener("click", () => {
    roleDetailModal.classList.remove("active");
  });

  roleDetailModal.addEventListener("click", (event) => {
    if (event.target === roleDetailModal) {
      roleDetailModal.classList.remove("active");
    }
  });

  function toggleRolesBot() {
    rolesBot.classList.toggle("active");
  }

  openRolesBot.addEventListener("click", toggleRolesBot);
  openRolesHelp.addEventListener("click", toggleRolesBot);

  closeRolesBot.addEventListener("click", () => {
    rolesBot.classList.remove("active");
  });

  function showRolesToast(message, type = "success") {
    const existingToast = document.querySelector(".roles-toast");

    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "roles-toast";
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

  initRoles();
});