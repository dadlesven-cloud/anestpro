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

  // ── Book modal ────────────────────────────────────────────────────────

  const bookOverlay = document.getElementById("bookModalOverlay");
  const bookForm = document.getElementById("bookOrderForm");
  const openBookBtn = document.getElementById("openBookModal");
  const bookCloseBtn = document.querySelector(".book-modal-close");
  const bookSuccess = document.getElementById("bookSuccessMessage");

  function openBookModal() {
    bookOverlay.classList.add("active");
    document.addEventListener("keydown", handleBookEsc);
  }

  function closeBookModal() {
    bookOverlay.classList.remove("active");
    document.removeEventListener("keydown", handleBookEsc);
    if (bookForm) {
      bookForm.reset();
      bookForm.style.display = "";
      bookForm.querySelectorAll(".error-message").forEach((el) => (el.style.display = "none"));
      bookForm.querySelectorAll(".modal-input").forEach((el) => el.classList.remove("error"));
    }
    if (bookSuccess) bookSuccess.style.display = "none";
  }

  function handleBookEsc(e) {
    if (e.key === "Escape") closeBookModal();
  }

  if (openBookBtn) openBookBtn.addEventListener("click", openBookModal);
  if (bookCloseBtn) bookCloseBtn.addEventListener("click", closeBookModal);
  if (bookOverlay) {
    bookOverlay.addEventListener("click", (e) => {
      if (e.target === bookOverlay) closeBookModal();
    });
  }

  if (bookForm) {
    bookForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = bookForm.querySelector('[name="name"]');
      const phoneInput = bookForm.querySelector('[name="phone"]');
      const cityInput = bookForm.querySelector('[name="city"]');
      const branchInput = bookForm.querySelector('[name="branch"]');
      const emailInput = bookForm.querySelector('[name="email"]');

      bookForm.querySelectorAll(".error-message").forEach((el) => (el.style.display = "none"));
      bookForm.querySelectorAll(".modal-input").forEach((el) => el.classList.remove("error"));

      let isValid = true;
      if (!nameInput.value.trim()) {
        showFieldError(nameInput, bookForm.querySelector(".name-error"), "Будь ласка, введіть ваше ім'я");
        isValid = false;
      }
      if (!phoneInput.value.trim() || !validatePhone(phoneInput.value)) {
        showFieldError(phoneInput, bookForm.querySelector(".phone-error"), "Будь ласка, введіть коректний телефон");
        isValid = false;
      }
      if (!cityInput.value.trim()) {
        showFieldError(cityInput, bookForm.querySelector(".city-error"), "Будь ласка, введіть ваше місто");
        isValid = false;
      }
      if (!branchInput.value.trim()) {
        showFieldError(branchInput, bookForm.querySelector(".branch-error"), "Будь ласка, введіть номер відділення");
        isValid = false;
      }
      if (!isValid) return;

      const submitBtn = bookForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = "<span>Відправка...</span>";

      const message =
        `📦 Замовлення книги\n` +
        (emailInput.value ? `Email: ${emailInput.value.trim()}\n` : "") +
        `Місто: ${cityInput.value.trim()}\n` +
        `Відділення НП: №${branchInput.value.trim()}`;

      try {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            message,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Помилка сервера");

        bookForm.style.display = "none";
        if (bookSuccess) bookSuccess.style.display = "block";
      } catch (err) {
        alert("Помилка: " + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });

    setupInputValidation(bookForm);
  }
});
