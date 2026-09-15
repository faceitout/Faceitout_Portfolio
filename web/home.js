document.addEventListener("DOMContentLoaded", async () => {
  const homeMenuElement = document.getElementById("homeMenu");
  const homeStartProjectElement = document.getElementById("homeStartProject");
  const homeCopyrightElement = document.getElementById("homeCopyright");
  const homeSocialElement = document.getElementById("homeSocial");
  const homeCreditElement = document.getElementById("homeCredit");
  const homeBrandElement = document.querySelector(".home-brand");
  const homeLogoElement = document.querySelector(".home-brand__image");
  const homeHeroStageElement = document.getElementById("homeHeroStage");

  const homeDesktopLogoSrc = "./assets/images/LOGO.svg";
  const homeMobileLogoSrc = "./assets/images/LOGO2.svg";
  const homeMobileMediaQuery = window.matchMedia("(max-width: 48rem)");

  const homeMobileToggleElements = Array.from(
    new Set(
      [
        ...document.querySelectorAll("[data-home-mobile-toggle]"),
        ...document.querySelectorAll(".home-mobile-menu-word"),
        ...document.querySelectorAll(".home-mobile-menu-button"),
        document.getElementById("homeMobileMenuToggle")
      ].filter(Boolean)
    )
  );

  const homeMobileMenuWordElement = document.querySelector(".home-mobile-menu-word");
  const homeMobileMenuPanelElement = document.getElementById("homeMobileMenuPanel");
  const homeMobileMenuElement = document.getElementById("homeMobileMenu");
  const homeMobileSocialElement = document.getElementById("homeMobileSocial");
  const homeMobileCreditElement = document.getElementById("homeMobileCredit");

  const defaultScrollGallery = {
    left: [
      {
        src: "./assets/images/01.png",
        label: "WORKS",
        alt: "Home gallery image 01"
      },
      {
        src: "./assets/images/03.png",
        href: "./work.html",
        label: "WORKS",
        alt: "Home gallery image 03"
      },
      {
        src: "./assets/images/05.png",
        href: "./gallery.html",
        label: "GALLERY",
        alt: "Home gallery image 05"
      },
      {
        src: "./assets/images/07.png",
        href: "./work.html",
        label: "WORKS",
        alt: "Home gallery image 07"
      },
      {
        src: "./assets/images/09.png",
        href: "./gallery.html",
        label: "GALLERY",
        alt: "Home gallery image 09"
      },
      {
        src: "./assets/images/11.png",
        href: "./gallery.html",
        label: "GALLERY",
        alt: "Home gallery image 11"
      }
    ],
    right: [
      {
        src: "./assets/images/12.png",
        href: "./gallery.html",
        label: "GALLERY",
        alt: "Home gallery image 12"
      },
      {
        src: "./assets/images/10.png",
        href: "./gallery.html",
        label: "GALLERY",
        alt: "Home gallery image 10"
      },
      {
        src: "./assets/images/08.png",
        href: "./work.html",
        label: "WORKS",
        alt: "Home gallery image 08"
      },
      {
        src: "./assets/images/06.png",
        href: "./work.html",
        label: "WORKS",
        alt: "Home gallery image 06"
      },
      {
        src: "./assets/images/04.png",
        href: "./work.html",
        label: "WORKS",
        alt: "Home gallery image 04"
      },
      {
        src: "./assets/images/02.png",
        alt: "Home gallery image 02"
      }
    ]
  };

  let homeData;

  function escapeHTML(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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

  function getGalleryItemData(item, index, columnName) {
    if (typeof item === "string") {
      return {
        src: item,
        href: "",
        label: "",
        alt: `${columnName} gallery image ${index + 1}`
      };
    }

    return {
      src: item?.src || item?.image || "",
      href: item?.href || item?.linkHref || "",
      label: item?.label || item?.title || "",
      alt: item?.alt || `${columnName} gallery image ${index + 1}`
    };
  }

  function createGalleryImage(item, index, columnName) {
    const imageData = getGalleryItemData(item, index, columnName);

    const safeSrc = escapeHTML(imageData.src);
    const safeAlt = escapeHTML(imageData.alt);
    const hasLink = Boolean(String(imageData.href || "").trim());

    if (!hasLink) {
      return `
        <figure class="home-scroll-gallery__item">
          <img
            class="home-scroll-gallery__image"
            src="${safeSrc}"
            alt="${safeAlt}"
            loading="eager"
            decoding="async"
            draggable="false"
          />
        </figure>
      `;
    }

    const safeHref = escapeHTML(imageData.href);
    const safeLabel = escapeHTML(imageData.label || imageData.alt || "Ver página");
    const externalAttrs = getExternalAttrs(imageData.href);

    return `
      <figure class="home-scroll-gallery__item">
        <a
          class="home-scroll-gallery__link"
          href="${safeHref}"
          aria-label="${safeLabel}"
          data-site-transition-label="${safeLabel}"
          ${externalAttrs}
        >
          <img
            class="home-scroll-gallery__image"
            src="${safeSrc}"
            alt="${safeAlt}"
            loading="eager"
            decoding="async"
            draggable="false"
          />
        </a>
      </figure>
    `;
  }

  function updateHomeLogoForViewport() {
    if (!homeLogoElement) return;

    const isMobile = homeMobileMediaQuery.matches;

    homeLogoElement.src = isMobile ? homeMobileLogoSrc : homeDesktopLogoSrc;
    homeLogoElement.alt = "faceitout";
  }

  try {
    const response = await fetch("./data/home.json");

    if (!response.ok) {
      throw new Error(`Error cargando home.json: ${response.status}`);
    }

    homeData = await response.json();
  } catch (error) {
    console.error("No se pudo cargar el JSON de home:", error);
    return;
  }

  updateHomeLogoForViewport();

  if (typeof homeMobileMediaQuery.addEventListener === "function") {
    homeMobileMediaQuery.addEventListener("change", updateHomeLogoForViewport);
  } else if (typeof homeMobileMediaQuery.addListener === "function") {
    homeMobileMediaQuery.addListener(updateHomeLogoForViewport);
  }

  if (homeMenuElement && Array.isArray(homeData.menu)) {
    homeMenuElement.innerHTML = homeData.menu
      .map((item, index, array) => {
        const label = item.label || "";
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");
        const separator = index < array.length - 1 ? "," : "";

        return `
          <li class="home-nav__item">
            <a
              class="home-nav__link"
              href="${safeHref}"
              aria-label="${safeLabel}"
            >
              ${createRollingText(label)}
            </a>${separator}
          </li>
        `;
      })
      .join("");
  }

  if (homeMobileMenuElement && Array.isArray(homeData.menu)) {
    const mobileItems = [
      ...homeData.menu,
      {
        label: "HOME",
        href: "./home.html"
      }
    ];

    homeMobileMenuElement.innerHTML = mobileItems
      .map((item) => {
        const label = item.label || "";
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");

        return `
          <li class="home-mobile-menu-list__item">
            <a
              class="home-mobile-menu-list__link"
              href="${safeHref}"
              aria-label="${safeLabel}"
            >
              ${safeLabel}
            </a>
          </li>
        `;
      })
      .join("");
  }

  if (homeStartProjectElement && homeData.startProject) {
    const startLabel = homeData.startProject.label || "START A PROJECT";
    const startHoverLabel = homeData.startProject.hoverLabel || "GET IN TOUCH";

    homeStartProjectElement.innerHTML = createRollingText(
      startLabel,
      startHoverLabel
    );

    homeStartProjectElement.setAttribute("aria-label", startLabel);

    homeStartProjectElement.href =
      homeData.startProject.href ||
      "mailto:almudenaestevez23@gmail.com";
  }

  if (homeCopyrightElement && homeData.footer?.copyright) {
    homeCopyrightElement.textContent = homeData.footer.copyright;
  }

  if (homeSocialElement && Array.isArray(homeData.footer?.social)) {
    homeSocialElement.innerHTML = homeData.footer.social
      .map((item, index, array) => {
        const label = item.label || "";
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");
        const separator = index < array.length - 1 ? "/" : "";

        return `
          <a
            class="home-footer__social-link"
            href="${safeHref}"
            ${getExternalAttrs(item.href)}
            aria-label="${safeLabel}"
          >
            ${createRollingText(label)}
          </a>
          ${
            separator
              ? `<span class="home-footer__separator" aria-hidden="true">${separator}</span>`
              : ""
          }
        `;
      })
      .join("");
  }

  if (homeMobileSocialElement && Array.isArray(homeData.footer?.social)) {
    homeMobileSocialElement.innerHTML = homeData.footer.social
      .map((item) => {
        const label = item.label || "";
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");

        return `
          <a
            class="home-mobile-menu-social__link"
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

  if (homeCreditElement) {
    const creditLabel = homeData.footer?.credit || "DESIGNED BY ALMU ESTEVEZ :)";

    homeCreditElement.innerHTML = createRollingText(creditLabel);
    homeCreditElement.setAttribute("aria-label", creditLabel);
  }

  if (homeMobileCreditElement) {
    homeMobileCreditElement.textContent =
      homeData.footer?.credit || "DESIGNED BY ALMU ESTEVEZ :)";
  }

  function initHomeScrollGallery() {
    if (!homeHeroStageElement) return;

    const scrollGalleryData = homeData.scrollGallery || defaultScrollGallery;

    const leftImages =
      Array.isArray(scrollGalleryData.left) && scrollGalleryData.left.length
        ? scrollGalleryData.left
        : defaultScrollGallery.left;

    const rightImages =
      Array.isArray(scrollGalleryData.right) && scrollGalleryData.right.length
        ? scrollGalleryData.right
        : defaultScrollGallery.right;

    homeHeroStageElement.innerHTML = `
      <div class="home-scroll-gallery" aria-label="Galería principal">
        <div class="home-scroll-gallery__column home-scroll-gallery__column--left">
          <div class="home-scroll-gallery__track home-scroll-gallery__track--left">
            ${leftImages
              .map((item, index) => createGalleryImage(item, index, "Left"))
              .join("")}
          </div>
        </div>

        <div class="home-scroll-gallery__column home-scroll-gallery__column--right">
          <div class="home-scroll-gallery__track home-scroll-gallery__track--right">
            ${rightImages
              .map((item, index) => createGalleryImage(item, index, "Right"))
              .join("")}
          </div>
        </div>
      </div>
    `;

    if (
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined"
    ) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const leftTrack = homeHeroStageElement.querySelector(
      ".home-scroll-gallery__track--left"
    );

    const rightTrack = homeHeroStageElement.querySelector(
      ".home-scroll-gallery__track--right"
    );

    if (!leftTrack || !rightTrack) return;

    let leftShift = 0;
    let rightShift = 0;
    let resizeFrame = null;

    function getTrackShift(track) {
      const column = track.closest(".home-scroll-gallery__column");

      const visibleHeight = column
        ? column.clientHeight
        : homeHeroStageElement.clientHeight || window.innerHeight;

      const fullTrackHeight = track.scrollHeight;
      const realShift = fullTrackHeight - visibleHeight;

      return Math.max(0, Math.round(realShift));
    }

    function snapPixel(value) {
      return Math.round(value);
    }

    function getCurrentProgress() {
      const trigger = ScrollTrigger.getById("home-scroll-gallery-trigger");

      return trigger ? trigger.progress : 0;
    }

    function calculateShifts() {
      leftShift = getTrackShift(leftTrack);
      rightShift = getTrackShift(rightTrack);
    }

    function setGalleryProgress(progress) {
      const cleanProgress = Math.max(0, Math.min(1, progress));

      const leftY = snapPixel(-leftShift * cleanProgress);
      const rightY = snapPixel(-rightShift + rightShift * cleanProgress);

      gsap.set(leftTrack, {
        y: leftY,
        force3D: true
      });

      gsap.set(rightTrack, {
        y: rightY,
        force3D: true
      });
    }

    function refreshGalleryPosition() {
      calculateShifts();
      setGalleryProgress(getCurrentProgress());
    }

    calculateShifts();
    setGalleryProgress(0);

    const existingTrigger = ScrollTrigger.getById("home-scroll-gallery-trigger");

    if (existingTrigger) {
      existingTrigger.kill();
    }

    ScrollTrigger.create({
      id: "home-scroll-gallery-trigger",
      trigger: ".home-hero",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.15,
      invalidateOnRefresh: true,
      onRefresh: (self) => {
        calculateShifts();
        setGalleryProgress(self.progress);
      },
      onUpdate: (self) => {
        setGalleryProgress(self.progress);
      }
    });

    const galleryImages = Array.from(
      homeHeroStageElement.querySelectorAll(".home-scroll-gallery__image")
    );

    galleryImages.forEach((image) => {
      const refreshAfterImage = () => {
        refreshGalleryPosition();
        ScrollTrigger.refresh();
        setGalleryProgress(getCurrentProgress());
      };

      if (image.complete) {
        return;
      }

      image.addEventListener("load", refreshAfterImage, { once: true });
      image.addEventListener("error", refreshAfterImage, { once: true });
    });

    if (document.fonts && typeof document.fonts.ready?.then === "function") {
      document.fonts.ready.then(() => {
        refreshGalleryPosition();
        ScrollTrigger.refresh();
      });
    }

    window.addEventListener("resize", () => {
      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = null;
        refreshGalleryPosition();
        ScrollTrigger.refresh();
        setGalleryProgress(getCurrentProgress());
      });
    });

    window.addEventListener(
      "orientationchange",
      () => {
        window.setTimeout(() => {
          refreshGalleryPosition();
          ScrollTrigger.refresh();
          setGalleryProgress(getCurrentProgress());
        }, 250);
      },
      { passive: true }
    );

    window.requestAnimationFrame(() => {
      calculateShifts();
      ScrollTrigger.refresh();
      setGalleryProgress(0);
    });
  }

  function setHomeMobileMenuOpen(isOpen) {
    document.body.classList.toggle("is-home-mobile-menu-open", isOpen);

    if (homeMobileMenuPanelElement) {
      homeMobileMenuPanelElement.setAttribute("aria-hidden", String(!isOpen));
    }

    if (homeMobileMenuWordElement) {
      homeMobileMenuWordElement.textContent = isOpen ? "MENU" : "HOME";
    }

    homeMobileToggleElements.forEach((toggle) => {
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });
  }

  function initHomeMobileMenu() {
    if (!homeMobileToggleElements.length || !homeMobileMenuPanelElement) return;

    setHomeMobileMenuOpen(false);

    homeMobileToggleElements.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const isOpen = document.body.classList.contains("is-home-mobile-menu-open");

        setHomeMobileMenuOpen(!isOpen);
      });
    });

    homeMobileMenuPanelElement.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");

      if (link) {
        setHomeMobileMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setHomeMobileMenuOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        setHomeMobileMenuOpen(false);
      }

      updateHomeLogoForViewport();
    });
  }

  function initHomeEntranceAnimation() {
    if (typeof gsap === "undefined") return;

    const entranceElements = [
      ".home-brand",
      ".home-nav__item",
      ".home-start",
      ".home-footer__copyright",
      ".home-footer__social",
      ".home-footer__credit"
    ];

    gsap.fromTo(
      entranceElements,
      {
        y: 16,
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
      !homeMobileMenuPanelElement ||
      !homeMobileToggleElements.length
    ) {
      return;
    }

    homeMobileToggleElements.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const isOpening = document.body.classList.contains("is-home-mobile-menu-open");

        if (!isOpening) return;

        gsap.fromTo(
          [
            ".home-mobile-menu-list__item",
            ".home-mobile-menu-social__link",
            ".home-mobile-menu-credit"
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
      !homeBrandElement ||
      typeof gsap === "undefined" ||
      typeof Draggable === "undefined"
    ) {
      return;
    }

    gsap.registerPlugin(Draggable);

    gsap.set(homeBrandElement, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      transformOrigin: "50% 50%"
    });

    gsap.fromTo(
      homeBrandElement,
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

    Draggable.create(homeBrandElement, {
      type: "x,y",
      zIndexBoost: false,
      minimumMovement: 4,

      onPress() {
        gsap.killTweensOf(homeBrandElement);

        homeBrandElement.classList.add("is-dragging");

        gsap.to(homeBrandElement, {
          scale: 1.08,
          rotation: -4,
          duration: 0.18,
          ease: "power2.out",
          overwrite: "auto"
        });
      },

      onDrag() {
        const rotationAmount = gsap.utils.clamp(-12, 12, this.x * 0.045);

        gsap.to(homeBrandElement, {
          rotation: rotationAmount,
          duration: 0.12,
          ease: "power2.out",
          overwrite: "auto"
        });
      },

      onRelease() {
        homeBrandElement.classList.remove("is-dragging");

        gsap.to(homeBrandElement, {
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

  initHomeScrollGallery();
  initHomeMobileMenu();
  initMobileMenuAnimation();
  initHomeEntranceAnimation();
  initDraggableLogo();
});