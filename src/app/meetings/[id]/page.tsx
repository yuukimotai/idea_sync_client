"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
  Paper, Chip, CircularProgress, Alert, Divider,
} from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getMeeting } from "@/infrastructure/api/meeting_api";
import { MEETING_PURPOSE_LABELS, type Meeting } from "@/shared/types";

const STATUS_LABELS: Record<string, string> = {
  draft: "準備中",
  active: "進行中",
  closed: "終了",
};

const STATUS_COLORS: Record<string, "default" | "success" | "error"> = {
  draft: "default",
  active: "success",
  closed: "error",
};

export default function MeetingRoomPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, logout } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    getMeeting(id)
      .then(setMeeting)
      .catch((err) => setError(err instanceof Error ? err.message : "取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [ready, id]);

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

      <Container maxWidth="md" sx={{ py: 4 }}>
        {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>}
        {error && <Alert severity="error">{error}</Alert>}
        {meeting && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="h5">{meeting.title}</Typography>
              <Chip
                label={STATUS_LABELS[meeting.status] ?? meeting.status}
                color={STATUS_COLORS[meeting.status] ?? "default"}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              目的：{MEETING_PURPOSE_LABELS[meeting.purpose]}
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                招待情報（参加者に共有してください）
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography variant="body2" color="textSecondary" sx={{ width: 120 }}>ルームコード</Typography>
                  <Typography variant="h6" sx={{ fontFamily: "monospace", letterSpacing: "0.15em" }}>
                    {meeting.room_code}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography variant="body2" color="textSecondary" sx={{ width: 120 }}>パスコード</Typography>
                  <Typography variant="h6" sx={{ fontFamily: "monospace", letterSpacing: "0.2em" }}>
                    {meeting.passcode}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
              <Typography color="textSecondary">
                （会議機能は準備中です）
              </Typography>
            </Paper>
          </>
        )}
      </Container>
    </>
  );
}
