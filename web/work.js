document.addEventListener("DOMContentLoaded", async () => {
  const logoElement = document.getElementById("siteLogo");
  const menuElement = document.getElementById("siteMenu");
  const workGridElement = document.getElementById("workGrid");
  const footerCopyrightElement = document.getElementById("footerCopyright");
  const footerSocialElement = document.getElementById("footerSocial");
  const footerContactElement = document.getElementById("footerContact");

  if (!workGridElement) return;

  let workData;

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

  if (logoElement && workData.logo) {
    logoElement.textContent = workData.logo.text || "";
    logoElement.href = workData.logo.href || "./home.html";
  }

  if (menuElement && Array.isArray(workData.menu)) {
    menuElement.innerHTML = workData.menu
      .map((item) => {
        const currentClass = item.current ? "is-current" : "";
        const ariaCurrent = item.current ? 'aria-current="page"' : "";

        return `
          <li>
            <a href="${item.href}" class="${currentClass}" ${ariaCurrent}>${item.label}</a>
          </li>
        `;
      })
      .join("");
  }

  if (footerCopyrightElement && workData.footer?.copyright) {
    footerCopyrightElement.innerHTML = `<p>${workData.footer.copyright}</p>`;
  }

  if (footerSocialElement && Array.isArray(workData.footer?.social)) {
    footerSocialElement.innerHTML = workData.footer.social
      .map(
        (item) => `
          <a href="${item.href}">${item.label}</a>
        `
      )
      .join("");
  }

  if (footerContactElement && workData.footer?.contact) {
    const { email, phoneLabel, phoneHref } = workData.footer.contact;

    footerContactElement.innerHTML = `
      <a href="mailto:${email}">${email}</a>
      <a href="${phoneHref}">${phoneLabel}</a>
    `;
  }

  if (!Array.isArray(workData.projects)) return;

  workGridElement.innerHTML = workData.projects
    .map(
      (project) => `
      <article class="work-card">
        <a href="${project.href || "#"}" class="work-card__link">
          <div class="work-card__media">
            <img src="${project.image}" alt="${project.alt}" />
          </div>

          <div class="work-card__meta">
            <span class="work-card__title">${project.title}</span>
            <span class="work-card__year">${project.year}</span>
            <span class="work-card__tags">${project.tags}</span>
          </div>
        </a>
      </article>
    `
    )
    .join("");

  if (typeof gsap !== "undefined") {
    function runEntranceAnimation() {
      const header = document.querySelector(".site-header");

      const headerElements = [
        document.querySelector(".site-header__logo"),
        ...document.querySelectorAll(".site-header__menu li"),
        document.querySelector(".site-header__time")
      ].filter(Boolean);

      const workCards = Array.from(
        document.querySelectorAll(".work-card")
      ).filter(Boolean);

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

      gsap.set(workCards, {
        y: 28,
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
          workCards,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.75,
            stagger: 0.06,
            clearProps: "opacity,visibility"
          },
          "<"
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

    function initHoverAnimations() {
      const workCards = Array.from(document.querySelectorAll(".work-card"));

      workCards.forEach((card) => {
        const image = card.querySelector(".work-card__media img");
        const meta = card.querySelector(".work-card__meta");
        const title = card.querySelector(".work-card__title");
        const year = card.querySelector(".work-card__year");
        const tags = card.querySelector(".work-card__tags");

        if (!image || !meta || !title || !year || !tags) return;
        if (window.innerWidth <= 768) return;

        const textElements = [title, year, tags];

        gsap.set(meta, {
          y: 10,
          autoAlpha: 0
        });

        gsap.set(textElements, {
          y: 8,
          autoAlpha: 0
        });

        card.addEventListener("mouseenter", () => {
          gsap.to(image, {
            scale: 1.06,
            duration: 0.6,
            ease: "power3.out",
            overwrite: "auto"
          });

          gsap.to(meta, {
            y: 0,
            autoAlpha: 1,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto"
          });

          gsap.to(textElements, {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            delay: 0.08,
            stagger: 0.04,
            ease: "power2.out",
            overwrite: "auto"
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(image, {
            scale: 1,
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto"
          });

          gsap.to(textElements, {
            y: 8,
            autoAlpha: 0,
            duration: 0.2,
            stagger: 0.02,
            ease: "power2.in",
            overwrite: "auto"
          });

          gsap.to(meta, {
            y: 10,
            autoAlpha: 0,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto",
            delay: 0.03
          });
        });
      });
    }

    runEntranceAnimation();
    initHoverAnimations();
  }
});