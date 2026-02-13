/**
 * Constructs the full API URL by resolving the host.
 *
 * This function uses `import.meta.env.VITE_API_HOST`, which is the standard
 * way to access client-side environment variables in modern bundlers like Vite.
 *
 * Make sure your .env.local file has a variable prefixed with `VITE_`.
 * Example: `VITE_API_HOST=http://your.api.host`
 *
 * The host resolution priority is:
 * 1. An explicitly passed `debugHost`.
 * 2. The `VITE_API_HOST` environment variable.
 * 3. A hardcoded fallback for local development.
 *
 * @param path - The API endpoint path (e.g., "/api/info").
 * @param debugHost - An optional host URL for debugging purposes.
 * @returns The full URL for the API endpoint.
 */
export const getApiUrl = (path: string, debugHost?: string): string => {
  // Use import.meta.env for client-side variables
  const host = debugHost || import.meta.env.VITE_API_HOST || "";

  const cleanHost = host.endsWith("/") ? host.slice(0, -1) : host;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanHost}${cleanPath}`;
};
