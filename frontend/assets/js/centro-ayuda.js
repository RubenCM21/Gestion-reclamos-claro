document.addEventListener("DOMContentLoaded", () => {
  const needType = document.getElementById("needType");
  const serviceType = document.getElementById("serviceType");
  const goalType = document.getElementById("goalType");
  const clearFilters = document.getElementById("clearFilters");
  const serviceCards = document.querySelectorAll(".service-card");
  const faqItems = document.querySelectorAll(".faq-item");

  function applyFilters() {
    const selectedNeed = needType.value;
    const selectedGoal = goalType.value;

    serviceCards.forEach((card) => {
      const cardType = card.dataset.type;
      const cardGoal = card.dataset.goal;

      const matchesNeed = selectedNeed === "all" || selectedNeed === cardType;
      const matchesGoal = selectedGoal === "all" || selectedGoal === cardGoal;

      if (matchesNeed && matchesGoal) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });

    showFilterMessage();
  }

  function showFilterMessage() {
    const visibleCards = document.querySelectorAll(".service-card:not(.hidden)").length;

    const existingMessage = document.querySelector(".filter-toast");
    if (existingMessage) {
      existingMessage.remove();
    }

    const toast = document.createElement("div");
    toast.className = "filter-toast";
    toast.textContent = `${visibleCards} opción(es) encontradas según tu selección.`;

    Object.assign(toast.style, {
      position: "fixed",
      right: "24px",
      top: "96px",
      background: "#171717",
      color: "#fff",
      padding: "14px 18px",
      borderRadius: "14px",
      boxShadow: "0 14px 35px rgba(0,0,0,.18)",
      fontWeight: "700",
      zIndex: "200"
    });

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2500);
  }

  if (needType) {
    needType.addEventListener("change", applyFilters);
  }

  if (serviceType) {
    serviceType.addEventListener("change", () => {
      showFilterMessage();
    });
  }

  if (goalType) {
    goalType.addEventListener("change", applyFilters);
  }

  if (clearFilters) {
    clearFilters.addEventListener("click", () => {
      needType.value = "all";
      serviceType.value = "all";
      goalType.value = "all";

      serviceCards.forEach((card) => card.classList.remove("hidden"));

      showFilterMessage();
    });
  }

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  });
});