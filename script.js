/* ============================================================
   PARTICLE CANVAS FACTORY
============================================================ */
function initParticleCanvas(canvasId, opts) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;
  const cfg = Object.assign({
    count: 35, maxDist: 75, speed: 0.25, maxAlpha: 0.22,
    colors: ['rgba(139,26,26,', 'rgba(201,168,76,', 'rgba(28,28,28,', 'rgba(180,150,120,'],
    darkBg: false,
  }, opts);

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || 300;
    H = canvas.height = canvas.offsetHeight || 600;
  }
  function make() {
    particles = Array.from({ length: cfg.count }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 2.2 + 0.5,
      vx:    (Math.random() - 0.5) * cfg.speed,
      vy:    (Math.random() - 0.5) * cfg.speed,
      color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
      alpha: Math.random() * cfg.maxAlpha + 0.04,
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);

    if (cfg.darkBg) {
      const g = ctx.createRadialGradient(W*.5,H*.4,0,W*.5,H*.4,Math.max(W,H)*.8);
      g.addColorStop(0,'rgba(34,8,8,1)'); g.addColorStop(1,'rgba(10,10,10,1)');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      const gl = ctx.createRadialGradient(W*.5,H*.4,0,W*.5,H*.4,W*.55);
      gl.addColorStop(0,'rgba(139,26,26,0.13)'); gl.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = gl; ctx.fillRect(0,0,W,H);
    }

    particles.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.color+p.alpha+')'; ctx.fill();
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<-4) p.x=W+4; if(p.x>W+4) p.x=-4;
      if(p.y<-4) p.y=H+4; if(p.y>H+4) p.y=-4;
    });

    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<cfg.maxDist){
          ctx.beginPath();
          ctx.moveTo(particles[i].x,particles[i].y);
          ctx.lineTo(particles[j].x,particles[j].y);
          ctx.strokeStyle=`rgba(139,26,26,${0.045*(1-d/cfg.maxDist)})`;
          ctx.lineWidth=0.5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  resize(); make(); draw();
  window.addEventListener('resize',()=>{ resize(); make(); },{passive:true});
}

// Hero canvas — cream bg, subtle warm particles
initParticleCanvas('heroCanvas', {
  count: 38, speed: 0.2, maxAlpha: 0.18, darkBg: false,
  colors: ['rgba(139,26,26,','rgba(201,168,76,','rgba(100,80,60,','rgba(180,140,100,'],
});
// Sidebar canvas — dark bg
initParticleCanvas('sidebarCanvas', {
  count: 20, speed: 0.16, maxAlpha: 0.16, darkBg: true,
  colors: ['rgba(139,26,26,','rgba(201,168,76,','rgba(212,165,165,','rgba(255,255,255,'],
});


/* ============================================================
   STACKING SECTIONS
   The scroll container is the main content div.
   Each .stack-section is position:sticky top:0 with increasing z-index,
   so each new section slides over and covers the previous one as you scroll.

   We also add a subtle scale-down to the section being covered
   to enhance the "card stack" feel.
============================================================ */
(function initStackingSections() {
  const sections = Array.from(document.querySelectorAll('.stack-section'));
  if (!sections.length) return;

  // On mobile, sticky stacking is disabled in CSS, so skip the JS too
  const isMobile = () => window.innerWidth <= 768;

  function onScroll() {
    if (isMobile()) return;

    sections.forEach((section, i) => {
      const rect = section.getBoundingClientRect();
      const contentEl = document.getElementById('mainContent');
      const contentLeft = contentEl ? contentEl.getBoundingClientRect().left : 0;

      // How far has this section been "scrolled past"?
      // When rect.top < 0, the section is being covered by the next one
      const scrolledPast = Math.max(0, -rect.top);
      const sectionH     = rect.height;
      const progress     = Math.min(1, scrolledPast / sectionH);

      // Scale down sections as they get covered — subtle parallax stack feel
      // Only apply to sections that are being scrolled past (not the last one)
      if (i < sections.length - 1) {
        const scale   = 1 - progress * 0.04; // shrink to 96% max
        const opacity = 1 - progress * 0.15; // fade to 85% max
        const borderR = progress * 20;       // round corners as it scales

        section.style.transform     = `scale(${scale})`;
        section.style.opacity       = Math.max(0.85, opacity);
        section.style.borderRadius  = `${borderR}px`;
        section.style.transformOrigin = 'top center';
      }
    });
  }

  // Attach to the scrollable content area
  const contentEl = document.getElementById('mainContent');
  if (contentEl) {
    contentEl.addEventListener('scroll', onScroll, { passive: true });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ============================================================
   ELEMENT-LEVEL REVEAL
============================================================ */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  targets.forEach(el => io.observe(el));
})();


/* ============================================================
   POLAROID POP-IN ANIMATION
   Cards scale from 85% → 100% with a spring bounce
   as they enter the viewport
============================================================ */
(function initPolaroids() {
  const cards = document.querySelectorAll('.polaroid-card');
  if (!('IntersectionObserver' in window)) {
    cards.forEach(c => c.classList.add('popped'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // Respect the --pop-delay CSS variable for stagger
        const delay = getComputedStyle(e.target).getPropertyValue('--pop-delay') || '0s';
        setTimeout(() => {
          e.target.classList.add('popped');
        }, parseFloat(delay) * 1000);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  cards.forEach(c => io.observe(c));
})();


/* ============================================================
   ACTIVE SIDEBAR NAV — highlight on scroll
============================================================ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const links    = document.querySelectorAll('.snav-link[data-section]');
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.getAttribute('id');
        links.forEach(a => a.classList.toggle('active', a.dataset.section === id));
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => io.observe(s));
})();


/* ============================================================
   EXPERIENCE TABS
============================================================ */
(function initTabs() {
  const tabs   = document.querySelectorAll('.exp-tab');
  const panels = document.querySelectorAll('.exp-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) {
        panel.classList.add('active');
        // Re-trigger reveal items inside
        panel.querySelectorAll('.reveal').forEach(el => {
          el.classList.remove('visible');
          requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
        });
      }
    });
  });
})();


/* ============================================================
   MOBILE HAMBURGER
============================================================ */
(function initMobileNav() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
})();


/* ============================================================
   DECK PLACEHOLDERS — hide iframe if URL not set yet
============================================================ */
(function initDecks() {
  document.querySelectorAll('.deck-iframe').forEach(iframe => {
    const src = iframe.getAttribute('src') || '';
    const ph  = iframe.nextElementSibling;
    if (src.includes('YOUR_') || !src) {
      iframe.style.display = 'none';
      if (ph) ph.style.display = 'flex';
    } else {
      if (ph) ph.style.display = 'none';
    }
  });
})();


/* ============================================================
   LOGO SLOTS — show placeholder text if logo fails to load
============================================================ */
(function initLogoSlots() {
  document.querySelectorAll('.exp-logo-img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const ph = img.nextElementSibling;
      if (ph) ph.style.display = 'flex';
    });
  });
})();


/* ============================================================
   STICKER SLOTS — hide if image fails
============================================================ */
(function initStickers() {
  document.querySelectorAll('.sticker .sticker-img').forEach(img => {
    img.addEventListener('error', () => {
      const s = img.closest('.sticker');
      if (s) s.style.display = 'none';
    });
  });
})();


/* ============================================================
   HERO PHOTO — show/hide placeholder based on image load
============================================================ */
(function initHeroPhoto() {
  const photo = document.querySelector('.hero-photo');
  const placeholder = document.querySelector('.hero-photo-placeholder');
  if (!photo || !placeholder) return;

  if (!photo.getAttribute('src') || photo.getAttribute('src') === '') {
    photo.style.display = 'none';
    placeholder.style.display = 'flex';
    return;
  }
  photo.addEventListener('load', () => { placeholder.style.display = 'none'; photo.style.display = 'block'; });
  photo.addEventListener('error', () => { photo.style.display = 'none'; placeholder.style.display = 'flex'; });
})();


/* ============================================================
   BACKGROUND MUSIC — low-volume ambient loop with mute toggle
   Browsers block unmuted autoplay until the visitor interacts
   with the page, so we try immediately, and if that's blocked
   we quietly start on the first click/scroll instead.
============================================================ */
(function initBgMusic() {
  const audio = document.getElementById('bgMusic');
  const btn   = document.getElementById('musicToggle');
  if (!audio || !btn) return;

  audio.volume = 0.15; // keep it low and ambient
  let userPaused = false;

  function updateIcon() { btn.textContent = audio.paused ? '🔇' : '🔊'; }

  function startOnFirstInteraction() {
    const resume = () => {
      if (!userPaused) audio.play().then(updateIcon).catch(() => {});
      document.removeEventListener('click', resume);
      document.removeEventListener('scroll', resume);
      document.removeEventListener('keydown', resume);
    };
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('scroll', resume, { once: true, passive: true });
    document.addEventListener('keydown', resume, { once: true });
  }

  audio.play().then(updateIcon).catch(() => { updateIcon(); startOnFirstInteraction(); });

  btn.addEventListener('click', () => {
    if (audio.paused) { userPaused = false; audio.play().then(updateIcon).catch(() => {}); }
    else { userPaused = true; audio.pause(); updateIcon(); }
  });
})();
