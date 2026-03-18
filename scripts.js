document.addEventListener("DOMContentLoaded", function () {
  // ── Team slider ───────────────────────────────────────────────────────
  const track = document.getElementById("teamTrack");
  const prevBtn = document.querySelector(".team-arrow-prev");
  const nextBtn = document.querySelector(".team-arrow-next");

  if (track && prevBtn && nextBtn) {
    const slides = track.querySelectorAll(".team-slide");
    const total = slides.length;
    let current = 0;
    const progressBar = document.getElementById("teamProgressBar");

    function getSlidesPerView() {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1280) return 2;
      return 3;
    }

    function updateSlider() {
      const perView = getSlidesPerView();
      const maxIndex = total - perView;
      if (current > maxIndex) current = maxIndex;
      if (current < 0) current = 0;
      const slideWidth = slides[0].offsetWidth;
      track.style.transform = `translateX(-${current * slideWidth}px)`;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current >= maxIndex;
      if (progressBar) {
        const progress = maxIndex > 0 ? (current / maxIndex) * 100 : 100;
        progressBar.style.width = progress + "%";
      }
    }

    prevBtn.addEventListener("click", () => { current--; updateSlider(); });
    nextBtn.addEventListener("click", () => { current++; updateSlider(); });

    window.addEventListener("resize", updateSlider);
    updateSlider();

    // Touch swipe support
    let startX = 0;
    track.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) { current++; } else { current--; }
        updateSlider();
      }
    });

  }

  // ── FAQ accordion ─────────────────────────────────────────────────────
  const faqItems = document.querySelectorAll(".faq .faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("click", function () {
      faqItems.forEach((el) => {
        if (el !== item) el.classList.remove("active");
      });
      item.classList.toggle("active");
    });
  });

  // ── Drag-to-scroll ────────────────────────────────────────────────────
  function makeDraggable(el) {
    let active = false;
    let startX, startScrollLeft, cachedOffsetLeft;

    el.addEventListener("mousedown", (e) => {
      active = true;
      cachedOffsetLeft = el.offsetLeft;
      startX = e.pageX - cachedOffsetLeft;
      startScrollLeft = el.scrollLeft;
      el.classList.add("grabbing", "noselect");
    });

    el.addEventListener("mouseleave", () => {
      active = false;
      el.classList.remove("grabbing", "noselect");
    });

    el.addEventListener("mouseup", () => {
      active = false;
      el.classList.remove("grabbing", "noselect");
    });

    el.addEventListener("mousemove", (e) => {
      if (!active) return;
      e.preventDefault();
      const x = e.pageX - cachedOffsetLeft;
      el.scrollLeft = startScrollLeft - (x - startX) * 2;
    });
  }

  const carousel = document.querySelector(".testimonials-carousel");
  if (carousel) makeDraggable(carousel);

  const serviceSlider = document.querySelector(".services-slider");
  if (serviceSlider) makeDraggable(serviceSlider);

  // ── Burger menu ───────────────────────────────────────────────────────
  const burgerBtn = document.querySelector(".burger");
  const burgerMenu = document.getElementById("burgerMenu");
  const closeBtn = document.querySelector(".burger-close");
  const menuLinks = document.querySelectorAll(".burger-link, .burger-phone, .social-link");

  function openMenu() {
    burgerMenu.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    burgerMenu.classList.remove("active");
    document.body.style.overflow = "";
  }

  burgerBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);
  menuLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("click", function (e) {
    if (!burgerMenu.contains(e.target) && e.target !== burgerBtn && !burgerBtn.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  // ── Sticky socials: hide when scrolled into footer ────────────────────
  const socialsBlock = document.querySelector(".socials-sticky");
  const footer = document.querySelector("footer");

  if (socialsBlock && footer) {
    socialsBlock.style.transition = "opacity 0.3s ease";
    const socialsHeight = socialsBlock.offsetHeight;

    function handleScroll() {
      const footerTop = footer.getBoundingClientRect().top;
      const triggerPoint = window.innerHeight - socialsHeight - 20;
      const hidden = footerTop < triggerPoint;
      socialsBlock.style.opacity = hidden ? "0" : "1";
      socialsBlock.style.pointerEvents = hidden ? "none" : "auto";
    }

    let isTicking = false;
    window.addEventListener("scroll", function () {
      if (!isTicking) {
        window.requestAnimationFrame(function () {
          handleScroll();
          isTicking = false;
        });
        isTicking = true;
      }
    });

    handleScroll();
  }
});
