// types-hybrid.ts - Updated for Hybrid System (Claude + Gemini)

export type ExpertCategory = 
  | 'Money' 
  | 'Career' 
  | 'Business' 
  | 'Self' 
  | 'Health' 
  | 'AI' 
  | 'Tech' 
  | 'Legal';

export type ComplexityLevel = 'simple' | 'medium' | 'complex';
export type ModelType = 'haiku' | 'sonnet' | 'opus' | 'gemini-flash' | 'gemini-pro';
export type APIProvider = 'claude' | 'gemini';

export interface Expert {
  id: string;
  name: string;
  title: string;
  description: string;
  category: ExpertCategory;
  emoji: string;
  avatarUrl?: string;
  systemInstruction: string;
  welcomeMessage: string;
  suggestions: string[];
  
  // Hybrid System Fields
  apiProvider: APIProvider;
  complexityLevel: ComplexityLevel;
  recommendedModel: ModelType;
}

export interface ChatAttachment {
  name: string;
  type: string;
  data: string; // Base64 Data URI
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'assistant';
  content: string;
  timestamp: Date;
  expertId?: string;
  attachment?: ChatAttachment;
  
  // Cost & Performance Metadata
  metadata?: {
    apiProvider: APIProvider;
    model: string;
    tokensUsed?: {
      input: number;
      output: number;
    };
    cost: number;
    cached?: boolean;
    responseTime: number;
  };
  
  // Legacy support
  isError?: boolean;
  modelUsed?: string;
  cost?: number;
}

export interface Conversation {
  id: string;
  expertId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  
  stats: {
    totalMessages: number;
    totalCost: number;
    averageResponseTime: number;
    cacheHitRate: number;
  };
}

export interface UserUsageStats {
  userId?: string;
  period?: 'daily' | 'weekly' | 'monthly';
  
  totalConversations?: number;
  totalMessages?: number;
  totalCost: number;
  totalCalls?: number;
  
  modelUsage: Record<string, number>;
  
  apiProviderUsage: {
    claude: number;
    gemini: number;
  };
  
  expertUsage?: Record<string, number>;
  
  cacheStats?: {
    hits: number;
    misses: number;
    hitRate: number;
    costSaved: number;
  };
  
  // Compatibility
  averageCost?: number;
  cacheHitRate?: number;
  costSavedByCache?: number;
}

export type Theme = 'light' | 'dark';

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
