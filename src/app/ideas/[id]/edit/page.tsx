"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import Link from "next/link";
import { apiCall } from "@/infrastructure/api/client";
import { updateIdea } from "@/infrastructure/api/idea_api";
import type { Idea } from "@/shared/types";

export default function EditIdeaPage() {
  const router = useRouter();
  const params = useParams();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchIdea();
  }, [router, id]);

  const fetchIdea = async () => {
    try {
      const result = await apiCall<Idea>(`/api/ideas/${id}`);
      setIdea(result);
      setTitle(result.title);
      setDescription(result.description);
    } catch (err) {
      setError("アイデアの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }

    setSaving(true);

    try {
      await updateIdea(Number(id), title, description);
      router.push(`/ideas/${id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "更新に失敗しました"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!idea) {
    return (
      <Container>
        <Typography color="error">アイデアが見つかりません</Typography>
        <Button component={Link} href="/ideas">
          戻る
        </Button>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Idea Sync</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" component={Link} href="/dashboard">
              ダッシュボード
            </Button>
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
        <Typography variant="h4" sx={{ mb: 3 }}>
          アイデアを編集
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
          <TextField
            fullWidth
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="説明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={saving}
            >
              {saving ? "保存中..." : "保存"}
            </Button>
            <Button
              variant="outlined"
              component={Link}
              href={`/ideas/${id}`}
            >
              キャンセル
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
