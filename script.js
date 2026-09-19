(() => {
  const windowsInstallerUrl = 'https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe';
  const newLogoUrl = 'assets/veltrix-logo-user.png';

  document.querySelectorAll('.header-download,.hero-primary,.platform-windows a,.download-panel a[href*="VELTRIX-Setup-"]').forEach(link => {
    link.setAttribute('href', windowsInstallerUrl);
  });

  const headerLogo = document.querySelector('.brand img');
  if (headerLogo) {
    headerLogo.setAttribute('src', newLogoUrl);
    headerLogo.setAttribute('alt', 'VELTRIX Client logo');
    headerLogo.style.width = '96px';
    headerLogo.style.height = '56px';
    headerLogo.style.objectFit = 'contain';
    headerLogo.style.filter = 'drop-shadow(0 0 16px rgba(34,221,255,.22))';

    const brandText = document.querySelector('.brand span');
    if (brandText) brandText.style.display = 'none';

    const brand = document.querySelector('.brand');
    if (brand) {
      brand.style.minWidth = '120px';
      brand.style.gap = '0';
    }
  }

  const footerLogo = document.querySelector('.footer-brand img');
  if (footerLogo) {
    footerLogo.setAttribute('src', newLogoUrl);
    footerLogo.setAttribute('alt', 'VELTRIX Client logo');
    footerLogo.style.width = '128px';
    footerLogo.style.height = '86px';
    footerLogo.style.objectFit = 'contain';
    footerLogo.style.filter = 'drop-shadow(0 0 18px rgba(34,221,255,.18))';
  }

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('main-nav');
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
