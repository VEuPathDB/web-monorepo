import { useCallback, useState } from 'react';
import './ScatterPlotAnnotationTooltip.scss';

/** A single row of annotation data: variable display name + value */
export interface AnnotationRow {
  displayName: string;
  value: string;
}

interface AnnotationPanelProps {
  /** Rows of annotation data (variable displayName -> value) */
  annotations: AnnotationRow[];
  /** Whether annotation data is still loading */
  loading?: boolean;
  /** Whether a point is currently pinned */
  isPinned?: boolean;
  /** Called to clear a pinned point */
  onClear?: () => void;
}

/**
 * Sidebar panel that displays entity annotation data for a hovered or pinned
 * scatterplot point. Renders as a card in the right sidebar column above
 * BirdsEyeView.
 */
export default function AnnotationPanel({
  annotations,
  loading,
  isPinned,
  onClear,
}: AnnotationPanelProps) {
  return (
    <div className="AnnotationPanel">
      <div className="AnnotationPanel__header">
        <span className="AnnotationPanel__title">Sample Details</span>
        {isPinned && (
          <button
            type="button"
            className="AnnotationPanel__unpin-btn"
            onClick={onClear}
            title="Unpin and return to hover mode"
          >
            Unpin
          </button>
        )}
      </div>

      {loading ? (
        <div className="AnnotationPanel__placeholder">
          Loading annotation data...
        </div>
      ) : annotations.length === 0 ? (
        <div className="AnnotationPanel__placeholder">
          Hover over a point to see sample details. Click to pin.
        </div>
      ) : (
        <div className="AnnotationPanel__body">
          <table>
            <tbody>
              {annotations.map((row) => (
                <AnnotationRowItem key={row.displayName} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

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
          className="AnnotationPanel__copy-btn"
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
