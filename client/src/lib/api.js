async function request(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: {
        ...(body !== undefined && { 'content-type': 'application/json' }),
        ...(token && { 'x-edit-token': token }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw Object.assign(new Error("Can't reach the Vaani server. Check that it's running and try again."), { status: 0 });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.error?.message ?? `Request failed (${res.status})`), {
      status: res.status,
      code: data.error?.code,
    });
  }
  return data;
}

async function uploadImage(blob) {
  let res;
  try {
    res = await fetch('/api/uploads', { method: 'POST', headers: { 'content-type': blob.type }, body: blob });
  } catch {
    throw new Error("Can't reach the Vaani server to upload the photo.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message ?? `Upload failed (${res.status})`);
  return data.url;
}

export const api = {
  uploadImage,
  health: () => request('/health'),
  generate: (transcript, engine = 'auto') => request('/generate', { method: 'POST', body: { transcript, engine } }),
  publish: (payload) => request('/stores', { method: 'POST', body: payload }),
  listStores: () => request('/stores'),
  getStore: (slug) => request(`/stores/${encodeURIComponent(slug)}`),
  getOwnerStore: (slug, token) => request(`/stores/${encodeURIComponent(slug)}/owner`, { token }),
  updateStore: (slug, store, token) => request(`/stores/${encodeURIComponent(slug)}`, { method: 'PUT', body: { store }, token }),
  sendInquiry: (slug, inquiry) => request(`/stores/${encodeURIComponent(slug)}/inquiries`, { method: 'POST', body: inquiry }),
  listInquiries: (slug, token) => request(`/stores/${encodeURIComponent(slug)}/inquiries`, { token }),
  setInquiryStatus: (slug, id, status, token) =>
    request(`/stores/${encodeURIComponent(slug)}/inquiries/${id}`, { method: 'PATCH', body: { status }, token }),
};
