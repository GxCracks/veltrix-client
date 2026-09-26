(() => {
  const windowsInstallerUrl = 'https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe';
  const cosmeticModDownloadUrl = 'https://github.com/GxCracks/veltrix-client/releases';
  const INTRO_KEY = 'veltrix_intro_seen';

  if (!document.querySelector('link[href="veltrix-extras.css"]')) {
    const extras = document.createElement('link');
    extras.rel = 'stylesheet';
    extras.href = 'veltrix-extras.css?v=1';
    document.head.appendChild(extras);
  }

  const nav = document.getElementById('main-nav');
  if (nav && !nav.querySelector('a[href="cosmetics.html"]')) {
    const cosmeticsLink = document.createElement('a');
    cosmeticsLink.href = 'cosmetics.html';
    cosmeticsLink.textContent = 'Cosmetics';
    const newsLink = nav.querySelector('a[href="#news"]');
    nav.insertBefore(cosmeticsLink, newsLink || null);
  }

  if (sessionStorage.getItem(INTRO_KEY) !== 'true') {
    const intro = document.createElement('div');
    intro.id = 'veltrix-intro';
    intro.className = 'veltrix-intro';
    intro.setAttribute('role', 'button');
    intro.setAttribute('tabindex', '0');
    intro.setAttribute('aria-label', 'Enter VELTRIX website');
    intro.innerHTML = '<div class="veltrix-intro-glow" aria-hidden="true"></div><img src="assets/veltrix-brand.svg" alt="VELTRIX Client"><span>Click to enter</span>';
    document.body.prepend(intro);

    const closeIntro = () => {
      if (!intro.isConnected || intro.classList.contains('leaving')) return;
      sessionStorage.setItem(INTRO_KEY, 'true');
      intro.classList.add('leaving');
      setTimeout(() => intro.remove(), 650);
    };
    intro.addEventListener('click', closeIntro);
    intro.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        closeIntro();
      }
    });
  }

  document.querySelectorAll('.header-download,.hero-primary,.platform-windows a,.download-panel a[href*="VELTRIX-Setup-"]').forEach(link => {
    link.setAttribute('href', windowsInstallerUrl);
  });

  const downloadPanel = document.querySelector('.download-panel');
  if (downloadPanel && !downloadPanel.querySelector('.cosmetic-mod-download')) {
    if (!document.getElementById('cosmetic-mod-download-style')) {
      const style = document.createElement('style');
      style.id = 'cosmetic-mod-download-style';
      style.textContent = `
        .cosmetic-mod-download{
          position:relative;
          display:grid;
          grid-template-columns:48px minmax(0,1fr) auto;
          align-items:center;
          gap:14px;
          min-width:min(100%,330px);
          padding:14px 16px;
          border:1px solid rgba(98,216,247,.3);
          border-radius:14px;
          background:linear-gradient(135deg,rgba(98,216,247,.12),rgba(105,215,165,.055));
          color:#f6fbfd;
          box-shadow:0 18px 45px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.04);
          overflow:hidden;
          transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease;
        }
        .cosmetic-mod-download:before{
          content:"";
          position:absolute;
          inset:0;
          pointer-events:none;
          background:linear-gradient(110deg,transparent 15%,rgba(98,216,247,.07),transparent 70%);
        }
        .cosmetic-mod-download:hover{
          transform:translateY(-2px);
          border-color:rgba(98,216,247,.55);
          box-shadow:0 22px 52px rgba(0,0,0,.3),0 0 32px rgba(98,216,247,.08);
        }
        .cosmetic-mod-download__icon{
          width:48px;
          height:48px;
          display:grid;
          place-items:center;
          border:1px solid rgba(98,216,247,.24);
          border-radius:12px;
          background:rgba(5,15,20,.72);
          color:#8ce7ff;
          font-size:1.1rem;
          font-weight:900;
          letter-spacing:.04em;
        }
        .cosmetic-mod-download__copy{display:block;min-width:0;line-height:1.25}
        .cosmetic-mod-download__copy strong{display:block;font-size:.88rem;letter-spacing:.01em}
        .cosmetic-mod-download__copy small{display:block;margin-top:5px;color:#9fb3bd;font-size:.67rem;line-height:1.35}
        .cosmetic-mod-download__arrow{color:#8ce7ff;font-size:1.15rem;font-weight:900}
        @media (max-width:720px){
          .cosmetic-mod-download{width:100%;grid-template-columns:42px minmax(0,1fr) auto}
          .cosmetic-mod-download__icon{width:42px;height:42px}
        }
      `;
      document.head.appendChild(style);
    }

    const modDownload = document.createElement('a');
    modDownload.className = 'cosmetic-mod-download';
    modDownload.href = cosmeticModDownloadUrl;
    modDownload.setAttribute('aria-label', 'VELTRIX Cosmetic Mod Releases für Minecraft 1.21.11 öffnen');
    modDownload.innerHTML = `
      <span class="cosmetic-mod-download__icon" aria-hidden="true">V</span>
      <span class="cosmetic-mod-download__copy">
        <strong>Cosmetic Mod herunterladen</strong>
        <small>Fabric · Minecraft 1.21.11 · Download über GitHub Releases</small>
      </span>
      <span class="cosmetic-mod-download__arrow" aria-hidden="true">→</span>
    `;
    downloadPanel.appendChild(modDownload);
  }

  const toggle = document.querySelector('.nav-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateFmt = value => {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? esc(value) : new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(date);
  };

  fetch('news.json', {cache: 'no-store'})
    .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
    .then(data => {
      const root = document.getElementById('news-grid');
      if (!root || !Array.isArray(data.items)) return;
      root.innerHTML = data.items.slice(0,3).map(item => `
        <article class="news-card">
          <div class="news-top"><span class="news-tag">${esc(item.tag || 'NEWS')}</span><span class="news-date">${dateFmt(item.date)}</span></div>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.summary)}</p>
          <div class="news-version">${item.version ? `VERSION ${esc(item.version)} · ` : ''}READ MORE →</div>
        </article>
      `).join('');
    })
    .catch(() => {
      const root = document.getElementById('news-grid');
      if (root) root.innerHTML = '<article class="news-card"><h3>News temporarily unavailable</h3><p>Please try again later.</p></article>';
    });

  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const targets = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const setActive = () => {
    let activeId = 'top';
    for (const target of targets) {
      if (target.getBoundingClientRect().top <= 150) activeId = target.id;
    }
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${activeId}`));
  };
  addEventListener('scroll', setActive, {passive:true});
  setActive();

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.1});
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  const hero = document.querySelector('.hero');
  if (hero && !reducedMotion) {
    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * -6;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * -4;
      hero.style.setProperty('--hero-x', `${x}px`);
      hero.style.setProperty('--hero-y', `${y}px`);
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--hero-x', '0px');
      hero.style.setProperty('--hero-y', '0px');
    });
  }

  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  };

  document.querySelectorAll('.store-preview-card').forEach(card => {
    const activate = () => showToast('VELTRIX Store preview — checkout is not live yet.');
    card.addEventListener('click', activate);
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  });
})();
