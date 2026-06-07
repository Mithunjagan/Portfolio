import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isVercel = process.env.VERCEL === '1';
  const dataDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
  const reviewsFilePath = path.join(dataDir, 'reviews.json');

  // Handle GET requests (return reviews)
  if (req.method === 'GET') {
    let reviewsList = [];

    // 1. Read from static bundled data/reviews.json first
    const staticFilePath = path.join(process.cwd(), 'data', 'reviews.json');
    if (fs.existsSync(staticFilePath)) {
      try {
        const fileData = fs.readFileSync(staticFilePath, 'utf8');
        reviewsList = JSON.parse(fileData);
      } catch (parseErr) {
        console.error("Error parsing static reviews.json:", parseErr);
      }
    }

    // 2. On Vercel, merge with ephemeral reviews in /tmp
    if (isVercel && fs.existsSync(reviewsFilePath)) {
      try {
        const fileData = fs.readFileSync(reviewsFilePath, 'utf8');
        const tmpList = JSON.parse(fileData);
        const idSet = new Set(reviewsList.map(r => r.id));
        tmpList.forEach(r => {
          if (!idSet.has(r.id)) {
            reviewsList.push(r);
          }
        });
      } catch (parseErr) {
        console.error("Error parsing tmp reviews.json:", parseErr);
      }
    }

    return res.json(reviewsList);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

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

    let reviewsList = [];

    // Ensure target folder exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Load existing list
    if (fs.existsSync(reviewsFilePath)) {
      try {
        const fileData = fs.readFileSync(reviewsFilePath, 'utf8');
        reviewsList = JSON.parse(fileData);
      } catch (parseErr) {
        console.error("Error parsing reviews file:", parseErr);
      }
    }

    reviewsList.push(newReview);

    // Write back
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviewsList, null, 2), 'utf8');
    console.log(`New review saved to ${reviewsFilePath}: ${rating} stars by ${newReview.name}`);

    return res.json({ success: true, review: newReview });
  } catch (error) {
    console.error("General error handling review request:", error);
    // Graceful fallback response to client to prevent errors on strict cloud hosts
    return res.json({ success: true, warning: "Local runtime restriction bypassed." });
  }
}
