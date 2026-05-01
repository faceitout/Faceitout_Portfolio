document.addEventListener("DOMContentLoaded", async () => {
  const logoElement = document.getElementById("siteLogo");
  const menuElement = document.getElementById("siteMenu");
  const footerCopyrightElement = document.getElementById("footerCopyright");
  const footerSocialElement = document.getElementById("footerSocial");
  const footerContactElement = document.getElementById("footerContact");
  const aboutDetailElement = document.getElementById("aboutDetail");

  let aboutData;

  try {
    const response = await fetch("./data/about.json");

    if (!response.ok) {
      throw new Error(`Error cargando about.json: ${response.status}`);
    }

    aboutData = await response.json();
  } catch (error) {
    console.error("No se pudo cargar el JSON de about:", error);

    if (aboutDetailElement) {
      aboutDetailElement.innerHTML = `<p>No se pudo cargar la información de About.</p>`;
    }

    return;
  }

  if (logoElement && aboutData.logo) {
    logoElement.textContent = aboutData.logo.text || "";
    logoElement.href = aboutData.logo.href || "./home.html";
  }

  if (menuElement && Array.isArray(aboutData.menu)) {
    menuElement.innerHTML = aboutData.menu
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

  if (footerCopyrightElement && aboutData.footer?.copyright) {
    footerCopyrightElement.innerHTML = `<p>${aboutData.footer.copyright}</p>`;
  }

  if (footerSocialElement && Array.isArray(aboutData.footer?.social)) {
    footerSocialElement.innerHTML = aboutData.footer.social
      .map((item) => `<a href="${item.href || "#"}">${item.label || ""}</a>`)
      .join("");
  }

  if (footerContactElement && aboutData.footer?.contact) {
    const { email, phoneLabel, phoneHref } = aboutData.footer.contact;

    footerContactElement.innerHTML = `
      <a href="mailto:${email || ""}">${email || ""}</a>
      <a href="${phoneHref || "#"}">${phoneLabel || ""}</a>
    `;
  }

  if (!aboutDetailElement || !aboutData.about) {
    return;
  }

  const description = aboutData.about.description || "";
  const image = aboutData.about.image || {};
  const meta = Array.isArray(aboutData.about.meta) ? aboutData.about.meta : [];

  const metaMarkup = meta
    .map((item) => {
      const label = item.label || "";
      const lines = Array.isArray(item.lines) ? item.lines : [];
      const links = Array.isArray(item.links) ? item.links : [];
      const linkLabel = item.linkLabel || "";
      const linkHref = item.linkHref || "#";

      let valueMarkup = "";

      if (links.length > 0) {
        valueMarkup = links
          .map(
            (link) => `
              <a href="${link.href || "#"}" target="_blank" rel="noopener noreferrer">
                ${link.label || ""}
              </a>
            `
          )
          .join("<br>");
      } else if (lines.length > 0) {
        valueMarkup = lines.join("<br>");
      } else if (linkLabel) {
        valueMarkup = `
          <a href="${linkHref}" target="_blank" rel="noopener noreferrer">
            ${linkLabel}
          </a>
        `;
      } else {
        valueMarkup = item.value || "";
      }

      return `
        <div class="about-detail__meta-block">
          <span class="about-detail__meta-label">${label}</span>
          <span class="about-detail__meta-value">${valueMarkup}</span>
        </div>
      `;
    })
    .join("");

  aboutDetailElement.innerHTML = `
    <div class="about-detail__intro">
      <p class="about-detail__description">${description}</p>

      <div class="about-detail__meta">
        ${metaMarkup}
      </div>
    </div>

    <figure
      class="about-detail__media"
      style="
        --about-media-position: ${image.position || "50% 50%"};
        --about-media-fit: ${image.fit || "cover"};
      "
    >
      <img
        src="${image.src || ""}"
        alt="${image.alt || "Imagen about"}"
      />
    </figure>
  `;

  if (typeof gsap !== "undefined") {
    function runEntranceAnimation() {
      const header = document.querySelector(".site-header");

      const headerElements = [
        document.querySelector(".site-header__logo"),
        ...document.querySelectorAll(".site-header__menu li"),
        document.querySelector(".site-header__time")
      ].filter(Boolean);

      const descriptionElement = document.querySelector(".about-detail__description");
      const metaBlocks = Array.from(
        document.querySelectorAll(".about-detail__meta-block")
      ).filter(Boolean);

      const media = document.querySelector(".about-detail__media");
      const mediaImage = media?.querySelector("img") || null;

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

      if (descriptionElement) {
        gsap.set(descriptionElement, {
          y: 22,
          autoAlpha: 0
        });
      }

      if (metaBlocks.length) {
        gsap.set(metaBlocks, {
          y: 18,
          autoAlpha: 0
        });
      }

      if (media) {
        gsap.set(media, {
          y: 26,
          autoAlpha: 0
        });
      }

      if (mediaImage) {
        gsap.set(mediaImage, {
          scale: 1.02
        });
      }

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
        );

      if (descriptionElement) {
        tl.to(
          descriptionElement,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.75,
            clearProps: "opacity,visibility"
          },
          "<"
        );
      }

      if (metaBlocks.length) {
        tl.to(
          metaBlocks,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.08,
            clearProps: "opacity,visibility"
          },
          "-=0.18"
        );
      }

      if (media) {
        tl.to(
          media,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.75,
            clearProps: "opacity,visibility"
          },
          "-=0.2"
        );
      }

      if (mediaImage) {
        tl.to(
          mediaImage,
          {
            scale: 1,
            duration: 0.8,
            ease: "sine.out",
            clearProps: "transform"
          },
          "<"
        );
      }

      tl.to(
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

    runEntranceAnimation();
  }
});