"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Paper,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { apiCall } from "@/infrastructure/api/client";
import { useAuth } from "@/hooks/useAuth";
import type { Idea } from "@/shared/types";

export default function IdeaDetailPage() {
  const params = useParams();
  const { ready, logout } = useAuth();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (ready) {
      apiCall<Idea>(`/api/ideas/${id}`)
        .then(setIdea)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [ready, id]);

  if (!ready || loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>;
  }

  if (!idea) {
    return (
      <Container>
        <Typography color="error">アイデアが見つかりません</Typography>
        <Button component={Link} href="/ideas">戻る</Button>
      </Container>
    );
  }

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
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>{idea.title}</Typography>
          <Typography variant="body1" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>{idea.description}</Typography>
          <Typography variant="caption" color="textSecondary">
            作成日時: {new Date(idea.created_at).toLocaleString("ja-JP")}
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
            更新日時: {new Date(idea.updated_at).toLocaleString("ja-JP")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button variant="contained" component={Link} href={`/ideas/${idea.id}/edit`}>編集</Button>
            <Button variant="outlined" component={Link} href="/ideas">戻る</Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
