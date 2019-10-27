import React, { Fragment, useEffect } from 'react';
import { StepAnalysisMenuPaneProps, StepAnalysisMenuPane } from './StepAnalysisMenuPane';
import { StepAnalysisSelectedPane, StepAnalysisSelectedPaneStateProps } from './StepAnalysisSelectedPane';
import { LoadingOverlay } from '../../../../Components';
import { StepAnalysisType } from '../../../../Utils/StepAnalysisUtils';

import 'wdk-client/Core/MoveAfterRefactor/Components/StepAnalysis/StepAnalysisView.scss';

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
  loadSavedAnalysis: () => void;
  toggleDescription: () => void;
  toggleParameters: () => void;
  updateParamValues: (newParamValues: Record<string, string>) => void;
  onFormSubmit: () => void;
  renameAnalysis: (newDisplayName: string) => void;
  duplicateAnalysis: () => void;
}

export const StepAnalysisView: React.SFC<StepAnalysisStateProps & StepAnalysisEventHandlers> = props => {
  // only call this once
  useEffect(() => {
    props.loadSavedAnalysis()
  }, []);
  return (
    <Fragment>
      {
        props.type === 'unopened-pane' &&
        <div className="step-analysis-pane"></div>
      }
      {
        props.type === 'loading-menu-pane' &&
        (
          <div className="analysis-menu-tab-pane">
            <LoadingOverlay>
              Loading saved analysis...
            </LoadingOverlay>
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
  )
}
