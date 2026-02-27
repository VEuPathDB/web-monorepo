import { forwardRef, useCallback, useState } from 'react';
import './ScatterPlotAnnotationTooltip.css';

/** A single row of annotation data: variable display name + value */
export interface AnnotationRow {
  displayName: string;
  value: string;
}

interface ScatterPlotAnnotationTooltipProps {
  /** Rows of annotation data (variable displayName -> value) */
  annotations: AnnotationRow[];
  /** Whether annotation data is still loading */
  loading?: boolean;
  /** Pixel position relative to the plot container */
  x: number;
  y: number;
  /** Called when the user dismisses the tooltip */
  onClose: () => void;
}

/**
 * A pinnable tooltip for Plotly scatterplots that shows entity annotation data.
 * Styled similarly to the VolcanoPlot pinned tooltip but with a vertical table
 * layout of variable name/value pairs with individual copy buttons.
 */
const ScatterPlotAnnotationTooltip = forwardRef<
  HTMLDivElement,
  ScatterPlotAnnotationTooltipProps
>(function ScatterPlotAnnotationTooltip(
  { annotations, loading, x, y, onClose },
  ref
) {
  return (
    <div
      ref={ref}
      className="ScatterAnnotationTooltip"
      onClick={(e) => e.stopPropagation()}
      style={{ left: x, top: y }}
    >
      <button
        type="button"
        className="ScatterAnnotationTooltip__close-btn"
        onClick={(e) => {
          e.preventDefault();
          onClose();
        }}
        aria-label="Dismiss tooltip"
      >
        &times;
      </button>

      {loading ? (
        <div className="ScatterAnnotationTooltip__loading">Loading...</div>
      ) : annotations.length === 0 ? (
        <div className="ScatterAnnotationTooltip__loading">
          No annotations available
        </div>
      ) : (
        <table>
          <tbody>
            {annotations.map((row) => (
              <AnnotationRowItem key={row.displayName} row={row} />
            ))}
          </tbody>
        </table>
      )}

      <div className="ScatterAnnotationTooltip__hint">
        Click a point to pin this tooltip
      </div>
    </div>
  );
});

function AnnotationRowItem({ row }: { row: AnnotationRow }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(row.value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    },
    [row.value]
  );

  return (
    <tr>
      <td>{row.displayName}:</td>
      <td>
        {row.value}
        <button
          type="button"
          className="ScatterAnnotationTooltip__copy-btn"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          {copied ? (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </td>
    </tr>
  );
}

export default ScatterPlotAnnotationTooltip;
