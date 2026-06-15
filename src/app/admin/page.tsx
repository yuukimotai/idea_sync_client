"use client";

import {
  Box,
  Button,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Paper,
} from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPage() {
  const { ready, logout } = useAuth({ adminOnly: true });

  // ready になるまで（＝admin確認が済むまで）何も描画しない。
  // 非adminは useAuth 内で /dashboard へリダイレクトされる。
  if (!ready) return null;

  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Idea Sync</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" component={Link} href="/dashboard">
              DashBoard
            </Button>
            <Button color="inherit" onClick={logout}>
              ログアウト
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          管理者ページ
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography color="textSecondary">
            ここは管理者だけが入れるエリア。
            今後、会議・参加者・機能ロール（タイムキーパー / 進行 / 書記 / 発表）の
            管理機能をここに追加していく予定。
          </Typography>
        </Paper>
      </Container>
    </>
  );
}
