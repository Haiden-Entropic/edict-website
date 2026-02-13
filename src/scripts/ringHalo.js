export class RingHalo {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.particles = [];
    this.animationId = null;
    this.destroyed = false;
    this.startTime = performance.now();

    this.options = {
      count: 40,
      radius: 220,
      colors: [
        "rgba(255,255,255,0.15)",
        "rgba(255,255,255,0.08)",
        "rgba(160,160,160,0.1)",
      ],
      ...options,
    };

    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    this._resizeBound = this._resize.bind(this);
    this._resizeTimer = null;
    this._onResize = () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(this._resizeBound, 150);
    };
    window.addEventListener("resize", this._onResize);

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
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  _createParticles() {
    this.particles = [];
    const { count, radius, colors } = this.options;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        baseAngle: (Math.PI * 2 * i) / count,
        radiusOffset: (Math.random() - 0.5) * 30,
        orbitSpeed: 0.0003 + Math.random() * 0.0006,
        size: 0.3 + Math.random() * 1,
        baseAlpha: 0.08 + Math.random() * 0.12,
        phaseOffset: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  _drawOnce() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const { radius } = this.options;

    for (const p of this.particles) {
      const r = radius + p.radiusOffset;
      const x = this.centerX + Math.cos(p.baseAngle) * r;
      const y = this.centerY + Math.sin(p.baseAngle) * r;

      this.ctx.beginPath();
      this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.baseAlpha;
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  _animate() {
    if (this.destroyed) return;

    const time = performance.now() - this.startTime;
    this.ctx.clearRect(0, 0, this.width, this.height);
    const { radius } = this.options;

    for (const p of this.particles) {
      const angle = p.baseAngle + time * p.orbitSpeed;
      const breathe = Math.sin(time * 0.0008 + p.phaseOffset) * 6;
      const r = radius + p.radiusOffset + breathe;

      const x = this.centerX + Math.cos(angle) * r;
      const y = this.centerY + Math.sin(angle) * r;

      const alpha =
        p.baseAlpha * (0.5 + 0.5 * Math.sin(time * 0.0015 + p.phaseOffset));

      this.ctx.beginPath();
      this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
    this.animationId = requestAnimationFrame(() => this._animate());
  }

  destroy() {
    this.destroyed = true;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    clearTimeout(this._resizeTimer);
    window.removeEventListener("resize", this._onResize);
  }
}
