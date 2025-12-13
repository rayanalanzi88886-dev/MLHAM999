export interface ChatAttachment {
  name: string;
  type: string;
  data: string; // Base64 Data URI
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  attachment?: ChatAttachment;
}

export type Theme = 'light' | 'dark';

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export type ExpertCategory = 'Money' | 'Self' | 'AI' | 'Tech' | 'Career';

export interface Expert {
  id: string;
  name: string;
  title: string;
  category: ExpertCategory;
  emoji: string;
  systemInstruction: string;
  welcomeMessage: string;
}