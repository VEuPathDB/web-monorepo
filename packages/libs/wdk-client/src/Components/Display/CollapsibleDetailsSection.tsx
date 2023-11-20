import React, { ReactNode } from 'react';

interface Props {
  summary: ReactNode;
  collapsibleDetails: ReactNode;
  showDetails: boolean;
  setShowDetails: (showDetails: boolean) => void;
}

export default function CollapsibleDetailsSection({
  summary,
  collapsibleDetails,
  showDetails,
  setShowDetails,
}: Props) {
  return (
    <details
      open={showDetails}
      onToggle={(e) => setShowDetails(e.currentTarget.open)}
    >
      <summary>{summary}</summary>
      {collapsibleDetails}
    </details>
  );
}
