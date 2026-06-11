// Auth
export interface Account {
  id: number;
  email: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  account: Account;
}

// Idea
export interface Idea {
  id: number;
  account_id: number;
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
  id: number;
  account_id: number;
  body: string;
  created_at: string;
}

export interface MessagesResponse {
  messages: Message[];
}

// AI Chat
export interface AiChatSession {
  id: number;
  account_id: number;
  idea_id: number;
  created_at: string;
}

export interface AiChatMessage {
  id: number;
  session_id: number;
  role: "user" | "model";
  body: string;
  created_at: string;
}

export interface AiChatSessionResponse {
  session: AiChatSession;
  idea: { id: number; title: string; description: string };
}

export interface AiChatMessagesResponse {
  messages: AiChatMessage[];
}

export interface AiChatSendResponse {
  user_message: AiChatMessage;
  ai_message: AiChatMessage;
}

// API Result
export interface ApiResult<T> {
  status: string;
  data?: T;
  error?: string;
}
