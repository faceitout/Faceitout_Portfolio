document.addEventListener("DOMContentLoaded", async () => {
  const logoElement = document.getElementById("siteLogo");
  const menuElement = document.getElementById("siteMenu");
  const footerCopyrightElement = document.getElementById("footerCopyright");
  const footerSocialElement = document.getElementById("footerSocial");
  const footerContactElement = document.getElementById("footerContact");
  const galleryGridElement = document.getElementById("galleryGrid");

  let galleryData;

  try {
    const response = await fetch("./data/gallery.json");

    if (!response.ok) {
      throw new Error(`Error cargando gallery.json: ${response.status}`);
    }

    galleryData = await response.json();
  } catch (error) {
    console.error("No se pudo cargar el JSON de gallery:", error);

    if (galleryGridElement) {
      galleryGridElement.innerHTML = `<p>No se pudo cargar la galería.</p>`;
    }

    return;
  }

  if (logoElement && galleryData.logo) {
    logoElement.textContent = galleryData.logo.text || "";
    logoElement.href = galleryData.logo.href || "./home.html";
  }

  if (menuElement && Array.isArray(galleryData.menu)) {
    menuElement.innerHTML = galleryData.menu
      .map((item) => {
        const isCurrent = Boolean(item.current);

        return `
          <li>
            <a href="${item.href || "#"}" class="${isCurrent ? "is-current" : ""}" ${isCurrent ? 'aria-current="page"' : ""}>
              ${item.label || ""}
            </a>
          </li>
        `;
      })
      .join("");
  }

  if (footerCopyrightElement && galleryData.footer?.copyright) {
    footerCopyrightElement.innerHTML = `<p>${galleryData.footer.copyright}</p>`;
  }

  if (footerSocialElement && Array.isArray(galleryData.footer?.social)) {
    footerSocialElement.innerHTML = galleryData.footer.social
      .map((item) => `<a href="${item.href || "#"}">${item.label || ""}</a>`)
      .join("");
  }

  if (footerContactElement && galleryData.footer?.contact) {
    const { email, phoneLabel, phoneHref } = galleryData.footer.contact;

    footerContactElement.innerHTML = `
      <a href="mailto:${email || ""}">${email || ""}</a>
      <a href="${phoneHref || "#"}">${phoneLabel || ""}</a>
    `;
  }

  if (!galleryGridElement || !Array.isArray(galleryData.gallery)) {
    return;
  }

  galleryGridElement.innerHTML = galleryData.gallery
    .map((item) => {
      const layoutClass = item.layout
        ? `gallery-card--${item.layout}`
        : "gallery-card--medium";

      const mediaMarkup =
        item.type === "video"
          ? `
            <video
              class="gallery-card__image gallery-card__video"
              autoplay
              muted
              loop
              playsinline
              preload="metadata"
            >
              <source src="${item.video || ""}" type="video/mp4" />
            </video>
          `
          : `
            <img
              class="gallery-card__image"
              src="${item.image || ""}"
              alt="${item.alt || item.title || "Imagen de galería"}"
            />
          `;

      return `
        <article class="gallery-card ${layoutClass}">
          <div class="gallery-card__image-wrapper">
            ${mediaMarkup}
          </div>

          <h2 class="gallery-card__title">${item.title || ""}</h2>
        </article>
      `;
    })
    .join("");

  if (typeof gsap !== "undefined") {
    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    function runEntranceAnimation() {
      const header = document.querySelector(".site-header");

      const headerElements = [
        document.querySelector(".site-header__logo"),
        ...document.querySelectorAll(".site-header__menu li"),
        document.querySelector(".site-header__time")
      ].filter(Boolean);

      const footerElements = Array.from(
        document.querySelectorAll(".site-footer__col")
      ).filter(Boolean);

      gsap.set(header, {
        yPercent: -100
      });

      gsap.set(headerElements, {
        y: 18,
        autoAlpha: 0
      });

      gsap.set(footerElements, {
        y: 18,
        autoAlpha: 0
      });

      const tl = gsap.timeline({
        defaults: {
          ease: "sine.out"
        }
      });

      tl.to(header, {
        yPercent: 0,
        duration: 0.3
      })
        .to(
          headerElements,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.05
          },
          "-=0.10"
        )
        .to(
          footerElements,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            stagger: 0.06
          },
          "<"
        );
    }

    function getColumns() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function animateGalleryCards(cards, staggerAmount = 0.14) {
      if (!cards.length) return;

      const images = cards
        .map((card) => card.querySelector(".gallery-card__image"))
        .filter(Boolean);

      const titles = cards
        .map((card) => card.querySelector(".gallery-card__title"))
        .filter(Boolean);

      gsap.to(cards, {
        y: 0,
        autoAlpha: 1,
        duration: 1,
        stagger: staggerAmount,
        ease: "sine.out",
        overwrite: "auto",
        clearProps: "opacity,visibility,transform"
      });

      gsap.to(images, {
        scale: 1,
        duration: 1.05,
        stagger: staggerAmount,
        ease: "sine.out",
        overwrite: "auto",
        clearProps: "transform"
      });

      gsap.to(titles, {
        y: 0,
        autoAlpha: 1,
        duration: 0.85,
        stagger: staggerAmount,
        delay: 0.18,
        ease: "sine.out",
        overwrite: "auto",
        clearProps: "opacity,visibility,transform"
      });
    }

    function initScrollReveal() {
      if (typeof ScrollTrigger === "undefined") return;

      const cards = Array.from(document.querySelectorAll(".gallery-card"));
      const columns = getColumns();
      const visibleThreshold = window.innerHeight * 0.95;

      cards.forEach((card) => {
        const image = card.querySelector(".gallery-card__image");
        const title = card.querySelector(".gallery-card__title");

        gsap.set(card, {
          y: 28,
          autoAlpha: 0
        });

        if (image) {
          gsap.set(image, {
            scale: 1.03
          });
        }

        if (title) {
          gsap.set(title, {
            y: 12,
            autoAlpha: 0
          });
        }
      });

      const initialVisibleCards = cards.filter((card) => {
        const rect = card.getBoundingClientRect();
        return rect.top < visibleThreshold;
      });

      if (initialVisibleCards.length) {
        requestAnimationFrame(() => {
          animateGalleryCards(initialVisibleCards, 0.16);
          initialVisibleCards.forEach((card) => {
            card.dataset.revealed = "true";
          });
        });
      }

      cards.forEach((card, index) => {
        if (card.dataset.revealed === "true") return;

        const columnIndex = index % columns;

        ScrollTrigger.create({
          trigger: card,
          start: "top 92%",
          once: true,
          onEnter: () => {
            if (card.dataset.revealed === "true") return;

            const image = card.querySelector(".gallery-card__image");
            const title = card.querySelector(".gallery-card__title");
            const delay = columnIndex * 0.14;

            card.dataset.revealed = "true";

            gsap.to(card, {
              y: 0,
              autoAlpha: 1,
              duration: 1,
              delay,
              ease: "sine.out",
              overwrite: "auto",
              clearProps: "opacity,visibility,transform"
            });

            if (image) {
              gsap.to(image, {
                scale: 1,
                duration: 1.05,
                delay,
                ease: "sine.out",
                overwrite: "auto",
                clearProps: "transform"
              });
            }

            if (title) {
              gsap.to(title, {
                y: 0,
                autoAlpha: 1,
                duration: 0.85,
                delay: delay + 0.18,
                ease: "sine.out",
                overwrite: "auto",
                clearProps: "opacity,visibility,transform"
              });
            }
          }
        });
      });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }

    runEntranceAnimation();
    initScrollReveal();

    if (typeof ScrollTrigger !== "undefined") {
      window.addEventListener("resize", () => {
        ScrollTrigger.refresh();
      });
    }
  }
});