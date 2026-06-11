"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import Link from "next/link";
import {
  listAiChatMessages,
  sendAiChatMessage,
  getOrCreateSession,
} from "@/infrastructure/api/ai_chat_api";
import { useAuth } from "@/hooks/useAuth";
import type { AiChatMessage } from "@/shared/types";

export default function AiChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { ready, logout } = useAuth();
  const sessionId = Number(params.session_id);
  const ideaId = Number(searchParams.get("idea_id"));

  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [ideaTitle, setIdeaTitle] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready) initialize();
  }, [ready, sessionId, ideaId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initialize = async () => {
    try {
      const [sessionData, messagesData] = await Promise.all([
        ideaId ? getOrCreateSession(ideaId) : Promise.resolve(null),
        listAiChatMessages(sessionId),
      ]);
      if (sessionData) setIdeaTitle(sessionData.idea.title);
      setMessages(messagesData.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;
    setIsSending(true);
    setError("");
    const body = inputValue;
    setInputValue("");
    try {
      const result = await sendAiChatMessage(sessionId, body);
      setMessages((prev) => [...prev, result.user_message, result.ai_message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
      setInputValue(body);
    } finally {
      setIsSending(false);
    }
  };

  if (!ready) return null;

  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Idea Sync</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" component={Link} href="/ideas">アイデア</Button>
            <Button color="inherit" component={Link} href="/dashboard">DashBoard</Button>
            <Button color="inherit" onClick={logout}>ログアウト</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3, display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5">壁打ち</Typography>
          {ideaTitle && <Chip label={ideaTitle} size="small" sx={{ mt: 0.5 }} />}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        ) : (
          <>
            <Paper sx={{ flex: 1, overflowY: "auto", p: 2, mb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              {messages.length === 0 ? (
                <Typography color="textSecondary" sx={{ m: "auto" }}>
                  アイデアについて何でも聞いてみよう
                </Typography>
              ) : (
                messages.map((msg) => (
                  <Box key={msg.id} sx={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <Box
                      sx={{
                        maxWidth: "75%",
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: msg.role === "user" ? "primary.main" : "#96959E",
                        color: "#FFFFFF",
                      }}
                    >
                      <Typography variant="caption" sx={{ opacity: 0.7, display: "block", mb: 0.5 }}>
                        {msg.role === "user" ? "あなた" : "Gemini"}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{msg.body}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.5, display: "block", mt: 0.5 }}>
                        {new Date(msg.created_at).toLocaleString("ja-JP")}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
              {isSending && (
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: "#96959E", color: "#FFFFFF" }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" sx={{ ml: 1 }}>Gemini が考え中...</Typography>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Paper>

            <Box component="form" onSubmit={handleSend} sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                placeholder="メッセージを入力..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isSending}
                multiline
                maxRows={4}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                }}
              />
              <Button variant="contained" type="submit" disabled={isSending || !inputValue.trim()} sx={{ minWidth: 80 }}>
                送信
              </Button>
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
