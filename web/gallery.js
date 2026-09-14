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

  const fallbackGalleryImageSrc = "./assets/images/Cartel_03.png";

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
  let galleryDetailDotsElement = null;
  let galleryDetailInfoElement = null;
  let galleryDetailDescriptionElement = null;
  let galleryDetailCloseElement = null;
  let galleryDetailAudioToggleElement = null;
  let galleryDetailPrevProjectElement = null;
  let galleryDetailNextProjectElement = null;
  let galleryDetailPrevSlideElement = null;
  let galleryDetailNextSlideElement = null;

  let galleryData = null;
  let selectedGalleryItem = null;
  let galleryItems = [];

  let currentDetailProjectIndex = 0;
  let currentDetailSlideIndex = 0;
  let currentDetailMediaItems = [];
  let detailSlideIndexes = new Map();

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
    galleryDetailDotsElement = document.getElementById("galleryDetailDots");
    galleryDetailInfoElement = document.getElementById("galleryDetailInfo");
    galleryDetailDescriptionElement = document.getElementById("galleryDetailDescription");
    galleryDetailCloseElement = document.getElementById("galleryDetailClose");
    galleryDetailAudioToggleElement = document.getElementById("galleryDetailAudioToggle");
    galleryDetailPrevProjectElement = document.getElementById("galleryDetailPrevProject");
    galleryDetailNextProjectElement = document.getElementById("galleryDetailNextProject");
    galleryDetailPrevSlideElement = document.getElementById("galleryDetailPrevSlide");
    galleryDetailNextSlideElement = document.getElementById("galleryDetailNextSlide");
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

    const oldTopElement = galleryDetailElement.querySelector(".gallery-detail__top");
    const oldDividerElement = galleryDetailElement.querySelector(".gallery-detail__divider");

    if (oldTopElement && galleryDetailCloseElement) {
      galleryDetailDialogElement.insertBefore(
        galleryDetailCloseElement,
        galleryDetailDialogElement.firstChild
      );
      oldTopElement.remove();
    }

    if (oldDividerElement) {
      oldDividerElement.remove();
    }

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

    galleryDetailPrevSlideElement =
      document.getElementById("galleryDetailPrevSlide") ||
      createButtonElement(
        "gallery-detail__slide-step gallery-detail__slide-step--prev",
        "galleryDetailPrevSlide",
        "Imagen anterior del proyecto",
        "chevron_left"
      );

    galleryDetailNextSlideElement =
      document.getElementById("galleryDetailNextSlide") ||
      createButtonElement(
        "gallery-detail__slide-step gallery-detail__slide-step--next",
        "galleryDetailNextSlide",
        "Imagen siguiente del proyecto",
        "chevron_right"
      );

    galleryDetailPrevProjectElement.className =
      "gallery-detail__project-nav gallery-detail__project-nav--prev";

    galleryDetailNextProjectElement.className =
      "gallery-detail__project-nav gallery-detail__project-nav--next";

    galleryDetailPrevSlideElement.className =
      "gallery-detail__slide-step gallery-detail__slide-step--prev";

    galleryDetailNextSlideElement.className =
      "gallery-detail__slide-step gallery-detail__slide-step--next";

    galleryDetailMediaShellElement.insertBefore(
      galleryDetailPrevProjectElement,
      galleryDetailMediaShellElement.firstChild
    );

    galleryDetailMediaShellElement.insertBefore(
      galleryDetailPrevSlideElement,
      galleryDetailMediaViewportElement
    );

    galleryDetailMediaShellElement.appendChild(galleryDetailNextSlideElement);
    galleryDetailMediaShellElement.appendChild(galleryDetailNextProjectElement);

    galleryDetailDotsElement =
      document.getElementById("galleryDetailDots") ||
      (() => {
        const element = document.createElement("div");
        element.className = "gallery-detail__dots";
        element.id = "galleryDetailDots";
        element.setAttribute("aria-label", "Navegación de imágenes del proyecto");
        contentElement.appendChild(element);
        return element;
      })();

    if (galleryDetailDotsElement.parentElement !== contentElement) {
      galleryDetailMediaShellElement.insertAdjacentElement("afterend", galleryDetailDotsElement);
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
    setButtonIcon(galleryDetailPrevSlideElement, "chevron_left");
    setButtonIcon(galleryDetailNextSlideElement, "chevron_right");

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

                    <button
                      class="gallery-detail__slide-step gallery-detail__slide-step--prev"
                      id="galleryDetailPrevSlide"
                      type="button"
                      aria-label="Imagen anterior del proyecto"
                      hidden
                    >
                      ${createMaterialIcon("chevron_left")}
                    </button>

                    <div class="gallery-detail__media-viewport">
                      <div
                        class="gallery-detail__media-track"
                        id="galleryDetailMediaTrack"
                      ></div>
                    </div>

                    <button
                      class="gallery-detail__slide-step gallery-detail__slide-step--next"
                      id="galleryDetailNextSlide"
                      type="button"
                      aria-label="Imagen siguiente del proyecto"
                      hidden
                    >
                      ${createMaterialIcon("chevron_right")}
                    </button>

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
                    class="gallery-detail__dots"
                    id="galleryDetailDots"
                    aria-label="Navegación de imágenes del proyecto"
                  ></div>

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
        poster: item.poster || item.image || fallbackGalleryImageSrc,
        alt: item.alt || item.title || "Gallery video"
      };
    }

    return {
      type: "image",
      src: item?.image || item?.poster || fallbackGalleryImageSrc,
      poster: "",
      alt: item?.alt || item?.title || "Gallery image"
    };
  }

  function normalizeMediaEntry(entry, fallbackAlt = "") {
    if (!entry) return null;

    if (typeof entry === "string") {
      const type = isVideoSource(entry) ? "video" : "image";

      return {
        type,
        src: entry,
        poster: type === "video" ? fallbackGalleryImageSrc : "",
        alt: fallbackAlt
      };
    }

    const src = entry.src || entry.image || entry.video || entry.url || "";

    if (!src) return null;

    const explicitType = String(entry.type || "").toLowerCase();
    const type = explicitType === "video" || isVideoSource(src) ? "video" : "image";

    return {
      type,
      src,
      poster:
        entry.poster ||
        entry.thumbnail ||
        entry.image ||
        (type === "video" ? fallbackGalleryImageSrc : ""),
      alt: entry.alt || fallbackAlt
    };
  }

  function getDetailMediaItems(item) {
    const fallbackAlt = item?.alt || item?.title || "Gallery item";
    const rawEntries = [];

    if (Array.isArray(item?.detailMedia)) {
      rawEntries.push(...item.detailMedia);
    }

    if (Array.isArray(item?.media)) {
      rawEntries.push(...item.media);
    }

    if (Array.isArray(item?.images)) {
      item.images.forEach((image) => {
        rawEntries.push({
          type: "image",
          src: image,
          alt: fallbackAlt
        });
      });
    }

    if (Array.isArray(item?.videos)) {
      item.videos.forEach((video) => {
        rawEntries.push({
          type: "video",
          src: video,
          poster: item?.poster || item?.image || fallbackGalleryImageSrc,
          alt: fallbackAlt
        });
      });
    }

    if (!rawEntries.length) {
      if ((item?.type === "video" || item?.video) && item?.video) {
        rawEntries.push({
          type: "video",
          src: item.video,
          poster: item.poster || item.image || fallbackGalleryImageSrc,
          alt: fallbackAlt
        });
      }

      if (item?.image) {
        rawEntries.push({
          type: "image",
          src: item.image,
          alt: fallbackAlt
        });
      }
    }

    const normalizedEntries = rawEntries
      .map((entry) => normalizeMediaEntry(entry, fallbackAlt))
      .filter(Boolean);

    if (!normalizedEntries.length) {
      normalizedEntries.push({
        type: "image",
        src: fallbackGalleryImageSrc,
        poster: "",
        alt: fallbackAlt
      });
    }

    return normalizedEntries;
  }

  function getCurrentDetailMediaItem() {
    if (!currentDetailMediaItems.length) return null;

    return currentDetailMediaItems[currentDetailSlideIndex] || null;
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

  function getActiveDetailVideo() {
    if (!galleryDetailMediaTrackElement) return null;

    const activeSlide = galleryDetailMediaTrackElement.querySelector(
      ".gallery-detail__project-slide.is-active, .gallery-detail__media-slide.is-active"
    );

    if (!activeSlide) return null;

    return activeSlide.querySelector("video");
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

    const playPromise = activeVideo.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        if (!isGalleryDetailAudioEnabled) return;

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

  function getSavedSlideIndex(projectIndex) {
    const safeProjectIndex = wrapIndex(projectIndex, galleryItems.length);
    const item = galleryItems[safeProjectIndex];
    const mediaItems = getDetailMediaItems(item);
    const savedIndex = detailSlideIndexes.get(safeProjectIndex) || 0;

    return wrapIndex(savedIndex, mediaItems.length);
  }

  function setSavedSlideIndex(projectIndex, slideIndex) {
    const safeProjectIndex = wrapIndex(projectIndex, galleryItems.length);
    const item = galleryItems[safeProjectIndex];
    const mediaItems = getDetailMediaItems(item);
    const safeSlideIndex = wrapIndex(slideIndex, mediaItems.length);

    detailSlideIndexes.set(safeProjectIndex, safeSlideIndex);

    return safeSlideIndex;
  }

  function getProjectDisplayMedia(projectIndex) {
    const safeProjectIndex = wrapIndex(projectIndex, galleryItems.length);
    const item = galleryItems[safeProjectIndex];
    const mediaItems = getDetailMediaItems(item);
    const slideIndex = getSavedSlideIndex(safeProjectIndex);

    return mediaItems[slideIndex] || mediaItems[0] || {
      type: "image",
      src: fallbackGalleryImageSrc,
      poster: "",
      alt: item?.title || "Gallery item"
    };
  }

  function getGalleryMetrics() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const gap = viewportWidth <= 420 ? 9 : viewportWidth <= 768 ? 10 : 12;

    let columnsOnScreen = 5;

    if (viewportWidth <= 768) {
      columnsOnScreen = 2.75;
    }

    if (viewportWidth <= 420) {
      columnsOnScreen = 2.4;
    }

    const tileWidth =
      (viewportWidth - gap * (columnsOnScreen - 1)) / columnsOnScreen;

    const tileHeight = tileWidth * 1.3356;

    const stepX = tileWidth + gap;
    const stepY = tileHeight + gap;

    const extraColumns = 4;
    const extraRows = 4;

    const columns = Math.ceil(viewportWidth / stepX) + extraColumns;
    const rows = Math.ceil(viewportHeight / stepY) + extraRows;

    const loopWidth = columns * stepX;
    const loopHeight = rows * stepY;

    const offsetStrength = viewportWidth <= 768 ? 0.18 : 0.24;

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

  function createTileMediaHTML(item, tileIndex = 0) {
    const media = getGalleryPrimaryMedia(item);
    const safeSrc = escapeHTML(media.src || fallbackGalleryImageSrc);
    const safePoster = escapeHTML(media.poster || fallbackGalleryImageSrc);
    const safeAlt = escapeHTML(media.alt || item?.title || "Gallery item");

    if (media.type === "video") {
      return `
        <video
          class="gallery-tile__media"
          data-src="${safeSrc}"
          poster="${safePoster}"
          muted
          loop
          playsinline
          preload="none"
          aria-label="${safeAlt}"
        ></video>
      `;
    }

    const loading = tileIndex < 18 ? "eager" : "lazy";
    const fetchPriority = tileIndex < 8 ? "high" : "auto";

    return `
      <img
        class="gallery-tile__media"
        src="${safeSrc}"
        alt="${safeAlt}"
        draggable="false"
        loading="${loading}"
        decoding="async"
        fetchpriority="${fetchPriority}"
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
          ${createTileMediaHTML(item, tileIndex)}
        </span>
      </button>
    `;
  }

  function playGalleryGridVideos() {
    if (!galleryWorldElement) return;

    const videos = Array.from(
      galleryWorldElement.querySelectorAll("video.gallery-tile__media")
    );

    if (!videos.length) return;

    const maxVideosToPlay = window.innerWidth <= 768 ? 2 : 5;
    let playedVideos = 0;

    videos.forEach((video) => {
      if (playedVideos >= maxVideosToPlay) {
        video.pause();
        return;
      }

      const rect = video.getBoundingClientRect();

      const isNearViewport =
        rect.right > -180 &&
        rect.left < window.innerWidth + 180 &&
        rect.bottom > -180 &&
        rect.top < window.innerHeight + 180;

      if (!isNearViewport && playedVideos > 0) return;

      video.muted = true;
      video.volume = 0;
      video.loop = true;
      video.playsInline = true;

      if (!video.getAttribute("src") && video.dataset.src) {
        video.src = video.dataset.src;
      }

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }

      playedVideos += 1;
    });
  }

  function createDetailMediaHTML(mediaItem, isActive = false, title = "") {
    const safeTitle = escapeHTML(mediaItem.alt || title || "Gallery media");
    const safeSrc = escapeHTML(mediaItem.src || fallbackGalleryImageSrc);
    const safePoster = escapeHTML(mediaItem.poster || fallbackGalleryImageSrc);

    if (mediaItem.type === "video") {
      return `
        <video
          class="gallery-detail__media"
          ${isActive ? `src="${safeSrc}"` : `data-src="${safeSrc}"`}
          poster="${safePoster}"
          loop
          playsinline
          preload="${isActive ? "metadata" : "none"}"
          aria-label="${safeTitle}"
        ></video>
      `;
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
    const mediaItem = getProjectDisplayMedia(projectIndex);
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

  function createDetailMediaSlideHTML(mediaItem, mediaIndex, title) {
    const activeClass = mediaIndex === currentDetailSlideIndex ? " is-active" : "";
    const safeTitle = escapeHTML(mediaItem.alt || title || `Imagen ${mediaIndex + 1}`);

    return `
      <div
        class="gallery-detail__media-slide${activeClass}"
        data-gallery-detail-media-slide="${mediaIndex}"
        aria-label="${safeTitle}"
      >
        <span class="gallery-detail__media-slide-inner">
          ${createDetailMediaHTML(mediaItem, mediaIndex === currentDetailSlideIndex, title)}
        </span>
      </div>
    `;
  }

  function renderDetailTrack() {
    if (!galleryDetailMediaTrackElement || !galleryItems.length) return;

    const item = galleryItems[currentDetailProjectIndex];
    const itemTitle = normalizeLabel(item?.title || "GALLERY ITEM");

    if (isGalleryMobileDetailMode()) {
      galleryDetailMediaTrackElement.innerHTML = currentDetailMediaItems
        .map((mediaItem, index) => createDetailMediaSlideHTML(mediaItem, index, itemTitle))
        .join("");

      galleryDetailMediaTrackElement.dataset.galleryDetailMode = "media";
      return;
    }

    galleryDetailMediaTrackElement.innerHTML = galleryItems
      .map((galleryItem, index) => createDetailProjectSlideHTML(galleryItem, index))
      .join("");

    galleryDetailMediaTrackElement.dataset.galleryDetailMode = "project";
  }

  function pauseDetailVideos(stopAllVideos = false) {
    if (!galleryDetailMediaTrackElement) return;

    const videos = Array.from(
      galleryDetailMediaTrackElement.querySelectorAll("video")
    );

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

  function playActiveDetailVideo() {
    applyActiveDetailVideoAudioState();
  }

  function getActiveCarouselSlide() {
    if (!galleryDetailMediaTrackElement) return null;

    if (isGalleryMobileDetailMode()) {
      return galleryDetailMediaTrackElement.querySelector(
        `.gallery-detail__media-slide[data-gallery-detail-media-slide="${currentDetailSlideIndex}"]`
      );
    }

    return galleryDetailMediaTrackElement.querySelector(
      `.gallery-detail__project-slide[data-gallery-detail-project-slide="${currentDetailProjectIndex}"]`
    );
  }

  function getCarouselTranslateX(dragOffsetX = 0) {
    if (!galleryDetailMediaViewportElement || !galleryDetailMediaTrackElement) {
      return dragOffsetX;
    }

    const activeSlide = getActiveCarouselSlide();

    if (!activeSlide) return dragOffsetX;

    const viewportWidth = galleryDetailMediaViewportElement.clientWidth;
    const activeCenter = activeSlide.offsetLeft + activeSlide.offsetWidth / 2;

    return viewportWidth / 2 - activeCenter + dragOffsetX;
  }

  function applyDetailCarouselPosition(animated = true, dragOffsetX = 0) {
    if (!galleryDetailMediaTrackElement) return;

    const translateX = getCarouselTranslateX(dragOffsetX);

    galleryDetailMediaTrackElement.style.transition = animated
      ? "transform 0.52s cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";

    galleryDetailMediaTrackElement.style.transform = `translate3d(${translateX}px, 0, 0)`;
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

  function renderDetailDots() {
    if (!galleryDetailDotsElement) return;

    if (currentDetailMediaItems.length > 1) {
      galleryDetailDotsElement.hidden = false;

      galleryDetailDotsElement.innerHTML = currentDetailMediaItems
        .map((_, index) => {
          return `
            <button
              class="gallery-detail__dot${index === currentDetailSlideIndex ? " is-active" : ""}"
              type="button"
              data-gallery-detail-dot="${index}"
              aria-label="Ir a imagen ${index + 1}"
              aria-current="${index === currentDetailSlideIndex ? "true" : "false"}"
            ></button>
          `;
        })
        .join("");
    } else {
      galleryDetailDotsElement.hidden = true;
      galleryDetailDotsElement.innerHTML = "";
    }
  }

  function refreshDetailControls() {
    const hasMultipleProjects = galleryItems.length > 1;
    const hasMultipleProjectImages = currentDetailMediaItems.length > 1;

    if (galleryDetailPrevProjectElement) {
      galleryDetailPrevProjectElement.hidden = !hasMultipleProjects;
    }

    if (galleryDetailNextProjectElement) {
      galleryDetailNextProjectElement.hidden = !hasMultipleProjects;
    }

    if (galleryDetailPrevSlideElement) {
      galleryDetailPrevSlideElement.hidden = !hasMultipleProjectImages;
    }

    if (galleryDetailNextSlideElement) {
      galleryDetailNextSlideElement.hidden = !hasMultipleProjectImages;
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

    const mediaSlides = Array.from(
      galleryDetailMediaTrackElement.querySelectorAll(".gallery-detail__media-slide")
    );

    mediaSlides.forEach((slide) => {
      const slideIndex = Number(slide.dataset.galleryDetailMediaSlide || 0);
      slide.classList.toggle("is-active", slideIndex === currentDetailSlideIndex);
    });

    const dots = Array.from(
      galleryDetailDotsElement?.querySelectorAll(".gallery-detail__dot") || []
    );

    dots.forEach((dot, index) => {
      const isActive = index === currentDetailSlideIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function updateDetailUI(animated = true) {
    if (!galleryItems.length) return;

    const item = galleryItems[currentDetailProjectIndex];
    const itemTitle = normalizeLabel(item?.title || "GALLERY ITEM");

    currentDetailMediaItems = getDetailMediaItems(item);
    currentDetailSlideIndex = getSavedSlideIndex(currentDetailProjectIndex);

    renderDetailTrack();
    renderDetailDots();
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
      pauseDetailVideos(false);
      playActiveDetailVideo();
    });
  }

  function renderGalleryDetail(projectIndex = 0, slideIndex = 0) {
    if (!galleryItems.length || !galleryDetailElement) return;

    currentDetailProjectIndex = wrapIndex(projectIndex, galleryItems.length);
    currentDetailMediaItems = getDetailMediaItems(galleryItems[currentDetailProjectIndex]);
    currentDetailSlideIndex = setSavedSlideIndex(currentDetailProjectIndex, slideIndex);

    updateDetailUI(false);
  }

  function openGalleryDetail(projectIndex = 0, slideIndex = 0) {
    if (!galleryDetailElement || !galleryItems.length) return;

    isGalleryDetailAudioEnabled = true;

    renderGalleryDetail(projectIndex, slideIndex);

    galleryDetailElement.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-gallery-detail-open");
    returnToNormalCursor();

    window.requestAnimationFrame(() => {
      applyDetailCarouselPosition(false, 0);
      playActiveDetailVideo();
    });
  }

  function closeGalleryDetail() {
    if (!galleryDetailElement) return;

    galleryDetailElement.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-gallery-detail-open");

    pauseDetailVideos(true);
    updateDetailAudioButton();
    playGalleryGridVideos();
  }

  function goToDetailSlide(slideIndex, animated = true) {
    if (!currentDetailMediaItems.length) return;

    currentDetailSlideIndex = setSavedSlideIndex(currentDetailProjectIndex, slideIndex);

    if (isGalleryMobileDetailMode()) {
      updateDetailActiveClasses();
      renderDetailDots();
      refreshDetailControls();

      window.requestAnimationFrame(() => {
        updateDetailActiveClasses();
        applyDetailCarouselPosition(animated, 0);
        pauseDetailVideos(false);
        playActiveDetailVideo();
      });

      return;
    }

    updateDetailUI(false);
  }

  function goToDetailProjectByIndex(projectIndex, animated = true) {
    if (!galleryItems.length) return;

    currentDetailProjectIndex = wrapIndex(projectIndex, galleryItems.length);
    currentDetailMediaItems = getDetailMediaItems(galleryItems[currentDetailProjectIndex]);
    currentDetailSlideIndex = getSavedSlideIndex(currentDetailProjectIndex);

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

    function getDragMode() {
      return isGalleryMobileDetailMode() ? "media" : "project";
    }

    function canDragCarousel(event) {
      if (!document.body.classList.contains("is-gallery-detail-open")) return false;
      if (event.target.closest("button, a")) return false;

      const dragMode = getDragMode();

      if (dragMode === "media") {
        return currentDetailMediaItems.length > 1;
      }

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
        applyDetailCarouselPosition(false, deltaX);
      },
      { passive: false }
    );

    function finishDrag(event) {
      if (activePointerId !== event.pointerId) return;

      const dragMode = getDragMode();

      const deltaX = latestX - startX;
      const deltaY = latestY - startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      const viewportWidth =
        galleryDetailMediaViewportElement.clientWidth || window.innerWidth;

      const threshold = dragMode === "media"
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
        if (dragMode === "media") {
          goToDetailSlide(currentDetailSlideIndex + direction, true);
          return;
        }

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

    if (galleryDetailPrevSlideElement) {
      galleryDetailPrevSlideElement.addEventListener("click", (event) => {
        event.stopPropagation();
        goToDetailSlide(currentDetailSlideIndex - 1);
      });
    }

    if (galleryDetailNextSlideElement) {
      galleryDetailNextSlideElement.addEventListener("click", (event) => {
        event.stopPropagation();
        goToDetailSlide(currentDetailSlideIndex + 1);
      });
    }

    if (galleryDetailDotsElement) {
      galleryDetailDotsElement.addEventListener("click", (event) => {
        const dot = event.target.closest("[data-gallery-detail-dot]");

        if (!dot) return;

        goToDetailSlide(Number(dot.dataset.galleryDetailDot || 0));
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

      if (event.key === "ArrowUp") {
        goToDetailSlide(currentDetailSlideIndex - 1);
      }

      if (event.key === "ArrowDown") {
        goToDetailSlide(currentDetailSlideIndex + 1);
      }

      if (event.key.toLowerCase() === "m") {
        isGalleryDetailAudioEnabled = !isGalleryDetailAudioEnabled;
        updateDetailAudioButton();
        applyActiveDetailVideoAudioState();
      }
    });
  }

  function initInfiniteGallery() {
    if (!galleryInfiniteElement || !galleryViewportElement || !galleryWorldElement) {
      return;
    }

    const sourceItems =
      Array.isArray(galleryData?.gallery) && galleryData.gallery.length
        ? galleryData.gallery
        : [
            {
              title: "Gallery item fallback",
              type: "image",
              image: fallbackGalleryImageSrc,
              poster: fallbackGalleryImageSrc,
              alt: "Gallery item fallback"
            }
          ];

    galleryItems = sourceItems;

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
    let videoWarmupTimeoutId = null;
    let tileRenderItems = [];

    function applyGalleryCSSVars() {
      galleryWorldElement.style.setProperty("--gallery-tile-width", `${metrics.tileWidth}px`);
      galleryWorldElement.style.setProperty("--gallery-tile-height", `${metrics.tileHeight}px`);
      galleryWorldElement.style.setProperty("--gallery-gap", `${metrics.gap}px`);
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

    function scheduleGridVideoWarmup() {
      if (videoWarmupTimeoutId) {
        window.clearTimeout(videoWarmupTimeoutId);
      }

      const warmup = () => {
        videoWarmupTimeoutId = null;
        playGalleryGridVideos();
      };

      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(warmup, {
          timeout: 1400
        });

        return;
      }

      videoWarmupTimeoutId = window.setTimeout(warmup, 700);
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
      scheduleGridVideoWarmup();
    }

    function renderGalleryPosition(immediate = false) {
      if (!tileRenderItems.length) return;

      if (immediate) {
        currentX = targetX;
        currentY = targetY;
      } else {
        currentX += (targetX - currentX) * 0.18;
        currentY += (targetY - currentY) * 0.18;
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
      });
    }

    function startAnimationLoop() {
      if (animationFrameId) return;

      function tick() {
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
        playGalleryGridVideos();
      }

      animationFrameId = window.requestAnimationFrame(tick);
    }

    function moveGalleryBy(deltaX, deltaY) {
      targetX -= deltaX;
      targetY -= deltaY;

      hasInteractedInCurrentHover = true;
      returnToNormalCursor();
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
      }, 240);

      openGalleryDetail(sourceIndex, 0);

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

      returnToNormalCursor();
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
      returnToNormalCursor();

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
      openGalleryDetail(sourceIndex, 0);
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