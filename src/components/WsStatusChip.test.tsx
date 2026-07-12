import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WsStatusChip } from "./WsStatusChip";

describe("WsStatusChip", () => {
  it.each([
    ["connecting", "接続中..."],
    ["connected", "接続済み"],
    ["reconnecting", "再接続中..."],
    ["disconnected", "切断"],
  ] as const)("%s は「%s」と表示する", (status, label) => {
    render(<WsStatusChip status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
