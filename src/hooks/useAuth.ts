"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UseAuthOptions {
  // true にすると admin 以外は /dashboard へリダイレクトする
  adminOnly?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { adminOnly = false } = options;
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) {
          router.push("/auth/login");
          return;
        }
        const data = await res.json();
        setRole(data.role ?? null);

        if (adminOnly && data.role !== "admin") {
          router.push("/dashboard");
          return;
        }
        setReady(true);
      })
      .catch(() => router.push("/auth/login"));
  }, [router, adminOnly]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  return { ready, role, isAdmin: role === "admin", logout };
}
