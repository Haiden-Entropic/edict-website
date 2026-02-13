import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) return;

  // --- Lenis smooth scroll ---
  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 0.8,
    smoothTouch: false,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // --- Wire anchor links to Lenis ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target);
      }
    });
  });

  // --- Reveal animations ---
  // Group .reveal elements by parent so siblings get staggered
  const revealEls = gsap.utils.toArray(".reveal");
  const grouped = new Map();

  revealEls.forEach((el) => {
    const parent = el.parentElement;
    if (!grouped.has(parent)) grouped.set(parent, []);
    grouped.get(parent).push(el);
  });

  grouped.forEach((children) => {
    if (children.length > 1) {
      gsap.from(children, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: children[0],
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    } else {
      gsap.from(children[0], {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: children[0],
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }
  });

  // --- Section heading animations ---
  gsap.utils.toArray("section h2").forEach((h2) => {
    // Skip if already handled as a .reveal
    if (h2.classList.contains("reveal")) return;
    gsap.from(h2, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: h2,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });

  // --- Cursor-reactive parallax ---
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  const lerpFactor = 0.08;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const depthEls = document.querySelectorAll("[data-depth]");

  if (depthEls.length > 0) {
    function updateParallax() {
      currentX += (mouseX - currentX) * lerpFactor;
      currentY += (mouseY - currentY) * lerpFactor;

      const offsetX = currentX - window.innerWidth / 2;
      const offsetY = currentY - window.innerHeight / 2;

      depthEls.forEach((el) => {
        const depth = parseFloat(el.dataset.depth) || 0;
        const moveX = offsetX * depth * 0.02;
        const moveY = offsetY * depth * 0.02;
        el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });

      requestAnimationFrame(updateParallax);
    }

    requestAnimationFrame(updateParallax);
  }
}
