document.addEventListener("DOMContentLoaded", () => {
  const profileCards = document.querySelectorAll(".profile-card");
  const selectedRoleInput = document.getElementById("selectedRole");
  const selectedProfileText = document.getElementById("selectedProfileText");

  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("passwordInput");

  const loginForm = document.getElementById("loginForm");
  const userInput = document.getElementById("userInput");

  const openQuickCase = document.getElementById("openQuickCase");
  const openOtp = document.getElementById("openOtp");

  const quickCaseModal = document.getElementById("quickCaseModal");
  const otpModal = document.getElementById("otpModal");
  const closeButtons = document.querySelectorAll(".modal-close");

  const roleNames = {
    cliente: "Cliente persona",
    empresa: "Cliente empresa",
    asesor: "Asesor de atención",
    supervisor: "Supervisor",
    admin: "Administrador"
  };

  const roleRedirects = {
    cliente: "pages/cliente/dashboard-cliente.html",
    empresa: "pages/public/atencion-empresas.html",
    asesor: "pages/asesor/dashboard-asesor.html",
    supervisor: "pages/supervisor/dashboard-supervisor.html",
    admin: "pages/admin/dashboard-admin.html"
  };

  profileCards.forEach((card) => {
    card.addEventListener("click", () => {
      profileCards.forEach((item) => item.classList.remove("active"));
      card.classList.add("active");

      const selectedRole = card.dataset.role;

      selectedRoleInput.value = selectedRole;
      selectedProfileText.textContent = roleNames[selectedRole];

      updatePlaceholderByRole(selectedRole);
    });
  });

  function updatePlaceholderByRole(role) {
    if (!userInput) return;

    const placeholders = {
      cliente: "Ingresa tu DNI o correo",
      empresa: "Ingresa tu RUC o correo corporativo",
      asesor: "Ingresa tu usuario interno",
      supervisor: "Ingresa tu usuario supervisor",
      admin: "Ingresa tu usuario administrador"
    };

    userInput.placeholder = placeholders[role] || "Ingresa tu usuario";
  }

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";

      passwordInput.type = isPassword ? "text" : "password";
      togglePassword.innerHTML = isPassword
        ? '<i class="fa-regular fa-eye-slash"></i>'
        : '<i class="fa-regular fa-eye"></i>';
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const role = selectedRoleInput.value;
      const user = userInput.value.trim();
      const password = passwordInput.value.trim();

      if (!user || !password) {
        showLoginToast("Completa tu usuario y contraseña para continuar.", "error");
        return;
      }

      showLoginToast("Acceso validado. Redirigiendo al panel...", "success");

      setTimeout(() => {
        window.location.href = roleRedirects[role] || "index.html";
      }, 900);
    });
  }

  if (openQuickCase && quickCaseModal) {
    openQuickCase.addEventListener("click", () => {
      quickCaseModal.classList.add("active");
    });
  }

  if (openOtp && otpModal) {
    openOtp.addEventListener("click", () => {
      otpModal.classList.add("active");
    });
  }

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modalId = button.dataset.close;
      const modal = document.getElementById(modalId);

      if (modal) {
        modal.classList.remove("active");
      }
    });
  });

  [quickCaseModal, otpModal].forEach((modal) => {
    if (!modal) return;

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("active");
      }
    });
  });

  function showLoginToast(message, type = "success") {
    const existingToast = document.querySelector(".login-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "login-toast";
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