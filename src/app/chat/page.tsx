"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
} from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { Message } from "@/shared/types";
import { listMessages } from "@/infrastructure/api/message_api";

export default function ChatPage() {
  const { ready } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleIncoming = useCallback((msg: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const { send } = useWebSocket({
    onMessage: handleIncoming,
    onError: () => setError("WebSocket接続でエラーが発生しました"),
    enabled: ready,
  });

  useEffect(() => {
    if (!ready) return;
    listMessages()
      .then(setMessages)
      .catch((err) => setError(err instanceof Error ? err.message : "メッセージの読み込みに失敗しました"))
      .finally(() => setLoading(false));
  }, [ready]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = inputValue.trim();
    if (!body) return;
    setIsSending(true);
    try {
      send(body);
      setInputValue("");
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
            <Button color="inherit" component={Link} href="/dashboard">DashBoard</Button>
            <Button color="inherit" component={Link} href="/ideas">アイデア</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4, display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }}>
        <Typography variant="h4" sx={{ mb: 2 }}>グローバルチャット</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        ) : (
          <>
            <Paper sx={{ flex: 1, overflowY: "auto", p: 2, mb: 2, display: "flex", flexDirection: "column" }}>
              {messages.length === 0 ? (
                <Typography color="textSecondary" sx={{ m: "auto" }}>メッセージはまだありません</Typography>
              ) : (
                messages.map((msg) => (
                  <Box key={msg.id} sx={{ mb: 1, p: 1, borderRadius: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(msg.created_at).toLocaleString("ja-JP")}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{msg.body}</Typography>
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} />
            </Paper>
            <Box component="form" onSubmit={handleSendMessage} sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
              <TextField
                fullWidth
                placeholder="メッセージを入力...（Shift+Enter で改行）"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isSending}
                multiline
                maxRows={4}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button variant="contained" type="submit" disabled={isSending || !inputValue.trim()}>
                {isSending ? "送信中..." : "送信"}
              </Button>
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
