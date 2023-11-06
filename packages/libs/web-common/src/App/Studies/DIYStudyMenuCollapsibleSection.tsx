import React, { ReactNode, useState } from 'react';
import { ArrowDown, ArrowRight } from '@veupathdb/coreui';

interface Props {
  sectionLabel: string;
  children: ReactNode;
  sectionKey: string;
}

const styles = {
  fill: '#555',
  height: '0.8em',
  width: '0.8em',
};

export function DIYStudyMenuCollapsibleSection({
  sectionLabel,
  children,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <div key={sectionLabel}>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em',
          cursor: 'pointer',
        }}
        title={`Click to ${isExpanded ? 'hide' : 'show'} this section`}
      >
        {isExpanded ? <ArrowDown {...styles} /> : <ArrowRight {...styles} />}
        {sectionLabel}
      </div>
      {isExpanded && (
        <div style={{ marginLeft: '1em' }} key={Math.random()}>
          {children}
        </div>
      )}
    </div>
  );
}
