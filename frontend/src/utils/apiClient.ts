// Simple wrapper around fetch, compatible with your existing API
const HOST = import.meta.env.VITE_API_HOST || "";

export const apiClient = {
  get: async <T>(path: string): Promise<T> => {
    const res = await fetch(`${HOST}${path}`);

    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);

    return res.json();
  },
  post: async <T>(path: string, body: any): Promise<T> => {
    const res = await fetch(`${HOST}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);

    return res.json();
  },
};

export const getImageUrl = (path: string) => {
  if (!path) return "";

  return `${HOST}${path}`;
};
