import React from 'react';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';

export type CommentFilter = 'all' | 'user' | 'ai';

interface Props {
  counts: { all: number; user: number; ai: number };
  active: CommentFilter;
  onChange: (filter: CommentFilter) => void;
}

const CHIPS: { key: CommentFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'user', label: 'User-generated' },
  { key: 'ai', label: 'AI-assisted' },
];

export function CommentFilterChips({
  counts,
  active,
  onChange,
}: Props): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      {CHIPS.map(({ key, label }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            style={{
              cursor: 'pointer',
              padding: '4px 12px',
              borderRadius: '16px',
              border: `1px solid ${gray[400]}`,
              background: isActive ? gray[700] : 'white',
              color: isActive ? 'white' : gray[700],
              fontSize: '13px',
            }}
          >
            {label} ({counts[key]})
          </button>
        );
      })}
    </div>
  );
}
