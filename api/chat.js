import { answerPortfolioQuestion, allowChatRequest } from "../lib/gemini.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { message, history } = req.body || {};
  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 2000 ||
    (history !== undefined && !Array.isArray(history))
  )
    return res
      .status(400)
      .json({ error: "Send a question between 1 and 2,000 characters." });
  // Vercel supplies the client header; local Express uses the socket address.
  const identity =
    process.env.VERCEL === "1"
      ? String(
          req.headers["x-forwarded-for"] ||
            req.socket?.remoteAddress ||
            "unknown",
        ).split(",")[0]
      : req.socket?.remoteAddress || "unknown";
  if (!allowChatRequest(identity)) {
    res.setHeader("Retry-After", "60");
    return res
      .status(429)
      .json({ error: "Too many questions. Please try again in a minute." });
  }
  try {
    const response = await answerPortfolioQuestion(
      { message: message.trim(), history },
      {
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      },
    );
    return res.json({ response });
  } catch (error) {
    return res
      .status(error.status || 502)
      .json({
        error: error.status
          ? error.message
          : "The assistant timed out or could not connect. Please try again.",
      });
  }
}
