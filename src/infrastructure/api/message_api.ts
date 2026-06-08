import { apiCall } from "./client";
import { MessagesResponse, Message } from "@/shared/types";

export async function listMessages(): Promise<Message[]> {
  const response = await apiCall<MessagesResponse>("/api/messages", {
    method: "GET"
  });
  return response.messages || [];
}

export async function createMessage(body: string): Promise<Message> {
  return apiCall<Message>("/api/messages", {
    method: "POST",
    body: JSON.stringify({ body })
  });
}
