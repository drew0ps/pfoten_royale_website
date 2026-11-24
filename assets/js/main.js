// Pfoten Royale am See – small progressive enhancements. The page works without JS.

(() => {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");

  // ---------- Header background on scroll ----------
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---------- Mobile navigation ----------
  const setNav = (open) => {
    nav.classList.toggle("is-open", open);
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menü schliessen" : "Menü öffnen");
  };

  toggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setNav(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) setNav(false);
  });

  // ---------- Active section highlight in nav ----------
  const navLinks = [...nav.querySelectorAll("ul a")];
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) =>
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`),
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  navLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) sectionObserver.observe(section);
  });

  // ---------- Reveal on scroll ----------
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  // ---------- Gallery lightbox ----------
  const lightbox = document.querySelector("[data-lightbox]");
  const lbImg = lightbox.querySelector("[data-lb-img]");
  const lbCaption = lightbox.querySelector("[data-lb-caption]");
  const items = [...document.querySelectorAll("[data-gallery] button")].map((button) => {
    const img = button.querySelector("img");
    const title = button.querySelector(".gallery-caption strong");
    return { src: img.currentSrc || img.src, alt: img.alt, caption: title ? title.textContent : img.alt };
  });
  let current = 0;

  const show = (index) => {
    current = (index + items.length) % items.length;
    const item = items[current];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCaption.textContent = `${item.caption} · ${current + 1} / ${items.length}`;
  };

  document.querySelector("[data-gallery]").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-index]");
    if (!button) return;
    show(Number(button.dataset.index));
    lightbox.showModal();
  });

  lightbox.querySelector("[data-lb-prev]").addEventListener("click", () => show(current - 1));
  lightbox.querySelector("[data-lb-next]").addEventListener("click", () => show(current + 1));
  lightbox.querySelector("[data-lb-close]").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target.tagName === "FIGURE") lightbox.close();
  });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });

  // Swipe support on touch devices
  let touchX = null;
  lightbox.addEventListener("touchstart", (event) => (touchX = event.touches[0].clientX), { passive: true });
  lightbox.addEventListener("touchend", (event) => {
    if (touchX === null) return;
    const delta = event.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 50) show(current + (delta < 0 ? 1 : -1));
    touchX = null;
  });

  // ---------- Footer year ----------
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
