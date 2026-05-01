document.addEventListener("DOMContentLoaded", async () => {
  if (typeof gsap === "undefined" || typeof Draggable === "undefined") return;

  gsap.registerPlugin(
    Draggable,
    ...(typeof ScrollTrigger !== "undefined" ? [ScrollTrigger] : [])
  );

  const logoElement = document.getElementById("siteLogo");
  const menuElement = document.getElementById("siteMenu");
  const footerCopyrightElement = document.getElementById("footerCopyright");
  const footerSocialElement = document.getElementById("footerSocial");
  const footerContactElement = document.getElementById("footerContact");

  const gallery = document.querySelector("#gallery3D");
  const stage = document.querySelector(".gallery-3d__stage");
  const section = document.querySelector(".gallery-3d");
  const galleryContainer = document.querySelector(".gallery-3d__container");

  if (!gallery || !stage) return;

  let homeData;

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

  if (logoElement && homeData.logo) {
    logoElement.textContent = homeData.logo.text || "";
    logoElement.href = homeData.logo.href || "./home.html";
  }

  if (menuElement && Array.isArray(homeData.menu)) {
    menuElement.innerHTML = homeData.menu
      .map(
        (item) => `
          <li>
            <a href="${item.href}">${item.label}</a>
          </li>
        `
      )
      .join("");
  }

  if (footerCopyrightElement && homeData.footer?.copyright) {
    footerCopyrightElement.innerHTML = `<p>${homeData.footer.copyright}</p>`;
  }

  if (footerSocialElement && Array.isArray(homeData.footer?.social)) {
    footerSocialElement.innerHTML = homeData.footer.social
      .map(
        (item) => `
          <a href="${item.href}">${item.label}</a>
        `
      )
      .join("");
  }

  if (footerContactElement && homeData.footer?.contact) {
    const { email, phoneLabel, phoneHref } = homeData.footer.contact;

    footerContactElement.innerHTML = `
  <a href="mailto:${email || ""}?subject=Hola Almudena">${email || ""}</a>
  <a href="${phoneHref || "#"}">${phoneLabel || ""}</a>
`;
  }

  const carouselItems = Array.isArray(homeData.carousel) ? homeData.carousel : [];
  if (!carouselItems.length) return;

  let scrollRotation = 0;
  let dragRotation = 0;

  gallery.innerHTML = "";

  for (let i = 0; i < carouselItems.length; i += 1) {
    const carouselItem = carouselItems[i];

    const item = document.createElement(carouselItem.href ? "a" : "div");
    item.className = "gallery-3d__item";

    if (carouselItem.href) {
      item.href = carouselItem.href;
      item.setAttribute("aria-label", carouselItem.alt || `Proyecto ${String(i + 1).padStart(2, "0")}`);
    }

    item.style.setProperty(
      "--carousel-media-position",
      carouselItem.position || "50% 50%"
    );

    item.style.setProperty(
      "--carousel-media-fit",
      carouselItem.fit || "cover"
    );

    let mediaElement;

    if (carouselItem.type === "video") {
      const video = document.createElement("video");
      video.src = carouselItem.video || "";
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute(
        "aria-label",
        carouselItem.alt || `Proyecto ${String(i + 1).padStart(2, "0")}`
      );

      mediaElement = video;
    } else {
      const img = document.createElement("img");
      img.src = carouselItem.image || "";
      img.alt = carouselItem.alt || `Proyecto ${String(i + 1).padStart(2, "0")}`;
      mediaElement = img;
    }

    item.appendChild(mediaElement);
    gallery.appendChild(item);
  }

  const items = Array.from(gallery.querySelectorAll(".gallery-3d__item"));
  const angleIncrement = 360 / items.length;

  function getOrbitRadius() {
    if (window.innerWidth < 768) return 140;
    if (window.innerWidth < 1200) return 200;
    return 250;
  }

  function renderCarousel() {
    const orbitRadius = getOrbitRadius();
    const totalRotation = scrollRotation + dragRotation;

    items.forEach((item, index) => {
      const angle = index * angleIncrement + totalRotation;
      const radians = angle * (Math.PI / 180);

      const x = Math.sin(radians) * orbitRadius;
      const z = Math.cos(radians) * orbitRadius;

      const depth = (z + orbitRadius) / (orbitRadius * 2);
      const scale = 0.8 + depth * 0.2;
      const opacity = 0.45 + depth * 0.55;

      const shadowBlur = 10 + depth * 26;
      const shadowY = 4 + depth * 16;
      const shadowOpacity = 0.00 + depth * 0.02;

      gsap.set(item, {
        x,
        y: 0,
        z,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        scale,
        opacity,
        zIndex: Math.round(1000 + z),
        force3D: true,
        boxShadow: `0 ${shadowY}px ${shadowBlur}px rgba(221, 255, 0, ${shadowOpacity})`
      });
    });
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

    if (galleryContainer) {
      gsap.set(galleryContainer, {
        y: 28,
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
      )
      .to(
        galleryContainer,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.75,
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

  renderCarousel();
  runEntranceAnimation();

  document.addEventListener("mousemove", (event) => {
    const percentX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);

    gsap.to(gallery, {
      duration: 0.8,
      ease: "power2.out",
      rotateX: 0,
      rotateY: percentX * 6,
      overwrite: "auto"
    });
  });

  const dragProxy = document.createElement("div");

  Draggable.create(dragProxy, {
    type: "x",
    trigger: stage,

    onPress() {
      this.startX = this.x;
      this.startRotation = dragRotation;
      stage.classList.add("is-dragging");
    },

    onDrag() {
      dragRotation = this.startRotation + (this.x - this.startX) * 0.25;
      renderCarousel();
    },

    onRelease() {
      stage.classList.remove("is-dragging");
    },

    onDragEnd() {
      stage.classList.remove("is-dragging");
      gsap.set(this.target, { x: 0 });
    }
  });

  if (typeof ScrollTrigger !== "undefined" && section) {
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 2,
      invalidateOnRefresh: true,
      onRefresh: renderCarousel,
      onUpdate: (self) => {
        scrollRotation = self.progress * 360;
        renderCarousel();
      }
    });
  }

  window.addEventListener("resize", () => {
    renderCarousel();

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });
});