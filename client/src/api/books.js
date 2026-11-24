const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export function fetchBooks(filters = {}, signal) {
  const params = new URLSearchParams();
  if (filters.genre) params.set("genre", filters.genre);
  if (filters.read) params.set("read", filters.read);
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);

  const query = params.toString();
  return request(query ? `/api/books?${query}` : "/api/books", { signal });
}

export function fetchStats(signal) {
  return request("/api/stats", { signal });
}

export function createBook(bookData) {
  return request("/api/books", { method: "POST", body: JSON.stringify(bookData) });
}

export function replaceBookById(id, bookData) {
  return request(`/api/books/${id}`, { method: "PUT", body: JSON.stringify(bookData) });
}

export function patchBookById(id, partialData) {
  return request(`/api/books/${id}`, { method: "PATCH", body: JSON.stringify(partialData) });
}

export function deleteBookById(id) {
  return request(`/api/books/${id}`, { method: "DELETE" });
}