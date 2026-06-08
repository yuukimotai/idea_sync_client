"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Typography,
  AppBar,
  Toolbar,
} from "@mui/material";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (!isAuthenticated) {
    return null;
  }

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
            <Button color="inherit" onClick={handleLogout}>
              ログアウト
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography variant="h4">ダッシュボード</Typography>
          <Typography variant="body1" color="textSecondary">
            アイデアを共有して、仲間とコラボレーション
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/ideas"
            >
              アイデアを見る
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/chat"
            >
              チャットに参加
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
