// Auth
export interface Account {
  id: string;
  email: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  account: Account;
}

// Idea
export interface Idea {
  id: string;
  account_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface IdeasResponse {
  ideas: Idea[];
}

// Message
export interface Message {
  id: string;
  account_id: string;
  body: string;
  created_at: string;
}

export interface MessagesResponse {
  messages: Message[];
}

// AI Chat
export interface AiChatSession {
  id: string;
  account_id: string;
  idea_id: string;
  created_at: string;
}

export interface AiChatMessage {
  id: string;
  session_id: string;
  role: "user" | "model";
  body: string;
  created_at: string;
}

export interface AiChatSessionResponse {
  session: AiChatSession;
  idea: { id: string; title: string; description: string };
}

export interface AiChatMessagesResponse {
  messages: AiChatMessage[];
}

export interface AiChatSendResponse {
  user_message: AiChatMessage;
  ai_message: AiChatMessage;
}

// Meeting
export type MeetingPurpose = "ideation" | "refinement" | "brainstorm";

export const MEETING_PURPOSE_LABELS: Record<MeetingPurpose, string> = {
  ideation: "アイデア出し",
  refinement: "アイデア煮詰め",
  brainstorm: "ブレスト",
};

export interface Meeting {
  id: string;
  idea_id: string | null;
  created_by: string;
  title: string;
  status: "draft" | "active" | "closed";
  purpose: MeetingPurpose;
  passcode: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  account_id: string;
  roles: string[];
}

export interface MeetingResponse {
  meeting: Meeting;
}

export interface MeetingJoinResponse {
  meeting: Meeting;
  participant: MeetingParticipant;
}

// API Result
export interface ApiResult<T> {
  status: string;
  data?: T;
  error?: string;
}
