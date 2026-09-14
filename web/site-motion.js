(() => {
  if (window.__faceitoutSiteMotionReady) return;
  window.__faceitoutSiteMotionReady = true;

  const SITE_REVEAL_AFTER_TRANSITION_KEY = "siteRevealAfterTransition";
  const SITE_TRANSITION_LABEL_KEY = "siteTransitionLabelAfterTransition";

  function safeSessionGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeSessionSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {}
  }

  function safeSessionRemove(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch {}
  }

  const shouldRevealAfterTransition =
    safeSessionGet(SITE_REVEAL_AFTER_TRANSITION_KEY) === "true";

  if (shouldRevealAfterTransition) {
    document.documentElement.classList.add("is-site-page-revealing");

    if (!document.getElementById("sitePageRevealStyle")) {
      const revealStyle = document.createElement("style");
      revealStyle.id = "sitePageRevealStyle";

      revealStyle.textContent = `
        html.is-site-page-revealing,
        html.is-site-page-revealing body {
          background: #ffffff !important;
          overflow: hidden !important;
        }

        html.is-site-page-revealing::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: 99998;
          background: #ffffff;
          pointer-events: none;
        }

        html.is-site-page-revealing .site-transition {
          z-index: 99999;
        }

        html.is-site-page-revealing .home-header,
        html.is-site-page-revealing .work-header,
        html.is-site-page-revealing .gallery-header,
        html.is-site-page-revealing .about-header,
        html.is-site-page-revealing .project-header,
        html.is-site-page-revealing .site-header,
        html.is-site-page-revealing .home-hero,
        html.is-site-page-revealing .work-hero,
        html.is-site-page-revealing .gallery-infinite,
        html.is-site-page-revealing .about-page,
        html.is-site-page-revealing .project-page,
        html.is-site-page-revealing .work-gallery-cta,
        html.is-site-page-revealing .project-next-cta,
        html.is-site-page-revealing .home-footer,
        html.is-site-page-revealing .work-footer,
        html.is-site-page-revealing .gallery-footer,
        html.is-site-page-revealing .about-footer,
        html.is-site-page-revealing .project-footer,
        html.is-site-page-revealing .site-footer {
          opacity: 0 !important;
          transform: translate3d(0, 3rem, 0) !important;
        }
      `;

      document.head.appendChild(revealStyle);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const transitionLinksSelector =
      'a[href]:not([target="_blank"]):not([download])';

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let isPageChanging = false;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    function forceScrollTop() {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
      });
    }

    forceScrollTop();

    window.addEventListener("pageshow", () => {
      forceScrollTop();
    });

    window.addEventListener("beforeunload", () => {
      window.scrollTo(0, 0);
    });

    function createTransitionElement() {
      let transitionElement = document.getElementById("siteTransition");

      if (!transitionElement) {
        transitionElement = document.createElement("div");
        transitionElement.className = "site-transition";
        transitionElement.id = "siteTransition";
        transitionElement.setAttribute("aria-hidden", "true");

        transitionElement.innerHTML = `
          <div class="site-transition__panel">
            <p class="site-transition__label" id="siteTransitionLabel"></p>
          </div>
        `;

        document.body.appendChild(transitionElement);
      }

      let panelElement = transitionElement.querySelector(
        ".site-transition__panel"
      );

      let labelElement = transitionElement.querySelector(
        ".site-transition__label"
      );

      if (!panelElement) {
        panelElement = document.createElement("div");
        panelElement.className = "site-transition__panel";
        transitionElement.appendChild(panelElement);
      }

      if (!labelElement) {
        labelElement = document.createElement("p");
        labelElement.className = "site-transition__label";
        labelElement.id = "siteTransitionLabel";
        labelElement.textContent = "LOADING";
        panelElement.appendChild(labelElement);
      }

      return {
        transitionElement,
        panelElement,
        labelElement
      };
    }

    const {
      transitionElement,
      panelElement,
      labelElement
    } = createTransitionElement();

    function normalizePathname(pathname) {
      return String(pathname || "")
        .split("/")
        .pop()
        .replace(".html", "")
        .trim()
        .toLowerCase();
    }

    function cleanTransitionLabel(value) {
      return String(value || "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
    }

    function getDatasetTransitionLabel(linkElement) {
      const explicitLabel =
        linkElement?.dataset?.siteTransitionLabel ||
        linkElement?.getAttribute("data-site-transition-label");

      const cleanLabel = cleanTransitionLabel(explicitLabel);

      return cleanLabel || "";
    }

    function getPageLabelFromHref(href, linkElement) {
      const explicitLabel = getDatasetTransitionLabel(linkElement);

      if (explicitLabel) {
        return explicitLabel;
      }

      const linkText = cleanTransitionLabel(linkElement?.textContent || "");

      if (linkText.includes("NEXT PROJECT")) return "NEXT PROJECT";

      if (linkText.includes("EXPLORE") || linkText.includes("GALLERY")) {
        return "GALLERY";
      }

      const url = new URL(href, window.location.href);
      const pageName = normalizePathname(url.pathname);

      const pageLabels = {
        home: "HOME",
        index: "HOME",
        work: "WORKS",
        works: "WORKS",
        gallery: "GALLERY",
        about: "ABOUT"
      };

      if (/^project\d+$/i.test(pageName)) {
        return linkText || "PROJECT";
      }

      return pageLabels[pageName] || linkText || "LOADING";
    }

    function shouldIgnoreLink(linkElement, event) {
      if (!linkElement) return true;
      if (isPageChanging) return true;

      const href = linkElement.getAttribute("href");

      if (!href) return true;
      if (href === "#") return true;
      if (href.startsWith("#")) return true;
      if (href.startsWith("mailto:")) return true;
      if (href.startsWith("tel:")) return true;
      if (href.startsWith("sms:")) return true;
      if (href.startsWith("javascript:")) return true;

      if (linkElement.dataset.noTransition === "true") return true;

      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return true;
      }

      if (event.button && event.button !== 0) return true;

      let url;

      try {
        url = new URL(href, window.location.href);
      } catch {
        return true;
      }

      if (url.origin !== window.location.origin) return true;

      const currentUrl = new URL(window.location.href);

      const isSamePage =
        url.pathname === currentUrl.pathname &&
        url.search === currentUrl.search;

      if (isSamePage) return true;

      return false;
    }

    function prewarmNextPage(href) {
      try {
        const preloadLink = document.createElement("link");
        preloadLink.rel = "prefetch";
        preloadLink.href = href;
        preloadLink.as = "document";
        document.head.appendChild(preloadLink);
      } catch {}

      try {
        fetch(href, {
          method: "GET",
          credentials: "same-origin",
          cache: "force-cache"
        }).catch(() => {});
      } catch {}
    }

    function goToPage(href, label) {
      safeSessionSet(SITE_REVEAL_AFTER_TRANSITION_KEY, "true");
      safeSessionSet(SITE_TRANSITION_LABEL_KEY, label || "LOADING");

      window.location.href = href;
    }

    function playFallbackTransition(href, label) {
      labelElement.textContent = label || "LOADING";

      transitionElement.classList.add("is-active");
      transitionElement.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-site-transitioning");

      window.setTimeout(() => {
        goToPage(href, label);
      }, prefersReducedMotion ? 120 : 1200);
    }

    function playPageTransition(href, label) {
      if (!transitionElement || !panelElement || !labelElement) {
        goToPage(href, label);
        return;
      }

      isPageChanging = true;
      prewarmNextPage(href);

      labelElement.textContent = label || "LOADING";

      transitionElement.classList.add("is-active");
      transitionElement.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-site-transitioning");

      if (prefersReducedMotion || typeof gsap === "undefined") {
        playFallbackTransition(href, label);
        return;
      }

      gsap.killTweensOf([transitionElement, panelElement, labelElement]);

      gsap.set(transitionElement, {
        autoAlpha: 1,
        pointerEvents: "auto"
      });

      gsap.set(panelElement, {
        scale: 1,
        transformOrigin: "50% 50%"
      });

      gsap.set(labelElement, {
        y: 34,
        autoAlpha: 0
      });

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.inOut"
        }
      });

      timeline
        .to(panelElement, {
          scale: 0.92,
          duration: 0.72
        })
        .to(
          labelElement,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.55,
            ease: "power3.out"
          },
          "-=0.26"
        )
        .add(() => {
          goToPage(href, label);
        }, "+=0.38");
    }

    function removeRevealCover() {
      safeSessionRemove(SITE_REVEAL_AFTER_TRANSITION_KEY);
      safeSessionRemove(SITE_TRANSITION_LABEL_KEY);

      document.documentElement.classList.remove("is-site-page-revealing");

      const revealStyle = document.getElementById("sitePageRevealStyle");

      if (revealStyle) {
        revealStyle.remove();
      }
    }

    function getRevealElements() {
      const selectors = [
        ".home-header",
        ".work-header",
        ".gallery-header",
        ".about-header",
        ".project-header",
        ".site-header",

        ".home-hero",
        ".work-hero",
        ".gallery-infinite",
        ".about-page",
        ".project-page",
        ".work-gallery-cta",
        ".project-next-cta",

        ".home-footer",
        ".work-footer",
        ".gallery-footer",
        ".about-footer",
        ".project-footer",
        ".site-footer"
      ];

      const elements = [];

      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          if (element.closest(".site-transition")) return;
          if (element.classList.contains("custom-cursor")) return;
          if (element.classList.contains("gallery-detail")) return;
          if (element.classList.contains("home-mobile-menu-panel")) return;
          if (element.classList.contains("work-mobile-menu-panel")) return;
          if (element.classList.contains("gallery-mobile-menu-panel")) return;
          if (element.classList.contains("about-mobile-menu-panel")) return;
          if (element.classList.contains("project-mobile-menu-panel")) return;

          elements.push(element);
        });
      });

      return Array.from(new Set(elements));
    }

    function pageContentIsReady() {
      const readySelectors = [
        "#homeHeroStage",
        "#workGrid",
        "#galleryInfiniteWorld",
        "#aboutDetail",
        "#projectDetail"
      ];

      return readySelectors.some((selector) => {
        const element = document.querySelector(selector);

        if (!element) return false;

        return element.children.length > 0;
      });
    }

    function waitForGeneratedContent() {
      if (pageContentIsReady()) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        let finished = false;
        let timeoutId = null;

        const observer = new MutationObserver(() => {
          if (!pageContentIsReady()) return;
          finish();
        });

        function finish() {
          if (finished) return;

          finished = true;
          observer.disconnect();

          if (timeoutId) {
            window.clearTimeout(timeoutId);
          }

          resolve();
        }

        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });

        timeoutId = window.setTimeout(finish, 2600);
      });
    }

    function waitForWindowLoad() {
      if (document.readyState === "complete") {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        window.addEventListener("load", resolve, {
          once: true
        });
      });
    }

    function waitForFrames(totalFrames = 5) {
      return new Promise((resolve) => {
        let frame = 0;

        function nextFrame() {
          frame += 1;

          if (frame >= totalFrames) {
            resolve();
            return;
          }

          window.requestAnimationFrame(nextFrame);
        }

        window.requestAnimationFrame(nextFrame);
      });
    }

    function waitForMediaReady(elements, timeout = 1800) {
      const mediaElements = [];

      elements.forEach((element) => {
        element.querySelectorAll("img, video").forEach((media) => {
          mediaElements.push(media);
        });
      });

      if (!mediaElements.length) {
        return Promise.resolve();
      }

      const mediaPromises = mediaElements.map((media) => {
        return new Promise((resolve) => {
          if (media.tagName === "IMG") {
            if (media.complete && media.naturalWidth > 0) {
              resolve();
              return;
            }

            media.addEventListener("load", resolve, { once: true });
            media.addEventListener("error", resolve, { once: true });
            return;
          }

          if (media.tagName === "VIDEO") {
            if (media.readyState >= 2) {
              resolve();
              return;
            }

            media.addEventListener("loadeddata", resolve, { once: true });
            media.addEventListener("canplay", resolve, { once: true });
            media.addEventListener("error", resolve, { once: true });
            return;
          }

          resolve();
        });
      });

      return Promise.race([
        Promise.all(mediaPromises),
        new Promise((resolve) => window.setTimeout(resolve, timeout))
      ]);
    }

    async function waitUntilPageIsStable() {
      await Promise.race([
        Promise.all([waitForWindowLoad(), waitForGeneratedContent()]),
        new Promise((resolve) => window.setTimeout(resolve, 3400))
      ]);

      const revealElements = getRevealElements();

      await waitForMediaReady(revealElements);
      await waitForFrames(5);

      return revealElements;
    }

    function hideTransitionInstantly() {
      transitionElement.classList.remove("is-active");
      transitionElement.setAttribute("aria-hidden", "true");

      if (typeof gsap !== "undefined") {
        gsap.set(transitionElement, {
          autoAlpha: 0,
          pointerEvents: "none"
        });

        gsap.set(panelElement, {
          scale: 1
        });

        gsap.set(labelElement, {
          autoAlpha: 0,
          y: 0
        });
      } else {
        transitionElement.style.opacity = "0";
        transitionElement.style.visibility = "hidden";
        transitionElement.style.pointerEvents = "none";
      }

      document.body.classList.remove("is-site-transitioning");
    }

    function playPageEnterTransition() {
      if (!transitionElement || !panelElement || !labelElement) return;

      if (!shouldRevealAfterTransition) {
        hideTransitionInstantly();
        return;
      }

      const incomingLabel =
        safeSessionGet(SITE_TRANSITION_LABEL_KEY) || "LOADING";

      labelElement.textContent = incomingLabel;

      transitionElement.classList.add("is-active");
      transitionElement.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-site-transitioning");

      forceScrollTop();

      if (typeof gsap !== "undefined") {
        gsap.set(transitionElement, {
          autoAlpha: 1,
          pointerEvents: "auto"
        });

        gsap.set(panelElement, {
          scale: 0.92,
          transformOrigin: "50% 50%"
        });

        gsap.set(labelElement, {
          y: 0,
          autoAlpha: 1
        });
      } else {
        transitionElement.style.opacity = "1";
        transitionElement.style.visibility = "visible";
        transitionElement.style.pointerEvents = "auto";
      }

      waitUntilPageIsStable().then((revealElements) => {
        forceScrollTop();

        if (
          prefersReducedMotion ||
          typeof gsap === "undefined" ||
          !revealElements.length
        ) {
          removeRevealCover();
          hideTransitionInstantly();
          return;
        }

        gsap.killTweensOf([
          transitionElement,
          panelElement,
          labelElement,
          ...revealElements
        ]);

        gsap.set(revealElements, {
          y: 58,
          autoAlpha: 0
        });

        removeRevealCover();

        const timeline = gsap.timeline({
          defaults: {
            ease: "power3.out"
          },
          onComplete() {
            hideTransitionInstantly();
          }
        });

        timeline
          .to(labelElement, {
            y: -34,
            autoAlpha: 0,
            duration: 0.34,
            ease: "power3.in"
          })
          .to(
            panelElement,
            {
              scale: 1,
              duration: 0.42,
              ease: "power3.inOut"
            },
            "-=0.22"
          )
          .to(
            transitionElement,
            {
              autoAlpha: 0,
              duration: 0.48,
              ease: "power2.out"
            },
            "-=0.18"
          )
          .to(
            revealElements,
            {
              y: 0,
              autoAlpha: 1,
              duration: 1,
              stagger: 0.045,
              ease: "power3.out",
              clearProps: "opacity,visibility,transform"
            },
            "-=0.45"
          );
      });
    }

    document.addEventListener("click", (event) => {
      const linkElement = event.target.closest(transitionLinksSelector);

      if (shouldIgnoreLink(linkElement, event)) return;

      const href = linkElement.href;
      const label = getPageLabelFromHref(href, linkElement);

      event.preventDefault();

      playPageTransition(href, label);
    });

    playPageEnterTransition();
  });
})();