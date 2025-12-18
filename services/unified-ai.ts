// services/unified-ai.ts - خدمة ذكاء اصطناعي موحدة ومحسّنة

import Anthropic from '@anthropic-ai/sdk';
import { Expert, ChatMessage, ChatAttachment } from '../types-hybrid';
import { MODEL_COSTS } from '../data/experts-hybrid';

// ===== الواجهات =====
export interface AIResponse {
  content: string;
  modelUsed: string;
  cost: number;
  tokensUsed: {
    input: number;
    output: number;
  };
  provider: 'claude' | 'gemini';
  cached?: boolean;
}

// ===== تهيئة العملاء =====
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

// ===== نظام الكاش الذكي =====
class ResponseCache {
  private cache: Map<string, { response: string; timestamp: number; cost: number }>;
  private readonly TTL = 3600000; // ساعة واحدة

  constructor() {
    this.cache = new Map();
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('ai_response_cache');
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load cache:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem('ai_response_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache:', error);
    }
  }

  private generateKey(expertId: string, userMessage: string): string {
    // Normalize the message
    const normalized = userMessage.trim().toLowerCase()
      .replace(/[؟?!.،,]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Normalize spaces
    
    return `${expertId}:${normalized}`;
  }

  get(expertId: string, userMessage: string): { response: string; cost: number } | null {
    const key = this.generateKey(expertId, userMessage);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }
    
    return { response: cached.response, cost: cached.cost };
  }

  set(expertId: string, userMessage: string, response: string, cost: number): void {
    const key = this.generateKey(expertId, userMessage);
    this.cache.set(key, { 
      response, 
      timestamp: Date.now(),
      cost 
    });
    this.saveToStorage();
  }

  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.saveToStorage();
      console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      oldestEntry: Math.min(...Array.from(this.cache.values()).map(v => v.timestamp)),
    };
  }
}

const responseCache = new ResponseCache();

// Cleanup cache every 30 minutes
setInterval(() => responseCache.cleanup(), 1800000);

// ===== تتبع الاستخدام =====
export class UsageTracker {
  private totalCost: number = 0;
  private callCount: number = 0;
  private modelUsage: Record<string, number> = {};
  private providerUsage: Record<string, number> = {};
  private cacheHits: number = 0;
  private cacheMisses: number = 0;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('usage_stats');
      if (stored) {
        const data = JSON.parse(stored);
        Object.assign(this, data);
      }
    } catch (error) {
      console.warn('Failed to load usage stats:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = {
        totalCost: this.totalCost,
        callCount: this.callCount,
        modelUsage: this.modelUsage,
        providerUsage: this.providerUsage,
        cacheHits: this.cacheHits,
        cacheMisses: this.cacheMisses,
      };
      localStorage.setItem('usage_stats', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save usage stats:', error);
    }
  }

  trackCall(response: AIResponse): void {
    this.callCount++;
    this.totalCost += response.cost;
    
    if (response.cached) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
      this.modelUsage[response.modelUsed] = (this.modelUsage[response.modelUsed] || 0) + 1;
      this.providerUsage[response.provider] = (this.providerUsage[response.provider] || 0) + 1;
    }
    
    this.saveToStorage();
  }

  getStats() {
    const cacheHitRate = this.callCount > 0 
      ? (this.cacheHits / this.callCount) * 100 
      : 0;

    return {
      totalCalls: this.callCount,
      totalCost: this.totalCost,
      averageCost: this.callCount > 0 ? this.totalCost / this.callCount : 0,
      modelUsage: this.modelUsage,
      providerUsage: this.providerUsage,
      cacheHitRate: cacheHitRate,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      costSavedByCache: this.cacheHits * 0.015 // Average Haiku cost
    };
  }

  reset(): void {
    this.totalCost = 0;
    this.callCount = 0;
    this.modelUsage = {};
    this.providerUsage = {};
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.saveToStorage();
  }
}

export const usageTracker = new UsageTracker();

// ===== Claude API =====
async function callClaude(
  messages: ChatMessage[],
  expert: Expert,
  attachments: ChatAttachment[]
): Promise<AIResponse> {
  
  // Select model based on expert configuration
  const modelName = expert.recommendedModel === 'haiku' 
    ? 'claude-3-haiku-20240307' 
    : expert.recommendedModel === 'sonnet'
      ? 'claude-3-5-sonnet-20240620'
      : 'claude-3-opus-20240229';

  const modelConfig = MODEL_COSTS[expert.recommendedModel as keyof typeof MODEL_COSTS] || MODEL_COSTS['haiku'];

  // Convert messages to Anthropic format
  const anthropicMessages: Anthropic.MessageParam[] = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role === 'model' ? 'assistant' : msg.role as 'user' | 'assistant',
      content: msg.content
    }));

  try {
    const response = await anthropic.messages.create({
      model: modelName,
      max_tokens: expert.complexityLevel === 'simple' ? 800 : 
                  expert.complexityLevel === 'medium' ? 1200 : 1600,
      system: expert.systemInstruction,
      messages: anthropicMessages as any,
    });

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    
    const inputCost = (inputTokens / 1_000_000) * modelConfig.input;
    const outputCost = (outputTokens / 1_000_000) * modelConfig.output;
    const totalCost = inputCost + outputCost;

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    console.log(`✅ Claude ${modelName} | Cost: $${totalCost.toFixed(5)} | Tokens: ${inputTokens + outputTokens}`);

    return {
      content,
      modelUsed: modelName,
      cost: totalCost,
      tokensUsed: { input: inputTokens, output: outputTokens },
      provider: 'claude',
      cached: false
    };

  } catch (error: any) {
    console.error('❌ Claude API Error:', error);
    
    // Better error messages
    if (error.status === 401) {
      throw new Error('مفتاح Claude API غير صالح. يرجى التحقق من الإعدادات.');
    } else if (error.status === 429) {
      throw new Error('تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.');
    } else if (error.status === 500) {
      throw new Error('خطأ في خادم Claude. يرجى المحاولة مرة أخرى.');
    }
    
    throw new Error(`خطأ في الاتصال بـ Claude: ${error.message}`);
  }
}

// ===== Gemini API =====
async function callGemini(
  messages: ChatMessage[],
  expert: Expert,
  attachments: ChatAttachment[]
): Promise<AIResponse> {
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('مفتاح Gemini API غير موجود في المتغيرات البيئية');
  }

  // Use a stable, widely available Gemini model
  const modelName = 'gemini-1.5-flash-8b-latest';
  const modelConfig = MODEL_COSTS['gemini-flash'] || { input: 0, output: 0 };
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  // Build contents: prepend system instruction to ensure compatibility without systemInstruction field
  const contents = [
    {
      role: 'user',
      parts: [{ text: `SYSTEM INSTRUCTIONS:\n${expert.systemInstruction}` }]
    },
    ...messages
      .filter(m => m.role !== 'system')
      .map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
  ];

  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: expert.complexityLevel === 'simple' ? 800 : 
                       expert.complexityLevel === 'medium' ? 1200 : 1600,
      topP: 0.95,
      topK: 40,
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errorData);
      
      if (response.status === 400) {
        const msg = (errorData && (errorData.error?.message || errorData.message)) || 'طلب غير صالح إلى Gemini API';
        throw new Error(msg);
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('مفتاح Gemini API غير صالح أو منتهي الصلاحية');
      } else if (response.status === 429) {
        throw new Error('تم تجاوز الحد المسموح. Gemini مجاني حتى 1500 طلب/يوم');
      }
      
      throw new Error(`خطأ من Gemini: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract content
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                    data.candidates?.[0]?.text || "";
    
    if (!content) {
      throw new Error('لم يتم استلام محتوى من Gemini');
    }

    // Calculate cost (Gemini Flash is free up to 1500 requests/day)
    const usage = data.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0 };
    const inputTokens = usage.promptTokenCount || 0;
    const outputTokens = usage.candidatesTokenCount || 0;

    // Gemini Flash is free for now
    const inputCost = (inputTokens / 1_000_000) * modelConfig.input;
    const outputCost = (outputTokens / 1_000_000) * modelConfig.output;
    const totalCost = inputCost + outputCost;

    console.log(`✨ Gemini ${modelName} | Cost: $${totalCost.toFixed(5)} (Free tier) | Tokens: ${inputTokens + outputTokens}`);

    return {
      content,
      modelUsed: modelName,
      cost: totalCost,
      tokensUsed: { input: inputTokens, output: outputTokens },
      provider: 'gemini',
      cached: false
    };

  } catch (error: any) {
    console.error('❌ Gemini API Error:', error);
    
    // If it's already a formatted error, throw it
    if (error.message.includes('مفتاح') || error.message.includes('تجاوز')) {
      throw error;
    }
    
    throw new Error(`خطأ في الاتصال بـ Gemini: ${error.message}`);
  }
}

// ===== الدالة الموحدة الرئيسية =====
export const callUnifiedAPI = async (
  messages: ChatMessage[],
  expert: Expert,
  attachments: ChatAttachment[] = []
): Promise<AIResponse> => {
  
  // Get the last user message for cache key
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMessage) {
    throw new Error('لا توجد رسالة من المستخدم');
  }

  // 1. Check cache first
  const cached = responseCache.get(expert.id, lastUserMessage.content);
  if (cached) {
    console.log('🎯 Cache Hit - Zero Cost!');
    
    const cachedResponse: AIResponse = {
      content: cached.response,
      modelUsed: 'cached',
      cost: 0, // No cost for cached responses
      tokensUsed: { input: 0, output: 0 },
      provider: expert.apiProvider,
      cached: true
    };
    
    usageTracker.trackCall(cachedResponse);
    return cachedResponse;
  }

  // 2. Make API call
  let response: AIResponse;

  try {
    if (expert.apiProvider === 'claude') {
      response = await callClaude(messages, expert, attachments);
    } else if (expert.apiProvider === 'gemini') {
      response = await callGemini(messages, expert, attachments);
    } else {
      throw new Error(`مزود API غير معروف: ${expert.apiProvider}`);
    }

    // 3. Cache the response
    responseCache.set(expert.id, lastUserMessage.content, response.content, response.cost);

    // 4. Track usage
    usageTracker.trackCall(response);

    return response;

  } catch (error: any) {
    console.error('❌ API Error:', error);
    throw error;
  }
};

// ===== دالة تقدير التكلفة =====
export const estimateCost = (
  expert: Expert,
  questionLength: number,
  expectedResponseLength: number = 400
): { model: string; estimatedCost: number; provider: string } => {
  
  const modelConfig = MODEL_COSTS[expert.recommendedModel as keyof typeof MODEL_COSTS];
  
  if (!modelConfig) {
    return {
      model: expert.recommendedModel,
      estimatedCost: 0,
      provider: expert.apiProvider
    };
  }

  // Rough token estimation (1 token ≈ 0.75 Arabic words)
  const inputTokens = Math.ceil((questionLength + expert.systemInstruction.length) / 0.75);
  const outputTokens = Math.ceil(expectedResponseLength / 0.75);
  
  const inputCost = (inputTokens / 1_000_000) * modelConfig.input;
  const outputCost = (outputTokens / 1_000_000) * modelConfig.output;
  
  return {
    model: expert.recommendedModel,
    estimatedCost: inputCost + outputCost,
    provider: expert.apiProvider
  };
};

// ===== تصدير معلومات الكاش =====
export const getCacheStats = () => responseCache.getStats();

// ===== مسح الكاش يدوياً =====
export const clearCache = () => {
  localStorage.removeItem('ai_response_cache');
  console.log('🧹 Cache cleared manually');
};
