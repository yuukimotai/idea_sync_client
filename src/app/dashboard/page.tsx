"use client";

import {
  Box,
  Button,
  Container,
  Typography,
  AppBar,
  Toolbar,
} from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { ready, isAdmin, logout } = useAuth();

  if (!ready) return null;

  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Idea Sync</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" component={Link} href="/ideas">
              アイデア
            </Button>
            <Button color="inherit" component={Link} href="/chat">
              チャット
            </Button>
            {isAdmin && (
              <Button color="inherit" component={Link} href="/admin">
                管理者
              </Button>
            )}
            <Button color="inherit" onClick={logout}>
              ログアウト
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <Typography variant="h4">DashBoard</Typography>
          <Typography variant="body1" color="textSecondary">
            アイデアを共有して、仲間とコラボレーション
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" size="large" component={Link} href="/ideas">
              アイデアを見る
            </Button>
            <Button variant="outlined" size="large" component={Link} href="/chat">
              チャットに参加
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
