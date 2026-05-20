document.addEventListener("DOMContentLoaded", () => {
  /*
    Estándar aplicado:
    1. La pantalla intenta consumir datos reales desde api.js.
    2. Si el backend todavía no existe, usa datos demo como respaldo visual.
    3. Cuando el backend esté listo y respete el contrato, no se toca el frontend.
  */

  const usersRows = document.getElementById("usersRows");
  const emptyUsers = document.getElementById("emptyUsers");

  const userSearch = document.getElementById("userSearch");
  const filterUserRole = document.getElementById("filterUserRole");
  const filterUserStatus = document.getElementById("filterUserStatus");
  const filterUserArea = document.getElementById("filterUserArea");

  const metricTotalUsers = document.getElementById("metricTotalUsers");
  const metricActiveUsers = document.getElementById("metricActiveUsers");
  const metricInactiveUsers = document.getElementById("metricInactiveUsers");
  const metricBlockedUsers = document.getElementById("metricBlockedUsers");
  const sidebarUsersCount = document.getElementById("sidebarUsersCount");

  const usersAiTip = document.getElementById("usersAiTip");
  const usersSummaryBox = document.getElementById("usersSummaryBox");

  const clearUserFilters = document.getElementById("clearUserFilters");
  const refreshUsers = document.getElementById("refreshUsers");
  const exportUsers = document.getElementById("exportUsers");
  const analyzeUsersAi = document.getElementById("analyzeUsersAi");
  const generateUsersSummary = document.getElementById("generateUsersSummary");

  const userModal = document.getElementById("userModal");
  const openCreateUserModal = document.getElementById("openCreateUserModal");
  const openCreateUserModalHero = document.getElementById("openCreateUserModalHero");
  const closeUserModal = document.getElementById("closeUserModal");
  const cancelUserForm = document.getElementById("cancelUserForm");
  const userForm = document.getElementById("userForm");

  const userModalTitle = document.getElementById("userModalTitle");
  const userId = document.getElementById("userId");
  const userNames = document.getElementById("userNames");
  const userLastNames = document.getElementById("userLastNames");
  const userEmail = document.getElementById("userEmail");
  const userUsername = document.getElementById("userUsername");
  const userRole = document.getElementById("userRole");
  const userArea = document.getElementById("userArea");
  const userStatus = document.getElementById("userStatus");
  const userDocument = document.getElementById("userDocument");
  const userObservation = document.getElementById("userObservation");

  const userDetailModal = document.getElementById("userDetailModal");
  const closeUserDetailModal = document.getElementById("closeUserDetailModal");
  const userDetailTitle = document.getElementById("userDetailTitle");
  const userDetailSubtitle = document.getElementById("userDetailSubtitle");
  const userDetailContent = document.getElementById("userDetailContent");

  const usersBot = document.getElementById("usersBot");
  const openUsersBot = document.getElementById("openUsersBot");
  const openUsersHelp = document.getElementById("openUsersHelp");
  const closeUsersBot = document.getElementById("closeUsersBot");

  let users = [];

  const demoUsers = [
    {
      id: 1,
      nombres: "Asesor",
      apellidos: "Técnico Hogar",
      correo: "asesor.hogar@demo.claro.pe",
      usuario: "asesor.hogar",
      rol: "Asesor",
      area: "Soporte técnico",
      estado: "Activo",
      documento: "00000001",
      ultimoAcceso: "Demo · Hoy 08:30"
    },
    {
      id: 2,
      nombres: "Supervisor",
      apellidos: "Atención",
      correo: "supervisor.atencion@demo.claro.pe",
      usuario: "supervisor.atencion",
      rol: "Supervisor",
      area: "Atención al cliente",
      estado: "Activo",
      documento: "00000002",
      ultimoAcceso: "Demo · Hoy 09:10"
    },
    {
      id: 3,
      nombres: "Administrador",
      apellidos: "Sistema",
      correo: "admin.sistema@demo.claro.pe",
      usuario: "admin.sistema",
      rol: "Administrador",
      area: "Administración",
      estado: "Activo",
      documento: "00000003",
      ultimoAcceso: "Demo · Ayer 17:45"
    },
    {
      id: 4,
      nombres: "Asesor",
      apellidos: "Facturación",
      correo: "asesor.facturacion@demo.claro.pe",
      usuario: "asesor.facturacion",
      rol: "Asesor",
      area: "Facturación",
      estado: "Inactivo",
      documento: "00000004",
      ultimoAcceso: "Demo · 10/05/2026"
    },
    {
      id: 5,
      nombres: "Cliente",
      apellidos: "Claro",
      correo: "cliente.demo@demo.claro.pe",
      usuario: "cliente.demo",
      rol: "Cliente",
      area: "Atención al cliente",
      estado: "Bloqueado",
      documento: "00000005",
      ultimoAcceso: "Demo · 02/05/2026"
    }
  ];

  async function initUsers() {
    try {
      /*
        Contrato esperado:
        GET /api/admin/usuarios

        Respuesta esperada:
        {
          "success": true,
          "usuarios": [
            {
              "id": 1,
              "nombres": "Juan",
              "apellidos": "Pérez",
              "correo": "juan@empresa.com",
              "usuario": "juan.perez",
              "rol": "Asesor",
              "area": "Soporte técnico",
              "estado": "Activo",
              "documento": "12345678",
              "ultimoAcceso": "2026-05-19 08:30"
            }
          ]
        }
      */

      if (typeof getUsuarios !== "function") {
        throw new Error("api.js no disponible.");
      }

      const response = await getUsuarios();
      users = response.usuarios || response.data || [];

      if (!Array.isArray(users)) {
        throw new Error("El backend no devolvió una lista válida de usuarios.");
      }

      if (users.length === 0) {
        throw new Error("No hay usuarios registrados en backend.");
      }
    } catch (error) {
      console.warn("Backend no disponible. Usando datos demo temporales:", error.message);
      users = demoUsers;
    }

    renderUsers();
    updateUserMetrics();
  }

  function renderUsers() {
    const filteredUsers = getFilteredUsers();
    usersRows.innerHTML = "";

    filteredUsers.forEach((item) => {
      const row = document.createElement("div");
      row.className = "user-row";

      row.innerHTML = `
        <span class="case-code">${item.nombres} ${item.apellidos}</span>
        <span>${item.correo}</span>
        <span>${item.rol}</span>
        <span>${item.area}</span>
        <span class="user-status-pill ${getStatusClass(item.estado)}">${item.estado}</span>
        <span>${item.ultimoAcceso || "Sin registro"}</span>

        <div class="user-actions">
          <button class="view-user" data-id="${item.id}">Ver</button>
          <button class="ghost edit-user" data-id="${item.id}">Editar</button>
          <button class="ghost toggle-user" data-id="${item.id}">
            ${item.estado === "Activo" ? "Desactivar" : "Activar"}
          </button>
        </div>
      `;

      usersRows.appendChild(row);
    });

    emptyUsers.classList.toggle("hidden", filteredUsers.length > 0);
    attachUserEvents();
  }

  function getFilteredUsers() {
    const search = userSearch.value.trim().toLowerCase();
    const role = filterUserRole.value;
    const status = filterUserStatus.value;
    const area = filterUserArea.value;

    return users.filter((item) => {
      const fullName = `${item.nombres} ${item.apellidos}`.toLowerCase();

      const matchesSearch =
        !search ||
        fullName.includes(search) ||
        String(item.correo || "").toLowerCase().includes(search) ||
        String(item.usuario || "").toLowerCase().includes(search) ||
        String(item.documento || "").toLowerCase().includes(search);

      const matchesRole = role === "all" || item.rol === role;
      const matchesStatus = status === "all" || item.estado === status;
      const matchesArea = area === "all" || item.area === area;

      return matchesSearch && matchesRole && matchesStatus && matchesArea;
    });
  }

  function attachUserEvents() {
    document.querySelectorAll(".view-user").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const selected = users.find((item) => Number(item.id) === id);

        if (selected) {
          openUserDetail(selected);
        }
      });
    });

    document.querySelectorAll(".edit-user").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const selected = users.find((item) => Number(item.id) === id);

        if (selected) {
          openUserForm(selected);
        }
      });
    });

    document.querySelectorAll(".toggle-user").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.dataset.id);
        const selected = users.find((item) => Number(item.id) === id);

        if (selected) {
          await toggleUserStatus(selected);
        }
      });
    });
  }

  function openUserDetail(item) {
    userDetailTitle.textContent = `${item.nombres} ${item.apellidos}`;
    userDetailSubtitle.textContent = `${item.rol} · ${item.area}`;

    const rows = [
      ["ID", item.id],
      ["Nombres", item.nombres],
      ["Apellidos", item.apellidos],
      ["Correo", item.correo],
      ["Usuario", item.usuario],
      ["Rol", item.rol],
      ["Área", item.area],
      ["Estado", item.estado],
      ["Documento", item.documento || "No registrado"],
      ["Último acceso", item.ultimoAcceso || "Sin registro"]
    ];

    userDetailContent.innerHTML = rows
      .map(
        ([label, value]) => `
          <div class="preview-row">
            <strong>${label}</strong>
            <span>${value}</span>
          </div>
        `
      )
      .join("");

    userDetailModal.classList.add("active");
  }

  function openUserForm(item = null) {
    userForm.reset();

    if (item) {
      userModalTitle.textContent = "Editar usuario";
      userId.value = item.id;
      userNames.value = item.nombres;
      userLastNames.value = item.apellidos;
      userEmail.value = item.correo;
      userUsername.value = item.usuario;
      userRole.value = item.rol;
      userArea.value = item.area;
      userStatus.value = item.estado;
      userDocument.value = item.documento || "";
      userObservation.value = "";
    } else {
      userModalTitle.textContent = "Nuevo usuario";
      userId.value = "";
      userStatus.value = "Activo";
    }

    userModal.classList.add("active");
  }

  async function saveUser() {
    const data = {
      id: userId.value ? Number(userId.value) : null,
      nombres: userNames.value.trim(),
      apellidos: userLastNames.value.trim(),
      correo: userEmail.value.trim(),
      usuario: userUsername.value.trim(),
      rol: userRole.value,
      area: userArea.value,
      estado: userStatus.value,
      documento: userDocument.value.trim(),
      observacion: userObservation.value.trim()
    };

    try {
      /*
        Para crear:
        POST /api/admin/usuarios

        Para editar, si luego agregamos updateUsuario en api.js:
        PUT /api/admin/usuarios/:id

        Como api.js ya tiene createUsuario(data), esta pantalla queda lista para crear.
        Si se edita y el backend expone updateUsuario, solo se agrega esa función en api.js,
        no se modifica esta pantalla.
      */

      if (!data.id && typeof createUsuario === "function") {
        const response = await createUsuario(data);
        const createdUser = response.usuario || response.data || data;

        users.push({
          ...createdUser,
          id: createdUser.id || Date.now(),
          ultimoAcceso: createdUser.ultimoAcceso || "Sin acceso"
        });
      } else if (data.id && typeof updateUsuario === "function") {
        const response = await updateUsuario(data.id, data);
        const updatedUser = response.usuario || response.data || data;

        users = users.map((item) =>
          Number(item.id) === Number(data.id)
            ? { ...item, ...updatedUser }
            : item
        );
      } else {
        throw new Error("Endpoint de guardado no disponible todavía.");
      }
    } catch (error) {
      console.warn("Guardado simulado de usuario:", error.message);

      if (data.id) {
        users = users.map((item) =>
          Number(item.id) === Number(data.id)
            ? { ...item, ...data }
            : item
        );
      } else {
        users.push({
          ...data,
          id: Date.now(),
          ultimoAcceso: "Demo · Sin acceso"
        });
      }
    }

    userModal.classList.remove("active");
    renderUsers();
    updateUserMetrics();
    showUsersToast("Usuario guardado correctamente.");
  }

  async function toggleUserStatus(item) {
    const newStatus = item.estado === "Activo" ? "Inactivo" : "Activo";

    try {
      /*
        Backend recomendado:
        PUT /api/admin/usuarios/:id
        body: { estado: "Inactivo" }

        Esta pantalla usará updateUsuario si existe en api.js.
      */

      if (typeof updateUsuario === "function") {
        await updateUsuario(item.id, { estado: newStatus });
      } else {
        throw new Error("updateUsuario no disponible en api.js.");
      }
    } catch (error) {
      console.warn("Cambio de estado simulado:", error.message);
    }

    item.estado = newStatus;
    renderUsers();
    updateUserMetrics();
    showUsersToast(`Usuario ${newStatus.toLowerCase()} correctamente.`);
  }

  function updateUserMetrics() {
    const total = users.length;
    const active = users.filter((item) => item.estado === "Activo").length;
    const inactive = users.filter((item) => item.estado === "Inactivo").length;
    const blocked = users.filter((item) => item.estado === "Bloqueado").length;

    metricTotalUsers.textContent = total;
    metricActiveUsers.textContent = active;
    metricInactiveUsers.textContent = inactive;
    metricBlockedUsers.textContent = blocked;
    sidebarUsersCount.textContent = total;

    usersAiTip.textContent =
      `Se registran ${total} usuarios: ${active} activos, ${inactive} inactivos y ${blocked} bloqueados.`;
  }

  function getStatusClass(status) {
    const classes = {
      Activo: "user-status-active",
      Inactivo: "user-status-inactive",
      Bloqueado: "user-status-blocked"
    };

    return classes[status] || "user-status-inactive";
  }

  [userSearch, filterUserRole, filterUserStatus, filterUserArea].forEach((field) => {
    field.addEventListener("input", renderUsers);
    field.addEventListener("change", renderUsers);
  });

  clearUserFilters.addEventListener("click", () => {
    userSearch.value = "";
    filterUserRole.value = "all";
    filterUserStatus.value = "all";
    filterUserArea.value = "all";

    renderUsers();
    showUsersToast("Filtros limpiados.");
  });

  refreshUsers.addEventListener("click", () => {
    initUsers();
    showUsersToast("Usuarios actualizados.");
  });

  exportUsers.addEventListener("click", () => {
    showUsersToast("Exportación de usuarios generada de forma simulada.");
  });

  analyzeUsersAi.addEventListener("click", () => {
    const inactive = users.filter((item) => item.estado === "Inactivo").length;
    const blocked = users.filter((item) => item.estado === "Bloqueado").length;
    const admins = users.filter((item) => item.rol === "Administrador").length;

    usersAiTip.textContent =
      `IA: revisar ${inactive} usuario(s) inactivos, ${blocked} bloqueado(s) y ${admins} cuenta(s) con rol administrador.`;

    showUsersToast("Análisis IA de usuarios generado.");
  });

  generateUsersSummary.addEventListener("click", () => {
    const active = users.filter((item) => item.estado === "Activo").length;
    const inactive = users.filter((item) => item.estado === "Inactivo").length;
    const blocked = users.filter((item) => item.estado === "Bloqueado").length;

    usersSummaryBox.innerHTML = `
      <strong>Análisis generado:</strong><br>
      Existen ${active} usuarios activos, ${inactive} inactivos y ${blocked} bloqueados.
      Se recomienda revisar cuentas sin uso y validar roles administrativos.
    `;

    showUsersToast("Resumen IA generado.");
  });

  openCreateUserModal.addEventListener("click", () => openUserForm());
  openCreateUserModalHero.addEventListener("click", () => openUserForm());

  closeUserModal.addEventListener("click", () => userModal.classList.remove("active"));
  cancelUserForm.addEventListener("click", () => userModal.classList.remove("active"));

  userModal.addEventListener("click", (event) => {
    if (event.target === userModal) {
      userModal.classList.remove("active");
    }
  });

  userForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveUser();
  });

  closeUserDetailModal.addEventListener("click", () => {
    userDetailModal.classList.remove("active");
  });

  userDetailModal.addEventListener("click", (event) => {
    if (event.target === userDetailModal) {
      userDetailModal.classList.remove("active");
    }
  });

  function toggleUsersBot() {
    usersBot.classList.toggle("active");
  }

  openUsersBot.addEventListener("click", toggleUsersBot);
  openUsersHelp.addEventListener("click", toggleUsersBot);

  closeUsersBot.addEventListener("click", () => {
    usersBot.classList.remove("active");
  });

  function showUsersToast(message, type = "success") {
    const existingToast = document.querySelector(".users-toast");

    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "users-toast";
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

  initUsers();
});