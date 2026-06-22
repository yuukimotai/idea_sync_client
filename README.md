# Idea Sync Client

Next.js + Material UI による **アイデア管理 + AI 壁打ちフロントエンド**。アイデア共有プラットフォームの UI レイヤー。

## 技術スタック

- **フレームワーク**: Next.js 16（App Router）
- **UI**: Material-UI（MUI）9
- **言語**: TypeScript 5
- **認証**: JWT を **httpOnly Cookie**（`SameSite=strict`）で保持。Next.js API Route を BFF プロキシとして使用
- **テーマ**: ソフトパステル + ダークアクセント
- **ID 型**: UUID（バックエンドの UUIDv7 に対応し、全 ID は `string`）

## 特徴

- ✅ **httpOnly Cookie 認証** — token を JS から読めない場所に保持し XSS リスクを低減
- ✅ **BFF プロキシ** — ブラウザは Next.js としか通信せず、サーバー側で Cookie → Bearer に変換して Ruby API へ
- ✅ **ロールベース表示** — `admin` のみ管理者ページに入れる（一般ユーザーは入口も非表示）
- ✅ **Ideas CRUD** — 作成・閲覧・編集・削除
- ✅ **AI 壁打ち** — Gemini とのタイムラインチャット
- ✅ **チャット入力** — AI 壁打ち / グローバルチャットとも複数行対応。**Enter で送信・Shift+Enter で改行**（Slack/Discord と同じ慣習）
- ✅ **TypeScript** — 型安全なコンポーネント

## クイックスタート

```bash
npm install
npm run dev   # http://localhost:3000
```

### 環境変数（任意）

BFF プロキシが Ruby API を呼ぶ先。未設定なら `http://localhost:2300`。

```env
# .env.local（サーバーサイドでのみ使用。NEXT_PUBLIC_ ではない）
RUBY_API_URL=http://localhost:2300
```

> token は httpOnly Cookie で扱うため、API のベース URL をクライアントに露出する必要はない。

## URL 構造

| URL | 説明 | アクセス |
|-----|------|---------|
| `/` | ログイン前ホーム | 全員 |
| `/auth/login` | ログイン | 全員 |
| `/auth/register` | ユーザー登録 | 全員 |
| `/dashboard` | ログイン後ホーム | 認証済み |
| `/ideas` | アイデア一覧 | 認証済み |
| `/ideas/new` | 新規作成 | 認証済み |
| `/ideas/[id]` | 詳細 | 認証済み（本人） |
| `/ideas/[id]/edit` | 編集 | 認証済み（本人） |
| `/ai-chat/[session_id]` | AI 壁打ち | 認証済み（本人） |
| `/chat` | グローバルチャット | 認証済み |
| `/admin` | 管理者ページ | **admin のみ**（非 admin は `/dashboard` へ） |

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx                  # ホーム
│   ├── layout.tsx                # ルートレイアウト（softTheme 適用）
│   ├── auth/{login,register}/    # 認証ページ
│   ├── dashboard/                # ログイン後ホーム（admin のみ管理者リンク）
│   ├── ideas/                    # 一覧 / new / [id] / [id]/edit
│   ├── ai-chat/[session_id]/     # AI 壁打ちチャット
│   ├── chat/                     # グローバルチャット
│   ├── admin/                    # 管理者ページ（admin 限定）
│   └── api/                      # ★ BFF（サーバーサイド）
│       ├── auth/{login,register,logout,me}/route.ts
│       └── proxy/[...path]/route.ts   # Cookie → Bearer 変換プロキシ
├── hooks/
│   └── useAuth.ts                # 認証状態・role・adminOnly ガード
├── infrastructure/api/
│   ├── client.ts                 # /api/proxy 経由の HTTP クライアント
│   ├── auth_api.ts               # ログイン / 登録
│   ├── idea_api.ts               # Ideas CRUD
│   └── ai_chat_api.ts            # AI 壁打ち
└── shared/
    ├── types.ts                  # 型定義（ID は string）
    └── theme.ts                  # softTheme（ソフトパステル + ダークアクセント）
```

## 認証フロー（httpOnly Cookie + BFF）

```
ブラウザ ──(email/pass)──▶ /api/auth/login (Next.js API Route)
                              │  Ruby /api/login を呼び、token を取得
                              │  token を httpOnly Cookie にセット（SameSite=strict）
                              ▼
ブラウザ ──(fetch /api/proxy/...)──▶ /api/proxy (Next.js)
                              │  Cookie から token を読み（サーバー側）
                              │  Authorization: Bearer <token> を付けて Ruby :2300 へ転送
                              ▼
                           Ruby API
```

- token は **JS から触れない httpOnly Cookie** にあるため `localStorage` は使わない。
- `useAuth()` は `/api/auth/me`（→ Ruby `/api/me`）を叩いて認証状態と `role` を取得。
  - `useAuth({ adminOnly: true })` で admin 以外を `/dashboard` にリダイレクト。
  - 返り値: `{ ready, role, isAdmin, logout }`。
- **注意**: フロントの出し分けは UX 用。実際のアクセス制御はバックエンド側のチェックが担う。

## API クライアント

`src/infrastructure/api/client.ts` は全リクエストを `/api/proxy` 経由で送る（token 付与はサーバー側で実施）:

```typescript
const result = await apiCall<IdeasResponse>("/api/ideas", { method: "GET" });
```

## 開発フロー

```bash
npm run dev          # 開発サーバー
npm run build        # ビルド
npm run start        # 本番モード
npx tsc --noEmit     # 型チェック
npm run lint         # ESLint
```

CI（`.github/workflows/ci.yml`）が push / PR ごとに **型チェック + ビルド + Docker ビルド** を実行する。
デプロイ（`deploy.yml`）は AWS 構築前のため手動トリガー（`workflow_dispatch`）。

## トラブルシューティング

### "Failed to fetch" / 401

- Ruby サーバー（:2300）が起動しているか確認
- `.env.local` の `RUBY_API_URL`（未設定なら localhost:2300）を確認
- DevTools → Application → Cookies に `auth_token`（httpOnly）があるか確認

### ログインし直しが必要になった

DB を作り直すと account_id（UUID）が変わり既存 Cookie は無効になる。再ログインで解決。

## 次のステップ

- [ ] 会議 RBAC（管理者ページに会議・参加者・機能ロール管理を追加）
- [ ] アイデア検索・フィルタ
- [ ] テスト（ユニット / E2E）
- [ ] AWS ECS/Fargate へのデプロイ

## 参考資料

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Material-UI](https://mui.com/)
- [Backend API](https://github.com/yuukimotai/idea_sync_server)
