import React, { Fragment } from 'react';
import { StepAnalysisErrorsPane } from './StepAnalysisErrorsPane';
import { CollapsibleSection } from 'wdk-client/Components';
import { Parameter } from 'wdk-client/Utils/WdkModel';

type StepAnalysisFormPaneProps = StepAnalysisFormPluginProps & {
  hasParameters: boolean;
  formExpanded: boolean;
  errors: string[];
  toggleParameters: () => void;
  formRenderer: (props: StepAnalysisFormPluginProps) => React.ReactNode;
};

export type StepAnalysisFormPluginProps = StepAnalysisFormPluginState & StepAnalysisFormPluginEventHandlers;

export interface StepAnalysisFormPluginState {
  paramSpecs: Parameter[];
  paramValues: Record<string, string>;
}

export interface StepAnalysisFormPluginEventHandlers {
  updateParamValues: (newParamValues: Record<string, string>) => void;
  onFormSubmit: () => void;
}

export const StepAnalysisFormPane: React.SFC<StepAnalysisFormPaneProps> = ({
  formExpanded,
  formRenderer,
  hasParameters,
  errors,
  paramSpecs,
  paramValues,
  updateParamValues,
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
                updateParamValues,
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
