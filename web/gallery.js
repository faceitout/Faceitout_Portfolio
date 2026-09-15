document.addEventListener("DOMContentLoaded", async () => {
  const galleryRootElement = document.querySelector(".gallery");
  const galleryLogoElement = document.getElementById("galleryLogo");
  const galleryBrandElement = document.querySelector(".gallery-brand");
  const galleryMenuElement = document.getElementById("galleryMenu");
  const galleryStartProjectElement = document.getElementById("galleryStartProject");

  const galleryCopyrightElement = document.getElementById("galleryCopyright");
  const gallerySocialElement = document.getElementById("gallerySocial");
  const galleryCreditElement = document.getElementById("galleryCredit");

  const galleryInfiniteElement = document.getElementById("galleryInfinite");
  const galleryViewportElement = document.getElementById("galleryInfiniteViewport");
  const galleryWorldElement = document.getElementById("galleryInfiniteWorld");

  const customCursorElement = document.getElementById("customCursor");
  const customCursorLabelElement = customCursorElement
    ? customCursorElement.querySelector(".custom-cursor__label")
    : null;

  const galleryDesktopLogoSrc = "./assets/images/LOGO.svg";
  const galleryMobileLogoSrc = "./assets/images/LOGO2.svg";
  const galleryMobileMediaQuery = window.matchMedia("(max-width: 48rem)");
  const galleryTouchMediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");

  const transparentPixelSrc =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

  const galleryMobileToggleElements = Array.from(
    new Set(
      [
        ...document.querySelectorAll("[data-gallery-mobile-toggle]"),
        ...document.querySelectorAll(".gallery-mobile-menu-word"),
        ...document.querySelectorAll(".gallery-mobile-menu-button"),
        document.getElementById("galleryMobileMenuToggle")
      ].filter(Boolean)
    )
  );

  const galleryMobileMenuWordElement = document.querySelector(".gallery-mobile-menu-word");
  const galleryMobileMenuPanelElement = document.getElementById("galleryMobileMenuPanel");
  const galleryMobileMenuElement = document.getElementById("galleryMobileMenu");
  const galleryMobileSocialElement = document.getElementById("galleryMobileSocial");
  const galleryMobileCreditElement = document.getElementById("galleryMobileCredit");

  let galleryDetailElement = null;
  let galleryDetailDialogElement = null;
  let galleryDetailMediaShellElement = null;
  let galleryDetailMediaViewportElement = null;
  let galleryDetailMediaTrackElement = null;
  let galleryDetailInfoElement = null;
  let galleryDetailDescriptionElement = null;
  let galleryDetailCloseElement = null;
  let galleryDetailAudioToggleElement = null;
  let galleryDetailPrevProjectElement = null;
  let galleryDetailNextProjectElement = null;

  let galleryData = null;
  let galleryItems = [];
  let selectedGalleryItem = null;

  let currentDetailProjectIndex = 0;
  let isGalleryDetailAudioEnabled = true;

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

  function cleanHref(value) {
    const rawHref = String(value || "").trim();

    if (!rawHref) return "";

    function cleanEscapes(href) {
      return String(href || "")
        .replace(/\\_/g, "_")
        .replace(/\\:/g, ":")
        .replace(/\\@/g, "@")
        .replace(/\\&/g, "&")
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .trim();
    }

    const markdownMatch = rawHref.match(/\((https?:\/\/[^)]+)\)/i);

    if (markdownMatch && markdownMatch[1]) {
      return cleanEscapes(markdownMatch[1]);
    }

    return cleanEscapes(rawHref);
  }

  function isExternalUrl(href) {
    return /^https?:\/\//i.test(cleanHref(href));
  }

  function getExternalAttrs(href) {
    return isExternalUrl(href) ? 'target="_blank" rel="noopener noreferrer"' : "";
  }

  function isGalleryMobileDetailMode() {
    return galleryMobileMediaQuery.matches || galleryTouchMediaQuery.matches;
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

  function createMaterialIcon(iconName) {
    return `<span class="material-symbols-rounded" aria-hidden="true">${iconName}</span>`;
  }

  function setButtonIcon(buttonElement, iconName) {
    if (!buttonElement) return;

    buttonElement.innerHTML = createMaterialIcon(iconName);
  }

  function bindGalleryDetailElements() {
    galleryDetailElement = document.getElementById("galleryDetail");

    galleryDetailDialogElement = galleryDetailElement
      ? galleryDetailElement.querySelector(".gallery-detail__dialog")
      : null;

    galleryDetailMediaShellElement = galleryDetailElement
      ? galleryDetailElement.querySelector(".gallery-detail__media-shell")
      : null;

    galleryDetailMediaViewportElement = galleryDetailElement
      ? galleryDetailElement.querySelector(".gallery-detail__media-viewport")
      : null;

    galleryDetailMediaTrackElement = document.getElementById("galleryDetailMediaTrack");
    galleryDetailInfoElement = document.getElementById("galleryDetailInfo");
    galleryDetailDescriptionElement = document.getElementById("galleryDetailDescription");
    galleryDetailCloseElement = document.getElementById("galleryDetailClose");
    galleryDetailAudioToggleElement = document.getElementById("galleryDetailAudioToggle");
    galleryDetailPrevProjectElement = document.getElementById("galleryDetailPrevProject");
    galleryDetailNextProjectElement = document.getElementById("galleryDetailNextProject");
  }

  function createButtonElement(className, id, ariaLabel, iconName) {
    const buttonElement = document.createElement("button");

    buttonElement.className = className;
    buttonElement.id = id;
    buttonElement.type = "button";
    buttonElement.setAttribute("aria-label", ariaLabel);
    buttonElement.innerHTML = createMaterialIcon(iconName);

    return buttonElement;
  }

  function normalizeGalleryDetailControls() {
    bindGalleryDetailElements();

    if (!galleryDetailElement || !galleryDetailDialogElement) return;

    galleryDetailElement
      .querySelectorAll(".gallery-detail__slide-step, .gallery-detail__dots")
      .forEach((element) => {
        element.remove();
      });

    if (!galleryDetailAudioToggleElement) {
      galleryDetailAudioToggleElement = createButtonElement(
        "gallery-detail__audio-toggle",
        "galleryDetailAudioToggle",
        "Quitar sonido",
        "volume_up"
      );

      galleryDetailAudioToggleElement.hidden = true;
      galleryDetailAudioToggleElement.setAttribute("aria-pressed", "true");

      galleryDetailDialogElement.insertBefore(
        galleryDetailAudioToggleElement,
        galleryDetailDialogElement.firstChild
      );
    }

    if (!galleryDetailCloseElement) {
      galleryDetailCloseElement = createButtonElement(
        "gallery-detail__close",
        "galleryDetailClose",
        "Cerrar detalle",
        "close"
      );

      galleryDetailDialogElement.insertBefore(
        galleryDetailCloseElement,
        galleryDetailDialogElement.firstChild
      );
    }

    const mainElement =
      galleryDetailElement.querySelector(".gallery-detail__main") ||
      (() => {
        const element = document.createElement("div");
        element.className = "gallery-detail__main";
        galleryDetailDialogElement.appendChild(element);
        return element;
      })();

    const contentElement =
      galleryDetailElement.querySelector(".gallery-detail__content") ||
      (() => {
        const element = document.createElement("div");
        element.className = "gallery-detail__content";
        mainElement.appendChild(element);
        return element;
      })();

    galleryDetailMediaShellElement =
      galleryDetailElement.querySelector(".gallery-detail__media-shell") ||
      (() => {
        const element = document.createElement("div");
        element.className = "gallery-detail__media-shell";
        contentElement.appendChild(element);
        return element;
      })();

    galleryDetailMediaViewportElement =
      galleryDetailElement.querySelector(".gallery-detail__media-viewport") ||
      (() => {
        const element = document.createElement("div");
        element.className = "gallery-detail__media-viewport";
        galleryDetailMediaShellElement.appendChild(element);
        return element;
      })();

    galleryDetailMediaTrackElement =
      document.getElementById("galleryDetailMediaTrack") ||
      (() => {
        const element = document.createElement("div");
        element.className = "gallery-detail__media-track";
        element.id = "galleryDetailMediaTrack";
        galleryDetailMediaViewportElement.appendChild(element);
        return element;
      })();

    if (galleryDetailMediaTrackElement.parentElement !== galleryDetailMediaViewportElement) {
      galleryDetailMediaViewportElement.appendChild(galleryDetailMediaTrackElement);
    }

    galleryDetailPrevProjectElement =
      document.getElementById("galleryDetailPrevProject") ||
      createButtonElement(
        "gallery-detail__project-nav gallery-detail__project-nav--prev",
        "galleryDetailPrevProject",
        "Proyecto anterior",
        "arrow_back"
      );

    galleryDetailNextProjectElement =
      document.getElementById("galleryDetailNextProject") ||
      createButtonElement(
        "gallery-detail__project-nav gallery-detail__project-nav--next",
        "galleryDetailNextProject",
        "Siguiente proyecto",
        "arrow_forward"
      );

    galleryDetailPrevProjectElement.className =
      "gallery-detail__project-nav gallery-detail__project-nav--prev";

    galleryDetailNextProjectElement.className =
      "gallery-detail__project-nav gallery-detail__project-nav--next";

    if (galleryDetailPrevProjectElement.parentElement !== galleryDetailMediaShellElement) {
      galleryDetailMediaShellElement.insertBefore(
        galleryDetailPrevProjectElement,
        galleryDetailMediaShellElement.firstChild
      );
    }

    if (galleryDetailNextProjectElement.parentElement !== galleryDetailMediaShellElement) {
      galleryDetailMediaShellElement.appendChild(galleryDetailNextProjectElement);
    }

    galleryDetailInfoElement =
      document.getElementById("galleryDetailInfo") ||
      (() => {
        const element = document.createElement("div");
        element.className = "gallery-detail__info";
        element.id = "galleryDetailInfo";
        element.hidden = true;
        contentElement.appendChild(element);
        return element;
      })();

    galleryDetailDescriptionElement =
      document.getElementById("galleryDetailDescription") ||
      (() => {
        const element = document.createElement("p");
        element.className = "gallery-detail__description";
        element.id = "galleryDetailDescription";
        element.hidden = true;
        contentElement.appendChild(element);
        return element;
      })();

    setButtonIcon(galleryDetailCloseElement, "close");
    setButtonIcon(galleryDetailAudioToggleElement, "volume_up");
    setButtonIcon(galleryDetailPrevProjectElement, "arrow_back");
    setButtonIcon(galleryDetailNextProjectElement, "arrow_forward");

    bindGalleryDetailElements();
  }

  function ensureGalleryDetailModal() {
    if (!galleryRootElement) return;

    const existingModal = document.getElementById("galleryDetail");

    if (!existingModal) {
      galleryRootElement.insertAdjacentHTML(
        "beforeend",
        `
          <div class="gallery-detail" id="galleryDetail" aria-hidden="true">
            <div class="gallery-detail__backdrop" data-gallery-detail-close></div>

            <section
              class="gallery-detail__dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Detalle de galería"
            >
              <button
                class="gallery-detail__audio-toggle"
                id="galleryDetailAudioToggle"
                type="button"
                aria-label="Quitar sonido"
                aria-pressed="true"
                hidden
              >
                ${createMaterialIcon("volume_up")}
              </button>

              <button
                class="gallery-detail__close"
                id="galleryDetailClose"
                type="button"
                aria-label="Cerrar detalle"
              >
                ${createMaterialIcon("close")}
              </button>

              <div class="gallery-detail__main">
                <div class="gallery-detail__content">
                  <div class="gallery-detail__media-shell">
                    <button
                      class="gallery-detail__project-nav gallery-detail__project-nav--prev"
                      id="galleryDetailPrevProject"
                      type="button"
                      aria-label="Proyecto anterior"
                    >
                      ${createMaterialIcon("arrow_back")}
                    </button>

                    <div class="gallery-detail__media-viewport">
                      <div
                        class="gallery-detail__media-track"
                        id="galleryDetailMediaTrack"
                      ></div>
                    </div>

                    <button
                      class="gallery-detail__project-nav gallery-detail__project-nav--next"
                      id="galleryDetailNextProject"
                      type="button"
                      aria-label="Siguiente proyecto"
                    >
                      ${createMaterialIcon("arrow_forward")}
                    </button>
                  </div>

                  <div
                    class="gallery-detail__info"
                    id="galleryDetailInfo"
                    hidden
                  ></div>

                  <p
                    class="gallery-detail__description"
                    id="galleryDetailDescription"
                    hidden
                  ></p>
                </div>
              </div>
            </section>
          </div>
        `
      );
    }

    normalizeGalleryDetailControls();
  }

  function updateGalleryLogoForViewport() {
    if (!galleryLogoElement) return;

    const isMobile = galleryMobileMediaQuery.matches;

    galleryLogoElement.src = isMobile ? galleryMobileLogoSrc : galleryDesktopLogoSrc;
    galleryLogoElement.alt = galleryData?.logo?.text || "faceitout";
  }

  function setCursorLabel(label) {
    if (!customCursorElement || !customCursorLabelElement) return;

    customCursorLabelElement.textContent = label;
  }

  function showGalleryPromptCursor() {
    if (!customCursorElement) return;

    setCursorLabel("DRAG ME");

    customCursorElement.style.display = "";
    customCursorElement.style.opacity = "";
    customCursorElement.style.visibility = "";
    customCursorElement.style.pointerEvents = "none";

    customCursorElement.classList.remove(
      "is-hover",
      "is-gallery-active",
      "is-gallery-drag",
      "is-gallery-dragging",
      "is-gallery-hidden"
    );

    customCursorElement.classList.add("is-gallery-prompt");
  }

  function returnToNormalCursor() {
    if (!customCursorElement) return;

    setCursorLabel("View");

    customCursorElement.style.display = "";
    customCursorElement.style.opacity = "";
    customCursorElement.style.visibility = "";
    customCursorElement.style.pointerEvents = "";

    customCursorElement.classList.remove(
      "is-hover",
      "is-gallery-prompt",
      "is-gallery-active",
      "is-gallery-drag",
      "is-gallery-dragging",
      "is-gallery-hidden"
    );
  }

  function resetGalleryCursor() {
    returnToNormalCursor();
  }

  function forceGrabCursor() {
    document.documentElement.style.cursor = "grabbing";
    document.body.style.cursor = "grabbing";

    if (galleryViewportElement) {
      galleryViewportElement.style.cursor = "grabbing";
    }

    if (customCursorElement) {
      customCursorElement.style.display = "flex";
      customCursorElement.style.opacity = "1";
      customCursorElement.style.visibility = "visible";
      customCursorElement.style.pointerEvents = "none";

      customCursorElement.classList.remove(
        "is-hover",
        "is-gallery-hidden",
        "is-gallery-drag",
        "is-gallery-dragging"
      );

      customCursorElement.classList.add("is-gallery-prompt");
    }

    setCursorLabel("DRAG ME");
  }

  function releaseGrabCursor() {
    document.documentElement.style.cursor = "";
    document.body.style.cursor = "";

    if (galleryViewportElement) {
      galleryViewportElement.style.cursor = "";
    }

    if (customCursorElement) {
      customCursorElement.style.pointerEvents = "";
    }
  }

  function wrapValue(value, min, max) {
    const range = max - min;

    if (!range) return min;

    return ((((value - min) % range) + range) % range) + min;
  }

  function wrapIndex(index, total) {
    if (!total) return 0;

    return ((index % total) + total) % total;
  }

  function isVideoSource(src) {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(String(src || ""));
  }

  function getGalleryPrimaryMedia(item) {
    const explicitType = String(item?.type || "").toLowerCase();

    if ((explicitType === "video" || item?.video || isVideoSource(item?.video)) && item?.video) {
      return {
        type: "video",
        src: item.video,
        poster: item.poster || item.image || "",
        alt: item.alt || item.title || "Gallery video"
      };
    }

    return {
      type: "image",
      src: item?.image || item?.poster || "",
      poster: "",
      alt: item?.alt || item?.title || "Gallery image"
    };
  }

  function getCurrentDetailMediaItem() {
    if (!galleryItems.length) return null;

    return getGalleryPrimaryMedia(galleryItems[currentDetailProjectIndex]);
  }

  function isCurrentDetailMediaVideo() {
    const mediaItem = getCurrentDetailMediaItem();

    return Boolean(mediaItem && mediaItem.type === "video");
  }

  function updateDetailAudioButton() {
    if (!galleryDetailAudioToggleElement) return;

    const shouldShowAudioButton = isCurrentDetailMediaVideo();

    galleryDetailAudioToggleElement.hidden = !shouldShowAudioButton;

    if (!shouldShowAudioButton) return;

    galleryDetailAudioToggleElement.classList.toggle(
      "is-muted",
      !isGalleryDetailAudioEnabled
    );

    galleryDetailAudioToggleElement.setAttribute(
      "aria-pressed",
      String(isGalleryDetailAudioEnabled)
    );

    galleryDetailAudioToggleElement.setAttribute(
      "aria-label",
      isGalleryDetailAudioEnabled ? "Quitar sonido" : "Activar sonido"
    );

    setButtonIcon(
      galleryDetailAudioToggleElement,
      isGalleryDetailAudioEnabled ? "volume_up" : "volume_off"
    );
  }

  function getActiveCarouselSlide() {
    if (!galleryDetailMediaTrackElement) return null;

    if (isGalleryMobileDetailMode()) {
      return galleryDetailMediaTrackElement.querySelector(".gallery-detail__media-slide.is-active");
    }

    return galleryDetailMediaTrackElement.querySelector(
      `.gallery-detail__project-slide[data-gallery-detail-project-slide="${currentDetailProjectIndex}"]`
    );
  }

  function getActiveDetailVideo() {
    const activeSlide = getActiveCarouselSlide();

    if (!activeSlide) return null;

    return activeSlide.querySelector("video");
  }

  function pauseGalleryGridVideos() {
    if (!galleryWorldElement) return;

    const videos = Array.from(galleryWorldElement.querySelectorAll("video"));

    videos.forEach((video) => {
      video.pause();
      video.muted = true;
      video.volume = 0;

      if (video.getAttribute("src")) {
        video.removeAttribute("src");
        video.load();
      }
    });
  }

  function getCarouselTranslateX(dragOffsetX = 0) {
    if (!galleryDetailMediaViewportElement || !galleryDetailMediaTrackElement) {
      return dragOffsetX;
    }

    const activeSlide = getActiveCarouselSlide();

    if (!activeSlide) return dragOffsetX;

    if (isGalleryMobileDetailMode()) {
      return 0;
    }

    const viewportWidth = galleryDetailMediaViewportElement.clientWidth;
    const activeCenter = activeSlide.offsetLeft + activeSlide.offsetWidth / 2;

    return viewportWidth / 2 - activeCenter + dragOffsetX;
  }

  function applyDetailCarouselPosition(animated = true, dragOffsetX = 0) {
    if (!galleryDetailMediaTrackElement) return;

    const isSingleResponsiveMode =
      isGalleryMobileDetailMode() ||
      galleryDetailMediaTrackElement.dataset.galleryDetailMode === "single";

    if (isSingleResponsiveMode) {
      galleryDetailMediaTrackElement.style.transition = "none";
      galleryDetailMediaTrackElement.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const translateX = getCarouselTranslateX(dragOffsetX);

    galleryDetailMediaTrackElement.style.transition = animated
      ? "transform 0.52s cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";

    galleryDetailMediaTrackElement.style.transform = `translate3d(${translateX}px, 0, 0)`;
  }

  function refreshCarouselAfterMediaLoad() {
    const activeSlide = getActiveCarouselSlide();

    if (!activeSlide) return;

    const activeMedia = activeSlide.querySelector(".gallery-detail__media");

    if (!activeMedia) return;

    const refresh = () => {
      window.requestAnimationFrame(() => {
        applyDetailCarouselPosition(false, 0);
      });
    };

    if (activeMedia.tagName === "IMG") {
      if (activeMedia.complete) {
        refresh();
      } else {
        activeMedia.addEventListener("load", refresh, { once: true });
      }
    }

    if (activeMedia.tagName === "VIDEO") {
      activeMedia.addEventListener("loadedmetadata", refresh, { once: true });
      activeMedia.addEventListener("loadeddata", refresh, { once: true });
    }
  }

  function applyActiveDetailVideoAudioState() {
    const activeVideo = getActiveDetailVideo();

    updateDetailAudioButton();

    if (!activeVideo) return;

    if (!activeVideo.getAttribute("src") && activeVideo.dataset.src) {
      activeVideo.src = activeVideo.dataset.src;
    }

    activeVideo.muted = !isGalleryDetailAudioEnabled;
    activeVideo.volume = isGalleryDetailAudioEnabled ? 1 : 0;
    activeVideo.loop = true;
    activeVideo.playsInline = true;

    activeVideo.addEventListener(
      "loadedmetadata",
      () => {
        applyDetailCarouselPosition(false, 0);
      },
      { once: true }
    );

    const playPromise = activeVideo.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        isGalleryDetailAudioEnabled = false;

        activeVideo.muted = true;
        activeVideo.volume = 0;

        updateDetailAudioButton();

        const mutedPlayPromise = activeVideo.play();

        if (mutedPlayPromise && typeof mutedPlayPromise.catch === "function") {
          mutedPlayPromise.catch(() => {});
        }
      });
    }
  }

  function pauseDetailVideos(stopAllVideos = false) {
    if (!galleryDetailMediaTrackElement) return;

    const videos = Array.from(galleryDetailMediaTrackElement.querySelectorAll("video"));

    videos.forEach((video) => {
      const isActiveVideo =
        video.closest(".gallery-detail__project-slide.is-active") ||
        video.closest(".gallery-detail__media-slide.is-active");

      if (isActiveVideo && !stopAllVideos) return;

      video.pause();
      video.muted = true;
      video.volume = 0;

      if (video.getAttribute("src")) {
        video.removeAttribute("src");
        video.load();
      }
    });
  }

  function createEmptyTileHTML(label) {
    return `
      <span class="gallery-tile__media gallery-tile__media--empty">
        ${escapeHTML(label)}
      </span>
    `;
  }

  function createEmptyDetailHTML(label) {
    return `
      <span class="gallery-detail__media gallery-detail__media--empty">
        ${escapeHTML(label)}
      </span>
    `;
  }

  function createTileMediaHTML(item) {
    const media = getGalleryPrimaryMedia(item);
    const safeAlt = escapeHTML(media.alt || item?.title || "Gallery item");

    if (media.type === "video") {
      const posterSrc = media.poster || "";

      if (!posterSrc) {
        return createEmptyTileHTML("VIDEO");
      }

      return `
        <img
          class="gallery-tile__media gallery-tile__media--video-poster"
          src="${transparentPixelSrc}"
          data-src="${escapeHTML(posterSrc)}"
          alt="${safeAlt}"
          draggable="false"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          data-gallery-lazy-media="true"
          data-gallery-video-poster="true"
        />
      `;
    }

    if (!media.src) {
      return createEmptyTileHTML("IMAGE");
    }

    return `
      <img
        class="gallery-tile__media"
        src="${transparentPixelSrc}"
        data-src="${escapeHTML(media.src)}"
        alt="${safeAlt}"
        draggable="false"
        loading="lazy"
        decoding="async"
        fetchpriority="low"
        data-gallery-lazy-media="true"
      />
    `;
  }

  function createGalleryTile(item, tileIndex, sourceIndex, columnIndex, rowIndex) {
    const title = item?.title || `Gallery item ${tileIndex + 1}`;
    const safeTitle = escapeHTML(title);

    return `
      <button
        class="gallery-tile"
        type="button"
        data-gallery-index="${tileIndex}"
        data-gallery-source-index="${sourceIndex}"
        data-gallery-column="${columnIndex}"
        data-gallery-row="${rowIndex}"
        aria-label="${safeTitle}"
      >
        <span class="gallery-tile__media-wrap">
          ${createTileMediaHTML(item)}
        </span>
      </button>
    `;
  }

  function createDetailMediaHTML(mediaItem, isActive = false, title = "") {
    const safeTitle = escapeHTML(mediaItem.alt || title || "Gallery media");
    const safeSrc = escapeHTML(mediaItem.src || "");
    const safePoster = mediaItem.poster ? escapeHTML(mediaItem.poster) : "";

    if (mediaItem.type === "video") {
      if (!mediaItem.src) {
        return createEmptyDetailHTML(safeTitle);
      }

      return `
        <video
          class="gallery-detail__media"
          ${isActive ? `src="${safeSrc}"` : `data-src="${safeSrc}"`}
          ${safePoster ? `poster="${safePoster}"` : ""}
          loop
          playsinline
          preload="${isActive ? "metadata" : "none"}"
          aria-label="${safeTitle}"
        ></video>
      `;
    }

    if (!mediaItem.src) {
      return createEmptyDetailHTML(safeTitle);
    }

    return `
      <img
        class="gallery-detail__media"
        src="${safeSrc}"
        alt="${safeTitle}"
        loading="${isActive ? "eager" : "lazy"}"
        decoding="async"
        draggable="false"
      />
    `;
  }

  function createDetailProjectSlideHTML(item, projectIndex) {
    const mediaItem = getGalleryPrimaryMedia(item);
    const itemTitle = normalizeLabel(item?.title || `Gallery item ${projectIndex + 1}`);
    const safeTitle = escapeHTML(itemTitle);
    const activeClass = projectIndex === currentDetailProjectIndex ? " is-active" : "";

    return `
      <button
        class="gallery-detail__project-slide${activeClass}"
        type="button"
        data-gallery-detail-project-slide="${projectIndex}"
        aria-label="${safeTitle}"
      >
        <span class="gallery-detail__project-slide-inner">
          ${createDetailMediaHTML(mediaItem, projectIndex === currentDetailProjectIndex, itemTitle)}
        </span>
      </button>
    `;
  }

  function createSingleMobileDetailSlideHTML(item) {
    const mediaItem = getGalleryPrimaryMedia(item);
    const itemTitle = normalizeLabel(item?.title || "Gallery item");

    return `
      <div
        class="gallery-detail__media-slide is-active"
        data-gallery-detail-project-slide="${currentDetailProjectIndex}"
        aria-label="${escapeHTML(itemTitle)}"
      >
        <span class="gallery-detail__media-slide-inner">
          ${createDetailMediaHTML(mediaItem, true, itemTitle)}
        </span>
      </div>
    `;
  }

  function renderDetailTrack() {
    if (!galleryDetailMediaTrackElement || !galleryItems.length) return;

    if (isGalleryMobileDetailMode()) {
      const item = galleryItems[currentDetailProjectIndex];

      galleryDetailMediaTrackElement.innerHTML = createSingleMobileDetailSlideHTML(item);
      galleryDetailMediaTrackElement.dataset.galleryDetailMode = "single";
      return;
    }

    galleryDetailMediaTrackElement.innerHTML = galleryItems
      .map((galleryItem, index) => createDetailProjectSlideHTML(galleryItem, index))
      .join("");

    galleryDetailMediaTrackElement.dataset.galleryDetailMode = "project";
  }

  function renderGalleryDetailInfo(item, itemTitle) {
    if (!galleryDetailInfoElement) return;

    const linkHref = cleanHref(item?.linkHref || item?.titleHref || "");
    const linkLabel = normalizeLabel(item?.linkLabel || "VER LINK");

    galleryDetailInfoElement.hidden = false;
    galleryDetailInfoElement.classList.toggle("has-link", Boolean(linkHref));

    if (linkHref) {
      galleryDetailInfoElement.innerHTML = `
        <span class="gallery-detail__info-cell">${escapeHTML(itemTitle)}</span>

        <span class="gallery-detail__info-separator" aria-hidden="true">/</span>

        <a
          class="gallery-detail__info-link"
          href="${escapeHTML(linkHref)}"
          ${getExternalAttrs(linkHref)}
          aria-label="${escapeHTML(linkLabel)}"
        >
          ${escapeHTML(linkLabel)}
        </a>
      `;

      return;
    }

    galleryDetailInfoElement.innerHTML = `
      <span class="gallery-detail__info-cell">${escapeHTML(itemTitle)}</span>
    `;
  }

  function refreshDetailControls() {
    const hasMultipleProjects = galleryItems.length > 1;

    if (galleryDetailPrevProjectElement) {
      galleryDetailPrevProjectElement.hidden = !hasMultipleProjects;
    }

    if (galleryDetailNextProjectElement) {
      galleryDetailNextProjectElement.hidden = !hasMultipleProjects;
    }

    updateDetailAudioButton();
  }

  function updateDetailActiveClasses() {
    if (!galleryDetailMediaTrackElement) return;

    const projectSlides = Array.from(
      galleryDetailMediaTrackElement.querySelectorAll(".gallery-detail__project-slide")
    );

    projectSlides.forEach((slide) => {
      const slideIndex = Number(slide.dataset.galleryDetailProjectSlide || 0);
      slide.classList.toggle("is-active", slideIndex === currentDetailProjectIndex);
    });

    const mobileSlide = galleryDetailMediaTrackElement.querySelector(
      ".gallery-detail__media-slide"
    );

    if (mobileSlide) {
      mobileSlide.classList.add("is-active");
    }
  }

  function updateDetailUI(animated = true) {
    if (!galleryItems.length) return;

    const item = galleryItems[currentDetailProjectIndex];
    const itemTitle = normalizeLabel(item?.title || "GALLERY ITEM");

    renderDetailTrack();
    renderGalleryDetailInfo(item, itemTitle);
    refreshDetailControls();

    if (galleryDetailDescriptionElement) {
      const description = item?.description || item?.text || item?.caption || "";

      if (description) {
        galleryDetailDescriptionElement.hidden = false;
        galleryDetailDescriptionElement.textContent = description;
      } else {
        galleryDetailDescriptionElement.hidden = true;
        galleryDetailDescriptionElement.textContent = "";
      }
    }

    window.requestAnimationFrame(() => {
      updateDetailActiveClasses();
      applyDetailCarouselPosition(animated, 0);
      refreshCarouselAfterMediaLoad();
      pauseDetailVideos(false);
      applyActiveDetailVideoAudioState();
    });
  }

  function openGalleryDetail(projectIndex = 0) {
    if (!galleryDetailElement || !galleryItems.length) return;

    pauseGalleryGridVideos();

    isGalleryDetailAudioEnabled = true;
    currentDetailProjectIndex = wrapIndex(projectIndex, galleryItems.length);

    updateDetailUI(false);

    galleryDetailElement.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-gallery-detail-open");
    releaseGrabCursor();
    returnToNormalCursor();

    window.requestAnimationFrame(() => {
      applyDetailCarouselPosition(false, 0);
      refreshCarouselAfterMediaLoad();
      applyActiveDetailVideoAudioState();
    });
  }

  function closeGalleryDetail() {
    if (!galleryDetailElement) return;

    galleryDetailElement.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-gallery-detail-open");

    pauseDetailVideos(true);
    updateDetailAudioButton();
    pauseGalleryGridVideos();

    if (galleryViewportElement && galleryViewportElement.matches(":hover")) {
      showGalleryPromptCursor();
    }
  }

  function goToDetailProjectByIndex(projectIndex, animated = true) {
    if (!galleryItems.length) return;

    currentDetailProjectIndex = wrapIndex(projectIndex, galleryItems.length);

    updateDetailUI(animated);
  }

  function goToDetailProject(step, animated = true) {
    goToDetailProjectByIndex(currentDetailProjectIndex + step, animated);
  }

  function initGalleryDetailCarouselDrag() {
    if (!galleryDetailElement || !galleryDetailMediaViewportElement) return;

    let activePointerId = null;
    let startX = 0;
    let startY = 0;
    let latestX = 0;
    let latestY = 0;
    let isDragging = false;
    let ignoreCarouselClick = false;

    function canDragCarousel(event) {
      if (!document.body.classList.contains("is-gallery-detail-open")) return false;
      if (event.target.closest("button, a")) return false;

      return galleryItems.length > 1;
    }

    function resetDragState() {
      activePointerId = null;
      startX = 0;
      startY = 0;
      latestX = 0;
      latestY = 0;
      isDragging = false;

      galleryDetailMediaViewportElement.classList.remove("is-dragging");
    }

    galleryDetailMediaViewportElement.addEventListener("pointerdown", (event) => {
      if (!canDragCarousel(event)) return;

      activePointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      latestX = event.clientX;
      latestY = event.clientY;
      isDragging = false;

      galleryDetailMediaViewportElement.classList.add("is-dragging");

      if (typeof galleryDetailMediaViewportElement.setPointerCapture === "function") {
        galleryDetailMediaViewportElement.setPointerCapture(activePointerId);
      }
    });

    galleryDetailMediaViewportElement.addEventListener(
      "pointermove",
      (event) => {
        if (activePointerId !== event.pointerId) return;
        if (!galleryDetailMediaTrackElement) return;

        latestX = event.clientX;
        latestY = event.clientY;

        const deltaX = latestX - startX;
        const deltaY = latestY - startY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (!isDragging && absX > 6 && absX > absY * 0.85) {
          isDragging = true;
        }

        if (!isDragging) return;

        event.preventDefault();

        if (!isGalleryMobileDetailMode()) {
          applyDetailCarouselPosition(false, deltaX);
        }
      },
      { passive: false }
    );

    function finishDrag(event) {
      if (activePointerId !== event.pointerId) return;

      const deltaX = latestX - startX;
      const deltaY = latestY - startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      const viewportWidth =
        galleryDetailMediaViewportElement.clientWidth || window.innerWidth;

      const threshold = isGalleryMobileDetailMode()
        ? Math.min(70, viewportWidth * 0.18)
        : Math.min(110, viewportWidth * 0.14);

      const shouldChange =
        isDragging &&
        absX > threshold &&
        absX > absY * 0.85;

      const direction = deltaX < 0 ? 1 : -1;

      if (isDragging) {
        ignoreCarouselClick = true;

        window.setTimeout(() => {
          ignoreCarouselClick = false;
        }, 90);
      }

      resetDragState();

      if (shouldChange) {
        goToDetailProject(direction, true);
        return;
      }

      applyDetailCarouselPosition(true, 0);
    }

    galleryDetailMediaViewportElement.addEventListener("pointerup", finishDrag);
    galleryDetailMediaViewportElement.addEventListener("pointercancel", finishDrag);

    galleryDetailMediaTrackElement.addEventListener("click", (event) => {
      if (ignoreCarouselClick) return;
      if (isGalleryMobileDetailMode()) return;

      const projectSlide = event.target.closest("[data-gallery-detail-project-slide]");

      if (!projectSlide) return;

      const projectIndex = Number(projectSlide.dataset.galleryDetailProjectSlide || 0);

      if (projectIndex === currentDetailProjectIndex) return;

      goToDetailProjectByIndex(projectIndex, true);
    });
  }

  function initGalleryDetailModal() {
    ensureGalleryDetailModal();

    if (!galleryDetailElement) return;

    if (galleryDetailCloseElement) {
      galleryDetailCloseElement.addEventListener("click", () => {
        closeGalleryDetail();
      });
    }

    if (galleryDetailAudioToggleElement) {
      galleryDetailAudioToggleElement.addEventListener("click", (event) => {
        event.stopPropagation();

        isGalleryDetailAudioEnabled = !isGalleryDetailAudioEnabled;

        updateDetailAudioButton();
        applyActiveDetailVideoAudioState();
      });
    }

    galleryDetailElement.addEventListener("click", (event) => {
      const closeTrigger = event.target.closest("[data-gallery-detail-close]");

      if (closeTrigger) {
        closeGalleryDetail();
      }
    });

    if (galleryDetailPrevProjectElement) {
      galleryDetailPrevProjectElement.addEventListener("click", (event) => {
        event.stopPropagation();
        goToDetailProject(-1);
      });
    }

    if (galleryDetailNextProjectElement) {
      galleryDetailNextProjectElement.addEventListener("click", (event) => {
        event.stopPropagation();
        goToDetailProject(1);
      });
    }

    initGalleryDetailCarouselDrag();

    document.addEventListener("keydown", (event) => {
      const isDetailOpen = document.body.classList.contains("is-gallery-detail-open");

      if (!isDetailOpen) return;

      if (event.key === "Escape") {
        closeGalleryDetail();
      }

      if (event.key === "ArrowLeft") {
        goToDetailProject(-1);
      }

      if (event.key === "ArrowRight") {
        goToDetailProject(1);
      }

      if (event.key.toLowerCase() === "m") {
        isGalleryDetailAudioEnabled = !isGalleryDetailAudioEnabled;
        updateDetailAudioButton();
        applyActiveDetailVideoAudioState();
      }
    });
  }

  function getGalleryMetrics() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const gap = viewportWidth <= 420 ? 9 : viewportWidth <= 768 ? 10 : 12;

    let columnsOnScreen = 5.15;

    if (viewportWidth <= 768) {
      columnsOnScreen = 2.6;
    }

    if (viewportWidth <= 420) {
      columnsOnScreen = 2.25;
    }

    const tileWidth =
      (viewportWidth - gap * (columnsOnScreen - 1)) / columnsOnScreen;

    const tileHeight = tileWidth * 1.3356;

    const stepX = tileWidth + gap;
    const stepY = tileHeight + gap;

    const extraColumns = viewportWidth <= 768 ? 3 : 4;
    const extraRows = viewportWidth <= 768 ? 3 : 4;

    const columns = Math.ceil(viewportWidth / stepX) + extraColumns;
    const rows = Math.ceil(viewportHeight / stepY) + extraRows;

    const loopWidth = columns * stepX;
    const loopHeight = rows * stepY;

    const offsetStrength = viewportWidth <= 768 ? 0.16 : 0.22;

    const columnOffsets = [
      tileHeight * offsetStrength,
      tileHeight * (offsetStrength * 0.68),
      tileHeight * (offsetStrength * 0.34),
      tileHeight * (offsetStrength * 0.68),
      tileHeight * offsetStrength
    ];

    return {
      viewportWidth,
      viewportHeight,
      gap,
      tileWidth,
      tileHeight,
      stepX,
      stepY,
      columns,
      rows,
      loopWidth,
      loopHeight,
      columnOffsets
    };
  }

  function initInfiniteGallery() {
    if (!galleryInfiniteElement || !galleryViewportElement || !galleryWorldElement) {
      return;
    }

    const sourceItems =
      Array.isArray(galleryData?.gallery) && galleryData.gallery.length
        ? galleryData.gallery
        : [];

    galleryItems = sourceItems;

    if (!sourceItems.length) {
      galleryWorldElement.innerHTML = "";
      return;
    }

    let metrics = getGalleryMetrics();

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    let isPointerDown = false;
    let hasDragged = false;
    let activePointerButton = 0;
    let activeTileElement = null;
    let ignoreNextClick = false;
    let hasInteractedInCurrentHover = false;

    let pointerStartX = 0;
    let pointerStartY = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;

    let animationFrameId = null;
    let resizeFrameId = null;
    let tileRenderItems = [];

    function applyGalleryCSSVars() {
      galleryWorldElement.style.setProperty("--gallery-tile-width", `${metrics.tileWidth}px`);
      galleryWorldElement.style.setProperty("--gallery-tile-height", `${metrics.tileHeight}px`);
      galleryWorldElement.style.setProperty("--gallery-gap", `${metrics.gap}px`);
    }

    function activateTileMediaIfNeeded(tile, finalX, finalY) {
      const bufferX = metrics.tileWidth * 1.2;
      const bufferY = metrics.tileHeight * 1.2;

      const isNearViewport =
        finalX < metrics.viewportWidth + bufferX &&
        finalX + metrics.tileWidth > -bufferX &&
        finalY < metrics.viewportHeight + bufferY &&
        finalY + metrics.tileHeight > -bufferY;

      if (!isNearViewport) return;

      const mediaElement = tile.querySelector("[data-gallery-lazy-media='true']");

      if (!mediaElement || mediaElement.dataset.loaded === "true") return;

      const src = mediaElement.dataset.src;

      if (!src) return;

      mediaElement.dataset.loaded = "true";
      mediaElement.src = src;
      mediaElement.removeAttribute("data-src");

      if (mediaElement.tagName === "IMG") {
        if (mediaElement.complete) {
          mediaElement.classList.add("is-loaded");
        } else {
          mediaElement.addEventListener(
            "load",
            () => {
              mediaElement.classList.add("is-loaded");
            },
            { once: true }
          );

          mediaElement.addEventListener(
            "error",
            () => {
              mediaElement.classList.add("is-loaded");
            },
            { once: true }
          );
        }
      }
    }

    function cacheTileRenderItems() {
      tileRenderItems = Array.from(
        galleryWorldElement.querySelectorAll(".gallery-tile")
      ).map((tile) => {
        const columnIndex = Number(tile.dataset.galleryColumn || 0);
        const rowIndex = Number(tile.dataset.galleryRow || 0);
        const offsetIndex = columnIndex % metrics.columnOffsets.length;
        const columnOffset = metrics.columnOffsets[offsetIndex] || 0;

        return {
          tile,
          columnIndex,
          rowIndex,
          columnOffset
        };
      });
    }

    function renderGalleryPosition(immediate = false) {
      if (!tileRenderItems.length) return;

      if (immediate) {
        currentX = targetX;
        currentY = targetY;
      } else {
        currentX += (targetX - currentX) * 0.16;
        currentY += (targetY - currentY) * 0.16;
      }

      tileRenderItems.forEach((item) => {
        const rawX = item.columnIndex * metrics.stepX + currentX;
        const rawY = item.rowIndex * metrics.stepY + currentY + item.columnOffset;

        const wrappedX = wrapValue(
          rawX,
          -metrics.stepX,
          metrics.loopWidth - metrics.stepX
        );

        const wrappedY = wrapValue(
          rawY,
          -metrics.stepY,
          metrics.loopHeight - metrics.stepY
        );

        const finalX = wrappedX - metrics.stepX;
        const finalY = wrappedY - metrics.stepY;

        item.tile.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;

        activateTileMediaIfNeeded(item.tile, finalX, finalY);
      });
    }

    function buildTiles() {
      metrics = getGalleryMetrics();
      applyGalleryCSSVars();

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      let tileIndex = 0;
      const tilesHTML = [];

      for (let columnIndex = 0; columnIndex < metrics.columns; columnIndex += 1) {
        for (let rowIndex = 0; rowIndex < metrics.rows; rowIndex += 1) {
          const sourceIndex = tileIndex % sourceItems.length;
          const sourceItem = sourceItems[sourceIndex];

          tilesHTML.push(
            createGalleryTile(
              sourceItem,
              tileIndex,
              sourceIndex,
              columnIndex,
              rowIndex
            )
          );

          tileIndex += 1;
        }
      }

      galleryWorldElement.innerHTML = tilesHTML.join("");

      cacheTileRenderItems();
      renderGalleryPosition(true);
      pauseGalleryGridVideos();
    }

    function startAnimationLoop() {
      if (animationFrameId) return;

      function tick() {
        if (document.hidden) {
          animationFrameId = null;
          return;
        }

        renderGalleryPosition(false);

        const distanceX = Math.abs(targetX - currentX);
        const distanceY = Math.abs(targetY - currentY);

        const shouldKeepMoving =
          isPointerDown || distanceX > 0.08 || distanceY > 0.08;

        if (shouldKeepMoving) {
          animationFrameId = window.requestAnimationFrame(tick);
          return;
        }

        renderGalleryPosition(true);
        animationFrameId = null;
        pauseGalleryGridVideos();
      }

      animationFrameId = window.requestAnimationFrame(tick);
    }

    function moveGalleryBy(deltaX, deltaY) {
      targetX -= deltaX;
      targetY -= deltaY;

      hasInteractedInCurrentHover = true;
      pauseGalleryGridVideos();
      startAnimationLoop();
    }

    function handleWindowPointerMove(event) {
      if (!isPointerDown) return;

      const deltaX = event.clientX - lastPointerX;
      const deltaY = event.clientY - lastPointerY;

      lastPointerX = event.clientX;
      lastPointerY = event.clientY;

      const totalDragDistance = Math.hypot(
        event.clientX - pointerStartX,
        event.clientY - pointerStartY
      );

      if (totalDragDistance > 5) {
        hasDragged = true;
      }

      targetX += deltaX;
      targetY += deltaY;

      startAnimationLoop();
    }

    function openTileFromPointer() {
      if (!activeTileElement || hasDragged || activePointerButton !== 0) return;

      const sourceIndex = Number(activeTileElement.dataset.gallerySourceIndex || 0);
      const nextItem = sourceItems[sourceIndex];

      if (!nextItem) return;

      selectedGalleryItem = nextItem;
      ignoreNextClick = true;

      activeTileElement.classList.add("is-selected");

      window.setTimeout(() => {
        if (activeTileElement) {
          activeTileElement.classList.remove("is-selected");
        }
      }, 180);

      openGalleryDetail(sourceIndex);

      window.setTimeout(() => {
        ignoreNextClick = false;
      }, 0);
    }

    function endPointerInteraction() {
      if (!isPointerDown) return;

      openTileFromPointer();

      isPointerDown = false;
      document.body.classList.remove("is-gallery-panning");

      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", endPointerInteraction);
      window.removeEventListener("pointercancel", endPointerInteraction);

      activeTileElement = null;
      activePointerButton = 0;

      releaseGrabCursor();

      if (
        galleryViewportElement.matches(":hover") &&
        !document.body.classList.contains("is-gallery-detail-open")
      ) {
        showGalleryPromptCursor();
      } else {
        returnToNormalCursor();
      }

      startAnimationLoop();

      window.setTimeout(() => {
        hasDragged = false;
      }, 0);
    }

    galleryViewportElement.addEventListener(
      "wheel",
      (event) => {
        if (document.body.classList.contains("is-gallery-detail-open")) return;

        event.preventDefault();

        const wheelSpeed = event.deltaMode === 1 ? 20 : 1;

        moveGalleryBy(
          event.deltaX * wheelSpeed,
          event.deltaY * wheelSpeed
        );
      },
      { passive: false }
    );

    galleryViewportElement.addEventListener("mousedown", (event) => {
      if (event.button === 1) {
        event.preventDefault();
      }
    });

    galleryViewportElement.addEventListener("auxclick", (event) => {
      if (event.button === 1) {
        event.preventDefault();
      }
    });

    galleryViewportElement.addEventListener("pointerenter", () => {
      hasInteractedInCurrentHover = false;

      if (!isPointerDown && !document.body.classList.contains("is-gallery-detail-open")) {
        showGalleryPromptCursor();
      }
    });

    galleryViewportElement.addEventListener("pointerleave", () => {
      if (!isPointerDown) {
        hasInteractedInCurrentHover = false;
        resetGalleryCursor();
      }
    });

    galleryViewportElement.addEventListener("pointerdown", (event) => {
      if (document.body.classList.contains("is-gallery-detail-open")) return;

      const isMouse = event.pointerType === "mouse";
      const isLeftClick = event.button === 0;
      const isWheelClick = event.button === 1;

      if (isMouse && !isLeftClick && !isWheelClick) return;

      if (isWheelClick) {
        event.preventDefault();
      }

      pauseGalleryGridVideos();

      isPointerDown = true;
      hasDragged = false;
      hasInteractedInCurrentHover = true;
      activePointerButton = event.button;
      activeTileElement = event.target.closest(".gallery-tile");

      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;

      document.body.classList.add("is-gallery-panning");
      forceGrabCursor();

      window.addEventListener("pointermove", handleWindowPointerMove);
      window.addEventListener("pointerup", endPointerInteraction);
      window.addEventListener("pointercancel", endPointerInteraction);

      startAnimationLoop();
    });

    galleryViewportElement.addEventListener("click", (event) => {
      if (ignoreNextClick) return;

      const tile = event.target.closest(".gallery-tile");

      if (!tile || hasDragged || document.body.classList.contains("is-gallery-detail-open")) {
        return;
      }

      const sourceIndex = Number(tile.dataset.gallerySourceIndex || 0);
      const nextItem = sourceItems[sourceIndex];

      if (!nextItem) return;

      selectedGalleryItem = nextItem;
      openGalleryDetail(sourceIndex);
    });

    window.addEventListener("resize", () => {
      if (resizeFrameId) {
        window.cancelAnimationFrame(resizeFrameId);
      }

      resizeFrameId = window.requestAnimationFrame(() => {
        resizeFrameId = null;

        buildTiles();

        if (document.body.classList.contains("is-gallery-detail-open")) {
          updateDetailUI(false);
        }

        if (window.innerWidth > 768) {
          setGalleryMobileMenuOpen(false);
        }

        updateGalleryLogoForViewport();

        if (galleryViewportElement.matches(":hover")) {
          if (hasInteractedInCurrentHover) {
            returnToNormalCursor();
          } else if (!document.body.classList.contains("is-gallery-detail-open")) {
            showGalleryPromptCursor();
          }
        }
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      if (!document.hidden) {
        renderGalleryPosition(true);
      }
    });

    buildTiles();

    window.gallerySelectedItem = () => selectedGalleryItem;
  }

  try {
    const response = await fetch("./data/gallery.json");

    if (!response.ok) {
      throw new Error(`Error cargando gallery.json: ${response.status}`);
    }

    galleryData = await response.json();
  } catch (error) {
    console.error("No se pudo cargar el JSON de gallery:", error);
    return;
  }

  updateGalleryLogoForViewport();

  if (typeof galleryMobileMediaQuery.addEventListener === "function") {
    galleryMobileMediaQuery.addEventListener("change", updateGalleryLogoForViewport);
  } else if (typeof galleryMobileMediaQuery.addListener === "function") {
    galleryMobileMediaQuery.addListener(updateGalleryLogoForViewport);
  }

  if (galleryBrandElement && galleryData.logo) {
    galleryBrandElement.href = galleryData.logo.href || "./home.html";
  }

  if (galleryMenuElement && Array.isArray(galleryData.menu)) {
    galleryMenuElement.innerHTML = galleryData.menu
      .map((item, index, array) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(cleanHref(item.href || "#"));
        const separator = index < array.length - 1 ? "," : "";
        const currentClass = item.current ? " is-current" : "";
        const ariaCurrent = item.current ? 'aria-current="page"' : "";

        return `
          <li class="gallery-nav__item">
            <a
              class="gallery-nav__link${currentClass}"
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

  if (galleryMobileMenuElement && Array.isArray(galleryData.menu)) {
    const mobileItems = [
      ...galleryData.menu,
      {
        label: "HOME",
        href: "./home.html"
      }
    ];

    galleryMobileMenuElement.innerHTML = mobileItems
      .map((item) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(cleanHref(item.href || "#"));
        const currentClass = item.current ? " is-current" : "";
        const ariaCurrent = item.current ? 'aria-current="page"' : "";

        return `
          <li class="gallery-mobile-menu-list__item">
            <a
              class="gallery-mobile-menu-list__link${currentClass}"
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

  if (galleryStartProjectElement) {
    const startLabel = galleryData.startProject?.label || "START A PROJECT";
    const startHoverLabel = galleryData.startProject?.hoverLabel || "GET IN TOUCH";

    galleryStartProjectElement.innerHTML = createRollingText(
      startLabel,
      startHoverLabel
    );

    galleryStartProjectElement.setAttribute("aria-label", startLabel);

    galleryStartProjectElement.href =
      cleanHref(galleryData.startProject?.href) ||
      "mailto:almudenaestevez23@gmail.com";
  }

  if (galleryCopyrightElement) {
    galleryCopyrightElement.textContent =
      galleryData.footer?.copyright || "© 2026 FACEITOUT";
  }

  if (gallerySocialElement && Array.isArray(galleryData.footer?.social)) {
    gallerySocialElement.innerHTML = galleryData.footer.social
      .map((item, index, array) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const cleanItemHref = cleanHref(item.href || "#");
        const safeHref = escapeHTML(cleanItemHref);
        const separator = index < array.length - 1 ? "/" : "";

        return `
          <a
            class="gallery-footer__social-link"
            href="${safeHref}"
            ${getExternalAttrs(cleanItemHref)}
            aria-label="${safeLabel}"
          >
            ${createRollingText(label)}
          </a>
          ${
            separator
              ? `<span class="gallery-footer__separator" aria-hidden="true">${separator}</span>`
              : ""
          }
        `;
      })
      .join("");
  }

  if (galleryMobileSocialElement && Array.isArray(galleryData.footer?.social)) {
    galleryMobileSocialElement.innerHTML = galleryData.footer.social
      .map((item) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const cleanItemHref = cleanHref(item.href || "#");
        const safeHref = escapeHTML(cleanItemHref);

        return `
          <a
            class="gallery-mobile-menu-social__link"
            href="${safeHref}"
            ${getExternalAttrs(cleanItemHref)}
            aria-label="${safeLabel}"
          >
            ${safeLabel}
          </a>
        `;
      })
      .join("");
  }

  if (galleryCreditElement) {
    const creditLabel = galleryData.footer?.credit || "DESIGNED BY ALMU ESTEVEZ :)";

    galleryCreditElement.innerHTML = createRollingText(creditLabel);
    galleryCreditElement.setAttribute("aria-label", creditLabel);
  }

  if (galleryMobileCreditElement) {
    galleryMobileCreditElement.textContent =
      galleryData.footer?.credit || "DESIGNED BY ALMU ESTEVEZ :)";
  }

  function setGalleryMobileMenuOpen(isOpen) {
    document.body.classList.toggle("is-gallery-mobile-menu-open", isOpen);

    if (galleryMobileMenuPanelElement) {
      galleryMobileMenuPanelElement.setAttribute("aria-hidden", String(!isOpen));
    }

    if (galleryMobileMenuWordElement) {
      galleryMobileMenuWordElement.textContent = isOpen ? "MENU" : "GALLERY";
    }

    galleryMobileToggleElements.forEach((toggle) => {
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });
  }

  function initGalleryMobileMenu() {
    if (!galleryMobileToggleElements.length || !galleryMobileMenuPanelElement) return;

    setGalleryMobileMenuOpen(false);

    galleryMobileToggleElements.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const isOpen = document.body.classList.contains("is-gallery-mobile-menu-open");

        setGalleryMobileMenuOpen(!isOpen);
      });
    });

    galleryMobileMenuPanelElement.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");

      if (link) {
        setGalleryMobileMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        !document.body.classList.contains("is-gallery-detail-open")
      ) {
        setGalleryMobileMenuOpen(false);
      }
    });
  }

  function initGalleryEntranceAnimation() {
    if (typeof gsap === "undefined") return;

    const entranceElements = [
      ".gallery-brand",
      ".gallery-nav__item",
      ".gallery-start",
      ".gallery-footer__copyright",
      ".gallery-footer__social",
      ".gallery-footer__credit"
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
      !galleryBrandElement ||
      typeof gsap === "undefined" ||
      typeof Draggable === "undefined"
    ) {
      return;
    }

    gsap.registerPlugin(Draggable);

    gsap.set(galleryBrandElement, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      transformOrigin: "50% 50%"
    });

    gsap.fromTo(
      galleryBrandElement,
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

    Draggable.create(galleryBrandElement, {
      type: "x,y",
      zIndexBoost: false,
      minimumMovement: 4,

      onPress() {
        gsap.killTweensOf(galleryBrandElement);

        galleryBrandElement.classList.add("is-dragging");

        gsap.to(galleryBrandElement, {
          scale: 1.08,
          rotation: -4,
          duration: 0.18,
          ease: "power2.out",
          overwrite: "auto"
        });
      },

      onDrag() {
        const rotationAmount = gsap.utils.clamp(-12, 12, this.x * 0.045);

        gsap.to(galleryBrandElement, {
          rotation: rotationAmount,
          duration: 0.12,
          ease: "power2.out",
          overwrite: "auto"
        });
      },

      onRelease() {
        galleryBrandElement.classList.remove("is-dragging");

        gsap.to(galleryBrandElement, {
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
      !galleryMobileMenuPanelElement ||
      !galleryMobileToggleElements.length
    ) {
      return;
    }

    galleryMobileToggleElements.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const isOpening = document.body.classList.contains("is-gallery-mobile-menu-open");

        if (!isOpening) return;

        gsap.fromTo(
          [
            ".gallery-mobile-menu-list__item",
            ".gallery-mobile-menu-social__link",
            ".gallery-mobile-menu-credit"
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

  initGalleryMobileMenu();
  initGalleryDetailModal();
  initInfiniteGallery();
  initMobileMenuAnimation();
  initGalleryEntranceAnimation();
  initDraggableLogo();
});