import { portfolioKnowledge } from '../data/portfolioKnowledge.js';
import { getChatProvider, requestChatReply } from '../lib/chatProvider.js';
import { getRelevantContext } from '../lib/portfolioContext.js';

// Prompt injection detection helper
function isPromptInjection(query) {
  const q = query.toLowerCase();
  const suspiciousPatterns = [
    "ignore previous instructions",
    "ignore instructions",
    "reveal system prompt",
    "reveal your prompt",
    "show system prompt",
    "show your prompt",
    "hidden context",
    "show hidden context",
    "reveal hidden context",
    "show api key",
    "reveal api key",
    "override instructions",
    "override previous",
    "you are now a",
    "new instruction",
    "translate the system prompt",
    "tell me your instructions",
    "print your prompt"
  ];
  return suspiciousPatterns.some(pattern => q.includes(pattern));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    let { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "Invalid message payload" });
    }

    message = message.trim();

    if (isPromptInjection(message)) {
      return res.json({
        response: "I'm sorry, but I can only answer questions about Mithun's portfolio, projects, skills, education, experience, and contact information. I cannot reveal internal instructions, system prompts, or security details."
      });
    }

    const provider = getChatProvider('https://vercel.com');
    if (!provider) {
      console.error("Missing GEMINI_API_KEY or OPENROUTER_API_KEY environment variable.");
      return res.status(500).json({ error: "Chat service is currently unavailable. Please verify API configuration." });
    }

    // 1. Load context
    const relevantContext = getRelevantContext(message, portfolioKnowledge);

    // 2. Build system prompt
    const systemPrompt = `You are Mithun's AI assistant.

Your job is to answer questions about Mithun, his projects, and his fields of expertise (embedded systems, FPGA and digital design, RF simulation, and applied AI) using the provided portfolio context and your technical knowledge.

Mithun Kumar J is an Electronics and Communication Engineering undergraduate at VIT Chennai.

Rules:

1. Answer as Mithun's portfolio assistant.
2. Never invent projects.
3. Never invent achievements.
4. Never invent internships.
5. Never invent certifications.
6. If the question is specifically about Mithun's personal details (such as his specific projects, achievements, certificates, or internships) and the information is not in the portfolio, say:
   "I don't currently have that information in Mithun's portfolio."
7. Answer directly and concisely. If asked for a link, use the exact public URL provided in the portfolio context.
8. Be professional.
9. Be technically accurate.
10. Prioritize portfolio data over model assumptions for Mithun's personal details. For general engineering questions, use technical knowledge without attributing unsupported work to Mithun.

PROVIDED PORTFOLIO CONTEXT:
${relevantContext}`;

    // 3. Prepare messages payload for API
    const messages = [{ role: 'system', content: systemPrompt }];

    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      recentHistory.forEach(msg => {
        if ((msg?.role === 'user' || msg?.role === 'assistant') && typeof msg.content === 'string' && msg.content.trim()) {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    messages.push({ role: 'user', content: message });

    const { status = 200, ...payload } = await requestChatReply(provider, messages);
    return res.status(status).json(payload);

  } catch (error) {
    console.error("General error handling chat request:", error);
    res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
}
