"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Message } from "@/shared/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001/cable";
const BACKOFF_INITIAL = 1000;
const BACKOFF_MAX = 30000;

export type WsStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

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
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelayRef = useRef(BACKOFF_INITIAL);
  // アンマウント / enabled=false による意図的なクローズかどうか
  const intentionalRef = useRef(false);
  // connect ↔ scheduleRetry の循環参照を避けるための間接参照
  const connectRef = useRef<() => void>(() => {});

  const [status, setStatus] = useState<WsStatus>("disconnected");

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const scheduleRetry = useCallback(() => {
    retryTimerRef.current = setTimeout(() => {
      retryDelayRef.current = Math.min(retryDelayRef.current * 2, BACKOFF_MAX);
      connectRef.current();
    }, retryDelayRef.current);
  }, []);

  const connect = useCallback(async () => {
    setStatus((prev) => (prev === "disconnected" ? "connecting" : "reconnecting"));

    let token: string;
    try {
      const res = await fetch("/api/ws-token");
      if (!res.ok) throw new Error("ws-token fetch failed");
      ({ token } = await res.json());
    } catch {
      // トークン取得失敗もバックオフ対象
      scheduleRetry();
      return;
    }

    const url = meetingId
      ? `${WS_URL}?token=${encodeURIComponent(token)}&room_code=${encodeURIComponent(meetingId)}`
      : `${WS_URL}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      retryDelayRef.current = BACKOFF_INITIAL; // 接続成功でバックオフをリセット
      setStatus("connected");
    };

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
      if (intentionalRef.current) {
        setStatus("disconnected");
        return;
      }
      setStatus("reconnecting");
      scheduleRetry();
    };
  }, [meetingId, scheduleRetry]);

  useEffect(() => { connectRef.current = connect; }, [connect]);

  const send = useCallback((body: string) => {
    wsRef.current?.send(JSON.stringify({ body }));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    intentionalRef.current = false;
    // effect 本体での同期 setState を避けるため接続開始は次タイックに遅延
    const starter = setTimeout(() => connectRef.current(), 0);
    return () => {
      clearTimeout(starter);
      intentionalRef.current = true;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, meetingId]);

  return { send, status };
}
