import { isEmpty, keyBy, partial } from 'lodash';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { requestDeleteStrategy, requestDuplicateStrategy, requestPatchStrategyProperties, requestRemoveStepFromStepTree, requestStrategy, requestUpdateStepProperties } from 'wdk-client/Actions/StrategyActions';
import { nestStrategy, setInsertStepWizardVisibility, unnestStrategy } from 'wdk-client/Actions/StrategyPanelActions';
import { Loading } from 'wdk-client/Components';
import { createNewTab } from 'wdk-client/Core/MoveAfterRefactor/Actions/StepAnalysis/StepAnalysisActionCreators';
import { RootState } from 'wdk-client/Core/State/Types';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { Step, StepTree, StrategyDetails } from 'wdk-client/Utils/WdkUser';
import StrategyPanel from 'wdk-client/Views/Strategy/StrategyPanel';
import { UiStepTree } from 'wdk-client/Views/Strategy/Types';

interface OwnProps {
  viewId: string;
  strategyId: number;
  stepId?: number;
  action?: string;
}

type MappedProps = 
| {
  isLoading: true;
} | {
  isLoading: false;
  strategy: StrategyDetails;
  uiStepTree: UiStepTree;
  insertStepVisibility?: number;
  stepToRename?: number;
  nestedStrategyBranchToRename?: number;
}

interface MappedDispatch {
  requestStrategy: (id: number) => void;
  onStrategyCopy: (signature: string) => void;
  onStrategyDelete: () => void;
  onStrategyRename: (name: string) => void;
  onStrategySave: (name: string, isPublic: boolean, description?: string) => void;
  onShowInsertStep: (stepId: number) => void;
  onHideInsertStep: () => void;
  onExpandNestedStrategy: (branchStepId: number) => void;
  onCollapseNestedStrategy: (branchStepId: number) => void;
  onRenameStep: (stepId: number, newName: string) => void;
  onRenameNestedStrategy: (branchStepId: number, newName: string) => void;
  onAnalyzeStep: () => void;
  onMakeNestedStrategy: (branchStepId: number) => void;
  onMakeUnnestedStrategy: (branchStepId: number) => void;
  onDeleteStep: (stepTree: StepTree, stepId: number) => void;
}

type Props = OwnProps & MappedProps & MappedDispatch;

function mapStateToProps(state: RootState, ownProps: OwnProps): MappedProps {
  const panelState = state.strategyPanel[ownProps.viewId];
  const insertStepVisibility = panelState && panelState.visibleInsertStepWizard;
  const stepToRename = panelState && panelState.visibleRenameStep;
  const nestedStrategyBranchIds = panelState ? panelState.nestedStrategyBranchIds : [];
  const nestedStrategyBranchToRename = panelState && panelState.visibleRenameNestedStrategyBranch;
  const entry = state.strategies.strategies[ownProps.strategyId];
  const strategy = entry && entry.status === 'success' ? entry.strategy : undefined;
  const { recordClasses } = state.globalData;
  const uiStepTree = strategy && recordClasses && makeUiStepTree(strategy, keyBy(recordClasses, 'urlSegment'), nestedStrategyBranchIds);
  return strategy == null || uiStepTree == null
    ? { isLoading: true }
    : { isLoading: false, strategy, uiStepTree, insertStepVisibility, stepToRename, nestedStrategyBranchToRename };
}

function mapDispatchToProps(dispatch: Dispatch, props: OwnProps): MappedDispatch {
  return bindActionCreators({
    requestStrategy,
    onStrategyCopy: (sourceStrategySignature: string) => requestDuplicateStrategy({ sourceStrategySignature }),
    onStrategyDelete: () => requestDeleteStrategy(props.strategyId),
    onStrategyRename: (name: string) => requestPatchStrategyProperties(props.strategyId, { name }),
    onStrategySave: (name: string, isPublic: boolean, description?: string) => requestPatchStrategyProperties(props.strategyId, { isPublic, isSaved: true, name, description }),
    onShowInsertStep: (stepId: number) => setInsertStepWizardVisibility(props.viewId, stepId),
    onHideInsertStep: () => setInsertStepWizardVisibility(props.viewId, undefined),
    onExpandNestedStrategy: (branchStepId: number) => requestUpdateStepProperties(props.strategyId, branchStepId, { expanded: true }),
    onCollapseNestedStrategy: (branchStepId: number) => requestUpdateStepProperties(props.strategyId, branchStepId, { expanded: false }),
    onRenameStep: (stepId: number, newName: string) => requestUpdateStepProperties(props.strategyId, stepId, { customName: newName }),
    onRenameNestedStrategy: (branchStepId: number, newName: string) =>
      requestUpdateStepProperties(props.strategyId, branchStepId, {
        expanded: true,
        expandedName: newName
      }),
    // FIXME These details should be better encapsulated
    onAnalyzeStep: () => createNewTab({
      type: 'ANALYSIS_MENU_STATE',
      displayName: 'New Analysis',
      status: 'AWAITING_USER_CHOICE',
      errorMessage: null 
    }),
    onMakeNestedStrategy: (branchStepId: number) => nestStrategy(props.viewId, branchStepId),
    onMakeUnnestedStrategy: (branchStepId: number) => unnestStrategy(props.viewId, branchStepId),
    onDeleteStep: (stepTree: StepTree, stepId: number) => requestRemoveStepFromStepTree(props.strategyId, stepId, stepTree)
  }, dispatch);
}

function StrategyPanelController(props: Props) {
  useEffect(() => {
    props.requestStrategy(props.strategyId);
  }, [ props.strategyId ]);

  if (props.isLoading) return <Loading/>;

  return (
    <StrategyPanel {...props} onDeleteStep={partial(props.onDeleteStep, props.strategy.stepTree)} />
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(StrategyPanelController);

/**
 * Transform a strategy's StepTree into a UiStepTree
 */
function makeUiStepTree(strategy: StrategyDetails, recordClassesByName: Record<string, RecordClass>, nestedBranchIds: number[]): UiStepTree {
  const colorIter = colors([
    '#A000A0', // purple
    '#00A0A0', // teal
    '#0000A0', // blue
    '#A00000', // brown
    '#A0A000', // green
  ]);
  
  return _recurse(strategy.stepTree);

  function _recurse(stepTree: StepTree, nestedControlStep?: Step, color?: string, isNested: boolean = false): UiStepTree {
    const step = strategy.steps[stepTree.stepId];
    const recordClass = recordClassesByName[step.recordClassName];
    const primaryInput = stepTree.primaryInput && _recurse(stepTree.primaryInput);
    // XXX Should we reset coloring when we traverse a new branch of secondary inputs?
    // only secondary inputs get a color
    const secondaryInput = stepTree.secondaryInput && _recurse(
      stepTree.secondaryInput,
      step,
      colorIter.next().value,
      // should the step be rendered as nested...
      nestedBranchIds.includes(step.id) || !isEmpty(step.expandedName) || stepTree.secondaryInput.primaryInput != null
    );
    return {
      step,
      recordClass,
      primaryInput,
      secondaryInput,
      nestedControlStep,
      color,
      isNested
    };
  }
}

/**
 * Returns an iterable that cycles through the listed colors infinitely
 */
function* colors(choices: string[]) {
  while(true) yield* choices;
}
