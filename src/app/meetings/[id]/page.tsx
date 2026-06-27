"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
  Paper, Chip, CircularProgress, Alert, Divider, TextField, IconButton,
  List, ListItem, ListItemText, Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getMeetingDetail, assignRole, revokeRole, listMeetingMessages } from "@/infrastructure/api/meeting_api";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  MEETING_PURPOSE_LABELS, MEETING_ROLE_LABELS, MEETING_FUNCTIONAL_ROLES,
  type Meeting, type MeetingParticipant, type MeetingCapabilities, type Message,
} from "@/shared/types";

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
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [capabilities, setCapabilities] = useState<MeetingCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadDetail = useCallback(async () => {
    const detail = await getMeetingDetail(id);
    setMeeting(detail.meeting);
    setParticipants(detail.participants);
    setCapabilities(detail.capabilities);
  }, [id]);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        await loadDetail();
        const history = await listMeetingMessages(id);
        setMessages(history);
      } catch (err) {
        setError(err instanceof Error ? err.message : "取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, id, loadDetail]);

  const handleMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const { send } = useWebSocket({
    onMessage: handleMessage,
    enabled: ready && !!meeting,
    meetingId: meeting?.room_code,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const body = input.trim();
    if (!body) return;
    send(body);
    setInput("");
  };

  const handleRoleToggle = async (accountId: string, role: string, hasRole: boolean) => {
    if (!meeting) return;
    const key = `${accountId}:${role}`;
    setRoleLoading(key);
    try {
      const updated = hasRole
        ? await revokeRole(meeting.room_code, accountId, role)
        : await assignRole(meeting.room_code, accountId, role);
      setParticipants((prev) => prev.map((p) => p.account_id === updated.account_id ? updated : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ロール更新に失敗しました");
    } finally {
      setRoleLoading(null);
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

      <Container maxWidth="md" sx={{ py: 4 }}>
        {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}
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

            {/* 招待情報 */}
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

            {/* 参加者 & ロール管理 */}
            {participants.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  参加者{capabilities?.manage_roles && "　（クリックでロール付与 / はく奪）"}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <List dense disablePadding>
                  {participants.map((p) => (
                    <ListItem key={p.id} disableGutters sx={{ flexDirection: "column", alignItems: "flex-start", py: 1 }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontFamily: "monospace", mb: 0.5 }}>
                        {p.account_id.slice(0, 8)}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {MEETING_FUNCTIONAL_ROLES.map((role) => {
                          const has = p.roles.includes(role);
                          const key = `${p.account_id}:${role}`;
                          const busy = roleLoading === key;
                          if (capabilities?.manage_roles) {
                            return (
                              <Tooltip key={role} title={has ? `${MEETING_ROLE_LABELS[role]}をはく奪` : `${MEETING_ROLE_LABELS[role]}を付与`}>
                                <Chip
                                  label={MEETING_ROLE_LABELS[role]}
                                  size="small"
                                  color={has ? "primary" : "default"}
                                  variant={has ? "filled" : "outlined"}
                                  disabled={busy}
                                  icon={has ? <RemoveIcon /> : <AddIcon />}
                                  onClick={() => handleRoleToggle(p.account_id, role, has)}
                                  sx={{ cursor: "pointer" }}
                                />
                              </Tooltip>
                            );
                          }
                          return has ? (
                            <Chip key={role} label={MEETING_ROLE_LABELS[role]} size="small" color="primary" />
                          ) : null;
                        })}
                        {!capabilities?.manage_roles && p.roles.length === 0 && (
                          <Typography variant="caption" color="textSecondary">ロールなし</Typography>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* チャット */}
            <Paper sx={{ display: "flex", flexDirection: "column", height: 420 }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle2">会議チャット</Typography>
              </Box>

              <Box sx={{ flex: 1, overflowY: "auto", px: 1 }}>
                {messages.length === 0 ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <Typography variant="body2" color="textSecondary">メッセージはまだありません</Typography>
                  </Box>
                ) : (
                  <List dense disablePadding>
                    {messages.map((msg) => (
                      <ListItem key={msg.id} alignItems="flex-start" sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Box component="span" sx={{ display: "flex", gap: 1, alignItems: "baseline" }}>
                              <Typography variant="caption" color="textSecondary" sx={{ fontFamily: "monospace" }}>
                                {msg.account_id.slice(0, 8)}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {new Date(msg.created_at).toLocaleTimeString("ja-JP")}
                              </Typography>
                            </Box>
                          }
                          secondary={<Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-wrap" }}>{msg.body}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                <div ref={messagesEndRef} />
              </Box>

              <Box sx={{ display: "flex", gap: 1, p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  maxRows={4}
                  placeholder="メッセージを入力... (Shift+Enter で改行)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <IconButton color="primary" onClick={handleSend} disabled={!input.trim()}>
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>
          </>
        )}
      </Container>
    </>
  );
}
