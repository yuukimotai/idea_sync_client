import { defineConfig } from "@playwright/test";

// E2E は docker compose のフルスタック（client:3000 / app:2300 / ws:3001 / db / redis）
// が起動している前提でローカル実行する。CI では実行しない（unit テストのみ）。
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  workers: 1, // 同一 DB を共有するため直列実行
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
});
