// hybrid-api-service.ts - Hybrid API Service (Claude + Gemini)

import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Expert, ChatMessage } from '../types-hybrid';

// ===== Initialize Clients =====
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

// Initialize Gemini safely
let genAI: GoogleGenerativeAI | null = null;
try {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey) {
    genAI = new GoogleGenerativeAI(geminiKey);
  }
} catch (e) {
  console.error("Failed to initialize Gemini SDK", e);
}

// ===== Interfaces =====
interface Message {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

interface APICallResult {
  response: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
  cost: number;
  model: string;
  cached: boolean;
  apiProvider: 'claude' | 'gemini';
}

// ===== Caching System =====
class ResponseCache {
  private cache: Map<string, { response: string; timestamp: number }>;
  private readonly TTL = 3600000; // 1 hour

  constructor() {
    this.cache = new Map();
  }

  private generateKey(expertId: string, question: string): string {
    return `${expertId}:${question.trim().toLowerCase()}`;
  }

  get(expertId: string, question: string): string | null {
    const key = this.generateKey(expertId, question);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.response;
  }

  set(expertId: string, question: string, response: string): void {
    const key = this.generateKey(expertId, question);
    this.cache.set(key, { response, timestamp: Date.now() });
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

const responseCache = new ResponseCache();
setInterval(() => responseCache.cleanup(), 1800000);

// ===== Claude API =====
const callClaudeHaiku = async (
  expert: Expert,
  userMessage: string,
  conversationHistory: Message[] = []
): Promise<APICallResult> => {
  
  // Build messages
  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map(msg => ({
      role: (msg.role === 'model' ? 'assistant' : msg.role) as 'user' | 'assistant',
      content: msg.content
    })),
    {
      role: 'user',
      content: userMessage
    }
  ];

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Using standard Haiku model name
      max_tokens: 500,
      system: expert.systemInstruction,
      messages: messages
    });

    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    // Calculate Cost
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const inputCost = (inputTokens / 1_000_000) * 0.25;  // $0.25/1M
    const outputCost = (outputTokens / 1_000_000) * 1.25; // $1.25/1M
    const totalCost = inputCost + outputCost;

    console.log(`💰 Claude Haiku | Cost: $${totalCost.toFixed(4)} | Tokens: ${inputTokens + outputTokens}`);

    return {
      response: responseText,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens
      },
      cost: totalCost,
      model: 'claude-3-haiku-20240307',
      cached: false,
      apiProvider: 'claude'
    };

  } catch (error: any) {
    console.error('❌ Claude API Error:', error);
    throw new Error(`Failed to connect to Claude: ${error.message}`);
  }
};

// ===== Gemini API =====
const callGeminiFlash = async (
  expert: Expert,
  userMessage: string,
  conversationHistory: Message[] = []
): Promise<APICallResult> => {
  
  try {
    if (!genAI) {
       // Fallback to fetch if SDK not initialized
       throw new Error("Gemini SDK not initialized");
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', // Using stable model name
      systemInstruction: expert.systemInstruction,
    });

    // Build history
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();

    // Gemini Flash Cost (Free tier assumption or low cost)
    const cost = 0;

    console.log(`✨ Gemini Flash | Cost: $0 (Free) | Response: ${responseText.length} chars`);

    return {
      response: responseText,
      tokensUsed: {
        input: 0, 
        output: 0
      },
      cost: cost,
      model: 'gemini-1.5-flash',
      cached: false,
      apiProvider: 'gemini'
    };

  } catch (error: any) {
    console.error('❌ Gemini API Error:', error);
    // Fallback to fetch if SDK fails
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const contents = [
            ...conversationHistory.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })),
            { role: 'user', parts: [{ text: userMessage }] }
        ];

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                system_instruction: { parts: [{ text: expert.systemInstruction }] }
            })
        });
        
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        return {
            response: text,
            tokensUsed: { input: 0, output: 0 },
            cost: 0,
            model: 'gemini-1.5-flash-rest',
            cached: false,
            apiProvider: 'gemini'
        };

    } catch (fetchError) {
        throw new Error(`Failed to connect to Gemini: ${error.message}`);
    }
  }
};

// ===== Main Function =====
export const callAI = async (
  expert: Expert,
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<APICallResult> => {
  
  // 1. Check Cache
  const cachedResponse = responseCache.get(expert.id, userMessage);
  if (cachedResponse) {
    console.log('✅ Cache Hit - Zero Cost!');
    return {
      response: cachedResponse,
      tokensUsed: { input: 0, output: 0 },
      cost: 0,
      model: 'cached',
      cached: true,
      apiProvider: expert.apiProvider
    };
  }

  // 2. Convert History
  const history: Message[] = conversationHistory.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  // 3. Call Appropriate API
  let result: APICallResult;

  if (expert.apiProvider === 'claude') {
    result = await callClaudeHaiku(expert, userMessage, history);
  } else if (expert.apiProvider === 'gemini') {
    result = await callGeminiFlash(expert, userMessage, history);
  } else {
    throw new Error(`Unknown API provider: ${expert.apiProvider}`);
  }

  // 4. Save to Cache
  responseCache.set(expert.id, userMessage, result.response);

  return result;
};

// ===== Usage Tracker =====
export class UsageTracker {
  private totalCost: number = 0;
  private callCount: number = 0;
  private apiProviderUsage: Record<string, number> = { claude: 0, gemini: 0 };
  private cacheHits: number = 0;

  trackCall(result: APICallResult): void {
    this.callCount++;
    this.totalCost += result.cost;
    
    if (result.cached) {
      this.cacheHits++;
    } else {
      this.apiProviderUsage[result.apiProvider] = 
        (this.apiProviderUsage[result.apiProvider] || 0) + 1;
    }
  }

  getStats() {
    return {
      totalCalls: this.callCount,
      totalCost: this.totalCost,
      averageCost: this.callCount > 0 ? this.totalCost / this.callCount : 0,
      cacheHitRate: this.callCount > 0 ? (this.cacheHits / this.callCount) * 100 : 0,
      apiProviderUsage: this.apiProviderUsage,
      costSavedByCache: this.cacheHits * 0.015 // Average Haiku cost
    };
  }

  reset(): void {
    this.totalCost = 0;
    this.callCount = 0;
    this.apiProviderUsage = { claude: 0, gemini: 0 };
    this.cacheHits = 0;
  }
}

export const usageTracker = new UsageTracker();
