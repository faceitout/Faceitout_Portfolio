document.addEventListener("DOMContentLoaded", async () => {
  const projectLogoElement = document.getElementById("projectLogo");
  const projectBrandElement = document.querySelector(".project-brand");
  const projectMenuElement = document.getElementById("projectMenu");
  const projectStartProjectElement = document.getElementById("projectStartProject");

  const projectDetailElement = document.getElementById("projectDetail");
  const projectCopyrightElement = document.getElementById("projectCopyright");
  const projectSocialElement = document.getElementById("projectSocial");
  const projectCreditElement = document.getElementById("projectCredit");

  const projectMobileMenuWordElement = document.querySelector(".project-mobile-menu-word");
  const projectMobileMenuPanelElement = document.getElementById("projectMobileMenuPanel");
  const projectMobileMenuElement = document.getElementById("projectMobileMenu");
  const projectMobileSocialElement = document.getElementById("projectMobileSocial");
  const projectMobileCreditElement = document.getElementById("projectMobileCredit");

  const projectMobileToggleElements = Array.from(
    new Set(
      [
        ...document.querySelectorAll("[data-project-mobile-toggle]"),
        ...document.querySelectorAll(".project-mobile-menu-word"),
        ...document.querySelectorAll(".project-mobile-menu-button"),
        document.getElementById("projectMobileMenuToggle")
      ].filter(Boolean)
    )
  );

  const projectDesktopLogoSrc = "./assets/images/LOGO.svg";
  const projectMobileLogoSrc = "./assets/images/LOGO2.svg";
  const projectMobileMediaQuery = window.matchMedia("(max-width: 48rem)");
  const projectId = document.body.dataset.project;

  let projectsData = null;
  let currentProjectGalleryItems = [];
  let currentLightboxIndex = 0;

  let projectLightboxElement = null;
  let projectLightboxViewportElement = null;
  let projectLightboxTrackElement = null;
  let projectLightboxDotsElement = null;
  let projectLightboxCloseElement = null;
  let projectLightboxPrevElement = null;
  let projectLightboxNextElement = null;

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

  function safeClassName(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
  }

  function isExternalUrl(href) {
    return /^https?:\/\//i.test(String(href || ""));
  }

  function getExternalAttrs(href) {
    return isExternalUrl(href) ? 'target="_blank" rel="noopener noreferrer"' : "";
  }

  function isVideoSource(src) {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(String(src || ""));
  }

  function isVideoItem(item) {
    return (
      item?.type === "video" ||
      Boolean(item?.video) ||
      isVideoSource(item?.image) ||
      isVideoSource(item?.src)
    );
  }

  function hasSoundControl(item) {
    return isVideoItem(item) && Boolean(item?.sound);
  }

  function wrapIndex(index, total) {
    if (!total) return 0;
    return ((index % total) + total) % total;
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

  function createExpandIcon() {
    return `
      <svg class="project-detail__open-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.2 4H4v4.2"></path>
        <path d="M4.4 4.4 9.6 9.6"></path>
        <path d="M15.8 4H20v4.2"></path>
        <path d="M19.6 4.4 14.4 9.6"></path>
        <path d="M8.2 20H4v-4.2"></path>
        <path d="M4.4 19.6 9.6 14.4"></path>
        <path d="M15.8 20H20v-4.2"></path>
        <path d="M19.6 19.6 14.4 14.4"></path>
      </svg>
    `;
  }

  function createCloseIcon() {
    return `
      <svg class="project-lightbox__close-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5 19 19"></path>
        <path d="M19 5 5 19"></path>
      </svg>
    `;
  }

  function createArrowIcon(direction = "next") {
    if (direction === "prev") {
      return `
        <svg class="project-lightbox__arrow-svg" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5 8 12l7 7"></path>
        </svg>
      `;
    }

    return `
      <svg class="project-lightbox__arrow-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 5 16 12l-7 7"></path>
      </svg>
    `;
  }

  function createVolumeIcon(isMuted = true) {
    if (isMuted) {
      return `
        <svg class="project-detail__sound-svg" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9.4h3.55L12 5.75v12.5L7.55 14.6H4V9.4Z"></path>
          <path d="M16.15 9.05l4.8 4.8"></path>
          <path d="M20.95 9.05l-4.8 4.8"></path>
        </svg>
      `;
    }

    return `
      <svg class="project-detail__sound-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9.4h3.55L12 5.75v12.5L7.55 14.6H4V9.4Z"></path>
        <path d="M15.3 8.3c1.05.9 1.7 2.22 1.7 3.7s-.65 2.8-1.7 3.7"></path>
        <path d="M17.8 5.8c1.7 1.55 2.75 3.75 2.75 6.2s-1.05 4.65-2.75 6.2"></path>
      </svg>
    `;
  }

  function updateProjectLogoForViewport() {
    if (!projectLogoElement) return;

    const isMobile = projectMobileMediaQuery.matches;

    projectLogoElement.src = isMobile ? projectMobileLogoSrc : projectDesktopLogoSrc;
    projectLogoElement.alt = projectsData?.logo?.text || "faceitout";
  }

  function getProjectGallery(project) {
    if (Array.isArray(project.gallery) && project.gallery.length) {
      return project.gallery;
    }

    if (project.coverImage) {
      return [
        {
          type: "image",
          image: project.coverImage,
          alt: project.title || "Project image"
        }
      ];
    }

    return [];
  }

  function getProjectCoverImage(project) {
    if (project.coverImage) return project.coverImage;
    if (project.image) return project.image;

    const gallery = getProjectGallery(project);
    const firstImage = gallery.find((item) => item.image);

    return firstImage?.image || "./assets/images/Nexo_08.png";
  }

  function getProjectHeroItem(project) {
    if (project.heroVideo) {
      return {
        type: "video",
        video: project.heroVideo,
        alt: project.title || "Project video"
      };
    }

    if (project.heroImage) {
      return {
        type: "image",
        image: project.heroImage,
        alt: project.title || "Project image"
      };
    }

    const gallery = getProjectGallery(project);
    const firstUsableItem = gallery.find((item) => item.image || item.video || item.src);

    return firstUsableItem || {
      type: "image",
      image: getProjectCoverImage(project),
      alt: project.title || "Project image"
    };
  }

  function normalizeProjectLightboxMedia(item) {
    const isVideo = isVideoItem(item);

    return {
      type: isVideo ? "video" : "image",
      src: isVideo
        ? item?.video || item?.image || item?.src || ""
        : item?.image || item?.src || item?.video || "",
      poster: item?.poster || item?.thumbnail || item?.image || "",
      alt: item?.alt || item?.title || "Project media",
      sound: Boolean(item?.sound)
    };
  }

  function createMediaMarkup(item, className, loading = "lazy", options = {}) {
    const isVideo = isVideoItem(item);
    const alt = escapeHTML(item.alt || item.title || "Project media");
    const mediaId = options.id ? `id="${escapeHTML(options.id)}"` : "";

    if (isVideo) {
      const videoSrc = escapeHTML(item.video || item.image || item.src || "");
      const poster = item.poster ? `poster="${escapeHTML(item.poster)}"` : "";
      const shouldLoadImmediately = loading === "eager";
      const srcAttr = shouldLoadImmediately ? `src="${videoSrc}"` : "";

      return `
        <video
          ${mediaId}
          class="${className}"
          ${srcAttr}
          data-src="${videoSrc}"
          data-project-video="true"
          data-sound-enabled="${hasSoundControl(item) ? "true" : "false"}"
          muted
          loop
          playsinline
          autoplay
          preload="${shouldLoadImmediately ? "metadata" : "none"}"
          ${poster}
          aria-label="${alt}"
        ></video>
      `;
    }

    const imageSrc = escapeHTML(item.image || item.src || "");

    return `
      <img
        ${mediaId}
        class="${className}"
        src="${imageSrc}"
        alt="${alt}"
        loading="${loading}"
        decoding="async"
        draggable="false"
      />
    `;
  }

  function createLightboxMediaMarkup(item) {
    const media = normalizeProjectLightboxMedia(item);
    const safeSrc = escapeHTML(media.src);
    const safePoster = media.poster ? `poster="${escapeHTML(media.poster)}"` : "";
    const safeAlt = escapeHTML(media.alt);

    if (media.type === "video") {
      return `
        <video
          class="project-lightbox__media"
          src="${safeSrc}"
          ${safePoster}
          data-project-lightbox-video="true"
          data-project-lightbox-sound="${media.sound ? "true" : "false"}"
          muted
          loop
          playsinline
          preload="auto"
          aria-label="${safeAlt}"
        ></video>
      `;
    }

    return `
      <img
        class="project-lightbox__media"
        src="${safeSrc}"
        alt="${safeAlt}"
        loading="eager"
        decoding="async"
        draggable="false"
      />
    `;
  }

  function createLightboxSoundButton() {
    return `
      <button
        class="project-lightbox__sound-toggle"
        type="button"
        data-project-lightbox-sound-toggle
        aria-label="Activar sonido"
        aria-pressed="false"
      >
        <span class="project-detail__sound-icon">
          ${createVolumeIcon(true)}
        </span>
      </button>
    `;
  }

  function createProjectLightboxSlideHTML(item, index) {
    const shouldShowSoundControl = hasSoundControl(item);

    return `
      <div
        class="project-lightbox__slide is-active"
        data-project-lightbox-slide="${index}"
        aria-hidden="false"
      >
        <div class="project-lightbox__media-frame">
          ${createLightboxMediaMarkup(item)}
          ${shouldShowSoundControl ? createLightboxSoundButton() : ""}
        </div>
      </div>
    `;
  }

  function createMetaRow(label, contentHTML) {
    if (!contentHTML) return "";

    return `
      <div class="project-detail__meta-row">
        <span class="project-detail__meta-label">${escapeHTML(label)}</span>
        <span class="project-detail__meta-value">${contentHTML}</span>
      </div>
    `;
  }

  function getProjectGalleryLayout(index) {
    const layoutPattern = [
      "wide",
      "half",
      "half",
      "wide",
      "half",
      "half",
      "third",
      "third",
      "third",
      "wide",
      "half",
      "half"
    ];

    return layoutPattern[index] || "wide";
  }

  function createSoundToggleButton(className = "project-detail__sound-toggle") {
    return `
      <button
        class="${className}"
        type="button"
        data-project-sound-toggle
        aria-label="Activar sonido"
        aria-pressed="false"
      >
        <span class="project-detail__sound-icon">
          ${createVolumeIcon(true)}
        </span>
      </button>
    `;
  }

  function createProjectGalleryItem(item, index, project) {
    const layout = safeClassName(item.layout || getProjectGalleryLayout(index));
    const videoId = `projectMediaVideo${index + 1}`;
    const shouldShowSoundControl = hasSoundControl(item);
    const projectClass = safeClassName(project?.id || projectId || "");
    const baseLayoutClass = layout === "wide" ? "project-detail__gallery-item--wide" : "project-detail__gallery-item--half";

    const classes = [
      "project-detail__gallery-item",
      baseLayoutClass,
      `project-detail__gallery-item--layout-${layout}`,
      `project-detail__gallery-item--nexo-${layout}`,
      projectClass ? `project-detail__gallery-item--${projectClass}` : "",
      shouldShowSoundControl ? "has-sound-control" : ""
    ]
      .filter(Boolean)
      .join(" ");

    return `
      <figure class="${classes}">
        <span class="project-detail__media-wrap">
          ${createMediaMarkup(
            item,
            "project-detail__gallery-media",
            index < 3 ? "eager" : "lazy",
            { id: isVideoItem(item) ? videoId : "" }
          )}
        </span>

        <button
          class="project-detail__open-button"
          type="button"
          data-project-lightbox-open="${index}"
          aria-label="Ver en grande ${escapeHTML(item.alt || item.title || `media ${index + 1}`)}"
        >
          <span class="project-detail__open-icon">
            ${createExpandIcon()}
          </span>
          <span class="project-detail__open-label">VER EN GRANDE</span>
        </button>

        ${shouldShowSoundControl ? createSoundToggleButton() : ""}
      </figure>
    `;
  }

  function setSoundButtonState(button, isSoundOn) {
    if (!button) return;

    button.classList.toggle("is-sound-on", isSoundOn);
    button.setAttribute("aria-pressed", String(isSoundOn));
    button.setAttribute("aria-label", isSoundOn ? "Quitar sonido" : "Activar sonido");

    const iconElement = button.querySelector(".project-detail__sound-icon");

    if (iconElement) {
      iconElement.innerHTML = createVolumeIcon(!isSoundOn);
    }
  }

  function ensureVideoSource(video) {
    if (!video) return;

    const dataSrc = video.dataset.src;

    if (!dataSrc) return;

    if (!video.getAttribute("src")) {
      video.setAttribute("src", dataSrc);
      video.load();
    }
  }

  function playVideo(video) {
    if (!video) return;

    ensureVideoSource(video);

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  function pauseProjectPageVideos() {
    const videos = Array.from(document.querySelectorAll(".project-detail video[data-project-video]"));

    videos.forEach((video) => {
      video.pause();
    });
  }

  function muteProjectPageVideos() {
    const videos = Array.from(document.querySelectorAll(".project-detail video[data-project-video]"));

    videos.forEach((video) => {
      video.muted = true;
      video.volume = 0;

      const figure = video.closest(".project-detail__gallery-item");
      const button = figure ? figure.querySelector("[data-project-sound-toggle]") : null;

      setSoundButtonState(button, false);
    });
  }

  function resumeProjectPageVideos() {
    const videos = Array.from(document.querySelectorAll(".project-detail video[data-project-video]"));

    videos.forEach((video) => {
      playVideo(video);
    });
  }

  function initProjectVideos() {
    const videos = Array.from(document.querySelectorAll(".project-detail video[data-project-video]"));
    const soundButtons = Array.from(document.querySelectorAll(".project-detail [data-project-sound-toggle]"));

    function getSoundButtonForVideo(video) {
      const figure = video.closest(".project-detail__gallery-item");

      if (!figure) return null;

      return figure.querySelector("[data-project-sound-toggle]");
    }

    function muteVideo(video) {
      if (!video) return;

      video.muted = true;
      video.volume = 0;

      setSoundButtonState(getSoundButtonForVideo(video), false);
    }

    function muteOtherSoundVideos(activeVideo) {
      videos.forEach((video) => {
        if (video === activeVideo) return;
        if (video.dataset.soundEnabled !== "true") return;

        muteVideo(video);
      });
    }

    videos.forEach((video) => {
      video.muted = true;
      video.volume = 0;
      video.loop = true;
      video.playsInline = true;
    });

    soundButtons.forEach((button) => {
      setSoundButtonState(button, false);

      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const figure = button.closest(".project-detail__gallery-item");
        const video = figure ? figure.querySelector("video[data-project-video]") : null;

        if (!video) return;

        const shouldTurnSoundOn = video.muted || video.volume === 0;

        if (shouldTurnSoundOn) {
          muteOtherSoundVideos(video);

          video.muted = false;
          video.volume = 1;

          playVideo(video);
          setSoundButtonState(button, true);
          return;
        }

        muteVideo(video);
        playVideo(video);
      });
    });

    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;

            if (document.body.classList.contains("is-project-lightbox-open")) {
              return;
            }

            if (entry.isIntersecting) {
              playVideo(video);
              return;
            }

            if (video.dataset.soundEnabled === "true") {
              muteVideo(video);
            }

            video.pause();
          });
        },
        {
          root: null,
          rootMargin: "650px 0px",
          threshold: 0.04
        }
      );

      videos.forEach((video) => {
        videoObserver.observe(video);
      });
    } else {
      videos.forEach((video) => {
        playVideo(video);
      });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        videos.forEach((video) => {
          if (video.dataset.soundEnabled === "true") {
            muteVideo(video);
          }

          video.pause();
        });

        return;
      }

      if (!document.body.classList.contains("is-project-lightbox-open")) {
        videos.forEach((video) => {
          playVideo(video);
        });
      }
    });
  }

  function ensureProjectLightbox() {
    const existingLightbox = document.getElementById("projectLightbox");

    if (!existingLightbox) {
      document.body.insertAdjacentHTML(
        "beforeend",
        `
          <div class="project-lightbox" id="projectLightbox" aria-hidden="true">
            <div class="project-lightbox__backdrop" data-project-lightbox-close></div>

            <section
              class="project-lightbox__dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Vista ampliada del proyecto"
            >
              <button
                class="project-lightbox__close"
                id="projectLightboxClose"
                type="button"
                aria-label="Cerrar imagen ampliada"
              >
                ${createCloseIcon()}
              </button>

              <button
                class="project-lightbox__nav project-lightbox__nav--prev"
                id="projectLightboxPrev"
                type="button"
                aria-label="Media anterior"
              >
                ${createArrowIcon("prev")}
              </button>

              <div
                class="project-lightbox__viewport"
                id="projectLightboxViewport"
                aria-label="Vista ampliada del proyecto"
              >
                <div class="project-lightbox__track" id="projectLightboxTrack"></div>
              </div>

              <button
                class="project-lightbox__nav project-lightbox__nav--next"
                id="projectLightboxNext"
                type="button"
                aria-label="Media siguiente"
              >
                ${createArrowIcon("next")}
              </button>

              <div class="project-lightbox__bottom">
                <div
                  class="project-lightbox__dots"
                  id="projectLightboxDots"
                  aria-label="Navegación de media"
                ></div>
              </div>
            </section>
          </div>
        `
      );
    }

    projectLightboxElement = document.getElementById("projectLightbox");
    projectLightboxViewportElement = document.getElementById("projectLightboxViewport");
    projectLightboxTrackElement = document.getElementById("projectLightboxTrack");
    projectLightboxDotsElement = document.getElementById("projectLightboxDots");
    projectLightboxCloseElement = document.getElementById("projectLightboxClose");
    projectLightboxPrevElement = document.getElementById("projectLightboxPrev");
    projectLightboxNextElement = document.getElementById("projectLightboxNext");
  }

  function pauseLightboxVideos() {
    if (!projectLightboxElement) return;

    const videos = Array.from(projectLightboxElement.querySelectorAll("video"));

    videos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
      video.volume = 0;
    });
  }

  function playActiveLightboxVideo() {
    if (!projectLightboxElement) return;

    const activeSlide = projectLightboxElement.querySelector(".project-lightbox__slide.is-active");
    const video = activeSlide ? activeSlide.querySelector("video[data-project-lightbox-video]") : null;

    if (!video) return;

    video.muted = true;
    video.volume = 0;
    video.loop = true;
    video.playsInline = true;

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  function updateLightboxSoundButton() {
    if (!projectLightboxElement) return;

    const button = projectLightboxElement.querySelector("[data-project-lightbox-sound-toggle]");
    const video = projectLightboxElement.querySelector("video[data-project-lightbox-video]");

    if (!button || !video) return;

    const isSoundOn = !video.muted && video.volume > 0;
    setSoundButtonState(button, isSoundOn);
  }

  function renderLightboxDots() {
    if (!projectLightboxDotsElement) return;

    if (currentProjectGalleryItems.length <= 1) {
      projectLightboxDotsElement.innerHTML = "";
      projectLightboxDotsElement.hidden = true;
      return;
    }

    projectLightboxDotsElement.hidden = false;

    projectLightboxDotsElement.innerHTML = currentProjectGalleryItems
      .map((_, index) => {
        return `
          <button
            class="project-lightbox__dot${index === currentLightboxIndex ? " is-active" : ""}"
            type="button"
            data-project-lightbox-dot="${index}"
            aria-label="Ir a media ${index + 1}"
            aria-current="${index === currentLightboxIndex ? "true" : "false"}"
          ></button>
        `;
      })
      .join("");
  }

  function updateLightboxNavVisibility() {
    const shouldShowNav = currentProjectGalleryItems.length > 1;

    if (projectLightboxPrevElement) {
      projectLightboxPrevElement.hidden = !shouldShowNav;
    }

    if (projectLightboxNextElement) {
      projectLightboxNextElement.hidden = !shouldShowNav;
    }
  }

  function renderProjectLightboxSlide(direction = 0) {
    if (!projectLightboxTrackElement || !currentProjectGalleryItems.length) return;

    const item = currentProjectGalleryItems[currentLightboxIndex];

    pauseLightboxVideos();

    projectLightboxTrackElement.classList.remove(
      "is-moving-prev",
      "is-moving-next",
      "is-dragging"
    );

    projectLightboxTrackElement.style.transition = "";
    projectLightboxTrackElement.style.transform = "";
    projectLightboxTrackElement.style.opacity = "";

    projectLightboxTrackElement.innerHTML = createProjectLightboxSlideHTML(
      item,
      currentLightboxIndex
    );

    if (direction < 0) {
      projectLightboxTrackElement.classList.add("is-moving-prev");
    } else if (direction > 0) {
      projectLightboxTrackElement.classList.add("is-moving-next");
    }

    renderLightboxDots();
    updateLightboxNavVisibility();
    playActiveLightboxVideo();
    updateLightboxSoundButton();
  }

  function openProjectLightbox(index = 0) {
    ensureProjectLightbox();

    if (!projectLightboxElement || !currentProjectGalleryItems.length) return;

    currentLightboxIndex = wrapIndex(index, currentProjectGalleryItems.length);

    renderProjectLightboxSlide(0);

    projectLightboxElement.setAttribute("aria-hidden", "false");
    projectLightboxElement.classList.add("is-active");
    document.body.classList.add("is-project-lightbox-open");

    muteProjectPageVideos();
    pauseProjectPageVideos();
  }

  function closeProjectLightbox() {
    if (!projectLightboxElement) return;

    projectLightboxElement.setAttribute("aria-hidden", "true");
    projectLightboxElement.classList.remove("is-active");
    document.body.classList.remove("is-project-lightbox-open");

    pauseLightboxVideos();
    resumeProjectPageVideos();
  }

  function goToProjectLightboxSlide(nextIndex, direction = 0) {
    if (!currentProjectGalleryItems.length) return;

    const previousIndex = currentLightboxIndex;
    currentLightboxIndex = wrapIndex(nextIndex, currentProjectGalleryItems.length);

    let movementDirection = direction;

    if (!movementDirection) {
      movementDirection = currentLightboxIndex > previousIndex ? 1 : -1;
    }

    renderProjectLightboxSlide(movementDirection);
  }

  function initProjectLightboxSwipe() {
    if (!projectLightboxViewportElement || !projectLightboxTrackElement) return;

    let activePointerId = null;
    let startX = 0;
    let startY = 0;
    let latestX = 0;
    let latestY = 0;
    let isDragging = false;

    function resetDrag() {
      activePointerId = null;
      startX = 0;
      startY = 0;
      latestX = 0;
      latestY = 0;
      isDragging = false;

      if (projectLightboxTrackElement) {
        projectLightboxTrackElement.classList.remove("is-dragging");
        projectLightboxTrackElement.style.transition = "";
        projectLightboxTrackElement.style.transform = "";
        projectLightboxTrackElement.style.opacity = "";
      }
    }

    projectLightboxViewportElement.addEventListener("pointerdown", (event) => {
      if (!document.body.classList.contains("is-project-lightbox-open")) return;
      if (currentProjectGalleryItems.length <= 1) return;
      if (event.target.closest("button")) return;

      activePointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      latestX = event.clientX;
      latestY = event.clientY;
      isDragging = false;

      if (typeof projectLightboxViewportElement.setPointerCapture === "function") {
        projectLightboxViewportElement.setPointerCapture(activePointerId);
      }
    });

    projectLightboxViewportElement.addEventListener(
      "pointermove",
      (event) => {
        if (activePointerId !== event.pointerId) return;
        if (!projectLightboxTrackElement) return;

        latestX = event.clientX;
        latestY = event.clientY;

        const deltaX = latestX - startX;
        const deltaY = latestY - startY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (!isDragging && absX > 8 && absX > absY * 1.1) {
          isDragging = true;
          projectLightboxTrackElement.classList.add("is-dragging");
        }

        if (!isDragging) return;

        event.preventDefault();

        const limitedDelta = Math.max(
          Math.min(deltaX, window.innerWidth * 0.32),
          window.innerWidth * -0.32
        );

        const opacity = Math.max(0.72, 1 - Math.abs(limitedDelta) / 600);

        projectLightboxTrackElement.style.transition = "none";
        projectLightboxTrackElement.style.transform = `translate3d(${limitedDelta}px, 0, 0)`;
        projectLightboxTrackElement.style.opacity = String(opacity);
      },
      { passive: false }
    );

    function finishSwipe(event) {
      if (activePointerId !== event.pointerId) return;

      const deltaX = latestX - startX;
      const deltaY = latestY - startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const threshold = Math.min(86, window.innerWidth * 0.2);

      const shouldChangeSlide =
        isDragging &&
        absX > threshold &&
        absX > absY * 1.1;

      const direction = deltaX < 0 ? 1 : -1;

      resetDrag();

      if (shouldChangeSlide) {
        goToProjectLightboxSlide(currentLightboxIndex + direction, direction);
      }
    }

    projectLightboxViewportElement.addEventListener("pointerup", finishSwipe);
    projectLightboxViewportElement.addEventListener("pointercancel", finishSwipe);
  }

  function initProjectLightbox() {
    ensureProjectLightbox();

    if (!projectLightboxElement || projectLightboxElement.dataset.initialized === "true") {
      return;
    }

    projectLightboxElement.dataset.initialized = "true";

    projectDetailElement.addEventListener("click", (event) => {
      const openButton = event.target.closest("[data-project-lightbox-open]");

      if (!openButton) return;

      event.preventDefault();
      event.stopPropagation();

      const index = Number(openButton.dataset.projectLightboxOpen || 0);
      openProjectLightbox(index);
    });

    if (projectLightboxCloseElement) {
      projectLightboxCloseElement.addEventListener("click", () => {
        closeProjectLightbox();
      });
    }

    projectLightboxElement.addEventListener("click", (event) => {
      const closeTrigger = event.target.closest("[data-project-lightbox-close]");

      if (closeTrigger) {
        closeProjectLightbox();
      }
    });

    if (projectLightboxPrevElement) {
      projectLightboxPrevElement.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        goToProjectLightboxSlide(currentLightboxIndex - 1, -1);
      });
    }

    if (projectLightboxNextElement) {
      projectLightboxNextElement.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        goToProjectLightboxSlide(currentLightboxIndex + 1, 1);
      });
    }

    if (projectLightboxDotsElement) {
      projectLightboxDotsElement.addEventListener("click", (event) => {
        const dot = event.target.closest("[data-project-lightbox-dot]");

        if (!dot) return;

        event.preventDefault();
        event.stopPropagation();

        const nextIndex = Number(dot.dataset.projectLightboxDot || 0);
        const direction = nextIndex > currentLightboxIndex ? 1 : -1;

        goToProjectLightboxSlide(nextIndex, direction);
      });
    }

    projectLightboxElement.addEventListener("click", (event) => {
      const soundButton = event.target.closest("[data-project-lightbox-sound-toggle]");

      if (!soundButton) return;

      event.preventDefault();
      event.stopPropagation();

      const video = projectLightboxElement.querySelector("video[data-project-lightbox-video]");

      if (!video) return;

      const shouldTurnSoundOn = video.muted || video.volume === 0;

      if (shouldTurnSoundOn) {
        video.muted = false;
        video.volume = 1;

        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }

        setSoundButtonState(soundButton, true);
        return;
      }

      video.muted = true;
      video.volume = 0;
      setSoundButtonState(soundButton, false);
    });

    document.addEventListener("keydown", (event) => {
      if (!document.body.classList.contains("is-project-lightbox-open")) return;

      if (event.key === "Escape") {
        closeProjectLightbox();
      }

      if (event.key === "ArrowLeft") {
        goToProjectLightboxSlide(currentLightboxIndex - 1, -1);
      }

      if (event.key === "ArrowRight") {
        goToProjectLightboxSlide(currentLightboxIndex + 1, 1);
      }
    });

    initProjectLightboxSwipe();
  }

  function renderProjectDetail(currentProject, currentProjectIndex) {
    if (!projectDetailElement) return;

    const heroItem = getProjectHeroItem(currentProject);
    const gallery = getProjectGallery(currentProject);

    currentProjectGalleryItems = gallery;

    const nextProject =
      projectsData.projects[(currentProjectIndex + 1) % projectsData.projects.length];

    const disciplinesHTML = Array.isArray(currentProject.disciplines)
      ? currentProject.disciplines
          .map((item) => escapeHTML(normalizeLabel(item)))
          .join("<br />")
      : "";

    const softwareHTML = Array.isArray(currentProject.software)
      ? currentProject.software
          .map((item) => escapeHTML(normalizeLabel(item)))
          .join(", ")
      : "";

    const linkHTML =
      currentProject.linkHref && currentProject.linkHref !== "#"
        ? `
          <a
            href="${escapeHTML(currentProject.linkHref)}"
            ${getExternalAttrs(currentProject.linkHref)}
          >
            ${escapeHTML(normalizeLabel(currentProject.linkLabel || "VER PROYECTO"))}
          </a>
        `
        : "";

    document.title = `${currentProject.title || "Project"} | Portfolio`;

    projectDetailElement.innerHTML = `
      <article class="project-detail project-detail--${escapeHTML(safeClassName(currentProject.id))}">
        <header class="project-detail__header">
          <h1 class="project-detail__title">${escapeHTML(normalizeLabel(currentProject.title))}</h1>
        </header>

        <section class="project-detail__intro" aria-label="Introducción del proyecto">
          <figure class="project-detail__hero">
            ${createMediaMarkup(heroItem, "project-detail__hero-media", "eager")}
          </figure>

          <aside class="project-detail__meta" aria-label="Información del proyecto">
            ${createMetaRow("Cliente", escapeHTML(normalizeLabel(currentProject.client)))}
            ${createMetaRow("Disciplina", disciplinesHTML)}
            ${createMetaRow("Año", escapeHTML(normalizeLabel(currentProject.year)))}
            ${createMetaRow("Software", softwareHTML)}
            ${createMetaRow("Link", linkHTML)}

            ${
              currentProject.description
                ? `
                  <p class="project-detail__description">
                    ${escapeHTML(currentProject.description)}
                  </p>
                `
                : ""
            }
          </aside>
        </section>

        <section class="project-detail__gallery" aria-label="Galería del proyecto">
          ${gallery.map((item, index) => createProjectGalleryItem(item, index, currentProject)).join("")}
        </section>

        ${
          nextProject
            ? `
              <section class="project-next-cta" aria-label="Siguiente proyecto">
                <a
                  class="project-next-cta__link"
                  id="projectNextCta"
                  href="./${escapeHTML(nextProject.id)}.html"
                  aria-label="NEXT PROJECT"
                >
                  NEXT<br />
                  PROJECT
                </a>
              </section>
            `
            : ""
        }
      </article>
    `;

    initProjectVideos();
    initProjectLightbox();
    initProjectNextTextScramble();
  }

  function initProjectNextTextScramble() {
    const projectNextElement = document.getElementById("projectNextCta");

    if (!projectNextElement) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const originalHTML = projectNextElement.innerHTML.trim();
    const originalLines = originalHTML
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?[^>]+(>|$)/g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const finalLines = originalLines.length
      ? originalLines
      : ["NEXT", "PROJECT"];

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
        const visibleCharacters = Array.from(line).filter((char) => char !== " ");
        return total + visibleCharacters.length;
      }, 0);
    }

    function renderLines(lines) {
      projectNextElement.innerHTML = lines
        .map((line) => {
          return `<span class="project-next-cta__line">${escapeHTML(line)}</span>`;
        })
        .join("");
    }

    function renderFinalText() {
      renderLines(finalLines);
      projectNextElement.classList.remove("is-scrambling");
      projectNextElement.setAttribute("aria-label", finalAriaLabel);
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
      projectNextElement.classList.add("is-scrambling");

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

    projectNextElement.addEventListener("mouseenter", playScramble);
    projectNextElement.addEventListener("focus", playScramble);

    projectNextElement.addEventListener("mouseleave", () => {
      if (!isAnimating) {
        renderFinalText();
      }
    });
  }

  try {
    const response = await fetch("./data/projects.json");

    if (!response.ok) {
      throw new Error(`Error cargando projects.json: ${response.status}`);
    }

    projectsData = await response.json();
  } catch (error) {
    console.error("No se pudo cargar el JSON de projects:", error);

    if (projectDetailElement) {
      projectDetailElement.innerHTML = `
        <article class="project-detail project-detail--error">
          <h1 class="project-detail__title">PROJECT</h1>
          <p class="project-detail__description">No se pudieron cargar los datos del proyecto.</p>
        </article>
      `;
    }

    return;
  }

  updateProjectLogoForViewport();

  if (typeof projectMobileMediaQuery.addEventListener === "function") {
    projectMobileMediaQuery.addEventListener("change", updateProjectLogoForViewport);
  } else if (typeof projectMobileMediaQuery.addListener === "function") {
    projectMobileMediaQuery.addListener(updateProjectLogoForViewport);
  }

  if (projectBrandElement && projectsData.logo) {
    projectBrandElement.href = projectsData.logo.href || "./home.html";
  }

  if (projectMenuElement && Array.isArray(projectsData.menu)) {
    projectMenuElement.innerHTML = projectsData.menu
      .map((item, index, array) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");
        const separator = index < array.length - 1 ? "," : "";
        const currentClass = item.current ? " is-current" : "";
        const ariaCurrent = item.current ? 'aria-current="page"' : "";

        return `
          <li class="project-nav__item">
            <a
              class="project-nav__link${currentClass}"
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

  if (projectMobileMenuElement && Array.isArray(projectsData.menu)) {
    const mobileItems = [
      ...projectsData.menu,
      {
        label: "HOME",
        href: "./home.html"
      }
    ];

    projectMobileMenuElement.innerHTML = mobileItems
      .map((item) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");
        const currentClass = item.current ? " is-current" : "";
        const ariaCurrent = item.current ? 'aria-current="page"' : "";

        return `
          <li class="project-mobile-menu-list__item">
            <a
              class="project-mobile-menu-list__link${currentClass}"
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

  if (projectStartProjectElement) {
    const startLabel = projectsData.startProject?.label || "START A PROJECT";
    const startHoverLabel = projectsData.startProject?.hoverLabel || "GET IN TOUCH";

    projectStartProjectElement.innerHTML = createRollingText(startLabel, startHoverLabel);
    projectStartProjectElement.setAttribute("aria-label", startLabel);
    projectStartProjectElement.href =
      projectsData.startProject?.href || "mailto:almudenaestevez23@gmail.com";
  }

  if (projectCopyrightElement) {
    projectCopyrightElement.textContent =
      projectsData.footer?.copyright || "© 2026 FACEITOUT";
  }

  if (projectSocialElement && Array.isArray(projectsData.footer?.social)) {
    projectSocialElement.innerHTML = projectsData.footer.social
      .map((item, index, array) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");
        const separator = index < array.length - 1 ? "/" : "";

        return `
          <a
            class="project-footer__social-link"
            href="${safeHref}"
            ${getExternalAttrs(item.href)}
            aria-label="${safeLabel}"
          >
            ${createRollingText(label)}
          </a>
          ${
            separator
              ? `<span class="project-footer__separator" aria-hidden="true">${separator}</span>`
              : ""
          }
        `;
      })
      .join("");
  }

  if (projectMobileSocialElement && Array.isArray(projectsData.footer?.social)) {
    projectMobileSocialElement.innerHTML = projectsData.footer.social
      .map((item) => {
        const label = normalizeLabel(item.label);
        const safeLabel = escapeHTML(label);
        const safeHref = escapeHTML(item.href || "#");

        return `
          <a
            class="project-mobile-menu-social__link"
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

  if (projectCreditElement) {
    const creditLabel = projectsData.footer?.credit || "DESIGNED BY ALMU ESTEVEZ :)";

    projectCreditElement.innerHTML = createRollingText(creditLabel);
    projectCreditElement.setAttribute("aria-label", creditLabel);
  }

  if (projectMobileCreditElement) {
    projectMobileCreditElement.textContent =
      projectsData.footer?.credit || "DESIGNED BY ALMU ESTEVEZ :)";
  }

  function setProjectMobileMenuOpen(isOpen) {
    document.body.classList.toggle("is-project-mobile-menu-open", isOpen);

    if (projectMobileMenuPanelElement) {
      projectMobileMenuPanelElement.setAttribute("aria-hidden", String(!isOpen));
    }

    if (projectMobileMenuWordElement) {
      projectMobileMenuWordElement.textContent = isOpen ? "MENU" : "WORKS";
    }

    projectMobileToggleElements.forEach((toggle) => {
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });
  }

  function initProjectMobileMenu() {
    if (!projectMobileToggleElements.length || !projectMobileMenuPanelElement) return;

    setProjectMobileMenuOpen(false);

    projectMobileToggleElements.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const isOpen = document.body.classList.contains("is-project-mobile-menu-open");
        setProjectMobileMenuOpen(!isOpen);
      });
    });

    projectMobileMenuPanelElement.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");

      if (link) {
        setProjectMobileMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setProjectMobileMenuOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        setProjectMobileMenuOpen(false);
      }

      updateProjectLogoForViewport();
    });
  }

  function initProjectEntranceAnimation() {
    if (typeof gsap === "undefined") return;

    const entranceElements = [
      ".project-brand",
      ".project-nav__item",
      ".project-start",
      ".project-detail__title",
      ".project-detail__hero",
      ".project-detail__meta-row",
      ".project-detail__description",
      ".project-detail__gallery-item",
      ".project-next-cta__link",
      ".project-footer__copyright",
      ".project-footer__social",
      ".project-footer__credit"
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
      !projectBrandElement ||
      typeof gsap === "undefined" ||
      typeof Draggable === "undefined"
    ) {
      return;
    }

    gsap.registerPlugin(Draggable);

    gsap.set(projectBrandElement, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      transformOrigin: "50% 50%"
    });

    gsap.fromTo(
      projectBrandElement,
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

    Draggable.create(projectBrandElement, {
      type: "x,y",
      zIndexBoost: false,
      minimumMovement: 4,

      onPress() {
        gsap.killTweensOf(projectBrandElement);
        projectBrandElement.classList.add("is-dragging");

        gsap.to(projectBrandElement, {
          scale: 1.08,
          rotation: -4,
          duration: 0.18,
          ease: "power2.out",
          overwrite: "auto"
        });
      },

      onDrag() {
        const rotationAmount = gsap.utils.clamp(-12, 12, this.x * 0.045);

        gsap.to(projectBrandElement, {
          rotation: rotationAmount,
          duration: 0.12,
          ease: "power2.out",
          overwrite: "auto"
        });
      },

      onRelease() {
        projectBrandElement.classList.remove("is-dragging");

        gsap.to(projectBrandElement, {
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
      !projectMobileMenuPanelElement ||
      !projectMobileToggleElements.length
    ) {
      return;
    }

    projectMobileToggleElements.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const isOpening = document.body.classList.contains("is-project-mobile-menu-open");

        if (!isOpening) return;

        gsap.fromTo(
          [
            ".project-mobile-menu-list__item",
            ".project-mobile-menu-social__link",
            ".project-mobile-menu-credit"
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

  if (!projectDetailElement || !projectId || !Array.isArray(projectsData.projects)) {
    return;
  }

  const currentProjectIndex = projectsData.projects.findIndex(
    (project) => project.id === projectId
  );

  if (currentProjectIndex === -1) {
    projectDetailElement.innerHTML = `
      <article class="project-detail project-detail--error">
        <h1 class="project-detail__title">PROJECT</h1>
        <p class="project-detail__description">No se ha encontrado el proyecto.</p>
      </article>
    `;
    return;
  }

  const currentProject = projectsData.projects[currentProjectIndex];

  initProjectMobileMenu();
  renderProjectDetail(currentProject, currentProjectIndex);
  initMobileMenuAnimation();
  initProjectEntranceAnimation();
  initDraggableLogo();
});