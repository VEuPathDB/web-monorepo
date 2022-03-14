import React, { ReactNode } from 'react';
import { StepAnalysisConfig } from '../../Utils/StepAnalysisUtils';

export type StepAnalysisResultPaneProps = StepAnalysisResultState & {
  resultRenderer: (props: StepAnalysisResultPluginProps) => React.ReactNode;
};

export type StepAnalysisResultState = ({ type: 'complete-result' } & CompleteResultState) | ({ type: 'incomplete-result' } & IncompleteResultState);

export type StepAnalysisResultPluginProps = CompleteResultState;

export interface CompleteResultState {
  analysisResult: any;
  analysisConfig: StepAnalysisConfig;
  webAppUrl: string;
}

export interface IncompleteResultState {
  className?: string;
  header: ReactNode;
  reason: ReactNode;
}

export const StepAnalysisResultsPane: React.SFC<StepAnalysisResultPaneProps> = props => (
  <div>
    {
      props.type === 'incomplete-result' &&
      <div className={props.className}>
        <h3>{props.header}</h3>
        <p>{props.reason}</p>
      </div>
    }
    {
      props.type === 'complete-result' &&
      <div className="step-analysis-subpane step-analysis-results-pane">
        {props.resultRenderer({
          analysisResult: props.analysisResult,
          analysisConfig: props.analysisConfig,
          webAppUrl: props.webAppUrl
        })}
      </div>
    }
  </div>
);
