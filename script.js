/* ============================================================
   HERO CANVAS — Animated floating dots / orbs
   ============================================================ */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;

  const COLORS = [
    'rgba(139,26,26,',
    'rgba(201,168,76,',
    'rgba(212,165,165,',
    'rgba(255,255,255,',
  ];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = Array.from({ length: 55 }, () => ({
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 2.8 + 0.6,
      vx:   (Math.random() - 0.5) * 0.35,
      vy:   (Math.random() - 0.5) * 0.35,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.35 + 0.1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // dark radial backdrop
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, Math.max(W, H) * 0.75);
    grad.addColorStop(0, 'rgba(44,10,10,1)');
    grad.addColorStop(1, 'rgba(10,10,10,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // soft radial glow — crimson pulse
    const glow = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, W * 0.5);
    glow.addColorStop(0, 'rgba(139,26,26,0.18)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();

      // move
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;
    });

    // connection lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139,26,26,${0.07 * (1 - dist / 90)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
})();


/* ============================================================
   NAV — scroll shadow + hamburger
   ============================================================ */
(function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // close menu on link click
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
})();


/* ============================================================
   SCROLL REVEAL
   ============================================================ */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal, .fade-in-up');

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => io.observe(el));
})();


/* ============================================================
   EXPERIENCE TABS
   ============================================================ */
(function initTabs() {
  const tabs = document.querySelectorAll('.exp-tab');
  const panels = document.querySelectorAll('.exp-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.getElementById('panel-' + target);
      if (panel) {
        panel.classList.add('active');
        // Re-trigger metrics count-up
        panel.querySelectorAll('.metric-num').forEach(el => {
          el.style.animation = 'none';
          void el.offsetWidth; // reflow
          el.style.animation = '';
        });
      }
    });
  });
})();


/* ============================================================
   SKILL CARDS — keyboard toggling
   ============================================================ */
(function initSkills() {
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // focus triggers CSS :focus state which shows back face
        card.focus();
      }
    });
  });
})();


/* ============================================================
   DECK PLACEHOLDERS — hide iframe if no real URL supplied
   ============================================================ */
(function initDecks() {
  document.querySelectorAll('.deck-iframe').forEach(iframe => {
    const src = iframe.getAttribute('src') || '';
    const placeholder = iframe.nextElementSibling;
    if (src.includes('YOUR_DECK_ID') || src === '') {
      iframe.style.display = 'none';
      if (placeholder) placeholder.style.display = 'flex';
    } else {
      if (placeholder) placeholder.style.display = 'none';
    }
  });
})();


/* ============================================================
   STICKER SLOTS — gracefully hide empty ones
   ============================================================ */
(function initStickers() {
  document.querySelectorAll('.sticker .sticker-img').forEach(img => {
    img.addEventListener('error', () => {
      img.closest('.sticker').style.display = 'none';
    });
    // if src is empty or placeholder, hide immediately
    const src = img.getAttribute('src') || '';
    if (!src || src.endsWith('/')) {
      img.closest('.sticker').style.display = 'none';
    }
  });
})();


/* ============================================================
   ACTIVE NAV LINK on scroll
   ============================================================ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(a => {
          a.style.color = a.getAttribute('href') === '#' + id ? 'var(--crimson)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
})();
