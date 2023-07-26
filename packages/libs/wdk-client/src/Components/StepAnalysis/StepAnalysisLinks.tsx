import React from 'react';

interface StepAnalysisLinksProps {
  renameAnalysis: (newDisplayName: string) => void;
  duplicateAnalysis: () => void;
}

export const StepAnalysisLinks: React.SFC<StepAnalysisLinksProps> = ({
  renameAnalysis,
  duplicateAnalysis,
}) => (
  <div style={{ textAlign: 'right' }}>
    <span>
      [{' '}
      <a
        onClick={(event) => {
          event.preventDefault();
          const newDisplayName = window.prompt('New name:');

          if (newDisplayName !== null) {
            renameAnalysis(newDisplayName);
          }
        }}
        href="#"
      >
        Rename This Analysis
      </a>{' '}
      |{' '}
      <a
        onClick={(event) => {
          event.preventDefault();
          duplicateAnalysis();
        }}
        href="#"
      >
        Duplicate
      </a>{' '}
      ]
    </span>
  </div>
);
