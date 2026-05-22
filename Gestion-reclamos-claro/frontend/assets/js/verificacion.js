"use strict";

/* =========================================================
   VERIFICACIÓN DE CUENTA - CLARO ATENCIÓN 360
========================================================= */

let verificationCountdown = 180;
let verificationInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  initVerificationPage();
});

/* =========================================================
   INIT
========================================================= */

function initVerificationPage() {
  bindVerificationInputs();
  bindVerificationForm();
  bindVerificationModals();
  bindResendCode();
  startVerificationTimer();

  const firstInput = document.querySelector(".verification-input");
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 250);
  }
}

/* =========================================================
   HELPERS
========================================================= */

function $(selector, parent = document) {
  return parent.querySelector(selector);
}

function $all(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setText(selector, value) {
  const element = $(selector);
  if (element) {
    element.textContent = value;
  }
}

/* =========================================================
   INPUTS DE CÓDIGO
========================================================= */

function bindVerificationInputs() {
  const inputs = $all(".verification-input");

  inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "");

      input.classList.toggle("filled", Boolean(input.value));

      if (input.value && inputs[index + 1]) {
        inputs[index + 1].focus();
      }

      setText("#verificationCodeError", "");
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && !input.value && inputs[index - 1]) {
        inputs[index - 1].focus();
      }

      if (event.key === "ArrowLeft" && inputs[index - 1]) {
        inputs[index - 1].focus();
      }

      if (event.key === "ArrowRight" && inputs[index + 1]) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener("paste", (event) => {
      event.preventDefault();

      const pasted = event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, inputs.length);

      pasted.split("").forEach((char, pasteIndex) => {
        if (inputs[pasteIndex]) {
          inputs[pasteIndex].value = char;
          inputs[pasteIndex].classList.add("filled");
        }
      });

      const nextIndex = Math.min(pasted.length, inputs.length - 1);

      if (inputs[nextIndex]) {
        inputs[nextIndex].focus();
      }

      setText("#verificationCodeError", "");
    });
  });
}

function getVerificationCode() {
  return $all(".verification-input")
    .map((input) => input.value)
    .join("");
}

function clearVerificationCode() {
  $all(".verification-input").forEach((input) => {
    input.value = "";
    input.classList.remove("filled");
  });

  const firstInput = $(".verification-input");
  if (firstInput) {
    firstInput.focus();
  }
}

/* =========================================================
   FORMULARIO
========================================================= */

function bindVerificationForm() {
  const form = $("#verificationForm");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const code = getVerificationCode();

    setText("#verificationCodeError", "");

    if (verificationCountdown <= 0) {
      setText("#verificationCodeError", "El código venció. Solicita uno nuevo.");
      return;
    }

    if (code.length !== 6) {
      setText("#verificationCodeError", "Ingresa el código completo de 6 dígitos.");
      return;
    }

    setButtonLoading("#verifyAccountBtn", true);

    await delay(700);

    setButtonLoading("#verifyAccountBtn", false);

    /*
      MOCK DATA - ELIMINAR CUANDO SE CONECTE AL BACKEND

      Código demo válido: 123456

      En backend real, aquí iría algo como:

      const response = await fetch("/api/auth/verificar-cuenta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      const result = await response.json();

      if (result.ok) {
        openModal("#verificationSuccessModal");
      } else {
        openModal("#verificationErrorModal");
      }
    */

    if (code === "123456") {
      openModal("#verificationSuccessModal");
    } else {
      openModal("#verificationErrorModal");
    }
  });
}

function setButtonLoading(selector, value) {
  const button = $(selector);

  if (!button) return;

  button.disabled = value;
  button.classList.toggle("loading", value);
}

/* =========================================================
   REENVIAR CÓDIGO
========================================================= */

function bindResendCode() {
  const resendButton = $("#resendCodeBtn");

  if (!resendButton) return;

  resendButton.addEventListener("click", () => {
    resendVerificationCode();
  });
}

function resendVerificationCode() {
  verificationCountdown = 180;
  startVerificationTimer();
  clearVerificationCode();

  showToast({
    title: "Código reenviado",
    message: "Te enviamos un nuevo código de verificación.",
    type: "success"
  });
}

/* =========================================================
   TEMPORIZADOR
========================================================= */

function startVerificationTimer() {
  clearInterval(verificationInterval);

  updateVerificationTimer();

  verificationInterval = setInterval(() => {
    verificationCountdown -= 1;
    updateVerificationTimer();

    if (verificationCountdown <= 0) {
      clearInterval(verificationInterval);
      verificationCountdown = 0;
      updateVerificationTimer();
      setText("#verificationCodeError", "El código venció. Solicita uno nuevo.");
    }
  }, 1000);
}

function updateVerificationTimer() {
  const minutes = String(Math.floor(verificationCountdown / 60)).padStart(2, "0");
  const seconds = String(verificationCountdown % 60).padStart(2, "0");

  setText("#verificationTimer", `${minutes}:${seconds}`);
}

/* =========================================================
   MODALES
========================================================= */

function bindVerificationModals() {
  $all("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeAllModals);
  });

  $("#modalBackdrop")?.addEventListener("click", closeAllModals);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllModals();
    }
  });
}

function openModal(selector) {
  const modal = $(selector);
  const backdrop = $("#modalBackdrop");

  if (!modal || !backdrop) return;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  backdrop.classList.add("show");
  document.body.classList.add("modal-open");
}

function closeAllModals() {
  $all(".modal").forEach((modal) => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  });

  $("#modalBackdrop")?.classList.remove("show");
  document.body.classList.remove("modal-open");
}

/* =========================================================
   TOAST
========================================================= */

function showToast({ title, message, type = "info" }) {
  const container = $("#toastContainer");

  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  toast.innerHTML = `
    <span>${type === "success" ? "✓" : type === "warning" ? "!" : type === "danger" ? "×" : "ℹ"}</span>
    <div>
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(24px)";

    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 4200);
}