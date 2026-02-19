import { ReactNode } from 'react';
import { colors } from '@material-ui/core';

export function ReviewCard({
  title,
  complete,
  incompleteHint,
  children,
}: {
  title: string;
  complete?: boolean;
  incompleteHint?: string;
  children?: ReactNode;
}) {
  const isIncomplete = complete === false;
  return (
    <div
      style={{
        border: `1px solid ${
          isIncomplete ? colors.orange[300] : colors.grey[300]
        }`,
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.4rem 0.75rem',
          background: isIncomplete
            ? colors.orange[50]
            : complete
            ? colors.green[50]
            : colors.grey[50],
        }}
      >
        <strong>{title}</strong>
        {complete === true && (
          <span style={{ color: colors.green[700], fontSize: '0.85em' }}>
            ✅ Complete
          </span>
        )}
        {complete === false && (
          <span style={{ color: colors.orange[800], fontSize: '0.85em' }}>
            ⚠ Action needed
          </span>
        )}
      </div>
      <div
        style={{
          padding: '0.5rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        {isIncomplete && incompleteHint ? (
          <span style={{ color: colors.orange[800] }}>{incompleteHint}</span>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <span style={{ color: colors.grey[600], minWidth: '10rem' }}>
        {label}:
      </span>
      <strong>{value}</strong>
    </div>
  );
}
