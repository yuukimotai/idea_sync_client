"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
  TextField, ToggleButton, ToggleButtonGroup, Alert, Paper,
} from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { createMeeting } from "@/infrastructure/api/meeting_api";
import { MEETING_PURPOSE_LABELS, type MeetingPurpose } from "@/shared/types";

const PURPOSES: MeetingPurpose[] = ["ideation", "refinement", "brainstorm"];

export default function NewMeetingPage() {
  const router = useRouter();
  const { ready, logout } = useAuth();
  const [purpose, setPurpose] = useState<MeetingPurpose>("brainstorm");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fullTitle = `【${MEETING_PURPOSE_LABELS[purpose]}】${title}`.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const meeting = await createMeeting({ title: fullTitle, purpose });
      router.push(`/meetings/${meeting.room_code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
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
        <Typography variant="h5" sx={{ mb: 3 }}>会議部屋を作る</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>目的</Typography>
          <ToggleButtonGroup
            value={purpose}
            exclusive
            onChange={(_, v) => v && setPurpose(v)}
            sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}
          >
            {PURPOSES.map((p) => (
              <ToggleButton key={p} value={p} sx={{ textTransform: "none" }}>
                {MEETING_PURPOSE_LABELS[p]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <TextField
            fullWidth
            label="部屋名"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 1 }}
            required
          />
          {title && (
            <Typography variant="caption" color="textSecondary" sx={{ mb: 3, display: "block" }}>
              タイトル：{fullTitle}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting || !title.trim()}
            sx={{ mt: 2 }}
          >
            {submitting ? "作成中..." : "部屋を作る"}
          </Button>
        </Paper>
      </Container>
    </>
  );
}
