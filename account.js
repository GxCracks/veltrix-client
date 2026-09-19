(() => {
  const status = document.getElementById('account-status');
  const view = document.getElementById('account-view');
  const loggedOut = document.getElementById('logged-out');
  const grid = document.getElementById('owned-grid');
  const filterRoot = document.getElementById('owned-filters');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let ownedItems = [];
  let activeFilter = 'All';

  function showLoggedOut(message) {
    status.textContent = message;
    loggedOut.hidden = false;
    view.hidden = true;
    grid.innerHTML = '';
  }

  function renderOwned() {
    const visible = activeFilter === 'All'
      ? ownedItems
      : ownedItems.filter(item => (item.categories || []).includes(activeFilter));
    grid.innerHTML = visible.length ? visible.map(item => `
      <article class="cosmetic-card">
        <div class="cosmetic-preview"><img src="${esc(item.preview || 'assets/veltrix-mark.svg')}" alt="${esc(item.name)}"></div>
        <div class="cosmetic-meta"><span>${esc((item.categories || []).join(' · '))}</span><strong>${esc(item.rarity || '')}</strong></div>
        <h3>${esc(item.name)}</h3>
        <div class="owned-actions">
          <button class="shop-button ${item.equipped ? '' : 'primary'}" type="button" data-cosmetic="${esc(item.id)}" data-equip-action="${item.equipped ? 'unequip' : 'equip'}">${item.equipped ? 'UNEQUIP' : 'EQUIP'}</button>
          <span class="shop-button" aria-label="Ownership status">${item.equipped ? 'EQUIPPED' : 'OWNED'}</span>
        </div>
      </article>`).join('') : '<p>No owned cosmetics match this filter.</p>';

    grid.querySelectorAll('[data-equip-action]').forEach(button => button.addEventListener('click', async () => {
      button.disabled = true;
      const cosmeticId = button.dataset.cosmetic;
      const action = button.dataset.equipAction;
      try {
        await VeltrixApi.request(action === 'equip' ? '/api/cosmetics/equip' : '/api/cosmetics/unequip', {
          method: 'POST', body: JSON.stringify({ cosmeticId })
        });
        await loadOwned();
        status.textContent = action === 'equip' ? 'Cosmetic equipped and synced with VELTRIX.' : 'Cosmetic unequipped and synced with VELTRIX.';
      } catch (error) {
        status.textContent = error.code === 'CSRF_INVALID' ? 'Your account session changed. Reload the page.' : 'Could not update this cosmetic.';
        button.disabled = false;
      }
    }));
  }

  async function loadOwned() {
    const owned = await VeltrixApi.request('/api/cosmetics/owned');
    ownedItems = Array.isArray(owned.cosmetics) ? owned.cosmetics : [];
    renderOwned();
  }

  async function loadAccount() {
    if (!VeltrixApi.getBase()) {
      showLoggedOut('VELTRIX account services are not live until the Railway API URL is configured.');
      return;
    }
    try {
      const account = await VeltrixApi.request('/api/account');
      status.textContent = '✓ Connected with Veltrix';
      view.hidden = false;
      loggedOut.hidden = true;
      document.getElementById('account-username').textContent = account.minecraftUsername || '—';
      document.getElementById('account-uuid').textContent = account.minecraftUuid || '—';
      document.getElementById('account-member').textContent = account.memberStatus || 'Member';
      document.getElementById('account-client').textContent = account.clientConnected ? '● Connected' : '○ Not Connected';
      document.getElementById('account-veltrix').textContent = account.veltrixUserId || '—';
      document.getElementById('account-created').textContent = account.accountCreated ? new Date(account.accountCreated).toLocaleDateString() : '—';
      await loadOwned();
    } catch (error) {
      showLoggedOut(error.status === 401 ? 'A verified VELTRIX account is required.' : 'VELTRIX account services are temporarily unavailable.');
    }
  }

  filterRoot?.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    activeFilter = button.textContent.trim();
    filterRoot.querySelectorAll('button').forEach(candidate => candidate.classList.toggle('active', candidate === button));
    renderOwned();
  }));

  document.getElementById('account-logout')?.addEventListener('click', async () => {
    try { await VeltrixApi.request('/api/web-session/logout', { method: 'POST' }); } catch {}
    location.href = 'cosmetics.html';
  });

  loadAccount();
})();
