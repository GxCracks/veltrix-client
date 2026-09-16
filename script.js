(() => {
  const windowsInstallerUrl = 'https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe';
  const windowsDownload = document.querySelector('[data-platform="windows"] .platform-action');
  if (windowsDownload) windowsDownload.setAttribute('href', windowsInstallerUrl);
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
          ${item.version ? `<div class="news-version">VERSION ${esc(item.version)}</div>` : ''}
        </article>
      `).join('');
    })
    .catch(() => {
      const root = document.getElementById('news-grid');
      if (root) root.innerHTML = '<article class="news-card"><h3>News unavailable</h3><p>Please check back later.</p></article>';
    });
})();
