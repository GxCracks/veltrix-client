window.VeltrixApi = (() => {
  const base = (window.VELTRIX_API_BASE || '').replace(/\/$/, '');
  let csrfToken = null;

  async function request(path, options = {}) {
    if (!base) {
      throw Object.assign(new Error('Backend unavailable'), { code: 'BACKEND_UNAVAILABLE' });
    }
    const method = (options.method || 'GET').toUpperCase();
    const headers = new Headers(options.headers || {});
    if (csrfToken && !['GET', 'HEAD'].includes(method)) headers.set('x-csrf-token', csrfToken);
    if (options.body && !(options.body instanceof FormData) && !headers.has('content-type')) headers.set('content-type', 'application/json');

    const response = await fetch(`${base}${path}`, { ...options, headers, credentials: 'include' });
    const body = await response.json().catch(() => ({}));
    if (body.csrfToken) csrfToken = body.csrfToken;
    if (!response.ok) {
      throw Object.assign(new Error(body.message || 'Request failed'), {
        code: body.code || 'REQUEST_FAILED',
        status: response.status
      });
    }
    return body;
  }

  return { request, getBase: () => base };
})();
