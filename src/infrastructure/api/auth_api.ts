import { apiCall } from "./client";
import type { AuthResponse } from "@/shared/types";

export async function register(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiCall("/api/accounts", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiCall("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
