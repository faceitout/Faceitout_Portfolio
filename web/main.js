document.addEventListener("DOMContentLoaded", () => {
  initCustomCursor();
  initThemeToggles();
  initClock();
  initLegacyMobileMenu();
});

function initCustomCursor() {
  const customCursor = document.getElementById("customCursor");

  if (!customCursor) return;

  const supportsCustomCursor = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  if (!supportsCustomCursor) {
    customCursor.style.display = "none";
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let hasMoved = false;

  const hoverSelector = [
    "a",
    "button",
    "[role='button']",
    "input",
    "textarea",
    "select",
    "summary",
    "label"
  ].join(", ");

  function setCursorState(target) {
    const hoverTarget = target?.closest?.(hoverSelector);

    customCursor.classList.remove("is-hover");

    if (hoverTarget) {
      customCursor.classList.add("is-hover");
    }
  }

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.22;
    cursorY += (mouseY - cursorY) * 0.22;

    customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(renderCursor);
  }

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    hasMoved = true;

    customCursor.classList.add("is-visible");
    setCursorState(event.target);
  });

  document.addEventListener("mouseover", (event) => {
    if (!hasMoved) return;

    setCursorState(event.target);
  });

  document.addEventListener("mouseleave", () => {
    customCursor.classList.remove("is-visible", "is-hover");
  });

  document.addEventListener("mouseenter", () => {
    if (!hasMoved) return;

    customCursor.classList.add("is-visible");
  });

  window.addEventListener("blur", () => {
    customCursor.classList.remove("is-visible", "is-hover");
  });

  renderCursor();
}

function initThemeToggles() {
  const themeToggleElements = Array.from(
    document.querySelectorAll("[data-theme-toggle]")
  );

  if (!themeToggleElements.length) return;

  const storageKey = "faceitout-theme";

  function getStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.warn("No se pudo guardar el tema:", error);
    }
  }

  function applyTheme(theme) {
    const isLight = theme === "light";

    document.body.classList.toggle("is-light", isLight);

    themeToggleElements.forEach((toggle) => {
      toggle.setAttribute("aria-pressed", String(isLight));
      toggle.setAttribute(
        "aria-label",
        isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"
      );
    });
  }

  const storedTheme = getStoredTheme();

  if (storedTheme === "light" || storedTheme === "dark") {
    applyTheme(storedTheme);
  } else {
    applyTheme(document.body.classList.contains("is-light") ? "light" : "dark");
  }

  themeToggleElements.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("is-light")
        ? "dark"
        : "light";

      applyTheme(nextTheme);
      setStoredTheme(nextTheme);
    });
  });
}

function initClock() {
  const clockElement = document.getElementById("clock");

  if (!clockElement) return;

  function renderClock() {
    const now = new Date();

    clockElement.textContent = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  renderClock();
  window.setInterval(renderClock, 1000);
}

function initLegacyMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenuPanel = document.getElementById("mobileMenuPanel");

  if (!menuToggle || !mobileMenuPanel) return;

  function setMenuOpen(isOpen) {
    document.body.classList.toggle("is-mobile-menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    mobileMenuPanel.setAttribute("aria-hidden", String(!isOpen));
  }

  setMenuOpen(false);

  menuToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.contains("is-mobile-menu-open");

    setMenuOpen(!isOpen);
  });

  mobileMenuPanel.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");

    if (link) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      setMenuOpen(false);
    }
  });
}