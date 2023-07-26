import React, { Fragment } from 'react';

import { safeHtml } from '../../Utils/ComponentUtils';

interface StepAnalysisDescriptionProps {
  shortDescription?: string;
  description?: string;
  descriptionExpanded: boolean;
  toggleDescription: () => void;
}

export const StepAnalysisDescription: React.SFC<StepAnalysisDescriptionProps> =
  ({
    shortDescription,
    description,
    descriptionExpanded,
    toggleDescription,
  }) => (
    <Fragment>
      <div className="step-analysis-description">
        <span>{shortDescription}</span>
        {description && (
          <span
            className="toggle-description"
            title="Toggle full description"
            onClick={toggleDescription}
          >
            {descriptionExpanded ? 'Read Less' : 'Read More'}
          </span>
        )}
      </div>
      {description && descriptionExpanded && (
        <div className="step-analysis-description">{safeHtml(description)}</div>
      )}
    </Fragment>
  );
