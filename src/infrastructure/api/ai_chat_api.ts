import { apiCall } from "./client";
import type {
  AiChatSessionResponse,
  AiChatMessagesResponse,
  AiChatSendResponse,
} from "@/shared/types";

export async function getOrCreateSession(
  ideaId: number
): Promise<AiChatSessionResponse> {
  return apiCall(`/api/ai_chat/sessions?idea_id=${ideaId}`);
}

export async function listAiChatMessages(
  sessionId: number
): Promise<AiChatMessagesResponse> {
  return apiCall(`/api/ai_chat/sessions/${sessionId}/messages`);
}

export async function sendAiChatMessage(
  sessionId: number,
  body: string
): Promise<AiChatSendResponse> {
  return apiCall(`/api/ai_chat/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}
