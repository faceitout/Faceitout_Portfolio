document.addEventListener("DOMContentLoaded", async () => {
  const workLogoElement = document.getElementById("workLogo");
  const workBrandElement = document.querySelector(".work-brand");
  const workMenuElement = document.getElementById("workMenu");
  const workStartProjectElement = document.getElementById("workStartProject");
  const workGridElement = document.getElementById("workGrid");
  const workGalleryCtaElement = document.getElementById("workGalleryCta");

  const workCopyrightElement = document.getElementById("workCopyright");
  const workSocialElement = document.getElementById("workSocial");
  const workCreditElement = document.getElementById("workCredit");

  const workDesktopLogoSrc = "./assets/images/LOGO.svg";
  const workMobileLogoSrc = "./assets/images/LOGO2.svg";
  const workMobileMediaQuery = window.matchMedia("(max-width: 48rem)");

  const workMobileToggleElements = Array.from(
    new Set(
      [
        ...document.querySelectorAll("[data-work-mobile-toggle]"),
        ...document.querySelectorAll(".work-mobile-menu-word"),
        ...document.querySelectorAll(".work-mobile-menu-button"),
        document.getElementById("workMobileMenuToggle")
      ].filter(Boolean)
    )
  );

  const workMobileMenuWordElement = document.querySelector(
    ".work-mobile-menu-word"
  );
  const workMobileMenuPanelElement = document.getElementById(
    "workMobileMenuPanel"
  );
  const workMobileMenuElement = document.getElementById("workMobileMenu");
  const workMobileSocialElement = document.getElementById("workMobileSocial");
  const workMobileCreditElement = document.getElementById("workMobileCredit");

  let workData;

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
    return isExternalUrl(href)
      ? 'target="_blank" rel="noopener noreferrer"'
      : "";
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

  function isVideoSource(src) {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(String(src || ""));
  }

  function updateWorkLogoForViewport() {
    if (!workLogoElement) return;

    const isMobile = workMobileMediaQuery.matches;

    workLogoElement.src = isMobile ? workMobileLogoSrc : workDesktopLogoSrc;
    workLogoElement.alt = workData?.logo?.text || "faceitout";
  }

  function getProjectMeta(project) {
    const rawTags = String(project.tags || "")
      .split(",")
      .map((tag) => normalizeLabel(tag))
      .filter(Boolean);

    const firstTag = rawTags[0] || "";
    const secondTag = rawTags.slice(1).join(" / ") || "";
    const year = normalizeLabel(project.year) || "";

    return {
      firstTag,
      secondTag,
      year
    };
  }

  function getProjectHoverMedia(project) {
    if (project.hoverVideo) {
      return project.hoverVideo;
    }

    if (project.hoverMedia) {
      return project.hoverMedia;
    }

    if (Array.isArray(project.hoverImages) && project.hoverImages.length) {
      return project.hoverImages[0];
    }

    return project.image || "./assets/images/Cartel_01.jpg";
  }

  function createProjectHoverPreview(project) {
    const hoverMedia = getProjectHoverMedia(project);
    const safeHoverMedia = escapeHTML(hoverMedia);

    const previewMediaHTML = isVideoSource(hoverMedia)
      ? `
          <video
            class="work-card-hover-preview__image is-active"
            src="${safeHoverMedia}"
            muted
            loop
            playsinline
            preload="auto"
          ></video>
        `
      : `
          <img
            class="work-card-hover-preview__image is-active"
            src="${safeHoverMedia}"
            alt=""
            loading="eager"
            decoding="async"
          />
        `;

    return `
      <div class="work-card-hover-preview" aria-hidden="true">
        <div class="work-card-hover-preview__inner">
          ${previewMediaHTML}
        </div>
      </div>
    `;
  }

  function createProjectCard(project, index) {
    const title = normalizeLabel(project.title || "PROJECT");
    const href = escapeHTML(project.href || "#");
    const image = escapeHTML(project.image || "");
    const alt = escapeHTML(project.alt || title);
    const transitionLabel = escapeHTML(title);
    const { firstTag, secondTag, year } = getProjectMeta(project);
    const loading = index < 2 ? "eager" : "lazy";

    return `
      <article class="work-card">
        <a
          class="work-card__link"
          href="${href}"
          aria-label="Ver proyecto ${escapeHTML(title)}"
          data-site-transition-label="${transitionLabel}"
        >
          <figure class="work-card__media">
            <img
              class="work-card__image"
              src="${image}"
              alt="${alt}"
              loading="${loading}"
              decoding="async"
            />

            ${createProjectHoverPreview(project)}
          </figure>

          <h2 class="work-card__title">“${escapeHTML(title)}”</h2>

          <div class="work-card__info" aria-label="Información del proyecto">
            <span class="work-card__info-cell">${escapeHTML(firstTag)}</span>
            <span class="work-card__info-cell">${escapeHTML(secondTag)}</span>
            <span class="work-card__info-cell">${escapeHTML(year)}</span>
          </div>
        </a>
      </article>
    `;
  }

  try {
    const response = await fetch("./data/work.json");

    if (!response.ok) {
      throw new Error(`Error cargando work.json: ${response.status}`);
    }

    workData = await response.json();
  } catch (error) {
    console.error("No se pudo cargar el JSON de work:", error);
    return;
  }

  updateWorkLogoForViewport();

  if (typeof workMobileMediaQuery.addEventListener === "function") {
    workMobileMediaQuery.addEventListener("change", updateWorkLogoForViewport);
  } else if (typeof workMobileMediaQuery.addListener === "function") {
    workMobileMediaQuery.addListener(updateWorkLogoForViewport);
  }

  if (workBrandElement && workData.logo) {
    workBrandElement.href = workData.logo.href || "./home.html";
  }

  if (workMenuElement && Array.isArray(workData.menu)) {
    workMenuElement.innerHTML = workData.menu
      .map((item, index, array) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");
        const separator = index < array.length - 1 ? "," : "";
        const currentClass = item.current ? " is-current" : "";
        const ariaCurrent = item.current ? 'aria-current="page"' : "";

        return `
          <li class="work-nav__item">
            <a
              class="work-nav__link${currentClass}"
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

  if (workMobileMenuElement && Array.isArray(workData.menu)) {
    const mobileItems = [
      ...workData.menu,
      {
        label: "HOME",
        href: "./home.html"
      }
    ];

    workMobileMenuElement.innerHTML = mobileItems
      .map((item) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");
        const currentClass = item.current ? " is-current" : "";
        const ariaCurrent = item.current ? 'aria-current="page"' : "";

        return `
          <li class="work-mobile-menu-list__item">
            <a
              class="work-mobile-menu-list__link${currentClass}"
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

  if (workStartProjectElement) {
    const startLabel = workData.startProject?.label || "START A PROJECT";
    const startHoverLabel =
      workData.startProject?.hoverLabel || "GET IN TOUCH";

    workStartProjectElement.innerHTML = createRollingText(
      startLabel,
      startHoverLabel
    );

    workStartProjectElement.setAttribute("aria-label", startLabel);

    workStartProjectElement.href =
      workData.startProject?.href ||
      "mailto:almudenaestevez23@gmail.com";
  }

  if (workGridElement && Array.isArray(workData.projects)) {
    const projectCardsHTML = workData.projects
      .map((project, index) => createProjectCard(project, index))
      .join("");

    const emptyCellHTML =
      workData.projects.length % 2 !== 0
        ? '<article class="work-card work-card--empty" aria-hidden="true"></article>'
        : "";

    workGridElement.innerHTML = projectCardsHTML + emptyCellHTML;
  }

  if (workGalleryCtaElement) {
    workGalleryCtaElement.href = workData.galleryCta?.href || "./gallery.html";
    workGalleryCtaElement.innerHTML =
      workData.galleryCta?.labelHTML || "EXPLORE THE<br />GALLERY";
  }

  if (workCopyrightElement && workData.footer?.copyright) {
    workCopyrightElement.textContent = workData.footer.copyright;
  }

  if (workSocialElement && Array.isArray(workData.footer?.social)) {
    workSocialElement.innerHTML = workData.footer.social
      .map((item, index, array) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");
        const separator = index < array.length - 1 ? "/" : "";

        return `
          <a
            class="work-footer__social-link"
            href="${safeHref}"
            ${getExternalAttrs(item.href)}
            aria-label="${safeLabel}"
          >
            ${createRollingText(label)}
          </a>
          ${
            separator
              ? `<span class="work-footer__separator" aria-hidden="true">${separator}</span>`
              : ""
          }
        `;
      })
      .join("");
  }

  if (workMobileSocialElement && Array.isArray(workData.footer?.social)) {
    workMobileSocialElement.innerHTML = workData.footer.social
      .map((item) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");

        return `
          <a
            class="work-mobile-menu-social__link"
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

  if (workCreditElement) {
    const creditLabel =
      workData.footer?.credit || "DESIGNED BY ALMU ESTEVEZ :)";

    workCreditElement.innerHTML = createRollingText(creditLabel);
    workCreditElement.setAttribute("aria-label", creditLabel);
  }

  if (workMobileCreditElement) {
    workMobileCreditElement.textContent =
      workData.footer?.credit || "DESIGNED BY ALMU ESTEVEZ :)";
  }

  function setWorkMobileMenuOpen(isOpen) {
    document.body.classList.toggle("is-work-mobile-menu-open", isOpen);

    if (workMobileMenuPanelElement) {
      workMobileMenuPanelElement.setAttribute("aria-hidden", String(!isOpen));
    }

    if (workMobileMenuWordElement) {
      workMobileMenuWordElement.textContent = isOpen ? "MENU" : "WORKS";
    }

    workMobileToggleElements.forEach((toggle) => {
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });
  }

  function initWorkMobileMenu() {
    if (!workMobileToggleElements.length || !workMobileMenuPanelElement) return;

    setWorkMobileMenuOpen(false);

    workMobileToggleElements.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const isOpen = document.body.classList.contains(
          "is-work-mobile-menu-open"
        );

        setWorkMobileMenuOpen(!isOpen);
      });
    });

    workMobileMenuPanelElement.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");

      if (link) {
        setWorkMobileMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setWorkMobileMenuOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        setWorkMobileMenuOpen(false);
      }

      updateWorkLogoForViewport();
    });
  }

  function initProjectMediaPreviews() {
    if (typeof gsap === "undefined") return;
    if (window.innerWidth <= 768) return;
    if (!workGridElement) return;

    const cards = Array.from(
      workGridElement.querySelectorAll(".work-card:not(.work-card--empty)")
    );

    if (!cards.length) return;

    const cardData = new Map();

    cards.forEach((card) => {
      const media = card.querySelector(".work-card__media");
      const previewElement = card.querySelector(".work-card-hover-preview");
      const previewInnerElement = card.querySelector(
        ".work-card-hover-preview__inner"
      );
      const previewMediaElement = card.querySelector(
        ".work-card-hover-preview__image"
      );

      if (
        !media ||
        !previewElement ||
        !previewInnerElement ||
        !previewMediaElement
      ) {
        return;
      }

      gsap.set(previewElement, {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 0.9,
        opacity: 0,
        rotation: 0,
        force3D: true,
        willChange: "transform, opacity"
      });

      gsap.set(previewInnerElement, {
        x: 0,
        y: 0,
        scale: 1,
        force3D: true,
        willChange: "transform"
      });

      if (previewMediaElement.tagName.toLowerCase() === "video") {
        previewMediaElement.muted = true;
        previewMediaElement.loop = true;
        previewMediaElement.playsInline = true;
        previewMediaElement.preload = "auto";

        try {
          previewMediaElement.load();
        } catch {}
      }

      cardData.set(card, {
        card,
        media,
        previewElement,
        previewInnerElement,
        previewMediaElement,
        rect: null,
        targetX: 0,
        currentX: 0,
        lastX: 0,
        rafId: null,
        visible: false,
        hasPlayedVideo: false
      });
    });

    function playPreviewMedia(data) {
      const media = data.previewMediaElement;

      if (media.tagName.toLowerCase() !== "video") return;

      if (!data.hasPlayedVideo) {
        data.hasPlayedVideo = true;

        try {
          media.currentTime = 0;
        } catch {}
      }

      const playPromise = media.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }

    function pausePreviewMedia(data) {
      const media = data.previewMediaElement;

      if (media.tagName.toLowerCase() !== "video") return;

      media.pause();
    }

    function updateDataFromPointer(data, event) {
      data.rect = data.media.getBoundingClientRect();

      const localX = event.clientX - data.rect.left;
      const progress = gsap.utils.clamp(0, 1, localX / data.rect.width);
      const maxMove = Math.min(data.rect.width * 0.2, 130);

      data.targetX = gsap.utils.mapRange(
        0,
        1,
        -maxMove,
        maxMove,
        progress
      );
    }

    function renderPreview(data) {
      data.rafId = null;

      if (!data.visible) return;

      const distance = data.targetX - data.currentX;

      data.currentX += distance * 0.18;

      const velocity = data.currentX - data.lastX;
      const rotation = gsap.utils.clamp(-5, 5, velocity * 0.16);
      const innerX = gsap.utils.clamp(-16, 16, velocity * -0.5);
      const innerScale = 1 + Math.min(Math.abs(velocity) * 0.0035, 0.025);

      gsap.set(data.previewElement, {
        x: data.currentX,
        rotation
      });

      gsap.set(data.previewInnerElement, {
        x: innerX,
        scale: innerScale
      });

      data.lastX = data.currentX;

      if (Math.abs(distance) > 0.25) {
        data.rafId = window.requestAnimationFrame(() => {
          renderPreview(data);
        });

        return;
      }

      gsap.to(data.previewElement, {
        rotation: 0,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto"
      });

      gsap.to(data.previewInnerElement, {
        x: 0,
        scale: 1,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto"
      });
    }

    function requestRender(data) {
      if (data.rafId) return;

      data.rafId = window.requestAnimationFrame(() => {
        renderPreview(data);
      });
    }

    function showPreview(data, event) {
      if (data.visible) return;

      data.visible = true;
      data.card.classList.add("is-media-hovered");

      updateDataFromPointer(data, event);

      data.currentX = data.targetX;
      data.lastX = data.targetX;

      gsap.killTweensOf([
        data.previewElement,
        data.previewInnerElement
      ]);

      gsap.set(data.previewElement, {
        x: data.currentX,
        rotation: 0,
        opacity: 0,
        scale: 0.9
      });

      gsap.set(data.previewInnerElement, {
        x: 0,
        scale: 1
      });

      playPreviewMedia(data);

      gsap.to(data.previewElement, {
        opacity: 1,
        scale: 1,
        duration: 0.22,
        ease: "power3.out",
        overwrite: "auto"
      });
    }

    function movePreview(data, event) {
      if (!data.visible) {
        showPreview(data, event);
        return;
      }

      updateDataFromPointer(data, event);
      requestRender(data);
    }

    function hidePreview(data) {
      if (!data.visible) return;

      data.visible = false;
      data.card.classList.remove("is-media-hovered");

      if (data.rafId) {
        window.cancelAnimationFrame(data.rafId);
        data.rafId = null;
      }

      pausePreviewMedia(data);

      gsap.killTweensOf([
        data.previewElement,
        data.previewInnerElement
      ]);

      gsap.to(data.previewElement, {
        opacity: 0,
        scale: 0.9,
        rotation: 0,
        duration: 0.18,
        ease: "power2.out",
        overwrite: "auto"
      });

      gsap.to(data.previewInnerElement, {
        x: 0,
        scale: 1,
        duration: 0.18,
        ease: "power2.out",
        overwrite: "auto"
      });
    }

    cards.forEach((card) => {
      const data = cardData.get(card);

      if (!data) return;

      data.media.addEventListener(
        "pointerenter",
        (event) => {
          showPreview(data, event);
        },
        {
          passive: true
        }
      );

      data.media.addEventListener(
        "pointermove",
        (event) => {
          movePreview(data, event);
        },
        {
          passive: true
        }
      );

      data.media.addEventListener(
        "pointerleave",
        () => {
          hidePreview(data);
        },
        {
          passive: true
        }
      );

      data.media.addEventListener(
        "pointercancel",
        () => {
          hidePreview(data);
        },
        {
          passive: true
        }
      );
    });

    window.addEventListener(
      "blur",
      () => {
        cardData.forEach((data) => {
          hidePreview(data);
        });
      },
      {
        passive: true
      }
    );
  }

  function initWorkGalleryTextScramble() {
    if (!workGalleryCtaElement) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const originalHTML = workGalleryCtaElement.innerHTML.trim();
    const originalLines = originalHTML
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?[^>]+(>|$)/g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const finalLines = originalLines.length
      ? originalLines
      : ["EXPLORE THE", "GALLERY"];

    const finalAriaLabel = finalLines.join(" ");
    const scrambleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?#$%&@";
    const characterStagger = 22;
    const characterSettleDuration = 260;

    let animationFrameId = null;
    let isAnimating = false;

    function getRandomCharacter() {
      const randomIndex = Math.floor(Math.random() * scrambleCharacters.length);
      return scrambleCharacters[randomIndex];
    }

    function getTotalAnimatableCharacters() {
      return finalLines.reduce((total, line) => {
        const visibleCharacters = Array.from(line).filter(
          (char) => char !== " "
        );

        return total + visibleCharacters.length;
      }, 0);
    }

    function renderLines(lines) {
      workGalleryCtaElement.innerHTML = lines
        .map((line) => {
          return `<span class="work-gallery-cta__line">${escapeHTML(
            line
          )}</span>`;
        })
        .join("");
    }

    function renderFinalText() {
      renderLines(finalLines);
      workGalleryCtaElement.classList.remove("is-scrambling");
      workGalleryCtaElement.setAttribute("aria-label", finalAriaLabel);
    }

    function renderScrambledText(elapsedTime) {
      let characterIndex = 0;

      const nextLines = finalLines.map((line) => {
        return Array.from(line)
          .map((character) => {
            if (character === " ") {
              return " ";
            }

            const characterStart = characterIndex * characterStagger;
            const characterProgress =
              (elapsedTime - characterStart) / characterSettleDuration;

            characterIndex += 1;

            if (characterProgress >= 1) {
              return character;
            }

            return getRandomCharacter();
          })
          .join("");
      });

      renderLines(nextLines);
    }

    function stopScramble() {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      isAnimating = false;
    }

    function playScramble() {
      if (prefersReducedMotion) {
        renderFinalText();
        return;
      }

      stopScramble();

      isAnimating = true;
      workGalleryCtaElement.classList.add("is-scrambling");

      const startedAt = performance.now();
      const totalCharacters = getTotalAnimatableCharacters();
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
        stopScramble();
      }

      animationFrameId = window.requestAnimationFrame(tick);
    }

    renderFinalText();

    workGalleryCtaElement.addEventListener("mouseenter", () => {
      playScramble();
    });

    workGalleryCtaElement.addEventListener("focus", () => {
      playScramble();
    });

    workGalleryCtaElement.addEventListener("mouseleave", () => {
      if (!isAnimating) {
        renderFinalText();
      }
    });
  }

  function initWorkEntranceAnimation() {
    if (typeof gsap === "undefined") return;

    const entranceElements = [
      ".work-brand",
      ".work-nav__item",
      ".work-start",
      ".work-title",
      ".work-card:not(.work-card--empty)",
      ".work-gallery-cta__link",
      ".work-footer__copyright",
      ".work-footer__social",
      ".work-footer__credit"
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

  function initDraggableLogo() {
    if (window.innerWidth <= 768) return;

    if (
      !workBrandElement ||
      typeof gsap === "undefined" ||
      typeof Draggable === "undefined"
    ) {
      return;
    }

    gsap.registerPlugin(Draggable);

    gsap.set(workBrandElement, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      transformOrigin: "50% 50%"
    });

    gsap.fromTo(
      workBrandElement,
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

    Draggable.create(workBrandElement, {
      type: "x,y",
      zIndexBoost: false,
      minimumMovement: 4,

      onPress() {
        gsap.killTweensOf(workBrandElement);

        workBrandElement.classList.add("is-dragging");

        gsap.to(workBrandElement, {
          scale: 1.08,
          rotation: -4,
          duration: 0.18,
          ease: "power2.out",
          overwrite: "auto"
        });
      },

      onDrag() {
        const rotationAmount = gsap.utils.clamp(-12, 12, this.x * 0.045);

        gsap.to(workBrandElement, {
          rotation: rotationAmount,
          duration: 0.12,
          ease: "power2.out",
          overwrite: "auto"
        });
      },

      onRelease() {
        workBrandElement.classList.remove("is-dragging");

        gsap.to(workBrandElement, {
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

  function initMobileMenuAnimation() {
    if (
      typeof gsap === "undefined" ||
      !workMobileMenuPanelElement ||
      !workMobileToggleElements.length
    ) {
      return;
    }

    workMobileToggleElements.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const isOpening = document.body.classList.contains(
          "is-work-mobile-menu-open"
        );

        if (!isOpening) return;

        gsap.fromTo(
          [
            ".work-mobile-menu-list__item",
            ".work-mobile-menu-social__link",
            ".work-mobile-menu-credit"
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

  initWorkMobileMenu();
  initMobileMenuAnimation();
  initWorkEntranceAnimation();
  initProjectMediaPreviews();
  initWorkGalleryTextScramble();
  initDraggableLogo();
});