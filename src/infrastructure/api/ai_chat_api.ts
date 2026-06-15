import { apiCall } from "./client";
import type {
  AiChatSessionResponse,
  AiChatMessagesResponse,
  AiChatSendResponse,
} from "@/shared/types";

export async function getOrCreateSession(
  ideaId: string
): Promise<AiChatSessionResponse> {
  return apiCall(`/api/ai_chat/sessions?idea_id=${ideaId}`);
}

export async function listAiChatMessages(
  sessionId: string
): Promise<AiChatMessagesResponse> {
  return apiCall(`/api/ai_chat/sessions/${sessionId}/messages`);
}

export async function sendAiChatMessage(
  sessionId: string,
  body: string
): Promise<AiChatSendResponse> {
  return apiCall(`/api/ai_chat/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}
