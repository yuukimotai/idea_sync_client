"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  Alert,
} from "@mui/material";
import Link from "next/link";
import { createIdea } from "@/infrastructure/api/idea_api";
import { useAuth } from "@/hooks/useAuth";

export default function NewIdeaPage() {
  const router = useRouter();
  const { ready, logout } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("タイトルを入力してください"); return; }
    setLoading(true);
    try {
      await createIdea(title, description);
      router.push("/ideas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Idea Sync</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" component={Link} href="/dashboard">DashBoard</Button>
            <Button color="inherit" component={Link} href="/ideas">アイデア</Button>
            <Button color="inherit" component={Link} href="/chat">チャット</Button>
            <Button color="inherit" onClick={logout}>ログアウト</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>新規アイデア</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
          <TextField fullWidth label="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" required />
          <TextField fullWidth label="説明" value={description} onChange={(e) => setDescription(e.target.value)} margin="normal" multiline rows={4} />
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button variant="contained" type="submit" disabled={loading}>
              {loading ? "作成中..." : "作成"}
            </Button>
            <Button variant="outlined" component={Link} href="/ideas">キャンセル</Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
