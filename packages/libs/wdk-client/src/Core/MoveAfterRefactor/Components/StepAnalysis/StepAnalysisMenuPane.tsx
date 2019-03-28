import React from 'react';
import { StepAnalysisType } from '../../../../Utils/StepAnalysisUtils';
import { StepAnalysisTile } from './StepAnalysisTile';
import { StepAnalysisEventHandlers } from './StepAnalysisView';

export interface StepAnalysisMenuPaneProps {
  recordClassDisplayName: string;
  wdkModelBuildNumber: number;
  webAppUrl: string;
  choices: StepAnalysisType[];
  selectedType?: string;
}

export const StepAnalysisMenuPane: React.SFC<StepAnalysisMenuPaneProps & StepAnalysisEventHandlers> = ({
  recordClassDisplayName,
  wdkModelBuildNumber,
  webAppUrl,
  choices,
  selectedType,
  loadChoice
}) => (
  <div className="analysis-menu-tab-pane">
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
  </div>
);
