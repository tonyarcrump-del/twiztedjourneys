/**
 * cinematic-atmosphere.js
 * Twizted Journeys — Visible cinematic motion layer
 * Canvas-based: sparkles, aurora ribbons, shimmer.
 * No external libraries. No interference with nav/merch/payment logic.
 * Respects prefers-reduced-motion. Degrades gracefully on mobile.
 */

(function () {
  'use strict';

  /* -- Motion preference check ---------------------------------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  /* -- Mobile detection — reduce particle count ----------------- */
  const isMobile = window.innerWidth < 768;

  /* -- Colour palette ------------------------------------------- */
  const TEAL   = { r: 86,  g: 224, b: 210 };
  const PURPLE = { r: 138, g: 43,  b: 239 };
  const CYAN   = { r: 158, g: 243, b: 247 };
  const WHITE  = { r: 248, g: 251, b: 255 };

  const SPARK_COLORS = [TEAL, PURPLE, CYAN, WHITE, TEAL, TEAL, CYAN];

  /* -- Utility -------------------------------------------------- */
  function rand(min, max) { return min + Math.random() * (max - min); }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function rgba(c, a) { return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')'; }
  function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

  /* ============================================================
     SPARKLE / PARTICLE
     Particles drift upward, twinkle alpha and size, wrap at edges.
     ============================================================ */

  function Particle(w, h, colorList) {
    this.w = w;
    this.h = h;
    this.colorList = colorList;
    this.reset(true);
  }

  Particle.prototype.reset = function (randomY) {
    this.x    = rand(0, this.w);
    this.y    = randomY ? rand(0, this.h) : this.h + rand(4, 20);
    this.size = rand(1.0, isMobile ? 1.8 : 2.6);
    this.baseAlpha = rand(0.45, 0.90);
    this.alpha = this.baseAlpha;
    this.color = pick(this.colorList);
    this.speedX = rand(-0.18, 0.18);
    this.speedY = -rand(0.22, isMobile ? 0.55 : 0.78);
    this.twinkleSpeed  = rand(0.009, 0.024);
    this.twinkleOffset = rand(0, Math.PI * 2);
    this.life    = 0;
    this.maxLife = rand(220, 480);
    /* occasional soft glow fleck */
    this.isFleck = Math.random() < 0.12;
    if (this.isFleck) {
      this.size      = rand(3.0, isMobile ? 4.2 : 5.6);
      this.baseAlpha = rand(0.22, 0.52);
      this.speedY    = -rand(0.10, 0.28);
    }
  };

  Particle.prototype.update = function () {
    this.life++;
    this.x += this.speedX;
    this.y += this.speedY;
    /* twinkle */
    this.alpha = this.baseAlpha *
      (0.52 + 0.48 * Math.sin(this.life * this.twinkleSpeed + this.twinkleOffset));
    /* fade in / fade out */
    var fade = 40;
    if (this.life < fade) this.alpha *= (this.life / fade);
    if (this.life > this.maxLife - fade) this.alpha *= ((this.maxLife - this.life) / fade);
    /* wrap x */
    if (this.x < -10) this.x = this.w + 10;
    if (this.x > this.w + 10) this.x = -10;
    /* recycle */
    if (this.y < -20 || this.life >= this.maxLife) this.reset(false);
  };

  Particle.prototype.draw = function (ctx) {
    ctx.save();
    if (this.isFleck) {
      var g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
      g.addColorStop(0, rgba(this.color, this.alpha));
      g.addColorStop(1, rgba(this.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      /* halo */
      var gh = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.2);
      gh.addColorStop(0,   rgba(this.color, this.alpha));
      gh.addColorStop(0.4, rgba(this.color, this.alpha * 0.52));
      gh.addColorStop(1,   rgba(this.color, 0));
      ctx.fillStyle = gh;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2.2, 0, Math.PI * 2);
      ctx.fill();
      /* bright core */
      ctx.fillStyle = rgba(WHITE, Math.min(this.alpha * 1.35, 0.96));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  /* ============================================================
     AURORA RIBBON
     2-3 wavy sine-wave ribbons per hero, drifting slowly.
     ============================================================ */

  function AuroraRibbon(w, h, index) {
    this.w = w;
    this.h = h;
    var configs = [
      { color: PURPLE, yFrac: 0.28, amp: 70, freq: 0.0032, speed: 0.0009, alpha: 0.16, thickness: 120 },
      { color: TEAL,   yFrac: 0.52, amp: 54, freq: 0.0024, speed: 0.0007, alpha: 0.12, thickness: 88  },
      { color: CYAN,   yFrac: 0.74, amp: 40, freq: 0.0044, speed: 0.0012, alpha: 0.09, thickness: 60  }
    ];
    var cfg = configs[index % configs.length];
    this.color     = cfg.color;
    this.yFrac     = cfg.yFrac;
    this.amp       = cfg.amp;
    this.freq      = cfg.freq;
    this.speed     = cfg.speed;
    this.alpha     = cfg.alpha;
    this.thickness = cfg.thickness;
    this.phase     = rand(0, Math.PI * 2);
  }

  AuroraRibbon.prototype.update = function () {
    this.phase += this.speed;
  };

  AuroraRibbon.prototype.draw = function (ctx) {
    var segments = Math.ceil(this.w / 4) + 2;
    var baseY    = this.h * this.yFrac;
    ctx.save();
    ctx.beginPath();
    for (var i = 0; i <= segments; i++) {
      var x = (i / segments) * this.w;
      var y = baseY
        + Math.sin(x * this.freq + this.phase) * this.amp
        + Math.sin(x * this.freq * 0.5 + this.phase * 0.7) * (this.amp * 0.38);
      if (i === 0) ctx.moveTo(x, y);
      else         ctx.lineTo(x, y);
    }
    var grd = ctx.createLinearGradient(0, 0, this.w, 0);
    grd.addColorStop(0,    rgba(this.color, 0));
    grd.addColorStop(0.12, rgba(this.color, this.alpha * 0.6));
    grd.addColorStop(0.35, rgba(this.color, this.alpha));
    grd.addColorStop(0.65, rgba(this.color, this.alpha));
    grd.addColorStop(0.88, rgba(this.color, this.alpha * 0.6));
    grd.addColorStop(1,    rgba(this.color, 0));
    ctx.strokeStyle = grd;
    ctx.lineWidth   = this.thickness;
    ctx.filter      = 'blur(' + (isMobile ? 14 : 24) + 'px)';
    ctx.stroke();
    ctx.restore();
  };

  /* ============================================================
     HEADLINE SHIMMER
     Injects a travelling highlight over gradient headline text.
     ============================================================ */

  function injectHeadlineShimmer() {
    if (document.getElementById('tj-headline-shimmer-style')) return;
    var style = document.createElement('style');
    style.id = 'tj-headline-shimmer-style';
    style.textContent = [
      '@keyframes tjHeadlineShimmer {',
      '  0%   { background-position: -200% center; }',
      '  100% { background-position: 260% center; }',
      '}',
      '.tj-shimmer-active {',
      '  background: linear-gradient(',
      '    105deg,',
      '    transparent 30%,',
      '    rgba(255,255,255,0.76) 48%,',
      '    rgba(158,243,247,0.62) 52%,',
      '    transparent 70%',
      '  ) no-repeat;',
      '  background-size: 220% 100%;',
      '  -webkit-background-clip: text;',
      '  background-clip: text;',
      '  animation: tjHeadlineShimmer 4.4s ease-in-out infinite;',
      '  animation-delay: 2s;',
      '}'
    ].join('\n');
    document.head.appendChild(style);

    var els = document.querySelectorAll(
      '.home-hero-panel h1 em, .hero-page__inner h1 em'
    );
    els.forEach(function (el) { el.classList.add('tj-shimmer-active'); });
  }

  /* ============================================================
     CANVAS FACTORY
     Mounts a full-cover canvas inside a hero element.
     ============================================================ */

  function buildHeroCanvas(heroEl, opts) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = [
      'position:absolute',
      'inset:0',
      'width:100%',
      'height:100%',
      'pointer-events:none',
      'z-index:2',
      'mix-blend-mode:screen'
    ].join(';');

    heroEl.style.position = 'relative';
    heroEl.insertBefore(canvas, heroEl.firstChild);

    var ctx = canvas.getContext('2d');
    var w = 0, h = 0;
    var particles = [], ribbons = [];
    var raf;

    function buildScene() {
      w = canvas.width  = heroEl.offsetWidth;
      h = canvas.height = heroEl.offsetHeight;
      var count = isMobile
        ? Math.floor(opts.particleCount * 0.35)
        : opts.particleCount;
      particles = [];
      for (var i = 0; i < count; i++) particles.push(new Particle(w, h, opts.colors));
      ribbons = [];
      if (opts.ribbonCount) {
        for (var j = 0; j < opts.ribbonCount; j++) ribbons.push(new AuroraRibbon(w, h, j));
      }
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      ribbons.forEach(function (r) { r.update(); r.draw(ctx); });
      particles.forEach(function (p) { p.update(); p.draw(ctx); });
      raf = requestAnimationFrame(tick);
    }

    buildScene();
    tick();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        cancelAnimationFrame(raf);
        buildScene();
        tick();
      }, 220);
    });
  }

  /* ============================================================
     PAGE BOOTSTRAP
     ============================================================ */

  function init() {
    /* Homepage hero */
    var homeHero = document.querySelector('.home-hero');
    if (homeHero) {
      buildHeroCanvas(homeHero, {
        particleCount: isMobile ? 26 : 68,
        ribbonCount:   isMobile ? 1  : 3,
        colors: SPARK_COLORS
      });
      injectHeadlineShimmer();
    }

    /* Events hero — any .hero-page that isn't the home hero */
    var heroPages = document.querySelectorAll('.hero-page');
    heroPages.forEach(function (el) {
      if (!el.classList.contains('home-hero')) {
        buildHeroCanvas(el, {
          particleCount: isMobile ? 16 : 42,
          ribbonCount:   isMobile ? 1  : 2,
          colors: [TEAL, PURPLE, CYAN, WHITE, TEAL]
        });
        injectHeadlineShimmer();
      }
    });

    /* Shoe Drive hero */
    var sdHero = document.querySelector('.sd-hero-wrap');
    if (sdHero) {
      buildHeroCanvas(sdHero, {
        particleCount: isMobile ? 14 : 36,
        ribbonCount:   isMobile ? 1  : 2,
        colors: [TEAL, CYAN, WHITE, TEAL, PURPLE]
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();