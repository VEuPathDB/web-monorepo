import React, { Fragment } from 'react';
import { StepAnalysisMenuPaneProps, StepAnalysisMenuPane } from './StepAnalysisMenuPane';
import { StepAnalysisSelectedPaneProps, StepAnalysisSelectedPane, StepAnalysisSelectedPaneStateProps } from './StepAnalysisSelectedPane';
import { Loading } from '../../../../Components';
import { StepAnalysisType } from '../../../../Utils/StepAnalysisUtils';

export type StepAnalysisStateProps = StepAnalysisUnopenedPaneTypedProps | StepAnalysisLoadingMenuPaneTypedProps | StepAnalysisMenuPaneTypedProps | StepAnalysisSelectedPaneTypedProps;

export interface StepAnalysisUnopenedPaneTypedProps {
  type: 'unopened-pane';
}

export interface StepAnalysisLoadingMenuPaneTypedProps {
  type: 'loading-menu-pane';
}

export type StepAnalysisMenuPaneTypedProps = {
  type: 'analysis-menu'; 
} & StepAnalysisMenuPaneProps;

export type StepAnalysisSelectedPaneTypedProps = {
  type: 'selected-analysis';
} & StepAnalysisSelectedPaneStateProps;

export interface StepAnalysisEventHandlers {
  loadChoice: (choice: StepAnalysisType) => void;
  toggleDescription: () => void;
  updateParamValues: (newParamValues: Record<string, string[]>) => void;
  updateFormUiState: (newFormState: any) => void;
  updateResultsUiState: (newResultsState: any) => void;
  onFormSubmit: () => void;
  renameAnalysis: (newDisplayName: string) => void;
  duplicateAnalysis: () => void;
}

export const StepAnalysisView: React.SFC<StepAnalysisStateProps & StepAnalysisEventHandlers> = props => (
  <Fragment>
    {
      props.type === 'unopened-pane' &&
      <div className="step-analysis-pane"></div>
    }
    {
      props.type === 'loading-menu-pane' &&
      (
        <div className="analysis-menu-tab-pane">
          <Loading>
            <div>
              Loading analysis...
            </div>
          </Loading>
        </div>
      )
    }
    {
      props.type === 'analysis-menu' &&
      <StepAnalysisMenuPane { ...props } />
    }
    {
      props.type === 'selected-analysis' &&
      <StepAnalysisSelectedPane { ...props } />
    }
  </Fragment>
);
