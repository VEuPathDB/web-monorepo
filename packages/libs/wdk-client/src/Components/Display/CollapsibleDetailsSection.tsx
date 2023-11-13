import React, { ReactNode, useState } from 'react';

interface Props {
  summary: ReactNode;
  collapsibleDetails: ReactNode;
  initialShowDetailsState?: boolean;
}

export default function CollapsibleDetailsSection({
  summary,
  collapsibleDetails,
  initialShowDetailsState = false,
}: Props) {
  const [showDetails, setShowDetails] = useState(initialShowDetailsState);
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
