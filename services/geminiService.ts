import { GoogleGenAI } from "@google/genai";
import { ChatMessage, ChatAttachment } from "../types";

// دالة مساعدة للتأخير (محاكاة الكتابة الطبيعية)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// دالة للاتصال بـ DeepSeek API
async function* streamToDeepSeek(
  history: ChatMessage[],
  newMessage: string,
  systemInstruction: string
): AsyncGenerator<string, void, unknown> {
  const apiKey = import.meta.env.VITE_BACKUP_API_KEY;
  const apiUrl = import.meta.env.VITE_BACKUP_API_URL;

  const messages = [
    { role: "system", content: systemInstruction },
    ...history.map(msg => ({
      role: msg.role === "model" ? "assistant" : "user",
      content: msg.content
    })),
    { role: "user", content: newMessage }
  ];

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: messages,
      stream: false,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content || "";
  
  // محاكاة الكتابة البطيئة
  const words = text.split(' ');
  for (const word of words) {
    yield word + ' ';
    await delay(Math.random() * 50 + 30);
  }
}

// دالة للاتصال بـ Together AI API
async function* streamToTogetherAI(
  history: ChatMessage[],
  newMessage: string,
  systemInstruction: string
): AsyncGenerator<string, void, unknown> {
  const apiKey = import.meta.env.VITE_TOGETHER_API_KEY;
  const modelId = import.meta.env.VITE_TOGETHER_MODEL_ID || import.meta.env.VITE_TOGETHER_FALLBACK_MODEL;

  const messages = [
    { role: "system", content: systemInstruction },
    ...history.map(msg => ({
      role: msg.role === "model" ? "assistant" : "user",
      content: msg.content
    })),
    { role: "user", content: newMessage }
  ];

  const response = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages,
      stream: false,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Together AI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content || "";
  
  // محاكاة الكتابة البطيئة
  const words = text.split(' ');
  for (const word of words) {
    yield word + ' ';
    await delay(Math.random() * 50 + 30);
  }
}

export const streamMessageToGemini = async function* (
  history: ChatMessage[],
  newMessage: string,
  systemInstruction: string,
  attachment?: ChatAttachment
): AsyncGenerator<string, void, unknown> {
  // المحاولة 1: Gemini API (الأساسي)
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';

    const chatHistory = history.map(msg => {
      const parts: any[] = [{ text: msg.content }];
      
      if (msg.attachment) {
        const base64Data = msg.attachment.data.includes(',') 
          ? msg.attachment.data.split(',')[1] 
          : msg.attachment.data;

        parts.push({
          inlineData: {
            mimeType: msg.attachment.type,
            data: base64Data
          }
        });
      }
      
      return {
        role: msg.role,
        parts: parts,
      };
    });

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
      history: chatHistory,
    });

    let messageParts: any[] = [{ text: newMessage }];
    
    if (attachment) {
      const base64Data = attachment.data.includes(',') 
        ? attachment.data.split(',')[1] 
        : attachment.data;
        
      messageParts.push({
        inlineData: {
          mimeType: attachment.type,
          data: base64Data
        }
      });
    }

    const result = await chat.sendMessageStream({ message: messageParts });
    
    // محاكاة تفكير الخبير - كتابة بطيئة طبيعية
    for await (const chunk of result) {
      if (chunk.text) {
        // إرسال حرف بحرف أو كلمة بكلمة لمحاكاة التفكير
        const words = chunk.text.split(' ');
        for (const word of words) {
          yield word + ' ';
          // تأخير بين 30-80 ميلي ثانية لكل كلمة (سرعة كتابة طبيعية)
          await delay(Math.random() * 50 + 30);
        }
      }
    }

  } catch (geminiError) {
    console.warn("⚠️ Gemini API failed, trying DeepSeek backup...", geminiError);
    
    // المحاولة 2: DeepSeek API (احتياطي)
    try {
      // لا ندعم المرفقات في الـ backup APIs
      if (attachment) {
        yield "⚠️ ملاحظة: المرفقات غير مدعومة في الوضع الاحتياطي.\n\n";
      }
      
      yield* streamToDeepSeek(history, newMessage, systemInstruction);
      
    } catch (deepseekError) {
      console.warn("⚠️ DeepSeek API failed, trying Together AI backup...", deepseekError);
      
      // المحاولة 3: Together AI API (احتياطي ثانوي)
      try {
        yield* streamToTogetherAI(history, newMessage, systemInstruction);
        
      } catch (togetherError) {
        console.error("❌ All APIs failed:", togetherError);
        yield "عذراً، حدث خطأ في جميع الخدمات المتاحة. يرجى:\n\n";
        yield "1. التحقق من اتصالك بالإنترنت\n";
        yield "2. المحاولة مرة أخرى بعد قليل\n";
        yield "3. التواصل مع الدعم الفني إذا استمرت المشكلة";
      }
    }
  }
};