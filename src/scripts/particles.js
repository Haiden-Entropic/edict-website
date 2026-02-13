export class ParticleAnimation {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.particles = [];
    this.mouse = { x: -9999, y: -9999, active: false };
    this.animationId = null;
    this.destroyed = false;
    this.mouseTimer = null;

    this.options = {
      quantity: 180,
      attractRadius: 300,
      ...options,
    };

    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    this._resizeBound = this._resize.bind(this);
    this._onMouseMove = this._handleMouse.bind(this);
    this._resizeTimer = null;
    this._onResize = () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(this._resizeBound, 150);
    };

    window.addEventListener("resize", this._onResize);
    window.addEventListener("mousemove", this._onMouseMove, { passive: true });

    this._resize();
    this._createParticles();

    if (this.reducedMotion) {
      this._drawOnce();
    } else {
      this._animate();
    }
  }

  _resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  _pickColor() {
    const r = Math.random();
    if (r < 0.35) return "#06B6D4";       // cyan -dominant
    if (r < 0.60) return "#3B82F6";       // blue
    if (r < 0.85) return "#FFFFFF";       // white
    return "#EF4444";                     // red -rare accent
  }

  _createParticles() {
    this.particles = [];
    const { quantity } = this.options;

    for (let i = 0; i < quantity; i++) {
      const homeX = Math.random() * this.width;
      const homeY = Math.random() * this.height;

      this.particles.push({
        homeX,
        homeY,
        x: homeX,
        y: homeY,
        radius: 1 + Math.random() * 2,   // 2-5px diameter (1-2.5 radius)
        alpha: 0.3 + Math.random() * 0.5, // 0.3-0.8
        color: this._pickColor(),
        ease: 0.03 + Math.random() * 0.07, // 0.03-0.10
        // Gentle ambient drift
        driftVx: (Math.random() - 0.5) * 0.3,
        driftVy: (Math.random() - 0.5) * 0.3,
      });
    }
  }

  _handleMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
    this.mouse.active = true;

    clearTimeout(this.mouseTimer);
    this.mouseTimer = setTimeout(() => {
      this.mouse.active = false;
    }, 3000);
  }

  _drawOnce() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (const p of this.particles) {
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  _animate() {
    if (this.destroyed) return;

    this.ctx.clearRect(0, 0, this.width, this.height);
    const { attractRadius } = this.options;

    for (const p of this.particles) {
      // Drift home position for ambient floating
      p.homeX += p.driftVx;
      p.homeY += p.driftVy;

      // Wrap at edges
      if (p.homeX < -20) p.homeX = this.width + 20;
      else if (p.homeX > this.width + 20) p.homeX = -20;
      if (p.homeY < -20) p.homeY = this.height + 20;
      else if (p.homeY > this.height + 20) p.homeY = -20;

      // Default target = drifting home
      let targetX = p.homeX;
      let targetY = p.homeY;

      // When mouse is active, attract nearby particles toward cursor
      if (this.mouse.active) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < attractRadius) {
          // Strength: 1.0 when right on cursor, 0.0 at edge of radius
          const strength = 1 - dist / attractRadius;
          // Target = directly toward cursor, scaled by strength
          targetX = p.x + dx * strength;
          targetY = p.y + dy * strength;
        }
      }

      // Lerp toward target (each particle has unique ease = different trail speed)
      p.x += (targetX - p.x) * p.ease;
      p.y += (targetY - p.y) * p.ease;

      // Draw
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
    this.animationId = requestAnimationFrame(() => this._animate());
  }

  destroy() {
    this.destroyed = true;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    clearTimeout(this.mouseTimer);
    clearTimeout(this._resizeTimer);
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("mousemove", this._onMouseMove);
  }
}
