import React, { ReactNode, useEffect, useState } from 'react';

interface Props {
  summary: ReactNode;
  collapsibleDetails: ReactNode;
  initialShowDetailsState?: boolean;
  expandDueToFiltering?: boolean;
}

export default function CollapsibleDetailsSection({
  summary,
  collapsibleDetails,
  initialShowDetailsState = false,
  expandDueToFiltering,
}: Props) {
  const [showDetails, setShowDetails] = useState(initialShowDetailsState);

  useEffect(() => {
    if (expandDueToFiltering) setShowDetails(expandDueToFiltering);
  }, [expandDueToFiltering]);

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
