import React from 'react';
import { SiblingSummary } from '../../../types/aiGenePublicationTypes';

interface SiblingSummaryBannerProps {
  summary: SiblingSummary;
  onDismiss?: () => void;
}

/**
 * Returns a human-readable relative time string for a given ISO-8601 date
 * string, e.g. "3 days ago". Returns null when the date is invalid or the
 * string cannot be parsed.
 */
function relativeTimeFromIso(isoString: string): string | null {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null;

    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) return null; // future date — omit

    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 60) return 'just now';

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60)
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 52)
      return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
  } catch {
    return null;
  }
}

export function SiblingSummaryBanner({
  summary,
  onDismiss,
}: SiblingSummaryBannerProps) {
  const total = summary.reviewed + summary.edited;

  if (total === 0) return null;

  const relativeTime =
    summary.latestAt != null ? relativeTimeFromIso(summary.latestAt) : null;

  const bannerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#e8f4fd',
    border: '1px solid #90c8f0',
    borderRadius: '4px',
    padding: '10px 12px',
    marginBottom: '12px',
    fontSize: '13px',
    color: '#1a4a6e',
    lineHeight: '1.5',
    boxSizing: 'border-box',
  };

  const messageStyle: React.CSSProperties = {
    flex: 1,
  };

  const dismissButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#1a4a6e',
    fontSize: '16px',
    lineHeight: '1',
    padding: '0 0 0 8px',
    flexShrink: 0,
    alignSelf: 'flex-start',
    opacity: 0.7,
  };

  return (
    <div
      style={bannerStyle}
      role="note"
      aria-label="Sibling publication summary"
    >
      <span style={messageStyle}>
        <strong>Note:</strong> This gene + publication has already been
        published by {total} other user{total === 1 ? '' : 's'} (
        {summary.reviewed} as-is, {summary.edited} edited). You can still review
        and publish under your name.
        {relativeTime != null && <span> Most recent: {relativeTime}.</span>}
      </span>
      {onDismiss != null && (
        <button
          style={dismissButtonStyle}
          onClick={onDismiss}
          aria-label="Dismiss"
          title="Dismiss"
        >
          &times;
        </button>
      )}
    </div>
  );
}
