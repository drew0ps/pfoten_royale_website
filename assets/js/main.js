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

  // ---------- Service picker ----------
  // Prices come from data attributes in the Preise section, so the HTML stays the single source of truth.
  const PHONE = "41765246598";
  const EMAIL = "pfotenroyale@gmail.com";
  const picker = document.querySelector("[data-picker]");

  if (picker) {
    const summary = picker.querySelector("[data-summary]");
    const summaryList = picker.querySelector("[data-summary-list]");
    const summaryEmpty = picker.querySelector("[data-summary-empty]");
    const summaryTotal = picker.querySelector("[data-summary-total]");
    const sizeClear = picker.querySelector("[data-size-clear]");
    const quoteBar = document.querySelector("[data-quote-bar]");
    const quoteTotal = document.querySelector("[data-quote-total]");
    const contactNote = document.querySelector("[data-contact-note]");
    const contactNoteTotal = document.querySelector("[data-contact-note-total]");
    const sizeInputs = [...picker.querySelectorAll('input[name="size"]')];
    const serviceInputs = [...picker.querySelectorAll('input[name="service"]')];

    const clean = (text) => text.replace(/\s+/g, " ").trim();
    const priceText = (input) =>
      clean(input.closest("label").querySelector(".option-price, .tier-price").textContent);

    const formatTotal = (min, max) => {
      if (max === null) return `ab ${min} CHF`;
      return min === max ? `${min} CHF` : `${min}–${max} CHF`;
    };

    const readState = () => {
      const items = [...sizeInputs, ...serviceInputs].filter((input) => input.checked && !input.disabled);
      let min = 0;
      let max = 0;
      let priced = 0;
      items.forEach((input) => {
        if (input.dataset.min === undefined) return; // "auf Anfrage"
        priced += 1;
        min += Number(input.dataset.min);
        max = input.dataset.max === undefined || max === null ? null : max + Number(input.dataset.max);
      });
      const size = sizeInputs.find((input) => input.checked);
      return {
        items: items.map((input) => ({ label: input.dataset.label, price: priceText(input) })),
        total: priced ? formatTotal(min, max) : null,
        onRequest: items.some((input) => input.dataset.min === undefined),
        size: size ? size.dataset.label : null,
        dog: clean(picker.elements.dog.value),
        date: clean(picker.elements.date.value),
      };
    };

    const buildMessage = (state, { whatsapp }) => {
      const bold = (text) => (whatsapp ? `*${text}*` : text);
      const lines = ["Hallo Pfoten Royale,", "", "ich möchte gerne einen Termin anfragen."];
      if (state.items.length) {
        lines.push("", bold("Gewünschte Leistungen:"));
        state.items.forEach((item) => lines.push(`– ${item.label}: ${item.price}`));
        if (state.total) {
          const extra = state.onRequest ? ", zzgl. Pick-up auf Anfrage" : "";
          lines.push("", `${bold("Richtpreis:")} ${state.total}${extra}`);
        }
      }
      if (state.dog || state.date) lines.push("");
      if (state.dog) lines.push(`Hund: ${state.dog}`);
      if (state.date) lines.push(`Wunschtermin: ${state.date}`);
      lines.push("", "Vielen Dank und freundliche Grüsse");
      return lines.join(whatsapp ? "\n" : "\r\n");
    };

    const updateLinks = (state) => {
      const waHref = `https://wa.me/${PHONE}?text=${encodeURIComponent(buildMessage(state, { whatsapp: true }))}`;
      const subject = state.size ? `Terminanfrage (${state.size.replace(" – ", " ")})` : "Terminanfrage";
      const body = buildMessage(state, { whatsapp: false });
      const mailHref = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      document.querySelectorAll('[data-contact="whatsapp"]').forEach((link) => (link.href = waHref));
      document.querySelectorAll('[data-contact="email"]').forEach((link) => (link.href = mailHref));
    };

    // Services that are part of the Komplettpflege can't be booked on top of it
    const syncIncluded = () => {
      const hasSize = sizeInputs.some((input) => input.checked);
      serviceInputs
        .filter((input) => input.hasAttribute("data-included"))
        .forEach((input) => {
          const price = input.closest("label").querySelector(".option-price");
          input.disabled = hasSize;
          if (hasSize) input.checked = false;
          price.textContent = hasSize ? "inklusive" : price.dataset.price;
        });
      sizeClear.hidden = !hasSize;
    };

    let summaryVisible = false;
    let pricesVisible = false;
    let lastState = readState();

    const syncQuoteBar = () => {
      const show = lastState.items.length > 0 && pricesVisible && !summaryVisible;
      quoteBar.hidden = !show;
      document.body.classList.toggle("quote-bar-visible", show);
    };

    const update = () => {
      syncIncluded();
      const state = readState();
      lastState = state;
      const totalText = state.total || (state.onRequest ? "auf Anfrage" : "–");

      summaryList.replaceChildren(
        ...state.items.map((item) => {
          const li = document.createElement("li");
          const name = document.createElement("span");
          const price = document.createElement("span");
          name.textContent = item.label;
          price.textContent = item.price;
          li.append(name, price);
          return li;
        }),
      );
      summaryEmpty.hidden = state.items.length > 0;
      summaryTotal.textContent = totalText;
      quoteTotal.textContent = totalText;
      contactNote.hidden = state.items.length === 0;
      contactNoteTotal.textContent = `Richtpreis ${totalText}`;

      updateLinks(state);
      syncQuoteBar();
    };

    picker.addEventListener("change", update);
    picker.addEventListener("input", update);
    picker.addEventListener("submit", (event) => event.preventDefault());
    picker.addEventListener("reset", () => requestAnimationFrame(update));
    sizeClear.addEventListener("click", () => {
      sizeInputs.forEach((input) => (input.checked = false));
      update();
    });

    new IntersectionObserver(([entry]) => {
      summaryVisible = entry.isIntersecting;
      syncQuoteBar();
    }).observe(summary);
    new IntersectionObserver(([entry]) => {
      pricesVisible = entry.isIntersecting;
      syncQuoteBar();
    }).observe(document.querySelector("#preise"));

    summary.hidden = false;
    update();
  }

  // ---------- Footer year ----------
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
