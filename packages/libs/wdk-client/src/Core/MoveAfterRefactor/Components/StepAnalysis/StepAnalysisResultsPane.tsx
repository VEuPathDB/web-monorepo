import React, { ReactNode } from 'react';
import { StepAnalysisConfig } from '../../../../Utils/StepAnalysisUtils';

type StepAnalysisResultPaneProps = StepAnalysisResultState & StepAnalysisResultEventHandlers & {
  resultRenderer: (props: StepAnalysisResultPluginProps) => React.ReactNode;
};

export type StepAnalysisResultState = ({ type: 'complete-result' } & CompleteResultState) | ({ type: 'incomplete-result'} & IncompleteResultState);

export type StepAnalysisResultPluginProps = CompleteResultState & StepAnalysisResultEventHandlers;

interface CompleteResultState {
  analysisResult: any;
  resultUiState: Record<string, any>;
  analysisConfig: StepAnalysisConfig;
  webAppUrl: string;
}

interface StepAnalysisResultEventHandlers {
  updateResultsUiState: (newResultsState: any) => void;
}

interface IncompleteResultState {
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
          resultUiState: props.resultUiState,
          analysisConfig: props.analysisConfig,
          updateResultsUiState: props.updateResultsUiState,
          webAppUrl: props.webAppUrl
        })}
      </div>
    }
  </div>
);
