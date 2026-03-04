document.addEventListener("DOMContentLoaded", function () {
  let scrollPosition = 0;
  const modalOverlay = document.querySelector(".modal-overlay");
  const openModalBtns = document.querySelectorAll(".open-modal-btn");
  const modalCloseBtns = document.querySelectorAll(".modal-close-btn");
  const modalForms = document.querySelectorAll(".modal-form");
  const mainForm = document.getElementById("contactForm");
  const successMessages = document.querySelectorAll(".success-message");

  // ── Validation ────────────────────────────────────────────────────────

  function validatePhone(phone) {
    const phoneRegex = /^[\d\s\+-]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  }

  function showFieldError(input, errorEl, message) {
    input.classList.add("error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = "block";
    }
  }

  function validateForm(form) {
    const nameInput = form.querySelector('.name, [name="name"]');
    const phoneInput = form.querySelector('.phone, [name="phone"]');
    let isValid = true;

    form.querySelectorAll(".error-message").forEach((msg) => (msg.style.display = "none"));
    nameInput.classList.remove("error");
    phoneInput.classList.remove("error");

    if (!nameInput.value.trim()) {
      showFieldError(nameInput, form.querySelector(".name-error, .error-message"), "Будь ласка, введіть ваше ім'я");
      isValid = false;
    }

    if (!phoneInput.value.trim()) {
      showFieldError(phoneInput, form.querySelector(".phone-error, .error-message"), "Будь ласка, введіть ваш телефон");
      isValid = false;
    } else if (!validatePhone(phoneInput.value)) {
      showFieldError(
        phoneInput,
        form.querySelector(".phone-error, .error-message"),
        "Будь ласка, введіть коректний телефон",
      );
      isValid = false;
    }

    if (!isValid) {
      const firstError = form.querySelector(".error");
      if (firstError) {
        firstError.style.animation = "none";
        void firstError.offsetWidth;
        firstError.style.animation = "shake 0.5s ease";
      }
    }

    return isValid;
  }

  function setupInputValidation(form) {
    form.querySelectorAll("input, textarea").forEach((input) => {
      input.addEventListener("input", function () {
        if (this.classList.contains("error")) {
          this.classList.remove("error");
          const errorField = this.nextElementSibling;
          if (errorField && errorField.classList.contains("error-message")) {
            errorField.style.display = "none";
          }
        }
      });
    });
  }

  // ── Form submission ───────────────────────────────────────────────────

  function showSuccessMessage(form) {
    form.style.display = "none";
    const successMessage = form.parentElement.querySelector(".success-message");
    if (successMessage) {
      successMessage.style.display = "block";
    } else {
      alert("Дякуємо! Ваше повідомлення відправлено.");
    }
  }

  function showErrorMessage(message) {
    alert("Помилка: " + message);
  }

  async function handleFormSubmit(form, e) {
    e.preventDefault();
    if (!validateForm(form)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner">Відправка...</span>';

    try {
      const formData = {
        name: form.querySelector('[name="name"]').value.trim(),
        phone: form.querySelector('[name="phone"]').value.trim(),
        message: form.querySelector('[name="message"]')?.value.trim() || "",
        origin: window.location.origin,
      };

      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Сервер вернул невалидный ответ");
      }

      if (!response.ok || result.error) {
        throw new Error(result.error || "Ошибка сервера");
      }

      form.reset();
      showSuccessMessage(form);

      setTimeout(() => {
        if (modalOverlay) modalOverlay.classList.remove("active");
      }, 1500);
    } catch (error) {
      console.error("Ошибка отправки:", error);
      showErrorMessage(error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  // ── Modal ─────────────────────────────────────────────────────────────

  function closeModal() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    document.body.style.top = "";
    window.scrollTo(0, scrollPosition);
    document.removeEventListener("keydown", handleEscapeKey);
    resetForms();
  }

  function handleEscapeKey(e) {
    if (e.key === "Escape") closeModal();
  }

  function resetForms() {
    modalForms.forEach((form) => {
      form.reset();
      form.style.display = "flex";
      form.querySelectorAll(".error-message").forEach((msg) => (msg.style.display = "none"));
      form.querySelectorAll(".modal-input, .modal-textarea").forEach((input) => input.classList.remove("error"));
    });
    successMessages.forEach((msg) => (msg.style.display = "none"));
  }

  openModalBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      modalOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollPosition}px`;
      document.addEventListener("keydown", handleEscapeKey);
    });
  });

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  modalCloseBtns.forEach((btn) => btn.addEventListener("click", closeModal));

  // ── Init forms ────────────────────────────────────────────────────────

  modalForms.forEach((form) => {
    form.addEventListener("submit", (e) => handleFormSubmit(form, e));
    setupInputValidation(form);
  });

  if (mainForm) {
    mainForm.addEventListener("submit", (e) => handleFormSubmit(mainForm, e));
    setupInputValidation(mainForm);
    mainForm.setAttribute("novalidate", true);
  }
});
