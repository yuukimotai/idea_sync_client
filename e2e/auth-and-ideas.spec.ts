import { test, expect, type Page } from "@playwright/test";

// 1回の実行内で使い回すテストユーザー（登録 → 以降のテストでログイン）
const EMAIL = `e2e_${Date.now()}@example.com`;
const PASSWORD = "password123";

async function login(page: Page) {
  await page.goto("/auth/login");
  await page.getByLabel("メールアドレス").fill(EMAIL);
  await page.getByLabel("パスワード").fill(PASSWORD);
  await page.getByRole("button", { name: /ログイン/ }).click();
  await page.waitForURL("**/dashboard");
}

test.describe.serial("認証 → アイデア CRUD・検索", () => {
  test("新規登録してダッシュボードに入れる", async ({ page }) => {
    await page.goto("/auth/register");
    await page.getByLabel("メールアドレス").fill(EMAIL);
    // MUI は required ラベルに " *" を付けるため正規表現でマッチさせる
    await page.getByLabel(/^パスワード\s?\*?$/).fill(PASSWORD);
    await page.getByLabel(/^パスワード（確認）/).fill(PASSWORD);
    await page.getByRole("button", { name: /登録/ }).click();

    await page.waitForURL("**/dashboard");
    await expect(page).toHaveURL(/dashboard/);
  });

  test("ログインしてアイデアを作成できる", async ({ page }) => {
    await login(page);

    await page.goto("/ideas/new");
    await page.getByLabel("タイトル").fill("E2E: Redis キャッシュ改善");
    await page.getByLabel("説明").fill("キャッシュレイヤーを見直す");
    await page.getByRole("button", { name: /作成|保存/ }).click();

    await page.waitForURL("**/ideas");
    await expect(page.getByText("E2E: Redis キャッシュ改善")).toBeVisible();
  });

  test("検索でアイデアをフィルタできる", async ({ page }) => {
    await login(page);

    // 2件目を作ってから検索で絞り込む
    await page.goto("/ideas/new");
    await page.getByLabel("タイトル").fill("E2E: 全然別のアイデア");
    await page.getByRole("button", { name: /作成|保存/ }).click();
    await page.waitForURL("**/ideas");

    const search = page.getByPlaceholder("タイトル・説明で検索...");
    await search.fill("Redis キャッシュ");

    await expect(page.getByText("E2E: Redis キャッシュ改善")).toBeVisible();
    await expect(page.getByText("E2E: 全然別のアイデア")).not.toBeVisible();

    // 検索クリアで両方表示に戻る
    await search.clear();
    await expect(page.getByText("E2E: 全然別のアイデア")).toBeVisible();
  });

  test("ヒットしない検索語では空メッセージを表示する", async ({ page }) => {
    await login(page);
    await page.goto("/ideas");

    await page.getByPlaceholder("タイトル・説明で検索...").fill("zzz-no-match-zzz");
    await expect(page.getByText(/に一致するアイデアはありません/)).toBeVisible();
  });
});

test.describe.serial("グローバルチャット（WS 往復）", () => {
  test("メッセージを送信するとリアルタイムに表示される", async ({ page }) => {
    await login(page);
    await page.goto("/chat");

    // WS 接続完了を待つ
    await expect(page.getByText("接続済み")).toBeVisible({ timeout: 10_000 });

    const body = `E2E chat ${Date.now()}`;
    await page.getByPlaceholder(/メッセージを入力/).fill(body);
    await page.keyboard.press("Enter");

    // WS ブロードキャストで自分にも配信される
    await expect(page.getByText(body)).toBeVisible({ timeout: 5_000 });
  });
});
