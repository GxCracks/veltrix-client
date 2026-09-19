(() => {
  const FALLBACK_COSMETICS = [{
    id: 'veltrix_dragon',
    name: 'VELTRIX Dragon',
    categories: ['Pets', 'Shoulder Cosmetics'],
    rarity: 'LEGENDARY',
    status: 'COMING SOON',
    purchasable: false,
    priceCents: 499,
    featured: true,
    createdAt: '2026-09-19',
    preview: 'assets/cosmetics/veltrix-dragon.svg',
    description: 'A cute little Veltrix Dragon that sits on your shoulder and accompanies you throughout Minecraft.'
  }];
  const CATEGORIES = ['Featured','Pets','Wings','Hats','Capes','Back Cosmetics','Shoulder Cosmetics','Emotes','Bundles','Limited','Owned'];
  const rarityRank = { COMMON:1, RARE:2, EPIC:3, LEGENDARY:4, MYTHIC:5, LIMITED:6 };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = item => ({ ...item, categories:Array.isArray(item.categories)?item.categories:[item.category].filter(Boolean), purchasable:Boolean(item.purchasable) });
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function filterCosmetics(items, query, category) {
    const q = (query || '').trim().toLowerCase();
    return items.filter(item => {
      const haystack = [item.name, item.rarity, ...(item.categories || [])].join(' ').toLowerCase();
      const categoryOk = !category || category === 'Featured'
        ? (category ? Boolean(item.featured) : true)
        : category === 'Owned'
          ? Boolean(item.owned)
          : (item.categories || []).includes(category);
      return (!q || haystack.includes(q)) && categoryOk;
    });
  }

  function sortCosmetics(items, sort) {
    const out = [...items];
    if (sort === 'newest') out.sort((a,b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    if (sort === 'price-asc') out.sort((a,b) => (a.priceCents || 0) - (b.priceCents || 0));
    if (sort === 'price-desc') out.sort((a,b) => (b.priceCents || 0) - (a.priceCents || 0));
    if (sort === 'rarity') out.sort((a,b) => (rarityRank[b.rarity] || 0) - (rarityRank[a.rarity] || 0));
    if (sort === 'featured') out.sort((a,b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    return out;
  }

  window.VeltrixCosmetics = { filterCosmetics, sortCosmetics, FALLBACK_COSMETICS };

  const grid = document.getElementById('cosmetic-grid');
  const search = document.getElementById('cosmetic-search');
  const sort = document.getElementById('cosmetic-sort');
  const categories = document.getElementById('category-row');
  const status = document.getElementById('shop-status');
  const dialog = document.getElementById('cosmetic-dialog');
  const body = document.getElementById('dialog-body');
  const connectionState = document.getElementById('connection-status');
  const verificationPanel = document.getElementById('verification-panel');
  const verificationCode = document.getElementById('verification-code');
  let items = FALLBACK_COSMETICS.map(normalize);
  let activeCategory = 'Featured';
  let loginPollGeneration = 0;

  function renderCategories() {
    categories.innerHTML = CATEGORIES.map(category => `<button type="button" class="${category===activeCategory?'active':''}" data-category="${esc(category)}">${esc(category)}</button>`).join('');
    categories.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      renderCategories();
      render();
    }));
  }

  function card(item) {
    return `<article class="cosmetic-card"><div class="cosmetic-preview"><img src="${esc(item.preview)}" alt="${esc(item.name)} preview"></div><div class="cosmetic-meta"><span>${esc((item.categories||[]).join(' · '))}</span><strong class="rarity-${String(item.rarity).toLowerCase()}">${esc(item.rarity)}</strong></div><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><div class="cosmetic-meta"><span class="status-coming">${esc(item.status||'COMING SOON')}</span><button class="shop-button" type="button" data-view="${esc(item.id)}">VIEW</button></div></article>`;
  }

  function render() {
    const filtered = sortCosmetics(filterCosmetics(items, search?.value, activeCategory), sort?.value || 'featured');
    grid.innerHTML = filtered.length ? filtered.map(card).join('') : '<p>No cosmetics match this filter.</p>';
    grid.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => openDetail(items.find(item => item.id === button.dataset.view))));
  }

  function openDetail(item) {
    if (!item || !dialog) return;
    body.innerHTML = `<div class="cosmetic-preview"><img src="${esc(item.preview)}" alt="${esc(item.name)} preview"></div><span class="section-kicker">${esc(item.rarity)}</span><h2>${esc(item.name)}</h2><p>${esc(item.description)}</p><p><strong>${esc((item.categories||[]).join(' · '))}</strong></p><button class="shop-button" type="button" disabled>${esc(item.status||'COMING SOON')}</button>`;
    dialog.showModal();
  }

  dialog?.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  search?.addEventListener('input', render);
  sort?.addEventListener('change', render);
  renderCategories();
  render();

  VeltrixApi.request('/api/cosmetics')
    .then(data => {
      if (Array.isArray(data.cosmetics) && data.cosmetics.length) {
        items = data.cosmetics.map(normalize);
        render();
        status.textContent = 'Catalog synced with VELTRIX.';
      }
    })
    .catch(() => { status.textContent = 'Backend temporarily unavailable — showing the safe preview catalog.'; });

  async function pollLoginStatus(requestId, expiresIn) {
    const generation = ++loginPollGeneration;
    const deadline = Date.now() + Math.min(Number(expiresIn || 300), 300) * 1000;
    while (generation === loginPollGeneration && Date.now() < deadline) {
      await sleep(1400);
      let result;
      try {
        result = await VeltrixApi.request(`/api/web-login/${encodeURIComponent(requestId)}/status`);
      } catch {
        connectionState.textContent = 'Could not check verification status. Try again.';
        return;
      }
      if (result.status === 'pending') continue;
      if (result.status === 'approved') {
        try {
          await VeltrixApi.request(`/api/web-login/${encodeURIComponent(requestId)}/complete`, { method: 'POST' });
          connectionState.innerHTML = '✓ Connected with Veltrix · <a href="account.html">Open Account</a>';
          verificationPanel.hidden = true;
        } catch {
          connectionState.textContent = 'Confirmation succeeded, but the web session could not be created. Try again.';
        }
        return;
      }
      if (result.status === 'denied') connectionState.textContent = 'Login request denied in VELTRIX Client.';
      else connectionState.textContent = 'Verification code expired. Try again.';
      return;
    }
    if (generation === loginPollGeneration) connectionState.textContent = 'Verification code expired. Try again.';
  }

  document.getElementById('connect-veltrix')?.addEventListener('click', async () => {
    const username = document.getElementById('minecraft-username').value.trim();
    loginPollGeneration += 1;
    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) {
      connectionState.textContent = 'Enter a valid Minecraft username.';
      return;
    }
    if (!VeltrixApi.getBase()) {
      connectionState.textContent = 'VELTRIX account connection is not live until the Railway API URL is configured.';
      return;
    }
    connectionState.textContent = 'Checking Veltrix Client connection...';
    verificationPanel.hidden = true;
    try {
      const result = await VeltrixApi.request('/api/web-login/request', {
        method: 'POST',
        body: JSON.stringify({ minecraftUsername: username })
      });
      connectionState.textContent = 'Veltrix Client detected — waiting for confirmation...';
      verificationPanel.hidden = false;
      verificationCode.textContent = result.code || 'Check your client';
      pollLoginStatus(result.requestId, result.expiresIn);
    } catch (error) {
      connectionState.textContent = error.code === 'BACKEND_UNAVAILABLE'
        ? 'VELTRIX account connection is not live yet.'
        : 'Veltrix Client not detected. Open VELTRIX and log into Minecraft, then try again.';
    }
  });
})();
