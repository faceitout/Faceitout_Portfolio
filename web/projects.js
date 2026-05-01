document.addEventListener("DOMContentLoaded", async () => {
  const logoElement = document.getElementById("siteLogo");
  const menuElement = document.getElementById("siteMenu");
  const footerCopyrightElement = document.getElementById("footerCopyright");
  const footerSocialElement = document.getElementById("footerSocial");
  const footerContactElement = document.getElementById("footerContact");
  const projectDetailElement = document.getElementById("projectDetail");
  const projectId = document.body.dataset.project;

  let projectsData;

  try {
    const response = await fetch("./data/projects.json");

    if (!response.ok) {
      throw new Error(`Error cargando projects.json: ${response.status}`);
    }

    projectsData = await response.json();
  } catch (error) {
    console.error("No se pudo cargar el JSON de projects:", error);

    if (projectDetailElement) {
      projectDetailElement.innerHTML = `<p>No se pudieron cargar los datos del proyecto.</p>`;
    }

    return;
  }

  if (logoElement && projectsData.logo) {
    logoElement.textContent = projectsData.logo.text || "";
    logoElement.href = projectsData.logo.href || "./home.html";
  }

  if (menuElement && Array.isArray(projectsData.menu)) {
    menuElement.innerHTML = projectsData.menu
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

  if (footerCopyrightElement && projectsData.footer?.copyright) {
    footerCopyrightElement.innerHTML = `<p>${projectsData.footer.copyright}</p>`;
  }

  if (footerSocialElement && Array.isArray(projectsData.footer?.social)) {
    footerSocialElement.innerHTML = projectsData.footer.social
      .map((item) => `<a href="${item.href || "#"}">${item.label || ""}</a>`)
      .join("");
  }

  if (footerContactElement && projectsData.footer?.contact) {
    const { email, phoneLabel, phoneHref } = projectsData.footer.contact;

    footerContactElement.innerHTML = `
      <a href="mailto:${email || ""}">${email || ""}</a>
      <a href="${phoneHref || "#"}">${phoneLabel || ""}</a>
    `;
  }

  if (!projectDetailElement || !projectId || !Array.isArray(projectsData.projects)) {
    return;
  }

  const currentProjectIndex = projectsData.projects.findIndex(
    (project) => project.id === projectId
  );

  if (currentProjectIndex === -1) {
    projectDetailElement.innerHTML = `
      <p>No se ha encontrado el proyecto.</p>
    `;
    return;
  }

  const currentProject = projectsData.projects[currentProjectIndex];
  const nextProject =
    projectsData.projects[(currentProjectIndex + 1) % projectsData.projects.length];

  const disciplinesMarkup = Array.isArray(currentProject.disciplines)
    ? currentProject.disciplines.join("<br>")
    : "";

  const galleryMarkup = Array.isArray(currentProject.gallery)
    ? currentProject.gallery
        .map((item) => {
          const layoutClass =
            item.layout === "landscape"
              ? "project-detail__item project-detail__item--landscape"
              : "project-detail__item project-detail__item--square";

          const isVideo = item.type === "video" || Boolean(item.video);

          return `
            <figure class="${layoutClass}">
              ${
                isVideo
                  ? `
                    <video autoplay muted loop playsinline preload="metadata" aria-label="${item.alt || ""}">
                      <source src="${item.video || ""}" type="video/mp4">
                    </video>
                  `
                  : `
                    <img src="${item.image || ""}" alt="${item.alt || ""}">
                  `
              }
            </figure>
          `;
        })
        .join("")
    : "";

  const nextProjectMarkup =
    nextProject && nextProject.id !== currentProject.id
      ? `
        <div class="project-detail__next">
          <a class="project-detail__next-link" href="./${nextProject.id}.html">
            Next Project
          </a>
        </div>
      `
      : "";

  projectDetailElement.innerHTML = `
    <div class="project-detail__intro">
      <p class="project-detail__description">
        ${currentProject.description || ""}
      </p>

      <div class="project-detail__meta">
        <div class="project-detail__meta-block">
          <span class="project-detail__meta-label">Cliente</span>
          <span class="project-detail__meta-value">${currentProject.client || ""}</span>
        </div>

        <div class="project-detail__meta-block">
          <span class="project-detail__meta-label">Disciplina</span>
          <span class="project-detail__meta-value">${disciplinesMarkup}</span>
        </div>

        <div class="project-detail__meta-block">
          <span class="project-detail__meta-label">Año</span>
          <span class="project-detail__meta-value">${currentProject.year || ""}</span>
        </div>

        <div class="project-detail__meta-block">
          <span class="project-detail__meta-label">Link</span>
          <span class="project-detail__meta-value">
            <a href="${currentProject.linkHref || "#"}" target="_blank" rel="noopener noreferrer">
              ${currentProject.linkLabel || ""}
            </a>
          </span>
        </div>
      </div>
    </div>

    <div class="project-detail__gallery">
      ${galleryMarkup}
    </div>

    ${nextProjectMarkup}
  `;

  if (typeof gsap !== "undefined") {
    function runEntranceAnimation() {
      const header = document.querySelector(".site-header");

      const headerElements = [
        document.querySelector(".site-header__logo"),
        ...document.querySelectorAll(".site-header__menu li"),
        document.querySelector(".site-header__time")
      ].filter(Boolean);

      const description = document.querySelector(".project-detail__description");
      const metaBlocks = Array.from(
        document.querySelectorAll(".project-detail__meta-block")
      ).filter(Boolean);

      const galleryItems = Array.from(
        document.querySelectorAll(".project-detail__item")
      ).filter(Boolean);

      const galleryMedia = galleryItems
        .map((item) => item.querySelector("img, video"))
        .filter(Boolean);

      const nextProjectBlock = document.querySelector(".project-detail__next");

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

      if (description) {
        gsap.set(description, {
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

      if (galleryItems.length) {
        gsap.set(galleryItems, {
          y: 26,
          autoAlpha: 0
        });

        gsap.set(galleryMedia, {
          scale: 1.02
        });
      }

      if (nextProjectBlock) {
        gsap.set(nextProjectBlock, {
          y: 18,
          autoAlpha: 0
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

      if (description) {
        tl.to(
          description,
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
            duration: 0.65,
            stagger: 0.08,
            clearProps: "opacity,visibility"
          },
          "-=0.18"
        );
      }

      if (galleryItems.length) {
        tl.to(
          galleryItems,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.65,
            stagger: 0.05,
            clearProps: "opacity,visibility"
          },
          "-=0.2"
        ).to(
          galleryMedia,
          {
            scale: 1,
            duration: 0.8,
            stagger: 0.05,
            ease: "sine.out",
            clearProps: "transform"
          },
          "<"
        );
      }

      if (nextProjectBlock) {
        tl.to(
          nextProjectBlock,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            clearProps: "opacity,visibility"
          },
          "-=0.15"
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