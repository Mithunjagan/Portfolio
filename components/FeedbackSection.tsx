import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  return `${months}mo ago`;
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
.reviews-hud-panel {
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
.review-form-card.animating-out {
  animation: liquidGasDissolve 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  pointer-events: none !important;
}
.laser-scan-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00d2ff, transparent);
  box-shadow: 0 0 10px #00d2ff, 0 0 20px #00d2ff, 0 0 35px #00d2ff;
  z-index: 100;
  animation: laserSweep 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes laserSweep {
  0% { top: -5%; }
  100% { top: 105%; }
}
@keyframes liquidGasDissolve {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0px) brightness(1);
  }
  20% {
    filter: blur(2px) brightness(1.5);
    box-shadow: 0 0 30px rgba(0, 210, 255, 0.4);
    border-color: rgba(0, 210, 255, 0.5);
  }
  60% {
    filter: blur(6px) brightness(1.8);
    box-shadow: 0 0 50px rgba(0, 210, 255, 0.6);
  }
  100% {
    opacity: 0;
    transform: scale(0.92) translateY(-20px);
    filter: blur(25px) brightness(0);
    height: 0;
    padding: 0;
    margin: 0;
    border: 0;
    overflow: hidden;
  }
}
@keyframes telemetryPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes distBarGrow {
  from { width: 0%; }
}
@keyframes reviewCardIn {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.97);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
@keyframes countUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(0, 210, 255, 0.15); }
  50% { box-shadow: 0 0 20px rgba(0, 210, 255, 0.3); }
}
`;

// ─── Base URL Resolver for local file:// access ────────────────────────────────
const getApiUrl = (path: string): string => {
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return `http://localhost:8080${path}`;
  }
  return path;
};

// ─── Rating Distribution Component ──────────────────────────────────────────
function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 stars
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    });
    const max = Math.max(...counts, 1);
    return counts.map((count, i) => ({
      stars: i + 1,
      count,
      percent: (count / max) * 100,
      totalPercent: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
    }));
  }, [reviews]);

  if (reviews.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ fontSize: '8px', fontFamily: "'Courier New', monospace", color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>
        Rating Distribution
      </div>
      {[...distribution].reverse().map(({ stars, count, percent, totalPercent }) => (
        <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontFamily: "'Courier New', monospace", color: 'rgba(255,255,255,0.5)', width: '22px', textAlign: 'right' }}>
            {stars}★
          </span>
          <div style={{
            flex: 1,
            height: '8px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid rgba(0, 212, 255, 0.08)',
          }}>
            <div style={{
              height: '100%',
              width: `${percent}%`,
              background: stars >= 4
                ? 'linear-gradient(90deg, #0055ff, #00d2ff)'
                : stars === 3
                  ? 'linear-gradient(90deg, #ff9900, #ffcc00)'
                  : 'linear-gradient(90deg, #ff3366, #ff6644)',
              boxShadow: stars >= 4
                ? '0 0 6px rgba(0, 210, 255, 0.4)'
                : stars === 3
                  ? '0 0 6px rgba(255, 204, 0, 0.3)'
                  : '0 0 6px rgba(255, 51, 102, 0.3)',
              borderRadius: '4px',
              transition: 'width 0.8s cubic-bezier(0.1, 0.8, 0.2, 1)',
              animation: 'distBarGrow 1s cubic-bezier(0.1, 0.8, 0.2, 1)',
            }} />
          </div>
          <span style={{
            fontSize: '10px',
            fontFamily: "'Courier New', monospace",
            color: 'rgba(255,255,255,0.4)',
            width: '40px',
            textAlign: 'right',
          }}>
            {count} <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)' }}>({totalPercent.toFixed(0)}%)</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Sentiment Indicator Component ──────────────────────────────────────────
function SentimentIndicator({ averageRating }: { averageRating: number }) {
  const getSentiment = (avg: number) => {
    if (avg >= 4.5) return { label: 'EXCEPTIONAL', color: '#00d2ff', glow: 'rgba(0, 210, 255, 0.4)', icon: '◆' };
    if (avg >= 3.5) return { label: 'POSITIVE', color: '#00cc88', glow: 'rgba(0, 204, 136, 0.4)', icon: '▲' };
    if (avg >= 2.5) return { label: 'NEUTRAL', color: '#ffcc00', glow: 'rgba(255, 204, 0, 0.4)', icon: '●' };
    if (avg >= 1.5) return { label: 'MIXED', color: '#ff9900', glow: 'rgba(255, 153, 0, 0.4)', icon: '▼' };
    return { label: 'CRITICAL', color: '#ff3366', glow: 'rgba(255, 51, 102, 0.4)', icon: '✕' };
  };

  const sentiment = getSentiment(averageRating);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '8px',
      border: `1px solid ${sentiment.color}33`,
    }}>
      <span style={{
        color: sentiment.color,
        fontSize: '14px',
        textShadow: `0 0 8px ${sentiment.glow}`,
        lineHeight: 1,
      }}>
        {sentiment.icon}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <span style={{ fontSize: '8px', fontFamily: "'Courier New', monospace", color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Sentiment
        </span>
        <span style={{
          fontSize: '11px',
          fontFamily: "'Orbitron', 'Courier New', monospace",
          color: sentiment.color,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textShadow: `0 0 6px ${sentiment.glow}`,
        }}>
          {sentiment.label}
        </span>
      </div>
    </div>
  );
}

// ─── Review Card Component ──────────────────────────────────────────────────
function ReviewCard({ review, index }: { review: Review; index: number }) {
  const starColor = (r: number) => {
    if (r >= 4) return '#00d2ff';
    if (r === 3) return '#ffcc00';
    return '#ff6644';
  };

  return (
    <div
      className="review-card"
      style={{
        animation: `reviewCardIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.08}s both`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Avatar circle */}
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${starColor(review.rating)}33, ${starColor(review.rating)}11)`,
            border: `1px solid ${starColor(review.rating)}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: starColor(review.rating),
            fontFamily: "'Orbitron', monospace",
            textShadow: `0 0 6px ${starColor(review.rating)}66`,
            flexShrink: 0,
          }}>
            {review.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#ffffff',
              lineHeight: 1.2,
            }}>
              {review.name}
            </div>
            <div style={{
              fontSize: '9px',
              fontFamily: "'Courier New', monospace",
              color: 'rgba(255,255,255,0.3)',
              marginTop: '2px',
            }}>
              {relativeTime(review.date)}
            </div>
          </div>
        </div>
        {/* Star rating */}
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          {[1, 2, 3, 4, 5].map(s => (
            <svg key={s} width="12" height="12" viewBox="0 0 24 24"
              fill={s <= review.rating ? starColor(review.rating) : 'transparent'}
              stroke={s <= review.rating ? starColor(review.rating) : 'rgba(255,255,255,0.15)'}
              strokeWidth="1.5"
              style={{
                filter: s <= review.rating ? `drop-shadow(0 0 3px ${starColor(review.rating)}66)` : 'none',
              }}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          ))}
        </div>
      </div>
      {review.comment && (
        <p style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.65)',
          lineHeight: 1.6,
          margin: 0,
          fontStyle: 'italic',
        }}>
          "{review.comment}"
        </p>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FeedbackSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Enforce one submission per terminal session/device
  const [hasSubmitted, setHasSubmitted] = useState(() => {
    try {
      return localStorage.getItem('portfolio_review_submitted') === 'true';
    } catch {
      return false;
    }
  });
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

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
    saveReviews(reviews);
    if (reviews.length === 0) {
      try {
        localStorage.removeItem('portfolio_review_submitted');
      } catch {}
      setHasSubmitted(false);
    }
  }, [reviews]);

  // ── Refresh ScrollTrigger on layout changes ──
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ScrollTrigger) {
      setTimeout(() => {
        (window as any).ScrollTrigger.refresh();
      }, 100);
    }
  }, [reviews, hasSubmitted, submitted, isAnimatingOut]);

  // ── Submit handler ──
  const handleSubmit = useCallback(() => {
    if (rating === 0 || hasSubmitted || isAnimatingOut) return;

    const newReview: Review = {
      id: generateId(),
      name: name.trim() || 'Anonymous',
      rating,
      comment: comment.trim() || 'No comment.',
      date: new Date().toISOString(),
    };

    // Trigger laser liquid gas out animation
    setIsAnimatingOut(true);

    // Send to backend
    fetch(getApiUrl('/api/reviews'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        rating,
        comment: comment.trim(),
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('API post failed');
        return res.json();
      })
      .then(() => {
        // Sync with backend immediately to get updated list
        return fetch(getApiUrl('/api/reviews'));
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReviews(data);
          saveReviews(data);
        }
      })
      .catch(err => {
        console.error('Network error sending/syncing review:', err);
        // Fallback: manually update client-side state if network request failed
        setReviews(prev => {
          const exists = prev.some(r => r.id === newReview.id || (r.name === newReview.name && r.comment === newReview.comment && r.rating === newReview.rating));
          if (!exists) {
            return [...prev, newReview];
          }
          return prev;
        });
      });

    // Reset and complete animation
    setTimeout(() => {
      setName('');
      setComment('');
      setRating(0);
      setHoverRating(0);
      setSubmitted(true);
      setHasSubmitted(true);
      try {
        localStorage.setItem('portfolio_review_submitted', 'true');
      } catch {}
      setIsAnimatingOut(false);
    }, 1200); // matches the 1.2s animation duration
  }, [rating, name, comment, hasSubmitted, isAnimatingOut]);

  // ─── Metrics Calculations ──────────────────────────────────────────────────
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;
  const approvalPercent = (averageRating / 5) * 100;

  const activeRating = hoverRating || rating;

  // Sort reviews: newest first
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reviews]);

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

        {/* ── Error Panel ── */}
        {loadError && (
          <div className="reviews-hud-panel font-mono text-xs" style={{ borderColor: 'rgba(255, 68, 68, 0.3)', background: 'rgba(255, 68, 68, 0.02)', boxShadow: '0 0 15px rgba(255, 68, 68, 0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255, 68, 68, 0.15)', paddingBottom: '10px' }}>
              <span className="hud-label" style={{ color: '#ff4444' }}>[ TELEMETRY_OFFLINE ]</span>
              <span style={{ color: 'rgba(255, 68, 68, 0.65)', marginLeft: 'auto', fontSize: '10px' }}>STATUS: OFFLINE // CONNECT_REFUSED</span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '11px', lineHeight: '1.5', margin: 0 }}>
              Failed to connect to reviews database. If viewing locally, please launch the site via <strong style={{ color: '#00d2ff' }}>http://localhost:8080</strong> instead of direct file access, and verify the backend dev server is running.
            </p>
          </div>
        )}

        {/* ── Analytics Dashboard ── */}
        {totalReviews > 0 && (
          <div className="reviews-hud-panel font-mono text-xs" style={{ maxWidth: '540px', animation: 'glowPulse 4s ease-in-out infinite' }}>
            {/* Dashboard Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(0, 212, 255, 0.08)', paddingBottom: '10px' }}>
              <span className="hud-label">[ RATING_TELEMETRY ]</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>STATUS: ACTIVE // {totalReviews} RESPONSES</span>
            </div>

            {/* Top Row: Score + Sentiment + Count */}
            <div style={{ display: 'flex', alignItems: 'stretch', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {/* Large Digital Rating */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '8px', fontFamily: "'Courier New', monospace", color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>AVG_SCORE</span>
                <span className="hud-value" style={{ fontSize: '38px', lineHeight: '1', animation: 'countUp 0.6s ease-out' }}>
                  {averageRating.toFixed(2)}
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}> / 5.00</span>
                </span>
              </div>

              {/* Divider */}
              <div style={{ width: '1px', background: 'rgba(0, 212, 255, 0.12)' }} />

              {/* Sentiment + Count */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', flex: 1, minWidth: '140px' }}>
                <SentimentIndicator averageRating={averageRating} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>TOTAL REVIEWS:</span>
                  <span className="hud-value" style={{ color: '#00d2ff', fontSize: '12px' }}>{totalReviews}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>APPROVAL INDEX:</span>
                  <span className="hud-value" style={{ color: '#00d2ff', fontSize: '12px' }}>{approvalPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Approval Progress Bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
                <span>0.00</span>
                <span>METRIC METER</span>
                <span>5.00</span>
              </div>
              <div style={{
                height: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '3px',
                overflow: 'hidden',
                border: '1px solid rgba(0, 212, 255, 0.15)',
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #0055ff, #00d2ff)',
                  boxShadow: '0 0 8px #00d2ff',
                  width: `${approvalPercent}%`,
                  transition: 'width 0.6s cubic-bezier(0.1, 0.8, 0.2, 1)',
                }} />
              </div>
            </div>

            {/* Rating Distribution Chart */}
            <RatingDistribution reviews={reviews} />
          </div>
        )}

        {/* ── Form Card ── */}
        {(!hasSubmitted || isAnimatingOut) && (
          <div
            className={`review-form-card spec-card ${isAnimatingOut ? 'animating-out' : ''}`}
            style={{
              position: 'relative',
              zIndex: 10,
              maxWidth: '500px',
              margin: '0 auto',
              padding: '32px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {isAnimatingOut && <div className="laser-scan-line" />}
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

            {/* One-per-user notice */}
            <div style={{
              textAlign: 'center',
              marginTop: '12px',
              fontSize: '9px',
              fontFamily: "'Courier New', monospace",
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.1em',
            }}>
              ⚡ ONE SUBMISSION PER TERMINAL
            </div>
          </div>
        )}

        {/* ── Success/Committed HUD Panel ── */}
        {hasSubmitted && !isAnimatingOut && (
          <div
            className="reviews-hud-panel font-mono text-xs"
            style={{
              borderColor: 'rgba(0, 212, 255, 0.2)',
              background: 'rgba(0, 212, 255, 0.01)',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.05)',
              textAlign: 'center',
              padding: '32px',
              maxWidth: '500px',
              margin: '0 auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 8px #00d2ff)', animation: 'telemetryPulse 2s infinite' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ color: '#00d2ff', fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.15em', marginBottom: '8px' }}>
              [ TRANSMISSION_COMMITTED ]
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.6', margin: 0 }}>
              Your feedback has been securely registered. Only one review transmission is permitted per terminal. Thank you for scanning the portfolio!
            </p>
          </div>
        )}

        {/* ── Reviews Feed ── */}
        {sortedReviews.length > 0 && (
          <div style={{ marginTop: '36px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <div style={{
                fontSize: '10px',
                fontFamily: "'Courier New', monospace",
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}>
                ◈ Transmission Log ({totalReviews})
              </div>
              <div style={{
                fontSize: '9px',
                fontFamily: "'Courier New', monospace",
                color: 'rgba(0, 210, 255, 0.4)',
                letterSpacing: '0.1em',
              }}>
                NEWEST FIRST
              </div>
            </div>
            <div className="reviews-feed" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sortedReviews.map((review, index) => (
                <ReviewCard key={review.id} review={review} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* ── Empty State ── */}
        {reviews.length === 0 && !loadError && (
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
