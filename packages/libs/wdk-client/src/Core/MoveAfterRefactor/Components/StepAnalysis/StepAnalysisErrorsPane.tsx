import React, { Fragment } from 'react';

interface StepAnalysisErrorsPaneProps {
  errors: string[]
}

export const StepAnalysisErrorsPane: React.SFC<StepAnalysisErrorsPaneProps> = ({
  errors
}) => (
  <div className="step-analysis-errors-pane">
    {
      errors.length > 0 && (
        <Fragment>
          <span>Please address the following issues:</span>
          <br />
          <ul>
            {
              errors.map((error, key) => <li key={key}>{error}</li>)
            }
          </ul>
          <hr/>
        </Fragment>
      )
    }
  </div>
);
