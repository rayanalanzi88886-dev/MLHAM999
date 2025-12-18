export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server API key missing' });
      return;
    }

    const {
      messages = [],
      systemInstruction = '',
      complexityLevel = 'medium',
      model = 'gpt-4o-mini'
    } = req.body || {};

    // Convert messages to OpenAI format
    const openaiMessages: any[] = [];
    
    // Add system instruction as first message if provided
    if (systemInstruction) {
      openaiMessages.push({
        role: 'system',
        content: systemInstruction
      });
    }

    // Add user messages
    openaiMessages.push(
      ...messages
        .filter((m: any) => m.role !== 'system')
        .map((m: any) => ({
          role: m.role === 'model' ? 'assistant' : m.role,
          content: m.content
        }))
    );

    const url = 'https://api.openai.com/v1/chat/completions';

    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: complexityLevel === 'simple' ? 800 : complexityLevel === 'medium' ? 1200 : 1600,
        top_p: 0.95
      })
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      const status = upstream.status;
      const message = data?.error?.message || data?.message || 'OpenAI upstream error';
      res.status(status).json({ error: message, details: data });
      return;
    }

    res.status(200).json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
