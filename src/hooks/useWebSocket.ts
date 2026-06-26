"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Message } from "@/shared/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001/cable";

type Options = {
  onMessage: (msg: Message) => void;
  onError?: (err: Event) => void;
  enabled: boolean;
  meetingId?: string; // room_code。省略時はグローバルチャット
};

export function useWebSocket({ onMessage, onError, enabled, meetingId }: Options) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  // keep refs current so the WS handler doesn't capture stale closures
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const connect = useCallback(async () => {
    const res = await fetch("/api/ws-token");
    if (!res.ok) return;
    const { token } = await res.json();

    const url = meetingId
      ? `${WS_URL}?token=${encodeURIComponent(token)}&room_code=${encodeURIComponent(meetingId)}`
      : `${WS_URL}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Message;
        onMessageRef.current(data);
      } catch {
        // ignore malformed frames
      }
    };

    ws.onerror = (event) => {
      onErrorRef.current?.(event);
    };

    ws.onclose = () => {
      wsRef.current = null;
    };
  }, [meetingId]);

  const send = useCallback((body: string) => {
    wsRef.current?.send(JSON.stringify({ body }));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, connect, meetingId]);

  return { send };
}
