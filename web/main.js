if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

window.addEventListener("pageshow", () => {
  window.scrollTo(0, 0);
});

const clockElement = document.getElementById("clock");

function updateClock() {
  if (!clockElement) return;

  const now = new Date();

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const period = hours >= 12 ? "p.m." : "a.m.";

  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  const formatted = `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${period}`;
  clockElement.textContent = formatted;
}

updateClock();
setInterval(updateClock, 1000);

const customCursor = document.getElementById("customCursor");

if (customCursor && typeof gsap !== "undefined") {
  gsap.set(customCursor, {
    xPercent: -50,
    yPercent: -50,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });

  window.addEventListener("mousemove", (event) => {
    gsap.to(customCursor, {
      x: event.clientX,
      y: event.clientY,
      duration: 0.18,
      ease: "power3.out",
      overwrite: "auto"
    });
  });

  document.addEventListener("mouseover", (event) => {
    const viewTarget = event.target.closest(".gallery-3d__item, .work-card__link");
    const hoverTarget = event.target.closest("a:not(.work-card__link), button, [role='button']");

    if (viewTarget) {
      customCursor.classList.remove("is-hover");
      customCursor.classList.add("is-view");
      return;
    }

    if (hoverTarget) {
      customCursor.classList.remove("is-view");
      customCursor.classList.add("is-hover");
    }
  });

  document.addEventListener("mouseout", (event) => {
    const related = event.relatedTarget;

    const stillInsideView =
      related && related.closest?.(".gallery-3d__item, .work-card__link");
    const stillInsideHover =
      related && related.closest?.("a:not(.work-card__link), button, [role='button']");

    const leftViewTarget = event.target.closest(".gallery-3d__item, .work-card__link");
    const leftHoverTarget = event.target.closest("a:not(.work-card__link), button, [role='button']");

    if (leftViewTarget && !stillInsideView) {
      customCursor.classList.remove("is-view");
    }

    if (leftHoverTarget && !stillInsideHover) {
      customCursor.classList.remove("is-hover");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined") return;

  const isHomePage = document.body.classList.contains("home-page");
  const siteWrapper = document.querySelector(".site-wrapper");

  if (!siteWrapper) return;

  if (
    !isHomePage &&
    typeof ScrollTrigger !== "undefined" &&
    typeof ScrollSmoother !== "undefined" &&
    document.querySelector("#smooth-wrapper") &&
    document.querySelector("#smooth-content")
  ) {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    if (!ScrollSmoother.get()) {
      ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 2,
        effects: false,
        smoothTouch: 0.1,
        normalizeScroll: true
      });
    }
  }

  let overlay = document.querySelector(".page-transition-overlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "page-transition-overlay";
    document.body.appendChild(overlay);
  }

  gsap.set(overlay, {
    clipPath: "inset(100% 0 0 0)"
  });

  let isTransitioning = false;

  function shouldHandleLink(link, event) {
    if (!link || isTransitioning) return false;
    if (event.defaultPrevented) return false;
    if (event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.hasAttribute("download")) return false;

    const rawHref = link.getAttribute("href");
    if (!rawHref) return false;
    if (rawHref.startsWith("#")) return false;
    if (rawHref.startsWith("mailto:")) return false;
    if (rawHref.startsWith("tel:")) return false;
    if (rawHref.startsWith("javascript:")) return false;

    const target = link.getAttribute("target");
    if (target && target !== "_self") return false;

    const url = new URL(link.href, window.location.href);

    if (url.origin !== window.location.origin) return false;
    if (url.pathname === window.location.pathname && url.hash) return false;
    if (url.href === window.location.href) return false;

    return true;
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!shouldHandleLink(link, event)) return;

    event.preventDefault();
    isTransitioning = true;

    const destination = link.href;
    document.body.classList.add("is-transitioning");

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.inOut"
      },
      onComplete: () => {
        window.location.href = destination;
      }
    });

    tl.to(
      siteWrapper,
      {
        y: -60,
        duration: 0.65
      },
      0
    ).to(
      overlay,
      {
        clipPath: "inset(0% 0 0 0)",
        duration: 0.8
      },
      0
    );
  });

  window.addEventListener("pageshow", () => {
    isTransitioning = false;
    document.body.classList.remove("is-transitioning");

    gsap.set(siteWrapper, {
      clearProps: "transform"
    });

    gsap.set(overlay, {
      clipPath: "inset(100% 0 0 0)"
    });
  });
});