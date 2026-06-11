const API_BASE = "/api/proxy";

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof options.headers === "object" && options.headers !== null) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.statusText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
