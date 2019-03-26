import React, { Fragment } from 'react';
import { StepAnalysisParameter } from '../../../../Utils/StepAnalysisUtils';
import { StepAnalysisErrorsPane } from './StepAnalysisErrorsPane';
import { CollapsibleSection } from 'wdk-client/Components';

type StepAnalysisFormPaneProps = StepAnalysisFormPluginProps & {
  hasParameters: boolean;
  formExpanded: boolean;
  errors: string[];
  toggleParameters: () => void;
  formRenderer: (props: StepAnalysisFormPluginProps) => React.ReactNode;
};

export type StepAnalysisFormPluginProps = StepAnalysisFormPluginState & StepAnalysisFormPluginEventHandlers;

export interface StepAnalysisFormPluginState {
  paramSpecs: StepAnalysisParameter[];
  paramValues: Record<string, string[]>;
  formUiState: Record<string, any>;
}

export interface StepAnalysisFormPluginEventHandlers {
  updateParamValues: (newParamValues: Record<string, string[]>) => void;
  updateFormUiState: (newFormState: any) => void;
  onFormSubmit: () => void;
}

export const StepAnalysisFormPane: React.SFC<StepAnalysisFormPaneProps> = ({
  formExpanded,
  formRenderer,
  hasParameters,
  errors,
  paramSpecs,
  paramValues,
  formUiState,
  updateParamValues,
  updateFormUiState,
  onFormSubmit,
  toggleParameters
}) => (
  <Fragment>
    <StepAnalysisErrorsPane errors={errors} />
    {hasParameters 
      ? (
        <CollapsibleSection
          headerContent="Parameters"
          className="step-analysis-parameters"
          isCollapsed={!formExpanded}
          onCollapsedChange={toggleParameters}
        >
          {
            formRenderer(
              { 
                paramSpecs, 
                paramValues, 
                formUiState, 
                updateParamValues, 
                updateFormUiState, 
                onFormSubmit 
              }
            )
          }
        </CollapsibleSection>
      )
      : (
        <Fragment>
          <div style={{ textAlign: "center" }}>
              <input type="submit" onClick={onFormSubmit} value="Reload Analysis"/>
            <div style={{ fontStyle: "italic" }}>
              The analysis results will be shown below.
            </div>
          </div>
          <hr/>
        </Fragment>
      )
    }
  </Fragment>
);
