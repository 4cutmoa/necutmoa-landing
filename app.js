const form = document.querySelector(".notify-form");
const message = document.querySelector(".form-message");
const apiBase = location.protocol === "file:" ? "http://localhost:4173" : "";

const showMessage = (text, isError = false) => {
  if (!message) return;
  message.textContent = text;
  message.classList.toggle("is-error", isError);
};

const saveLeadLocally = (lead) => {
  const key = "necutmoa_launch_leads";
  const leads = JSON.parse(localStorage.getItem(key) || "[]");
  leads.push(lead);
  localStorage.setItem(key, JSON.stringify(leads));
};

if (form && message) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();

    if (!email) {
      showMessage("이메일을 입력해주세요.", true);
      return;
    }

    const lead = {
      email,
      page: location.href,
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${apiBase}/api/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      });

      if (!response.ok) {
        throw new Error("save failed");
      }

      const result = await response.json();
      showMessage(`출시 알림이 등록됐어요! 현재 ${result.count}명이 기다리고 있어요.`);
      form.reset();
    } catch (error) {
      showMessage("잠시 후 다시 시도해주세요.", true);
    }
  });
}

document.querySelectorAll("img[data-fallback]").forEach((image) => {
  image.addEventListener("error", () => {
    image.classList.add("is-missing");
    const figure = image.closest("figure");
    if (figure) {
      figure.classList.add("missing-image");
    }
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll(".feature-row, .intro-grid article, .plan-card, .screen-gallery figure, .data-grid article").forEach((element) => {
  observer.observe(element);
});
