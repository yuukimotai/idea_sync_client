import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWebSocket } from "./useWebSocket";
import type { Message } from "@/shared/types";

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  send = vi.fn();
  closeCalled = false;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  close() {
    this.closeCalled = true;
    this.onclose?.();
  }

  static last(): MockWebSocket {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1];
  }
}

describe("useWebSocket", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: "test-token" }),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const flushConnect = async () => {
    // 接続開始の setTimeout(0) + ws-token fetch の microtask を消化
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
  };

  it("トークン付き URL で接続する", async () => {
    renderHook(() => useWebSocket({ onMessage: vi.fn(), enabled: true }));
    await flushConnect();

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.last().url).toContain("token=test-token");
    expect(MockWebSocket.last().url).not.toContain("room_code");
  });

  it("meetingId 指定時は room_code を付与する", async () => {
    renderHook(() => useWebSocket({ onMessage: vi.fn(), enabled: true, meetingId: "ROOM12345678" }));
    await flushConnect();

    expect(MockWebSocket.last().url).toContain("room_code=ROOM12345678");
  });

  it("enabled=false なら接続しない", async () => {
    renderHook(() => useWebSocket({ onMessage: vi.fn(), enabled: false }));
    await flushConnect();

    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it("open で connected、予期せぬ切断で reconnecting になる", async () => {
    const { result } = renderHook(() => useWebSocket({ onMessage: vi.fn(), enabled: true }));
    await flushConnect();

    act(() => MockWebSocket.last().onopen?.());
    expect(result.current.status).toBe("connected");

    act(() => MockWebSocket.last().onclose?.());
    expect(result.current.status).toBe("reconnecting");
  });

  it("受信メッセージを onMessage に渡す", async () => {
    const onMessage = vi.fn();
    renderHook(() => useWebSocket({ onMessage, enabled: true }));
    await flushConnect();

    const msg: Partial<Message> = { id: "m1", body: "hello" };
    act(() => MockWebSocket.last().onmessage?.({ data: JSON.stringify(msg) }));

    expect(onMessage).toHaveBeenCalledWith(expect.objectContaining({ id: "m1", body: "hello" }));
  });

  it("不正な JSON フレームは無視する", async () => {
    const onMessage = vi.fn();
    renderHook(() => useWebSocket({ onMessage, enabled: true }));
    await flushConnect();

    act(() => MockWebSocket.last().onmessage?.({ data: "not-json" }));
    expect(onMessage).not.toHaveBeenCalled();
  });

  it("切断後は指数バックオフで再接続する（1s → 2s）", async () => {
    renderHook(() => useWebSocket({ onMessage: vi.fn(), enabled: true }));
    await flushConnect();
    expect(MockWebSocket.instances).toHaveLength(1);

    // 1回目の切断 → 1000ms 後に再接続
    act(() => MockWebSocket.last().onclose?.());
    await act(async () => { await vi.advanceTimersByTimeAsync(999); });
    expect(MockWebSocket.instances).toHaveLength(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(MockWebSocket.instances).toHaveLength(2);

    // 2回目の切断 → 2000ms 後に再接続（バックオフ倍増）
    act(() => MockWebSocket.last().onclose?.());
    await act(async () => { await vi.advanceTimersByTimeAsync(1999); });
    expect(MockWebSocket.instances).toHaveLength(2);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(MockWebSocket.instances).toHaveLength(3);
  });

  it("接続成功でバックオフがリセットされる", async () => {
    renderHook(() => useWebSocket({ onMessage: vi.fn(), enabled: true }));
    await flushConnect();

    // 切断 → 再接続 → open 成功
    act(() => MockWebSocket.last().onclose?.());
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    act(() => MockWebSocket.last().onopen?.());

    // 次の切断はまた 1000ms で再接続する（2000ms ではなく）
    act(() => MockWebSocket.last().onclose?.());
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(MockWebSocket.instances).toHaveLength(3);
  });

  it("アンマウント時は close して再接続しない", async () => {
    const { unmount } = renderHook(() => useWebSocket({ onMessage: vi.fn(), enabled: true }));
    await flushConnect();
    act(() => MockWebSocket.last().onopen?.());

    const ws = MockWebSocket.last();
    unmount();
    expect(ws.closeCalled).toBe(true);

    // 意図的クローズなのでバックオフ再接続は走らない
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("send は WS にペイロードを書き込む", async () => {
    const { result } = renderHook(() => useWebSocket({ onMessage: vi.fn(), enabled: true }));
    await flushConnect();
    act(() => MockWebSocket.last().onopen?.());

    result.current.send("hello");
    expect(MockWebSocket.last().send).toHaveBeenCalledWith(JSON.stringify({ body: "hello" }));
  });
});
