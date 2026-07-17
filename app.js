const form = document.querySelector(".notify-form");
const message = document.querySelector(".form-message");
const NOTIFY_URL = location.protocol === "file:"
  ? "http://localhost:4173/api/notify"
  : "https://p2u2akpnylfnj4rlgzidt2qgc40vcumt.lambda-url.us-east-1.on.aws/";

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
      const response = await fetch(NOTIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      });

      if (!response.ok) {
        throw new Error("save failed");
      }

      const result = await response.json();
      showMessage(`출시 알림이 등록됐어요! 현재 ${result.count}명이 출시를 기다리고 있어요.`);
      form.reset();
    } catch (error) {
      showMessage("잠시 후 다시 시도해주세요.", true);
    }
  });
}

// 안드로이드 출시 준비중 팝업
let toastTimer;
const showToast = (text) => {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
};

document.querySelectorAll(".store-badge-android").forEach((badge) => {
  badge.addEventListener("click", (event) => {
    event.preventDefault();
    showToast("Google Play 버전은 출시 준비중입니다.");
  });
});

document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
  const trigger = dropdown.querySelector(".nav-dropdown-trigger");
  if (!trigger) return;

  const closeDropdown = () => {
    dropdown.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  };

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));
  });

  dropdown.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDropdown();
      trigger.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      closeDropdown();
    }
  });
});

// 모달
const openModal = (id) => {
  const overlay = document.getElementById(`modal-${id}`);
  if (!overlay) return;
  overlay.hidden = false;
  overlay.removeAttribute("aria-hidden");
  document.body.style.overflow = "hidden";
  overlay.querySelector(".modal-close")?.focus();
};

const closeModal = (overlay) => {
  overlay.hidden = true;
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

document.querySelectorAll(".legal-btn").forEach((btn) => {
  btn.addEventListener("click", () => openModal(btn.dataset.modal));
});

document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal(overlay);
  });
  overlay.querySelector(".modal-close")?.addEventListener("click", () => closeModal(overlay));
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  document.querySelectorAll(".modal-overlay:not([hidden])").forEach(closeModal);
});

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
