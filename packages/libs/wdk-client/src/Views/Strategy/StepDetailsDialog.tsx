import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Dialog from 'wdk-client/Components/Overlays/Dialog';
import { cxStepBoxes as cx } from 'wdk-client/Views/Strategy/ClassNames';
import CombineStepDetails from 'wdk-client/Views/Strategy/CombineStepDetails';
import NestedStepDetails from 'wdk-client/Views/Strategy/NestedStepDetails';
import StepDetails from 'wdk-client/Views/Strategy/StepDetails';
import { getStepUrl } from 'wdk-client/Views/Strategy/StrategyUtils';
import { isCombineUiStepTree, isLeafUiStepTree, StepDetailProps } from 'wdk-client/Views/Strategy/Types';

type Props = RouteComponentProps<any> & StepDetailProps

interface StepAction {
  /** Text of the button */
  display: React.ReactType<Props>;
  /** Action to take when user clicks */
  onClick: (props: Props) => void;
  /** The button should be disabled */
  isDisabled?: (props: Props) => boolean;
  /** The button should be hidden */
  isHidden?: (props: Props) => boolean;
  /** The dialog should be closed when the button is clicked */
  closeOnClick?: boolean;
}

const actions: StepAction[] = [
  {
    display: () => <React.Fragment>Rename</React.Fragment>,
    onClick: ({ showRenameStep }) => showRenameStep(),
    isDisabled: ({ stepTree, isNested }) => isCombineUiStepTree(stepTree) && !isNested
  },
  {
    display: () => <React.Fragment>View</React.Fragment>,
    onClick: ({ history, stepTree }) => {
      history.push(getStepUrl(stepTree.step));
    },
    isDisabled: ({ location, stepTree }) => location.pathname.startsWith(getStepUrl(stepTree.step))
  },
  {
    display: () => <React.Fragment>Analyze</React.Fragment>,
    onClick: ({ showNewAnalysisTab }) => showNewAnalysisTab(),
    isDisabled: ({ location, stepTree }) => !location.pathname.startsWith(getStepUrl(stepTree.step))
  },
  {
    display: () => <React.Fragment>Revise</React.Fragment>,
    onClick: () => alert('todo'),
    isDisabled: ({ isNested }) => isNested
  },
  {
    display: () => <React.Fragment>Make nested strategy</React.Fragment>,
    onClick: ({ makeNestedStrategy }) => {
      makeNestedStrategy();
    },
    isHidden: ({ stepTree, isNested }) => (
      !isLeafUiStepTree(stepTree) ||
      stepTree.nestedControlStep == null ||
      isNested
    )
  },
  {
    display: () => <React.Fragment>Unnest strategy</React.Fragment>,
    onClick: ({ makeUnnestStrategy }) => makeUnnestStrategy(),
    isDisabled: ({ stepTree }) => isCombineUiStepTree(stepTree),
    isHidden: ({ isNested }) => !isNested
  },
  {
    display: ({ stepTree }) => <React.Fragment>{
      stepTree.nestedControlStep && stepTree.nestedControlStep.expanded
        ? 'Hide nested'
        : 'Show nested'
      }</React.Fragment>,
    onClick: ({ isExpanded, collapseNestedStrategy, expandNestedStrategy }) => {
      if (isExpanded) collapseNestedStrategy();
      else expandNestedStrategy();
    },
    isHidden: ({ isNested }) => !isNested
  },
  {
    display: () => <React.Fragment>Insert step before</React.Fragment>,
    onClick: ({ insertStepBefore }) => insertStepBefore()
  },
  {
    display: () => <React.Fragment>Delete</React.Fragment>,
    onClick: ({ deleteStep }) => deleteStep()
  }
]

export default withRouter(function StepDetailsDialog(props: Props) {
  const {
    isNested,
    isOpen,
    stepTree,
    onClose,
  } = props;
  const { step, nestedControlStep } = stepTree;
  return (
    <Dialog
      className={cx("--StepDetails")}
      title={(
        <div className={cx("--StepActions")}>
          {actions
          .filter(action => action.isHidden == null || !action.isHidden(props))
          .map((action, index) => (
            <div key={index}>
              <button type="button" className="link" onClick={() => {
                if (action.onClick) action.onClick(props);
                if (action.closeOnClick !== false) onClose();
              }}
              disabled={action.isDisabled ? action.isDisabled(props) : false}
            ><action.display {...props}/></button>
            </div>
          ))}
        </div>
      )}
      open={isOpen}
      onClose={onClose}
    >
      <React.Fragment>
        <div className={cx('--StepDetailsHeading')}>Details for "{nestedControlStep && nestedControlStep.expandedName ? nestedControlStep.expandedName : step.customName}"</div>
        { isNested ? <NestedStepDetails {...props}/>
        : isCombineUiStepTree(stepTree) ? <CombineStepDetails {...props} />
        : <StepDetails {...props} /> }
      </React.Fragment>
    </Dialog>
  );
});