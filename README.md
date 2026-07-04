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
- ✅ **リアルタイムチャット** — グローバルチャット・会議室チャットともに WebSocket（Falcon :3001）で双方向通信。ルームコード単位でスコープ分離。切断時は指数バックオフで自動再接続
- ✅ **会議部屋** — パスコード発行・目的タグ付き会議部屋を作成・入室・リアルタイムチャット
- ✅ **チャット入力** — AI 壁打ち / グローバルチャットとも複数行対応。**Enter で送信・Shift+Enter で改行**（Slack/Discord と同じ慣習）
- ✅ **TypeScript** — 型安全なコンポーネント

## クイックスタート

### Docker Compose（推奨）

サーバーリポジトリ（`idea_sync_server`）から一括起動できる:

```bash
cd idea_sync_server
docker compose up -d   # Next.js(:3000) / Hanami(:2300) / Falcon WS(:3001) / DB(:5433)
```

### ローカル単独起動

```bash
npm install
npm run dev   # http://localhost:3000
```

### 環境変数

```env
# .env.local

# BFF プロキシが Ruby API を呼ぶ先（サーバーサイドのみ。デフォルト: http://localhost:2300）
RUBY_API_URL=http://localhost:2300

# WebSocket サーバーの URL（ブラウザから直接接続。デフォルト: ws://localhost:3001/cable）
NEXT_PUBLIC_WS_URL=ws://localhost:3001/cable
```

> Docker Compose 起動時は環境変数が自動で設定される（`.env.local` 不要）。HTTP API の token は httpOnly Cookie で扱うため `RUBY_API_URL` はクライアントに露出しない。WS 認証は `/api/ws-token` route 経由でサーバーサイドから JWT を取得し `?token=` で渡す。

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
| `/meetings/new` | 会議部屋作成 | 認証済み |
| `/meetings/join` | 会議部屋入室（ルームコード＋パスコード） | 認証済み |
| `/meetings/[room_code]` | 会議部屋 | 認証済み |
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
│   ├── chat/                     # グローバルチャット（WS リアルタイム）
│   ├── meetings/
│   │   ├── new/                  #   会議部屋作成（目的タグ + 部屋名）
│   │   ├── join/                 #   会議部屋入室（ID + パスコード）
│   │   └── [id]/                 #   会議部屋（招待情報 + WS リアルタイムチャット）
│   ├── admin/                    # 管理者ページ（admin 限定）
│   └── api/                      # ★ BFF（サーバーサイド）
│       ├── auth/{login,register,logout,me}/route.ts
│       ├── ws-token/route.ts          # httpOnly Cookie から JWT を取得（WS 認証用）
│       └── proxy/[...path]/route.ts   # Cookie → Bearer 変換プロキシ
├── hooks/
│   ├── useAuth.ts                # 認証状態・role・adminOnly ガード
│   └── useWebSocket.ts           # WS 接続管理（接続・受信・送信・自動再接続・WsStatus）meetingId でルームスコープ対応
├── infrastructure/api/
│   ├── client.ts                 # /api/proxy 経由の HTTP クライアント
│   ├── auth_api.ts               # ログイン / 登録
│   ├── idea_api.ts               # Ideas CRUD
│   ├── ai_chat_api.ts            # AI 壁打ち
│   └── meeting_api.ts            # 会議 CRUD + join
└── shared/
    ├── types.ts                  # 型定義（Meeting / MeetingParticipant 含む）
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
                           Ruby API :2300

--- WebSocket（別フロー）---

ブラウザ ──GET /api/ws-token──▶ Next.js（サーバーサイド）
                              │  httpOnly Cookie から token を読んで JSON で返す
                              ▼
ブラウザ ──WS ws://localhost:3001/cable?token=<JWT>──────────────▶ Falcon WS :3001  (グローバルチャット)
ブラウザ ──WS ws://localhost:3001/cable?token=<JWT>&room_code=<code>──▶ Falcon WS :3001  (会議室チャット)
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
npm run dev          # 開発サーバー（:3000）
npm run build        # ビルド
npm run start        # 本番モード
npx tsc --noEmit     # 型チェック
npm run lint         # ESLint
```

CI（`.github/workflows/ci.yml`）が push / PR ごとに **型チェック + ビルド + Docker ビルド** を実行する。
デプロイ（`deploy.yml`）は AWS 構築前のため手動トリガー（`workflow_dispatch`）。

## トラブルシューティング

### "Failed to fetch" / 401

- Ruby サーバー（:2300）と Falcon WS（:3001）が起動しているか確認
- Docker Compose を使っている場合は `idea_sync_server` 側で `docker compose up -d` を実行
- `.env.local` の `RUBY_API_URL`（未設定なら localhost:2300）を確認
- DevTools → Application → Cookies に `auth_token`（httpOnly）があるか確認

### ログインし直しが必要になった

DB を作り直すと account_id（UUID）が変わり既存 Cookie は無効になる。再ログインで解決。

## 次のステップ

- [x] 会議部屋作成・パスコード入室・会議詳細ページ
- [x] ルームコード（12文字英数字）によるシンプルな入室フロー
- [x] 会議室 WS チャット（ルームコード単位でスコープ分離・履歴永続化）
- [x] 会議内の機能ロール（タイムキーパー / 進行 / 書記 / 発表）
- [x] WS 切断時の自動再接続（指数バックオフ 1s→30s・接続状態チップ表示）
- [ ] アイデア検索・フィルタ
- [ ] テスト（ユニット / E2E）
- [ ] AWS ECS/Fargate へのデプロイ

## 参考資料

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Material-UI](https://mui.com/)
- [Backend API](https://github.com/yuukimotai/idea_sync_server)
