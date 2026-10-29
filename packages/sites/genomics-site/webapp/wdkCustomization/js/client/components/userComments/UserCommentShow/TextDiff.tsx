import React from 'react';
import { diffWords } from 'diff';
import { green, red } from '@veupathdb/coreui/lib/definitions/colors';

interface Props {
  before: string;
  after: string;
}

// Inline word-level diff between the AI-generated original and the
// author-edited, published text. Additions are highlighted green; deletions
// are highlighted red with a strikethrough (unchanged text is left plain),
// so the original wording is still fully readable alongside the edit.
export function TextDiff({ before, after }: Props): JSX.Element {
  const changes = diffWords(before, after);

  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      {changes.map((change, index) => {
        if (change.added) {
          return (
            <ins
              key={index}
              style={{
                background: green[100],
                color: green[900],
                textDecoration: 'none',
              }}
            >
              {change.value}
            </ins>
          );
        }
        if (change.removed) {
          return (
            <del
              key={index}
              style={{
                background: red[100],
                color: red[900],
              }}
            >
              {change.value}
            </del>
          );
        }
        return <React.Fragment key={index}>{change.value}</React.Fragment>;
      })}
    </span>
  );
}
