/**
 * SWR fetcher yang melempar error jika respons tidak OK.
 * Mencegah bug seperti `w.map is not a function` saat API mengembalikan 500
 * dengan body JSON { error: "..." } — yang sebelumnya dianggap data valid.
 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Request failed: ${res.status}`);
  }
  return res.json();
}