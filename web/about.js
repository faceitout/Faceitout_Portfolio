document.addEventListener("DOMContentLoaded", async () => {
  const aboutLogoElement = document.getElementById("aboutLogo");
  const aboutBrandElement = document.querySelector(".about-brand");
  const aboutMenuElement = document.getElementById("aboutMenu");
  const aboutStartProjectElement = document.getElementById("aboutStartProject");
  const aboutDetailElement = document.getElementById("aboutDetail");

  const aboutCopyrightElement = document.getElementById("aboutCopyright");
  const aboutSocialElement = document.getElementById("aboutSocial");
  const aboutCreditElement = document.getElementById("aboutCredit");

  const aboutDesktopLogoSrc = "./assets/images/LOGO.svg";
  const aboutMobileLogoSrc = "./assets/images/LOGO2.svg";
  const aboutMobileMediaQuery = window.matchMedia("(max-width: 48rem)");

  const aboutMobileToggleElements = Array.from(
    new Set(
      [
        ...document.querySelectorAll("[data-about-mobile-toggle]"),
        ...document.querySelectorAll(".about-mobile-menu-word"),
        ...document.querySelectorAll(".about-mobile-menu-button"),
        document.getElementById("aboutMobileMenuToggle")
      ].filter(Boolean)
    )
  );

  const aboutMobileMenuWordElement = document.querySelector(".about-mobile-menu-word");
  const aboutMobileMenuPanelElement = document.getElementById("aboutMobileMenuPanel");
  const aboutMobileMenuElement = document.getElementById("aboutMobileMenu");
  const aboutMobileSocialElement = document.getElementById("aboutMobileSocial");
  const aboutMobileCreditElement = document.getElementById("aboutMobileCredit");

  let aboutData = null;

  function escapeHTML(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeLabel(value) {
    return String(value || "").trim().toUpperCase();
  }

  function isExternalUrl(href) {
    return /^https?:\/\//i.test(String(href || ""));
  }

  function getExternalAttrs(href) {
    return isExternalUrl(href) ? 'target="_blank" rel="noopener noreferrer"' : "";
  }

  function createRollingText(label, hoverLabel = label) {
    const safeLabel = escapeHTML(label);
    const safeHoverLabel = escapeHTML(hoverLabel);

    return `
      <span class="text-roll" aria-hidden="true">
        <span class="text-roll__inner">
          <span class="text-roll__line text-roll__line--default">${safeLabel}</span>
          <span class="text-roll__line text-roll__line--hover">${safeHoverLabel}</span>
        </span>
      </span>
    `;
  }

  function updateAboutLogoForViewport() {
    if (!aboutLogoElement) return;

    const isMobile = aboutMobileMediaQuery.matches;

    aboutLogoElement.src = isMobile ? aboutMobileLogoSrc : aboutDesktopLogoSrc;
    aboutLogoElement.alt = aboutData?.logo?.text || "faceitout";
  }

  function createAboutSocialLinks(links = [], className = "about-content__link") {
    return links
      .map((link, index, array) => {
        const label = normalizeLabel(link.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(link.href || "#");
        const separator = index < array.length - 1 ? "/" : "";

        return `
          <a
            class="${className}"
            href="${safeHref}"
            ${getExternalAttrs(link.href)}
            aria-label="${safeLabel}"
          >
            ${safeLabel}
          </a>
          ${
            separator
              ? `<span class="about-content__separator" aria-hidden="true">${separator}</span>`
              : ""
          }
        `;
      })
      .join("");
  }

  function createAboutHeadline(headlineLines) {
    const lines = Array.isArray(headlineLines) && headlineLines.length
      ? headlineLines
      : ["HEY. SOY ALMU :)"];

    const ariaLabel = lines.join(" ");

    return `
      <h1
        class="about-hero__headline"
        id="aboutHeadline"
        aria-label="${escapeHTML(ariaLabel)}"
      >
        ${lines
          .map((line) => `<span class="about-hero__headline-line">${escapeHTML(line)}</span>`)
          .join("")}
      </h1>
    `;
  }

  function createAboutImage(image) {
    const imageData = image || {};
    const safeSrc = escapeHTML(imageData.src || "./assets/images/Yo.jpg");
    const safeAlt = escapeHTML(imageData.alt || "Imagen About");
    const safePosition = escapeHTML(imageData.position || "50% 50%");
    const safeFit = escapeHTML(imageData.fit || "cover");

    return `
      <figure
        class="about-hero__media"
        style="
          --about-media-position: ${safePosition};
          --about-media-fit: ${safeFit};
        "
      >
        <img
          class="about-hero__image"
          src="${safeSrc}"
          alt="${safeAlt}"
          loading="eager"
          decoding="async"
        />
      </figure>
    `;
  }

  function createAboutParagraphs(paragraphs) {
    const safeParagraphs = Array.isArray(paragraphs) && paragraphs.length
      ? paragraphs
      : [];

    return safeParagraphs
      .map((paragraph) => {
        return `<p class="about-content__paragraph">${escapeHTML(paragraph)}</p>`;
      })
      .join("");
  }

  function createAboutLines(lines) {
    const safeLines = Array.isArray(lines) ? lines : [];

    return safeLines
      .map((line) => {
        return `<span class="about-content__line">${escapeHTML(normalizeLabel(line))}</span>`;
      })
      .join("");
  }

  function createAboutSections(sections) {
    const safeSections = Array.isArray(sections) ? sections : [];

    return safeSections
      .map((section) => {
        const label = normalizeLabel(section.label);
        const type = section.type || "text";

        let valueHTML = "";

        if (type === "lines") {
          valueHTML = createAboutLines(section.lines);
        } else if (type === "links") {
          valueHTML = `
            <div class="about-content__links">
              ${createAboutSocialLinks(section.links)}
            </div>
          `;
        } else if (type === "email") {
          const emailLabel = normalizeLabel(section.value);
          const safeEmailLabel = escapeHTML(emailLabel);
          const safeHref = escapeHTML(section.href || `mailto:${section.value || ""}`);

          valueHTML = `
            <a
              class="about-content__contact-link"
              href="${safeHref}"
              aria-label="${safeEmailLabel}"
            >
              ${safeEmailLabel}
            </a>
          `;
        } else {
          valueHTML = `<span>${escapeHTML(normalizeLabel(section.value))}</span>`;
        }

        return `
          <section class="about-content__block about-content__block--${escapeHTML(type)}">
            <p class="about-content__label">${escapeHTML(label)}</p>

            <div class="about-content__value">
              ${valueHTML}
            </div>
          </section>
        `;
      })
      .join("");
  }

  function renderAboutPage() {
    if (!aboutDetailElement || !aboutData?.about) return;

    const aboutInfo = aboutData.about;
    const introLabel = normalizeLabel(aboutInfo.introLabel || "SOBRE MI");

    aboutDetailElement.innerHTML = `
      <section class="about-hero" aria-labelledby="aboutHeadline">
        ${createAboutImage(aboutInfo.image)}
        ${createAboutHeadline(aboutInfo.headlineLines)}
      </section>

      <section class="about-content" aria-label="Información sobre mí">
        <section class="about-content__block about-content__block--intro">
          <p class="about-content__label">${escapeHTML(introLabel)}</p>

          <div class="about-content__text">
            ${createAboutParagraphs(aboutInfo.descriptionParagraphs)}
          </div>
        </section>

        ${createAboutSections(aboutInfo.sections)}
      </section>
    `;
  }

  function initAboutHeadlineScramble() {
    const headlineElement = document.getElementById("aboutHeadline");

    if (!headlineElement) return;

    const lineElements = Array.from(
      headlineElement.querySelectorAll(".about-hero__headline-line")
    );

    if (!lineElements.length) return;

    const finalLines = lineElements.map((line) => line.textContent || "");
    const scrambleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?#$%&@";
    const characterStagger = 18;
    const characterSettleDuration = 240;

    let animationFrameId = null;
    let hasPlayed = false;

    function getRandomCharacter() {
      const randomIndex = Math.floor(Math.random() * scrambleCharacters.length);
      return scrambleCharacters[randomIndex];
    }

    function getTotalCharacters() {
      return finalLines.reduce((total, line) => {
        return total + Array.from(line).filter((char) => char !== " ").length;
      }, 0);
    }

    function renderLines(lines) {
      lineElements.forEach((lineElement, index) => {
        lineElement.textContent = lines[index] || "";
      });
    }

    function renderFinalText() {
      renderLines(finalLines);
      headlineElement.classList.remove("is-scrambling");
    }

    function renderScrambledText(elapsedTime) {
      let characterIndex = 0;

      const nextLines = finalLines.map((line) => {
        return Array.from(line)
          .map((character) => {
            if (character === " ") return " ";

            const characterStart = characterIndex * characterStagger;
            const characterProgress =
              (elapsedTime - characterStart) / characterSettleDuration;

            characterIndex += 1;

            if (characterProgress >= 1) return character;

            return getRandomCharacter();
          })
          .join("");
      });

      renderLines(nextLines);
    }

    function playScrambleOnce() {
      if (hasPlayed) return;

      hasPlayed = true;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        renderFinalText();
        return;
      }

      headlineElement.classList.add("is-scrambling");

      const startedAt = performance.now();
      const totalCharacters = getTotalCharacters();
      const totalDuration =
        totalCharacters * characterStagger + characterSettleDuration;

      function tick(now) {
        const elapsedTime = now - startedAt;

        renderScrambledText(elapsedTime);

        if (elapsedTime < totalDuration) {
          animationFrameId = window.requestAnimationFrame(tick);
          return;
        }

        renderFinalText();

        if (animationFrameId) {
          window.cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }

      animationFrameId = window.requestAnimationFrame(tick);
    }

    renderFinalText();
    window.setTimeout(playScrambleOnce, 450);
  }

  function setAboutMobileMenuOpen(isOpen) {
    document.body.classList.toggle("is-about-mobile-menu-open", isOpen);

    if (aboutMobileMenuPanelElement) {
      aboutMobileMenuPanelElement.setAttribute("aria-hidden", String(!isOpen));
    }

    if (aboutMobileMenuWordElement) {
      aboutMobileMenuWordElement.textContent = isOpen ? "MENU" : "ABOUT";
    }

    aboutMobileToggleElements.forEach((toggle) => {
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });
  }

  function initAboutMobileMenu() {
    if (!aboutMobileToggleElements.length || !aboutMobileMenuPanelElement) return;

    setAboutMobileMenuOpen(false);

    aboutMobileToggleElements.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const isOpen = document.body.classList.contains("is-about-mobile-menu-open");
        setAboutMobileMenuOpen(!isOpen);
      });
    });

    aboutMobileMenuPanelElement.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");

      if (link) {
        setAboutMobileMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setAboutMobileMenuOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        setAboutMobileMenuOpen(false);
      }

      updateAboutLogoForViewport();
    });
  }

  function initAboutEntranceAnimation() {
    if (typeof gsap === "undefined") return;

    const entranceElements = [
      ".about-brand",
      ".about-nav__item",
      ".about-start",
      ".about-hero__media",
      ".about-hero__headline",
      ".about-content__block",
      ".about-footer__copyright",
      ".about-footer__social",
      ".about-footer__credit"
    ];

    gsap.fromTo(
      entranceElements,
      {
        y: 18,
        autoAlpha: 0
      },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.75,
        stagger: 0.035,
        ease: "sine.out",
        clearProps: "opacity,visibility,transform"
      }
    );
  }

  function initMobileMenuAnimation() {
    if (
      typeof gsap === "undefined" ||
      !aboutMobileMenuPanelElement ||
      !aboutMobileToggleElements.length
    ) {
      return;
    }

    aboutMobileToggleElements.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const isOpening = document.body.classList.contains("is-about-mobile-menu-open");

        if (!isOpening) return;

        gsap.fromTo(
          [
            ".about-mobile-menu-list__item",
            ".about-mobile-menu-social__link",
            ".about-mobile-menu-credit"
          ],
          {
            y: 18,
            autoAlpha: 0
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.55,
            stagger: 0.045,
            ease: "sine.out",
            clearProps: "opacity,visibility,transform"
          }
        );
      });
    });
  }

  function initDraggableLogo() {
    if (window.innerWidth <= 768) return;

    if (
      !aboutBrandElement ||
      typeof gsap === "undefined" ||
      typeof Draggable === "undefined"
    ) {
      return;
    }

    gsap.registerPlugin(Draggable);

    gsap.set(aboutBrandElement, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      transformOrigin: "50% 50%"
    });

    gsap.fromTo(
      aboutBrandElement,
      {
        scale: 0,
        rotation: -18,
        autoAlpha: 0
      },
      {
        scale: 1,
        rotation: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "elastic.out(1, 0.65)",
        delay: 0.1
      }
    );

    Draggable.create(aboutBrandElement, {
      type: "x,y",
      zIndexBoost: false,
      minimumMovement: 4,

      onPress() {
        gsap.killTweensOf(aboutBrandElement);
        aboutBrandElement.classList.add("is-dragging");

        gsap.to(aboutBrandElement, {
          scale: 1.08,
          rotation: -4,
          duration: 0.18,
          ease: "power2.out",
          overwrite: "auto"
        });
      },

      onDrag() {
        const rotationAmount = gsap.utils.clamp(-12, 12, this.x * 0.045);

        gsap.to(aboutBrandElement, {
          rotation: rotationAmount,
          duration: 0.12,
          ease: "power2.out",
          overwrite: "auto"
        });
      },

      onRelease() {
        aboutBrandElement.classList.remove("is-dragging");

        gsap.to(aboutBrandElement, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.75,
          ease: "elastic.out(1, 0.55)",
          overwrite: "auto"
        });
      }
    });
  }

  try {
    const response = await fetch("./data/about.json");

    if (!response.ok) {
      throw new Error(`Error cargando about.json: ${response.status}`);
    }

    aboutData = await response.json();
  } catch (error) {
    console.error("No se pudo cargar el JSON de about:", error);

    if (aboutDetailElement) {
      aboutDetailElement.innerHTML = `
        <section class="about-page__error">
          <p>No se pudo cargar la información de About.</p>
        </section>
      `;
    }

    return;
  }

  updateAboutLogoForViewport();

  if (typeof aboutMobileMediaQuery.addEventListener === "function") {
    aboutMobileMediaQuery.addEventListener("change", updateAboutLogoForViewport);
  } else if (typeof aboutMobileMediaQuery.addListener === "function") {
    aboutMobileMediaQuery.addListener(updateAboutLogoForViewport);
  }

  if (aboutBrandElement && aboutData.logo) {
    aboutBrandElement.href = aboutData.logo.href || "./home.html";
  }

  if (aboutMenuElement && Array.isArray(aboutData.menu)) {
    aboutMenuElement.innerHTML = aboutData.menu
      .map((item, index, array) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");
        const separator = index < array.length - 1 ? "," : "";
        const currentClass = item.current ? " is-current" : "";
        const ariaCurrent = item.current ? 'aria-current="page"' : "";

        return `
          <li class="about-nav__item">
            <a
              class="about-nav__link${currentClass}"
              href="${safeHref}"
              aria-label="${safeLabel}"
              ${ariaCurrent}
            >
              ${createRollingText(label)}
            </a>${separator}
          </li>
        `;
      })
      .join("");
  }

  if (aboutMobileMenuElement && Array.isArray(aboutData.menu)) {
    const mobileItems = [
      ...aboutData.menu,
      {
        label: "HOME",
    href: "./home.html"
      }
    ];

    aboutMobileMenuElement.innerHTML = mobileItems
      .map((item) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");
        const currentClass = item.current ? " is-current" : "";
        const ariaCurrent = item.current ? 'aria-current="page"' : "";

        return `
          <li class="about-mobile-menu-list__item">
            <a
              class="about-mobile-menu-list__link${currentClass}"
              href="${safeHref}"
              aria-label="${safeLabel}"
              ${ariaCurrent}
            >
              ${safeLabel}
            </a>
          </li>
        `;
      })
      .join("");
  }

  if (aboutStartProjectElement) {
    const startLabel = aboutData.startProject?.label || "START A PROJECT";
    const startHoverLabel = aboutData.startProject?.hoverLabel || "GET IN TOUCH";

    aboutStartProjectElement.innerHTML = createRollingText(
      startLabel,
      startHoverLabel
    );

    aboutStartProjectElement.setAttribute("aria-label", startLabel);

    aboutStartProjectElement.href =
      aboutData.startProject?.href ||
      "mailto:almudenaestevez23@gmail.com";
  }

  if (aboutCopyrightElement) {
    aboutCopyrightElement.textContent =
      aboutData.footer?.copyright || "© 2026 FACEITOUT";
  }

  if (aboutSocialElement && Array.isArray(aboutData.footer?.social)) {
    aboutSocialElement.innerHTML = aboutData.footer.social
      .map((item, index, array) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");
        const separator = index < array.length - 1 ? "/" : "";

        return `
          <a
            class="about-footer__social-link"
            href="${safeHref}"
            ${getExternalAttrs(item.href)}
            aria-label="${safeLabel}"
          >
            ${createRollingText(label)}
          </a>
          ${
            separator
              ? `<span class="about-footer__separator" aria-hidden="true">${separator}</span>`
              : ""
          }
        `;
      })
      .join("");
  }

  if (aboutMobileSocialElement && Array.isArray(aboutData.footer?.social)) {
    aboutMobileSocialElement.innerHTML = aboutData.footer.social
      .map((item) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");

        return `
          <a
            class="about-mobile-menu-social__link"
            href="${safeHref}"
            ${getExternalAttrs(item.href)}
            aria-label="${safeLabel}"
          >
            ${safeLabel}
          </a>
        `;
      })
      .join("");
  }

  if (aboutCreditElement) {
    const creditLabel = aboutData.footer?.credit || "DESIGNED BY ALMU ESTEVEZ :)";

    aboutCreditElement.innerHTML = createRollingText(creditLabel);
    aboutCreditElement.setAttribute("aria-label", creditLabel);
  }

  if (aboutMobileCreditElement) {
    aboutMobileCreditElement.textContent =
      aboutData.footer?.credit || "DESIGNED BY ALMU ESTEVEZ :)";
  }

  renderAboutPage();
  initAboutMobileMenu();
  initMobileMenuAnimation();
  initAboutEntranceAnimation();
  initAboutHeadlineScramble();
  initDraggableLogo();
});