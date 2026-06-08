"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
import type { Message } from "@/shared/types";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    setIsAuthenticated(true);
    connectWebSocket(token);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = (token: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2300";
    const wsUrl = apiUrl
      .replace("http://", "ws://")
      .replace("https://", "wss://");

    const ws = new WebSocket(`${wsUrl}/cable?token=${token}`);

    ws.onopen = () => {
      setLoading(false);
      setError("");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
          setMessages((prev) => [...prev, data.message]);
        } else if (data.type === "history") {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };

    ws.onerror = (event) => {
      setError("チャットサーバーに接続できません");
      console.error("WebSocket error:", event);
    };

    ws.onclose = () => {
      setError("チャット接続が切断されました");
    };

    wsRef.current = ws;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !wsRef.current) return;

    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ body: inputValue }));
      setInputValue("");
    } else {
      setError("チャットサーバーに接続していません");
    }
  };

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
            <Button color="inherit" component={Link} href="/dashboard">
              ダッシュボード
            </Button>
            <Button color="inherit" component={Link} href="/ideas">
              アイデア
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              ログアウト
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4, display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          グローバルチャット
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Paper
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2,
                mb: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {messages.length === 0 ? (
                <Typography color="textSecondary" sx={{ m: "auto" }}>
                  メッセージはまだありません
                </Typography>
              ) : (
                messages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      mb: 1,
                      p: 1,
                      backgroundColor: "rgba(144, 202, 249, 0.1)",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="textSecondary">
                      {new Date(msg.created_at).toLocaleString("ja-JP")}
                    </Typography>
                    <Typography variant="body2">{msg.body}</Typography>
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} />
            </Paper>

            <Box
              component="form"
              onSubmit={handleSendMessage}
              sx={{ display: "flex", gap: 1 }}
            >
              <TextField
                fullWidth
                placeholder="メッセージを入力..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN}
              />
              <Button
                variant="contained"
                type="submit"
                disabled={!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN}
              >
                送信
              </Button>
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
