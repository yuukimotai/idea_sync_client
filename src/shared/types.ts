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

// API Result
export interface ApiResult<T> {
  status: string;
  data?: T;
  error?: string;
}
