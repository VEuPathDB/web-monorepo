import React, { Fragment } from 'react';
import { StepAnalysisType } from '../../Utils/StepAnalysisUtils';
import { StepAnalysisTile } from './StepAnalysisTile';
import { StepAnalysisEventHandlers } from './StepAnalysisView';

export interface StepAnalysisMenuPaneProps {
  recordClassDisplayName: string;
  wdkModelBuildNumber: number;
  webAppUrl: string;
  choices: StepAnalysisType[];
  selectedType?: string;
  errorMessage: string | null;
}

export const StepAnalysisMenuPane: React.SFC<StepAnalysisMenuPaneProps & StepAnalysisEventHandlers> = ({
  recordClassDisplayName,
  wdkModelBuildNumber,
  webAppUrl,
  choices,
  selectedType,
  loadChoice,
  errorMessage
}) => (
  <div className="analysis-menu-tab-pane">
    {
      errorMessage != null
        ? <Fragment>
          <h3>
            An error occurred while loading your chosen analysis:
            </h3>
          <p>
            {errorMessage}
          </p>
        </Fragment>
        : <Fragment>
          <h3>Analyze your {recordClassDisplayName} results with a tool below.</h3>
          <div className="analysis-selector-container">
            {
              choices.map(
                choice => <StepAnalysisTile
                  key={choice.name}
                  shortDescription={choice.shortDescription}
                  displayName={choice.displayName}
                  customThumbnailUrl={
                    choice.customThumbnail &&
                    `${webAppUrl}/${choice.customThumbnail}`
                  }
                  inactive={+choice.releaseVersion <= 0}
                  newRelease={+choice.releaseVersion === wdkModelBuildNumber}
                  loading={choice.name === selectedType}
                  loadChoice={() => loadChoice(choice)}
                />
              )
            }
          </div>
        </Fragment>
    }
  </div>
);
