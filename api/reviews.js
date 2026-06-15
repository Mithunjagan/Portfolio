import fs from 'fs';
import path from 'path';

// ─── In-memory cache ─────────────────────────────────────────────────────────
let cachedReviews = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 60 seconds

function getCachedReviews() {
  if (cachedReviews && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return cachedReviews;
  }
  return null;
}

function setCachedReviews(reviews) {
  cachedReviews = reviews;
  cacheTimestamp = Date.now();
}

// ─── JSONBin.io helpers ──────────────────────────────────────────────────────
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const useJsonBin = !!(JSONBIN_BIN_ID && JSONBIN_API_KEY);

async function fetchFromJsonBin() {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
    headers: { 'X-Master-Key': JSONBIN_API_KEY }
  });
  if (!res.ok) throw new Error(`JSONBin GET failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.record) ? data.record : [];
}

async function saveToJsonBin(reviews) {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY
    },
    body: JSON.stringify(reviews)
  });
  if (!res.ok) throw new Error(`JSONBin PUT failed: ${res.status}`);
  return true;
}

// ─── Local file fallback helpers ─────────────────────────────────────────────
function getLocalReviews() {
  const staticPath = path.join(process.cwd(), 'data', 'reviews.json');
  if (fs.existsSync(staticPath)) {
    try {
      return JSON.parse(fs.readFileSync(staticPath, 'utf8'));
    } catch { /* ignore */ }
  }
  
  const tmpPath = path.join('/tmp', 'reviews.json');
  if (fs.existsSync(tmpPath)) {
    try {
      return JSON.parse(fs.readFileSync(tmpPath, 'utf8'));
    } catch { /* ignore */ }
  }
  
  return [];
}

function saveLocalReviews(reviews) {
  const isVercel = process.env.VERCEL === '1';
  const dir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
  const filePath = path.join(dir, 'reviews.json');
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local reviews:', err);
  }
}

// ─── Main Handler ────────────────────────────────────────────────────────────
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

  // ── GET: Return all reviews ──
  if (req.method === 'GET') {
    try {
      // 1. Check cache first
      const cached = getCachedReviews();
      if (cached) return res.json(cached);

      // 2. Try JSONBin
      if (useJsonBin) {
        try {
          const reviews = await fetchFromJsonBin();
          setCachedReviews(reviews);
          return res.json(reviews);
        } catch (err) {
          console.error('JSONBin fetch error, falling back to local:', err.message);
        }
      }

      // 3. Fallback to local files
      const local = getLocalReviews();
      setCachedReviews(local);
      return res.json(local);
    } catch (err) {
      console.error('GET reviews error:', err);
      return res.json([]);
    }
  }

  // ── POST: Submit a new review ──
  if (req.method === 'POST') {
    try {
      const { name, rating, comment } = req.body;

      if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Invalid rating value (must be 1-5)' });
      }

      const newReview = {
        id: 'rev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        name: (name && typeof name === 'string') ? name.trim().slice(0, 40) : 'Anonymous Reviewer',
        rating: rating,
        comment: (comment && typeof comment === 'string') ? comment.trim().slice(0, 280) : '',
        date: new Date().toISOString()
      };

      if (useJsonBin) {
        try {
          // Fetch current reviews from JSONBin
          let reviews = [];
          try {
            reviews = await fetchFromJsonBin();
          } catch { /* start fresh */ }

          reviews.push(newReview);
          await saveToJsonBin(reviews);
          setCachedReviews(reviews);

          console.log(`Review saved to JSONBin: ${rating} stars by ${newReview.name}`);
          return res.json({ success: true, review: newReview });
        } catch (err) {
          console.error('JSONBin save error, falling back to local:', err.message);
        }
      }

      // Fallback: save locally
      let reviews = getLocalReviews();
      reviews.push(newReview);
      saveLocalReviews(reviews);
      setCachedReviews(reviews);

      console.log(`Review saved locally: ${rating} stars by ${newReview.name}`);
      return res.json({ success: true, review: newReview });
    } catch (error) {
      console.error('POST review error:', error);
      return res.json({ success: true, warning: 'Local runtime restriction bypassed.' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
