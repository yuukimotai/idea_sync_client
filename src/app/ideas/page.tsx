"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import Link from "next/link";
import { listIdeas, deleteIdea } from "@/infrastructure/api/idea_api";
import { getOrCreateSession } from "@/infrastructure/api/ai_chat_api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { Idea } from "@/shared/types";

export default function IdeasPage() {
  const { ready, logout } = useAuth();
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingChat, setStartingChat] = useState<string | null>(null);

  useEffect(() => {
    if (ready) fetchIdeas();
  }, [ready]);

  const fetchIdeas = async () => {
    try {
      setError("");
      const result = await listIdeas();
      setIdeas(result.ideas || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "アイデアの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;
    try {
      await deleteIdea(id);
      setIdeas(ideas.filter((idea) => idea.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  const handleStartChat = async (ideaId: string) => {
    setStartingChat(ideaId);
    try {
      const result = await getOrCreateSession(ideaId);
      router.push(`/ai-chat/${result.session.id}?idea_id=${ideaId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "壁打ちの開始に失敗しました");
      setStartingChat(null);
    }
  };

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
            <Button color="inherit" component={Link} href="/chat">
              チャット
            </Button>
            <Button color="inherit" onClick={logout}>
              ログアウト
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4">アイデア一覧</Typography>
          <Button variant="contained" component={Link} href="/ideas/new">
            新規作成
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : ideas.length === 0 ? (
          <Alert severity="info">
            アイデアがまだありません。
            <Link href="/ideas/new">新規作成</Link>
            しましょう
          </Alert>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            {ideas.map((idea) => (
              <Card key={idea.id}>
                <CardContent>
                  <Typography variant="h6">{idea.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {idea.description}
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                    {new Date(idea.created_at).toLocaleString("ja-JP")}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} href={`/ideas/${idea.id}`}>
                    詳細
                  </Button>
                  <Button size="small" component={Link} href={`/ideas/${idea.id}/edit`}>
                    編集
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    disabled={startingChat === idea.id}
                    onClick={() => handleStartChat(idea.id)}
                  >
                    {startingChat === idea.id ? "開始中..." : "壁打ちする"}
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(idea.id)}>
                    削除
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </>
  );
}
