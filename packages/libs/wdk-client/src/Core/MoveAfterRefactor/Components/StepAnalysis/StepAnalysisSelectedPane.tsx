import React, { Fragment } from 'react';
import { StepAnalysisErrorsPane } from './StepAnalysisErrorsPane';
import { StepAnalysisLinks } from './StepAnalysisLinks';
import { StepAnalysisDescription } from './StepAnalysisDescription';
import { StepAnalysisFormPane, StepAnalysisFormPluginState, StepAnalysisFormPluginProps } from './StepAnalysisFormPane';
import { StepAnalysisResultsPane, StepAnalysisResultState, StepAnalysisResultPluginProps } from './StepAnalysisResultsPane';
import { StepAnalysisParameter, StepAnalysisConfig } from '../../../../Utils/StepAnalysisUtils';
import { StepAnalysisEventHandlers } from './StepAnalysisView';

export type StepAnalysisSelectedPaneProps = StepAnalysisSelectedPaneStateProps & StepAnalysisEventHandlers;

export interface StepAnalysisSelectedPaneStateProps {
  analysisName: string;
  descriptionState: DescriptionState;
  formState: StepAnalysisFormMetadata & StepAnalysisFormPluginState;
  resultState?: StepAnalysisResultState;
  pluginRenderers: PluginRenderers;
}

interface DescriptionState {
  shortDescription: string;
  description: string;
  descriptionExpanded: boolean;
}

interface StepAnalysisFormMetadata {
  hasParameters: boolean;
  formExpanded: boolean;
  errors: string[];
}

interface PluginRenderers {
  formRenderer: (props: StepAnalysisFormPluginProps) => React.ReactNode;
  resultRenderer: (props: StepAnalysisResultPluginProps) => React.ReactNode;
}

export const StepAnalysisSelectedPane: React.SFC<StepAnalysisSelectedPaneProps> = ({
  analysisName,
  descriptionState,
  formState,
  resultState,
  toggleDescription,
  toggleParameters,
  updateParamValues,
  updateFormUiState,
  updateResultsUiState,
  onFormSubmit,
  renameAnalysis,
  duplicateAnalysis,
  pluginRenderers: {
    formRenderer,
    resultRenderer
  }
}) => (
  <div className="step-analysis-pane">
    <div>
      <StepAnalysisLinks 
        renameAnalysis={renameAnalysis} 
        duplicateAnalysis={duplicateAnalysis} 
      />
      {/* FIXME Make this configurable */ formState.hasParameters &&
        <>
          <h2 id="step-analysis-title">{analysisName}</h2>
          <StepAnalysisDescription 
            {...descriptionState} 
            toggleDescription={toggleDescription} 
          />
        </>
      }
    </div>
    <div className="step-analysis-subpane">
      {formState.hasParameters &&
        <StepAnalysisFormPane
          {...formState}
          toggleParameters={toggleParameters}
          formRenderer={formRenderer}
          updateParamValues={updateParamValues}
          updateFormUiState={updateFormUiState}
          onFormSubmit={onFormSubmit}
        />
      }
      {
        resultState &&
        <StepAnalysisResultsPane
          {...resultState}
          resultRenderer={resultRenderer}
          updateResultsUiState={updateResultsUiState}
        />
      }
    </div>
  </div>
);
