import { portfolioKnowledge } from '../data/portfolioKnowledge.js';

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

// Lightweight retrieval logic
function getRelevantContext(query) {
  const q = query.toLowerCase();
  let contextParts = [];

  // Personal Info
  if (q.includes("mithun") || q.includes("who is") || q.includes("about") || q.includes("bio") || q.includes("background") || q.includes("interest") || q.includes("profile") || q.includes("personal") || q.includes("hello") || q.includes("hi")) {
    contextParts.push(`Personal Info:\n${JSON.stringify(portfolioKnowledge.personal, null, 2)}`);
  }

  // Education
  if (q.includes("education") || q.includes("degree") || q.includes("college") || q.includes("university") || q.includes("study") || q.includes("studied") || q.includes("student") || q.includes("course") || q.includes("major")) {
    contextParts.push(`Education:\n${JSON.stringify(portfolioKnowledge.education, null, 2)}`);
  }

  // Skills
  if (q.includes("skills") || q.includes("skill") || q.includes("technologies") || q.includes("languages") || q.includes("programming") || q.includes("tools") || q.includes("stack") || q.includes("altium") || q.includes("kicad") || q.includes("stm32") || q.includes("opencv") || q.includes("pytorch") || q.includes("c++") || q.includes("assembly") || q.includes("rtos") || q.includes("embedded")) {
    contextParts.push(`Skills:\n${JSON.stringify(portfolioKnowledge.skills, null, 2)}`);
  }

  // Projects
  if (q.includes("projects") || q.includes("project") || q.includes("build") || q.includes("built") || q.includes("develop") || q.includes("ship spy") || q.includes("shipspy") || q.includes("surveillance") || q.includes("robotic arm") || q.includes("gesture") || q.includes("kernel") || q.includes("real-time") || q.includes("os")) {
    if (q.includes("ship spy") || q.includes("shipspy")) {
      const shipSpy = portfolioKnowledge.projects.find(p => p.id === "ship-spy-live");
      contextParts.push(`Project Details (Ship Spy Live):\n${JSON.stringify(shipSpy, null, 2)}`);
    } else if (q.includes("kernel") || q.includes("rtos") || q.includes("real-time")) {
      const rtos = portfolioKnowledge.projects.find(p => p.id === "embedded-rtos-kernel");
      contextParts.push(`Project Details (Embedded RTOS Kernel):\n${JSON.stringify(rtos, null, 2)}`);
    } else if (q.includes("gesture") || q.includes("robotic") || q.includes("arm")) {
      const arm = portfolioKnowledge.projects.find(p => p.id === "gesture-robotic-arm");
      contextParts.push(`Project Details (Gesture-Controlled Robotic Arm):\n${JSON.stringify(arm, null, 2)}`);
    } else {
      contextParts.push(`Projects:\n${JSON.stringify(portfolioKnowledge.projects, null, 2)}`);
    }
  }

  // Achievements
  if (q.includes("achievements") || q.includes("achievement") || q.includes("hackathon") || q.includes("first place") || q.includes("certificate") || q.includes("certification") || q.includes("awards") || q.includes("award") || q.includes("won")) {
    contextParts.push(`Achievements:\n${JSON.stringify(portfolioKnowledge.achievements, null, 2)}`);
  }

  // Contact
  if (q.includes("contact") || q.includes("email") || q.includes("github") || q.includes("linkedin") || q.includes("hire") || q.includes("reach") || q.includes("message") || q.includes("find") || q.includes("locate") || q.includes("social")) {
    contextParts.push(`Contact Info:\n${JSON.stringify(portfolioKnowledge.contact, null, 2)}`);
  }

  if (contextParts.length === 0) {
    contextParts.push(`Personal Info:\n${JSON.stringify(portfolioKnowledge.personal, null, 2)}`);
    contextParts.push(`Available categories to query: Personal Info, Education, Skills (Hardware/Software/Tools), Projects (Ship Spy Live, Embedded RTOS Kernel, Gesture-Controlled Robotic Arm), Achievements (Hackathon win, ARM specialist certification), Contact Details.`);
  }

  return contextParts.join("\n\n");
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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
      console.error("Missing or placeholder OPENROUTER_API_KEY environment variable.");
      return res.status(500).json({ error: "Chat service is currently unavailable. Please verify API configuration." });
    }

    // 1. Load context
    const relevantContext = getRelevantContext(message);

    // 2. Build system prompt
    const systemPrompt = `You are Mithun's AI assistant.

Your job is to answer questions about Mithun, his projects, and his fields of expertise (Embedded Systems, ARM Architecture, AI, Computer Vision, and general engineering topics) using the provided portfolio context and your technical knowledge.

About Mithun:

* Electronics and Communication Engineering student.
* Interested in Embedded Systems.
* Interested in ARM Architecture.
* Interested in AI.
* Interested in Computer Vision.
* Interested in Electronics Design.
* Builds engineering projects.

Rules:

1. Answer as Mithun's portfolio assistant.
2. Never invent projects.
3. Never invent achievements.
4. Never invent internships.
5. Never invent certifications.
6. If the question is specifically about Mithun's personal details (such as his specific projects, achievements, certificates, or internships) and the information is not in the portfolio, say:
   "I don't currently have that information in Mithun's portfolio."
7. Be concise. Do not include any source citations, references, headings, or structural notes (e.g., "Source: ...", "according to the context"). Answer directly.
8. Be professional.
9. Be technically accurate.
10. Prioritize portfolio data over model assumptions for Mithun's personal details. For general engineering, programming, or technical questions in his domains (Embedded Systems, ARM, AI, Computer Vision), answer using your broad knowledge to showcase Mithun's fields of expertise.

PROVIDED PORTFOLIO CONTEXT:
${relevantContext}`;

    // 3. Prepare messages payload for API
    const messages = [{ role: 'system', content: systemPrompt }];

    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      recentHistory.forEach(msg => {
        if (msg.role && msg.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    messages.push({ role: 'user', content: message });

    // 4. Try Primary Model
    const primaryModel = "google/gemma-4-31b-it:free";
    const fallbackModel = "liquid/lfm-2.5-1.2b-instruct:free";

    let responseText = "";
    let callSucceeded = false;

    console.log(`Sending query to primary model: ${primaryModel}`);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vercel.com",
          "X-Title": "Mithun Portfolio Chatbot"
        },
        body: JSON.stringify({
          model: primaryModel,
          messages: messages,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Primary model returned status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        responseText = data.choices[0].message.content;
        callSucceeded = true;
      } else {
        throw new Error("Invalid response format from primary model");
      }
    } catch (primaryErr) {
      console.warn(`Primary model failed: ${primaryErr.message}. Attempting fallback model: ${fallbackModel}`);
    }

    if (!callSucceeded) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://vercel.com",
            "X-Title": "Mithun Portfolio Chatbot (Fallback)"
          },
          body: JSON.stringify({
            model: fallbackModel,
            messages: messages,
            temperature: 0.3
          })
        });

        if (!response.ok) {
          throw new Error(`Fallback model returned status ${response.status}`);
        }

        const data = await response.json();
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
          responseText = data.choices[0].message.content;
          callSucceeded = true;
        } else {
          throw new Error("Invalid response format from fallback model");
        }
      } catch (fallbackErr) {
        console.error(`Fallback model also failed: ${fallbackErr.message}`);
        return res.status(500).json({ error: "The AI service is temporarily overloaded. Please try again in a few moments." });
      }
    }

    res.json({ response: responseText });

  } catch (error) {
    console.error("General error handling chat request:", error);
    res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
}
