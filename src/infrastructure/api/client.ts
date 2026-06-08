const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2300";

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof options.headers === "object" && options.headers !== null) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
