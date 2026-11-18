export function getChatProvider(referer) {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    return {
      name: 'Gemini',
      headers: { 'x-goog-api-key': geminiKey },
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

function geminiPayload(messages) {
  const [system, ...turns] = messages;
  const contents = [];
  for (const turn of turns) {
    const role = turn.role === 'assistant' ? 'model' : 'user';
    const previous = contents.at(-1);
    // The widget includes a welcome message before the first user turn.
    if (!previous && role === 'model') continue;
    const part = { text: turn.content };
    if (previous?.role === role) {
      previous.parts.push(part);
    } else {
      contents.push({ role, parts: [part] });
    }
  }
  return {
    systemInstruction: { parts: [{ text: system.content }] },
    contents,
    generationConfig: { temperature: 0.3 }
  };
}

function geminiFailure(status, data) {
  const invalidKey = Array.isArray(data?.error?.details) &&
    data.error.details.some(detail => detail?.reason === 'API_KEY_INVALID');
  if (status === 401 || status === 403 || invalidKey) {
    return { status: 503, error: 'Gemini denied API access. Check the server API key and its permissions.' };
  }
  if (status === 429) {
    return { status: 429, error: 'Gemini reached its rate or quota limit. Please try again later.' };
  }
  if (status === 404) {
    return { status: 503, error: 'The configured Gemini model is unavailable for this project.' };
  }
  return { status: 502, error: 'Gemini could not answer this request. Please try again.' };
}

function geminiReply(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts
    .filter(part => part && !part.thought && typeof part.text === 'string')
    .map(part => part.text)
    .join('');
}

export async function requestChatReply(provider, messages) {
  const useGemini = provider.name === 'Gemini';
  for (const model of provider.models) {
    const url = useGemini
      ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.replace(/^models\//, ''))}:generateContent`
      : provider.url;
    const body = useGemini ? geminiPayload(messages) : { model, messages, temperature: 0.3 };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...provider.headers },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.warn(`${provider.name} model ${model} returned HTTP ${response.status}.`);
        if (useGemini) {
          const data = await response.json().catch(() => null);
          return geminiFailure(response.status, data);
        }
        continue;
      }

      const data = await response.json();
      const reply = useGemini ? geminiReply(data) : data?.choices?.[0]?.message?.content;
      if (typeof reply === 'string' && reply.trim()) {
        return { response: reply };
      }
      console.warn(`${provider.name} model ${model} returned an empty reply.`);
    } catch {
      console.warn(`${provider.name} model ${model} request failed.`);
    }
  }

  return useGemini
    ? geminiFailure()
    : { status: 500, error: 'The AI service is temporarily unavailable. Please try again in a few moments.' };
}
