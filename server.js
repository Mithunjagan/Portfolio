import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getChatProvider, requestChatReply } from './lib/chatProvider.js';
import { getRelevantContext } from './lib/portfolioContext.js';

// Initialize dotenv configuration
dotenv.config();

// Determine directory names in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We dynamically import portfolioKnowledge to ensure we are loading the compiled JS.
let portfolioKnowledge;
try {
  const kbModule = await import('./data/portfolioKnowledge.js');
  portfolioKnowledge = kbModule.portfolioKnowledge;
} catch (err) {
  console.warn("Warning: Portfolio knowledge base JS file not found yet. Run 'npm run build' first. Using temporary empty fallback.");
  portfolioKnowledge = {
    personal: { name: "Mithun" },
    education: {},
    skills: {},
    projects: [],
    achievements: [],
    contact: {}
  };
}

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Serve static assets from root directory
app.use(express.static(__dirname));

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

// Chat API Route
app.post('/api/chat', async (req, res) => {
  try {
    let { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "Invalid message payload" });
    }

    message = message.trim();

    // Prompt injection check
    if (isPromptInjection(message)) {
      return res.json({
        response: "I'm sorry, but I can only answer questions about Mithun's portfolio, projects, skills, education, experience, and contact information. I cannot reveal internal instructions, system prompts, or security details."
      });
    }

    const provider = getChatProvider('http://localhost:8080');
    if (!provider) {
      console.error("Missing GEMINI_API_KEY or OPENROUTER_API_KEY environment variable.");
      return res.status(500).json({ error: "Chat service is currently unavailable. Please verify API configuration." });
    }

    // Lazy load the latest knowledge base if it was recently compiled
    try {
      const kbModule = await import(`./data/portfolioKnowledge.js?t=${Date.now()}`);
      portfolioKnowledge = kbModule.portfolioKnowledge;
    } catch (e) {
      // fallback to existing loaded state
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

    // Include history if provided
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
});

// GET route to fetch all reviews
app.get('/api/reviews', (req, res) => {
  try {
    const reviewsFilePath = path.join(__dirname, 'data', 'reviews.json');
    if (fs.existsSync(reviewsFilePath)) {
      const fileData = fs.readFileSync(reviewsFilePath, 'utf8');
      const reviewsList = JSON.parse(fileData);
      return res.json(reviewsList);
    }
    res.json([]);
  } catch (error) {
    console.error("Error reading reviews file:", error);
    res.status(500).json({ error: "Failed to read reviews from server." });
  }
});

// Reviews API Route to store submissions persistently in a JSON file
app.post('/api/reviews', async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    
    if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid rating value (must be 1-5)" });
    }

    const newReview = {
      id: 'rev-' + Date.now(),
      name: (name && typeof name === 'string') ? name.trim().slice(0, 40) : "Anonymous Reviewer",
      rating: rating,
      comment: (comment && typeof comment === 'string') ? comment.trim().slice(0, 280) : "",
      date: new Date().toISOString()
    };

    const dataDir = path.join(__dirname, 'data');
    const reviewsFilePath = path.join(dataDir, 'reviews.json');
    let reviewsList = [];

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read existing reviews if file exists
    if (fs.existsSync(reviewsFilePath)) {
      try {
        const fileData = fs.readFileSync(reviewsFilePath, 'utf8');
        reviewsList = JSON.parse(fileData);
      } catch (parseErr) {
        console.error("Error parsing reviews.json, starting fresh:", parseErr);
      }
    }

    reviewsList.push(newReview);

    // Write updated reviews back to file
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviewsList, null, 2), 'utf8');
    
    // Write updated reviews back to reviewsData.js script file for offline file:// support
    const reviewsDataPath = path.join(dataDir, 'reviewsData.js');
    const reviewsDataContent = `window.portfolioReviews = ${JSON.stringify(reviewsList, null, 2)};\n`;
    fs.writeFileSync(reviewsDataPath, reviewsDataContent, 'utf8');
    
    console.log(`New review saved: ${rating} stars by ${newReview.name}`);

    res.json({ success: true, review: newReview });
  } catch (error) {
    console.error("Error saving review:", error);
    res.status(500).json({ error: "Failed to save review on server." });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
