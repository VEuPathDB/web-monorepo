import React from 'react';
import { StepAnalysisLinks } from './StepAnalysisLinks';
import { StepAnalysisDescription } from './StepAnalysisDescription';
import { StepAnalysisFormPane, StepAnalysisFormPluginState, StepAnalysisFormPluginProps } from './StepAnalysisFormPane';
import { StepAnalysisResultsPane, StepAnalysisResultState, StepAnalysisResultPluginProps } from './StepAnalysisResultsPane';
import { StepAnalysisEventHandlers } from './StepAnalysisView';
import { LoadingOverlay } from '../../Components';

export type StepAnalysisSelectedPaneProps = StepAnalysisSelectedPaneStateProps & StepAnalysisEventHandlers;

export interface StepAnalysisSelectedPaneStateProps {
  analysisName: string;
  descriptionState: DescriptionState;
  formSaving: boolean;
  formState: StepAnalysisFormMetadata & StepAnalysisFormPluginState;
  resultState?: StepAnalysisResultState;
  pluginRenderers: PluginRenderers;
}

interface DescriptionState {
  shortDescription?: string;
  description?: string;
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
  formSaving,
  formState,
  resultState,
  toggleDescription,
  toggleParameters,
  updateParamValues,
  onFormSubmit,
  renameAnalysis,
  duplicateAnalysis,
  pluginRenderers: {
    formRenderer,
    resultRenderer
  }
}) => {
  return (
    <div className="step-analysis-pane">
      {formSaving && (
        <LoadingOverlay>Updating analysis...</LoadingOverlay>
      )}
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
            onFormSubmit={onFormSubmit}
          />
        }
        {
          resultState &&
          <StepAnalysisResultsPane
            {...resultState}
            resultRenderer={resultRenderer}
          />
        }
      </div>
    </div>
  );
}
