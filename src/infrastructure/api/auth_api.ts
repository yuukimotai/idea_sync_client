import type { Account } from "@/shared/types";

export async function login(
  email: string,
  password: string
): Promise<{ account: Account }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "ログインに失敗しました");
  return data;
}

export async function register(
  email: string,
  password: string
): Promise<{ account: Account }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "登録に失敗しました");
  return data;
}
