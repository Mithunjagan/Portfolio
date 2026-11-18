export function getChatProvider(referer) {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    return {
      name: 'Gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      headers: { Authorization: `Bearer ${geminiKey}` },
      models: [process.env.GEMINI_MODEL?.trim() || 'gemini-3.1-flash-lite']
    };
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!openRouterKey || openRouterKey === 'your_openrouter_api_key_here') {
    return null;
  }

  return {
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    headers: {
      Authorization: `Bearer ${openRouterKey}`,
      'HTTP-Referer': referer,
      'X-Title': 'Mithun Portfolio Chatbot'
    },
    models: ['google/gemma-4-31b-it:free', 'liquid/lfm-2.5-1.2b-instruct:free']
  };
}

export async function requestChatReply(provider, messages) {
  for (const model of provider.models) {
    try {
      const response = await fetch(provider.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...provider.headers },
        body: JSON.stringify({ model, messages, temperature: 0.3 })
      });

      if (!response.ok) {
        console.warn(`${provider.name} model ${model} returned HTTP ${response.status}.`);
        continue;
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (typeof reply === 'string' && reply.trim()) {
        return reply;
      }
      console.warn(`${provider.name} model ${model} returned an empty reply.`);
    } catch {
      console.warn(`${provider.name} model ${model} request failed.`);
    }
  }

  return null;
}
