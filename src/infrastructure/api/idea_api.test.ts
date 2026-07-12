import { describe, it, expect, vi, beforeEach } from "vitest";
import { listIdeas } from "./idea_api";

function mockFetchOk(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  });
}

describe("listIdeas のクエリ組み立て", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetchOk({ ideas: [] }));
  });

  it("パラメータなしならクエリ文字列を付けない", async () => {
    await listIdeas();
    expect(fetch).toHaveBeenCalledWith("/api/proxy/api/ideas", expect.any(Object));
  });

  it("q / sort / order を付与する", async () => {
    await listIdeas({ q: "redis", sort: "title", order: "asc" });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toBe("/api/proxy/api/ideas?q=redis&sort=title&order=asc");
  });

  it("検索語を URL エンコードする", async () => {
    await listIdeas({ q: "進捗 100%" });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain(`q=${encodeURIComponent("進捗 100%").replace(/%20/g, "+")}`);
    expect(url).not.toContain("進捗 100%");
  });

  it("空文字の q は付与しない", async () => {
    await listIdeas({ q: "", sort: "created_at", order: "desc" });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).not.toContain("q=");
    expect(url).toContain("sort=created_at");
  });

  it("API エラー時は例外を投げる", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({ message: "boom" }),
    }));
    await expect(listIdeas()).rejects.toThrow("boom");
  });
});
