"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
  TextField, Alert, Paper,
} from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { joinMeeting } from "@/infrastructure/api/meeting_api";

export default function JoinMeetingPage() {
  const router = useRouter();
  const { ready, logout } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !passcode.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await joinMeeting(roomCode.trim().toUpperCase(), passcode.trim().toUpperCase());
      router.push(`/meetings/${roomCode.trim().toUpperCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "入室に失敗しました");
    } finally {
      setSubmitting(false);
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
            <Button color="inherit" onClick={logout}>ログアウト</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>会議に入室する</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="ルームコード"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            sx={{ mb: 2 }}
            required
            placeholder="例: AB12CD34EF56"
            slotProps={{ htmlInput: { maxLength: 12, style: { letterSpacing: "0.15em", fontFamily: "monospace" } } }}
          />
          <TextField
            fullWidth
            label="パスコード"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value.toUpperCase())}
            sx={{ mb: 3 }}
            required
            placeholder="例: AB12CD"
            slotProps={{ htmlInput: { maxLength: 6, style: { letterSpacing: "0.2em", fontFamily: "monospace" } } }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting || !roomCode.trim() || !passcode.trim()}
          >
            {submitting ? "入室中..." : "入室する"}
          </Button>
        </Paper>
      </Container>
    </>
  );
}
