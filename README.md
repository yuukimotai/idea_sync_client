# Idea Sync Client

Next.js + Material UI による **Idea 管理フロントエンド**。DDD Lite アーキテクチャで構築した、アイデア共有・管理プラットフォームのUIレイヤー。

## 技術スタック

- **フレームワーク**: Next.js 16.2
- **UI**: Material-UI（MUI）9.0
- **言語**: TypeScript 5
- **認証**: JWT Bearer token（localStorage 保存）
- **スタイリング**: Dark mode 対応
- **アーキテクチャ**: DDD Lite（ドメイン層 ⊢ アプリケーション層 ⊢ インフラ層 ⊢ プレゼンテーション層）

## 特徴

- ✅ **DDD Lite アーキテクチャ** — バックエンド設計に合わせた構造
- ✅ **Dark Mode** — Material-UI で完全なダークモード対応
- ✅ **Ideas CRUD** — 作成・読取・更新・削除機能
- ✅ **JWT 認証** — localStorage で token 管理
- ✅ **TypeScript** — 型安全なコンポーネント実装

## クイックスタート

### セットアップ

```bash
npm install
```

### 環境変数設定

`.env.local` ファイルを作成：

```env
NEXT_PUBLIC_API_URL=http://localhost:2300
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセス

## URL 構造

| URL | 説明 |
|-----|------|
| `/` | ログイン前ホーム（登録・ログインボタン） |
| `/auth/login` | ログインページ |
| `/auth/register` | ユーザー登録ページ |
| `/dashboard` | ログイン後ホーム |
| `/ideas` | アイデア一覧 |
| `/ideas/new` | 新規アイデア作成 |
| `/ideas/[id]` | アイデア詳細 |
| `/ideas/[id]/edit` | アイデア編集 |
| `/chat` | グローバルチャット（WIP） |

## ディレクトリ構成

```
src/
├── domain/                    # ドメイン層
│   ├── idea/
│   ├── message/
│   └── auth/
├── application/               # アプリケーション層
│   └── usecases/
├── infrastructure/            # インフラ層
│   ├── api/
│   │   ├── client.ts         # ← HTTP クライアント（JWT 自動付与）
│   │   ├── auth_api.ts       # ← 認証 API
│   │   └── idea_api.ts       # ← Ideas CRUD API
│   └── storage/
├── presentation/              # プレゼンテーション層
│   ├── components/
│   └── hooks/
├── shared/                    # 共有
│   ├── types.ts              # ← インターフェース定義
│   └── theme.ts              # ← Material-UI テーマ
└── app/
    ├── page.tsx              # ホーム
    ├── layout.tsx            # ルートレイアウト
    ├── auth/
    │   ├── login/page.tsx
    │   └── register/page.tsx
    ├── dashboard/page.tsx
    ├── ideas/
    │   ├── page.tsx          # 一覧
    │   ├── new/page.tsx      # 新規作成
    │   └── [id]/
    │       ├── page.tsx      # 詳細
    │       └── edit/page.tsx  # 編集
    └── chat/page.tsx
```

## API クライアント

`src/infrastructure/api/client.ts` が全 HTTP リクエストを処理：

```typescript
// 自動的に JWT token を付与
const result = await apiCall<IdeasResponse>("/api/ideas", {
  method: "GET"
});
```

**特徴:**
- Authorization header に Bearer token を自動追加
- エラーハンドリング
- 204 No Content 対応

## 認証フロー

1. **ユーザー登録** (`/auth/register`)
   - メール・パスワード入力
   - backend の `/api/accounts` を呼出
   - JWT token を localStorage に保存
   - `/dashboard` にリダイレクト

2. **ログイン** (`/auth/login`)
   - メール・パスワード入力
   - backend の `/api/login` を呼出
   - JWT token を localStorage に保存
   - `/dashboard` にリダイレクト

3. **API 呼出し**
   - localStorage から token を読込
   - Authorization header に追加
   - backend の API を呼出

## 開発フロー

```bash
# サーバー起動
npm run dev

# ビルド
npm run build

# 本番モード起動
npm run start

# 型チェック
npx tsc --noEmit

# ESLint
npm run lint
```

## Ideas CRUD 使用例

### 一覧表示（自動取得）

`/ideas` ページにアクセスすると、JWT token で認証されたリクエストが backend に送信され、ユーザーのアイデア一覧が表示されます。

### 新規作成

1. `/ideas/new` にアクセス
2. タイトル・説明を入力
3. 「作成」をクリック
4. `/ideas` にリダイレクト、新規アイデアが表示される

### 詳細表示・編集・削除

1. `/ideas` から対象アイデアをクリック
2. `/ideas/[id]` で詳細表示
3. 「編集」をクリック → `/ideas/[id]/edit`
4. 「削除」をクリック → 確認ダイアログ → 削除実行

## トラブルシューティング

### "Failed to fetch" エラー

- Backend サーバーが起動しているか確認：`docker-compose ps`
- `.env.local` の `NEXT_PUBLIC_API_URL` を確認
- ブラウザの DevTools → Network で リクエスト詳細を確認

### JWT token の有効期限

現在、JWT は有効期限がありません（本番環境では設定推奨）

### localStorage に token が保存されない

- ブラウザのプライベートモード/シークレットモードを確認
- DevTools → Application → Local Storage を確認

## 次のステップ

- [ ] WebSocket チャット機能
- [ ] タグ・カテゴリ機能
- [ ] アイデア検索・フィルタリング
- [ ] ユーザー間コラボレーション
- [ ] ユニットテスト・E2E テスト
- [ ] Vercel デプロイ

## 参考資料

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Material-UI コンポーネント](https://mui.com/components/)
- [Backend API ドキュメント](https://github.com/yuukimotai/idea_sync_server)
