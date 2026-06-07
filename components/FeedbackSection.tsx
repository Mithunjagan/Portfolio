import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'portfolio_reviews';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateId(): string {
  return 'rev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

function loadReviews(): Review[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore corrupt data */ }
  return [];
}

function saveReviews(reviews: Review[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch { /* ignore quota errors */ }
}

// ─── Rating labels ───────────────────────────────────────────────────────────
const ratingLabels: Record<number, string> = {
  1: 'Terrible // Needs major revision',
  2: 'Subpar // Potential is there',
  3: 'Good // Decent execution',
  4: 'Great // Highly professional',
  5: 'Excellent // ECE Masterpiece!',
};

// ─── Injected Styles ─────────────────────────────────────────────────────────
const FEEDBACK_STYLES = `
.hud-panel {
  background: rgba(0, 210, 255, 0.02);
  border: 1px solid rgba(0, 212, 255, 0.12);
  border-radius: 16px;
  padding: 24px;
  margin: 0 auto 32px;
  max-width: 500px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.03);
}
.hud-label {
  font-family: 'Orbitron', 'Plus Jakarta Sans', sans-serif;
  color: #00d2ff;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.hud-value {
  font-family: 'Orbitron', 'Plus Jakarta Sans', sans-serif;
  color: #ffffff;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 210, 255, 0.4);
}
`;

// ─── Base URL Resolver for local file:// access ────────────────────────────────
const getApiUrl = (path: string): string => {
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return `http://localhost:8080${path}`;
  }
  return path;
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FeedbackSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Load on mount ──
  useEffect(() => {
    // 1. Check if reviews are statically loaded in window context (from reviewsData.js)
    const globalReviews = (window as any).portfolioReviews;
    if (Array.isArray(globalReviews) && globalReviews.length > 0) {
      setReviews(globalReviews);
      saveReviews(globalReviews);
    } else {
      // 2. Fallback to localStorage
      const local = loadReviews();
      if (local.length > 0) {
        setReviews(local);
      }
    }

    // 3. Fetch global reviews from server to sync latest updates
    fetch(getApiUrl('/api/reviews'))
      .then(res => {
        if (!res.ok) throw new Error(`Server returned status ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
          saveReviews(data);
          setLoadError(null);
        }
      })
      .catch(err => {
        console.error('Error syncing reviews with backend:', err);
        // Only set load error if we have no reviews loaded statically or from cache
        setReviews(prev => {
          if (prev.length === 0) {
            setLoadError(err.message || 'Connection failed');
          }
          return prev;
        });
      });
  }, []);

  // ── Persist on change ──
  useEffect(() => {
    if (reviews.length > 0) {
      saveReviews(reviews);
    }
  }, [reviews]);

  // ── Submit handler ──
  const handleSubmit = useCallback(() => {
    if (rating === 0) return;

    const newReview: Review = {
      id: generateId(),
      name: name.trim() || 'Anonymous',
      rating,
      comment: comment.trim() || 'No comment.',
      date: new Date().toISOString(),
    };

    setReviews(prev => [...prev, newReview]);

    // Also send to backend
    fetch(getApiUrl('/api/reviews'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        rating,
        comment: comment.trim(),
      }),
    }).catch(err => console.error('Network error sending review:', err));

    // Reset form
    setName('');
    setComment('');
    setRating(0);
    setHoverRating(0);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  }, [rating, name, comment]);

  // ─── Metrics Calculations ──────────────────────────────────────────────────
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;
  const approvalPercent = (averageRating / 5) * 100;

  const activeRating = hoverRating || rating;

  return (
    <>
      <style>{FEEDBACK_STYLES}</style>

      <section
        id="review-section"
        className="review-section py-20 px-6 lg:px-16 max-w-3xl mx-auto w-full z-20 relative border-t border-brand-border/30"
        style={{ position: 'relative' }}
      >
        {/* ── Header ── */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '36px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div
            className="section-tag font-tech"
            style={{
              color: '#00d2ff',
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            [ FEEDBACK_TERMINAL ]
          </div>
          <h2
            className="font-tech"
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            Rate This <span style={{ color: '#00d2ff' }}>Portfolio</span>
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '14px',
              marginTop: '12px',
              maxWidth: '400px',
              margin: '12px auto 0',
            }}
          >
            Your feedback fuels improvement. Drop a rating and let me know what
            you think.
          </p>
        </div>

        {/* ── Sci-Fi Diagnostics HUD Panel ── */}
        {loadError && (
          <div className="hud-panel font-mono text-xs" style={{ borderColor: 'rgba(255, 68, 68, 0.3)', background: 'rgba(255, 68, 68, 0.02)', boxShadow: '0 0 15px rgba(255, 68, 68, 0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255, 68, 68, 0.15)', paddingBottom: '10px' }}>
              <span className="hud-label" style={{ color: '#ff4444' }}>[ TELEMETRY_OFFLINE ]</span>
              <span style={{ color: 'rgba(255, 68, 68, 0.65)', marginLeft: 'auto', fontSize: '10px' }}>STATUS: OFFLINE // CONNECT_REFUSED</span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '11px', lineHeight: '1.5', margin: 0 }}>
              Failed to connect to reviews database. If viewing locally, please launch the site via <strong style={{ color: '#00d2ff' }}>http://localhost:8080</strong> instead of direct file access, and verify the backend dev server is running.
            </p>
          </div>
        )}

        {totalReviews > 0 && (
          <div className="hud-panel font-mono text-xs">
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(0, 212, 255, 0.08)', paddingBottom: '10px' }}>
              <span className="hud-label">[ RATING_TELEMETRY ]</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 'auto', fontSize: '10px' }}>STATUS: ACTIVE // RESPONSES_COMMITTED</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
              {/* Large Digital Rating */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="hud-label" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>AVG_SCORE</span>
                <span className="hud-value" style={{ fontSize: '38px', lineHeight: '1' }}>
                  {averageRating.toFixed(2)}
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}> / 5.00</span>
                </span>
              </div>

              {/* Stats Splitter */}
              <div style={{ width: '1px', height: '40px', background: 'rgba(0, 212, 255, 0.15)' }} />

              {/* Review Count & Approval */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>LOGGED TRANSMISSIONS:</span>
                  <span className="hud-value">{totalReviews}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>APPROVAL INDEX:</span>
                  <span className="hud-value" style={{ color: '#00d2ff' }}>{approvalPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Glowing Progress bar indicator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
                <span>0.00</span>
                <span>METRIC METER</span>
                <span>5.00</span>
              </div>
              <div
                style={{
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 212, 255, 0.15)',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #0055ff, #00d2ff)',
                    boxShadow: '0 0 8px #00d2ff',
                    width: `${approvalPercent}%`,
                    transition: 'width 0.6s cubic-bezier(0.1, 0.8, 0.2, 1)',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Form Card ── */}
        <div
          className="review-form-card spec-card"
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '500px',
            margin: '0 auto',
            padding: '32px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
          }}
        >
          {/* Stars */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '10px',
                fontFamily: "'Courier New', monospace",
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '16px',
              }}
            >
              Select Your Rating
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= activeRating;
                return (
                  <button
                    key={star}
                    type="button"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: active
                        ? '#00d2ff'
                        : 'rgba(255,255,255,0.15)',
                      fill: active
                        ? 'rgba(0,210,255,0.45)'
                        : 'transparent',
                      filter: active
                        ? 'drop-shadow(0 0 8px rgba(0,210,255,0.5))'
                        : 'none',
                      transition: 'color 0.2s, fill 0.2s, filter 0.2s',
                      width: '40px',
                      height: '40px',
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="100%"
                      height="100%"
                      fill={
                        active ? 'rgba(0,210,255,0.45)' : 'transparent'
                      }
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
            <div
              style={{
                height: '16px',
                marginTop: '8px',
                fontSize: '11px',
                fontFamily: "'Courier New', monospace",
                color: activeRating
                  ? 'rgba(255,255,255,0.7)'
                  : 'transparent',
              }}
            >
              {ratingLabels[activeRating] || ''}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Your name (optional)"
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '20px' }}>
            <textarea
              placeholder="Share your thoughts... (optional)"
              maxLength={280}
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                color: '#ffffff',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
            <div
              style={{
                textAlign: 'right',
                fontSize: '10px',
                fontFamily: "'Courier New', monospace",
                color:
                  comment.length >= 270
                    ? '#ff3366'
                    : 'rgba(255,255,255,0.4)',
                marginTop: '4px',
              }}
            >
              {comment.length}/280
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            disabled={rating === 0}
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              fontFamily: "'Courier New', monospace",
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              border: '1px solid',
              cursor: rating === 0 ? 'not-allowed' : 'pointer',
              background:
                rating === 0
                  ? 'rgba(255,255,255,0.02)'
                  : 'rgba(0,210,255,0.1)',
              borderColor:
                rating === 0
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,210,255,0.3)',
              color:
                rating === 0
                  ? 'rgba(255,255,255,0.3)'
                  : '#00d2ff',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              if (rating > 0) {
                e.currentTarget.style.background = 'rgba(0,210,255,0.2)';
                e.currentTarget.style.boxShadow =
                  '0 0 25px rgba(0,210,255,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (rating > 0) {
                e.currentTarget.style.background = 'rgba(0,210,255,0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            Submit Review
          </button>

          {/* Success Toast */}
          {submitted && (
            <div
              style={{
                position: 'absolute',
                bottom: '-60px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(10,10,10,0.95)',
                border: '1px solid rgba(0,210,255,0.3)',
                padding: '12px 24px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12px',
                color: '#ffffff',
                pointerEvents: 'none',
                backdropFilter: 'blur(12px)',
                whiteSpace: 'nowrap',
                zIndex: 50,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Review submitted! Thank you 🌌
            </div>
          )}
        </div>

        {/* ── Empty State ── */}
        {reviews.length === 0 && (
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.3)',
              fontSize: '13px',
              fontFamily: "'Courier New', monospace",
              marginTop: '32px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            Be the first to submit a review 🌌
          </p>
        )}
      </section>
    </>
  );
}

// ─── Self-mounting ───────────────────────────────────────────────────────────
function mount() {
  const mountPoint = document.getElementById('review-section-mount');
  if (mountPoint) {
    const root = createRoot(mountPoint);
    root.render(<FeedbackSection />);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
