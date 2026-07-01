import React, { ReactNode } from 'react';

// A labelled row (bold heading + value) shared by CommentReferences and
// AiProvenanceSection so AI provenance reads in the same visual language as
// the other reference fields (PMID(s), Category, …).
export function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ fontWeight: 600, fontSize: '14px' }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}
