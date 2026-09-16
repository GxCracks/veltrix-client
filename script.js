(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateFmt = (v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? esc(v) : new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(d);
  };

  function renderNews(items) {
    const root = document.getElementById('news-grid');
    if (!root || !Array.isArray(items) || !items.length) return;
    const list = items.slice(0,5);
    const featured = list.find(i => i.featured) || list[0];
    const side = list.filter(i => i !== featured).slice(0,2);
    root.innerHTML = `
      <article class="news-featured">
        <span class="news-tag">${esc(featured.tag || 'NEWS')}</span>
        <h3>${esc(featured.title)}</h3>
        <p>${esc(featured.summary)}</p>
        <div class="news-meta"><span>${dateFmt(featured.date)}</span>${featured.version ? `<span>Version ${esc(featured.version)}</span>` : ''}</div>
      </article>
      <div class="news-stack">${side.map(item => `
        <article class="news-card"><div class="news-top"><span class="news-tag">${esc(item.tag || 'NEWS')}</span><span class="news-date">${dateFmt(item.date)}</span></div><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p>${item.version ? `<div class="news-version">VERSION ${esc(item.version)}</div>` : ''}</article>
      `).join('')}</div>`;
  }

  fetch('news.json', {cache:'no-store'})
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => renderNews(data.items))
    .catch(() => {});

  const windowsInstallerUrl = 'https://github.com/GxCracks/veltrix-client/releases/download/v0.8.1/VELTRIX-Setup-0.8.1.exe';
  const windowsDownload = document.querySelector('[data-platform="windows"] .platform-action');
  if (windowsDownload) {
    windowsDownload.setAttribute('href', windowsInstallerUrl);
    windowsDownload.removeAttribute('download');
    windowsDownload.textContent = 'Install VELTRIX for Windows';
  }
})();
