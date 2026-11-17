import React from 'react';
import { collapseStatus, StatusTuple } from './utils';
import { CitationResult } from './CitationResult';

interface CitationLineProps {
  readonly status: StatusTuple;
}

export function CitationLine(props: CitationLineProps): React.ReactElement {
  const result = collapseStatus(props.status);

  let style: React.CSSProperties | undefined;
  let className: string | undefined;

  if (result == null) {
    style = { visibility: 'hidden' };
  } else if (result.status !== 'success') {
    className = 'invalid';
  }

  return (
    <div className="field-grid publication-hint" style={style}>
      <span className={className}>Citation:</span>
      <CitationResult result={result} />
    </div>
  );
}
