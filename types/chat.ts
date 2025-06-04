export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  role: Role;
  content: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface StreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    delta: {
      content?: string;
      role?: string;
    };
    index: number;
    finish_reason: string | null;
  }[];
} 