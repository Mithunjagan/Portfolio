import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import chatHandler from "./api/chat.js";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.all("/api/chat", chatHandler);
// Publish only browser assets; backend source and local data stay private.
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
for (const file of ["style.css", "script.js"])
  app.get("/" + file, (req, res) => res.sendFile(path.join(__dirname, file)));
app.get("/data/Resume.pdf", (req, res) =>
  res.sendFile(path.join(__dirname, "data/Resume.pdf")),
);

// GET route to fetch all reviews
app.get("/api/reviews", (req, res) => {
  try {
    const reviewsFilePath = path.join(__dirname, "data", "reviews.json");
    if (fs.existsSync(reviewsFilePath)) {
      const fileData = fs.readFileSync(reviewsFilePath, "utf8");
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
app.post("/api/reviews", async (req, res) => {
  try {
    const { name, rating, comment } = req.body;

    if (
      rating === undefined ||
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5
    ) {
      return res
        .status(400)
        .json({ error: "Invalid rating value (must be 1-5)" });
    }

    const newReview = {
      id: "rev-" + Date.now(),
      name:
        name && typeof name === "string"
          ? name.trim().slice(0, 40)
          : "Anonymous Reviewer",
      rating: rating,
      comment:
        comment && typeof comment === "string"
          ? comment.trim().slice(0, 280)
          : "",
      date: new Date().toISOString(),
    };

    const dataDir = path.join(__dirname, "data");
    const reviewsFilePath = path.join(dataDir, "reviews.json");
    let reviewsList = [];

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read existing reviews if file exists
    if (fs.existsSync(reviewsFilePath)) {
      try {
        const fileData = fs.readFileSync(reviewsFilePath, "utf8");
        reviewsList = JSON.parse(fileData);
      } catch (parseErr) {
        console.error("Error parsing reviews.json, starting fresh:", parseErr);
      }
    }

    reviewsList.push(newReview);

    // Write updated reviews back to file
    fs.writeFileSync(
      reviewsFilePath,
      JSON.stringify(reviewsList, null, 2),
      "utf8",
    );

    // Write updated reviews back to reviewsData.js script file for offline file:// support
    const reviewsDataPath = path.join(dataDir, "reviewsData.js");
    const reviewsDataContent = `window.portfolioReviews = ${JSON.stringify(reviewsList, null, 2)};\n`;
    fs.writeFileSync(reviewsDataPath, reviewsDataContent, "utf8");

    console.log(`New review saved: ${rating} stars by ${newReview.name}`);

    res.json({ success: true, review: newReview });
  } catch (error) {
    console.error("Error saving review:", error);
    res.status(500).json({ error: "Failed to save review on server." });
  }
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
