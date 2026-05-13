(function () {
  const headerSlot = document.getElementById("header-placeholder");
  const scrollTopButton = document.getElementById("scrollTopBtn");
  const hero = document.querySelector(".hero");
  const heroBg = document.querySelector(".hero__bg");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setActiveNavLink() {
    const links = document.querySelectorAll(".site-nav a");
    const path = window.location.pathname.split("/").pop() || "index.html";

    links.forEach((link) => {
      const href = link.getAttribute("href");
      const isActive =
        (path === "" && href === "index.html") ||
        (path === "index.html" && href === "index.html") ||
        path === href;

      if (isActive) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });
  }

  function setupMobileNav() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("siteNav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function animateCounter(el) {
    if (!el || el.dataset.animated === "true") return;

    const target = Number(el.dataset.count || 0);
    const duration = Number(el.dataset.duration || 1800);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const decimals = Number(el.dataset.decimals || 0);
    const start = performance.now();

    el.dataset.animated = "true";

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = `${prefix}${value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = `${prefix}${target.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        })}${suffix}`;
      }
    }

    requestAnimationFrame(tick);
  }

  function setupRevealAnimations() {
    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("visible"));
      document.querySelectorAll("[data-count]").forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");

          if (entry.target.matches("[data-count]")) {
            animateCounter(entry.target);
          }

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );

    elements.forEach((el) => observer.observe(el));
    document.querySelectorAll("[data-count]").forEach((el) => observer.observe(el));
  }

  function setupScrollTopButton() {
    if (!scrollTopButton) return;

    const toggleButton = () => {
      if (window.scrollY > 500) {
        scrollTopButton.classList.add("visible");
      } else {
        scrollTopButton.classList.remove("visible");
      }
    };

    window.addEventListener("scroll", toggleButton, { passive: true });
    toggleButton();

    scrollTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  function setupParallax() {
    if (!hero || !heroBg || prefersReducedMotion) return;

    let ticking = false;
    let pointerX = 0;
    let pointerY = 0;

    function update() {
      const scrollOffset = window.scrollY * 0.18;
      const xOffset = pointerX * 10;
      const yOffset = pointerY * 10 - scrollOffset;
      heroBg.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0) scale(1.08)`;
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    window.addEventListener("mousemove", (event) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      pointerX = (event.clientX / width - 0.5);
      pointerY = (event.clientY / height - 0.5);
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    });
  }

  function initAfterHeader() {
    setActiveNavLink();
    setupMobileNav();
    setupRevealAnimations();
    setupScrollTopButton();
    setupParallax();
  }

  function loadHeader() {
    if (!headerSlot) {
      initAfterHeader();
      return;
    }

    fetch("header.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Header fetch failed");
        }
        return response.text();
      })
      .then((html) => {
        headerSlot.innerHTML = html;
        initAfterHeader();
      })
      .catch(() => {
        headerSlot.innerHTML = `
          <header class="site-header" id="siteHeader">
            <div class="container header-inner">
              <a class="brand" href="index.html">
                <span class="brand-mark">CSR</span>
                <span class="brand-text">
                  <strong>Catawba Solar Racing Team</strong>
                  <small>Student-led • Salisbury, NC</small>
                </span>
              </a>
              <nav class="site-nav open" id="siteNav">
                <a href="index.html">Home</a>
                <a href="about.html">About</a>
                <a href="cars.html">Cars</a>
                <a href="team.html">Team</a>
                <a href="sponsors.html">Sponsors</a>
                <a href="contact.html">Contact</a>
              </nav>
            </div>
          </header>
        `;
        initAfterHeader();
      });
  }

  document.addEventListener("DOMContentLoaded", loadHeader);
})();