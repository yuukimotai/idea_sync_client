"use client";

import { useEffect, useState, useCallback } from "react";
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
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";
import { listIdeas, deleteIdea, type IdeaSort } from "@/infrastructure/api/idea_api";
import { getOrCreateSession } from "@/infrastructure/api/ai_chat_api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { Idea } from "@/shared/types";

// 並び替えの選択肢（sort + order の組み合わせ）
const SORT_OPTIONS = [
  { value: "created_desc", label: "作成が新しい順", sort: "created_at" as IdeaSort, order: "desc" as const },
  { value: "created_asc",  label: "作成が古い順",   sort: "created_at" as IdeaSort, order: "asc" as const },
  { value: "updated_desc", label: "更新が新しい順", sort: "updated_at" as IdeaSort, order: "desc" as const },
  { value: "title_asc",    label: "タイトル順",     sort: "title" as IdeaSort,      order: "asc" as const },
];

export default function IdeasPage() {
  const { ready, logout } = useAuth();
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortValue, setSortValue] = useState("created_desc");

  const fetchIdeas = useCallback(async (q: string, sortVal: string) => {
    try {
      setError("");
      const opt = SORT_OPTIONS.find((o) => o.value === sortVal) ?? SORT_OPTIONS[0];
      const result = await listIdeas({ q: q.trim() || undefined, sort: opt.sort, order: opt.order });
      setIdeas(result.ideas || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "アイデアの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  // 検索は入力から 300ms 待ってから発火（デバウンス）。並び替えは即時
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => fetchIdeas(query, sortValue), 300);
    return () => clearTimeout(timer);
  }, [ready, query, sortValue, fetchIdeas]);

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

        {/* 検索・並び替え */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="タイトル・説明で検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            size="small"
            value={sortValue}
            onChange={(e) => setSortValue(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            {SORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : ideas.length === 0 ? (
          query.trim() ? (
            <Alert severity="info">「{query.trim()}」に一致するアイデアはありません</Alert>
          ) : (
          <Alert severity="info">
            アイデアがまだありません。
            <Link href="/ideas/new">新規作成</Link>
            しましょう
          </Alert>
          )
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
