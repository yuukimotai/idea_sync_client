"use client";

import { Chip } from "@mui/material";
import type { WsStatus } from "@/hooks/useWebSocket";

const LABELS: Record<WsStatus, string> = {
  connecting:   "接続中...",
  connected:    "接続済み",
  reconnecting: "再接続中...",
  disconnected: "切断",
};

const COLORS: Record<WsStatus, "default" | "success" | "warning" | "error"> = {
  connecting:   "default",
  connected:    "success",
  reconnecting: "warning",
  disconnected: "error",
};

export function WsStatusChip({ status }: { status: WsStatus }) {
  return (
    <Chip
      label={LABELS[status]}
      color={COLORS[status]}
      size="small"
      variant="outlined"
    />
  );
}
