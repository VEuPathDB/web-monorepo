import React, { Fragment } from 'react';

interface StepAnalysisDescriptionProps {
  shortDescription: string;
  description: string;
  descriptionExpanded: boolean;
  toggleDescription: () => void;
}

export const StepAnalysisDescription: React.SFC<StepAnalysisDescriptionProps> = ({
  shortDescription,
  description,
  descriptionExpanded,
  toggleDescription
}) => (
  <Fragment>
    <div className="step-analysis-description">
      <span>{shortDescription}</span>
      {
        description && (
          <span className="toggle-description-new" title="Toggle full description" onClick={toggleDescription}>
            {descriptionExpanded ? 'Read Less' : 'Read More'}
          </span>
        )
      }
    </div>
    {
      descriptionExpanded &&
      <div className="step-analysis-description" dangerouslySetInnerHTML={{ __html: description }} />
    }
  </Fragment>
);