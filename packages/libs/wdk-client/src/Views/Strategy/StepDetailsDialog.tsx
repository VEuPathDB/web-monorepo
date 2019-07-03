import React from 'react';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import Dialog from 'wdk-client/Components/Overlays/Dialog';
import { cxStepBoxes as cx } from 'wdk-client/Views/Strategy/ClassNames';
import CombineStepDetails from 'wdk-client/Views/Strategy/CombineStepDetails';
import StepDetails from 'wdk-client/Views/Strategy/StepDetails';
import { StepBoxProps } from 'wdk-client/Views/Strategy/Types';
import NestedStepDetails from 'wdk-client/Views/Strategy/NestedStepDetails';
import { getStepUrl } from 'wdk-client/Views/Strategy/StrategyUtils';

interface Props extends StepBoxProps, RouteComponentProps<any> {
  isOpen: boolean;
  onClose: () => void;
}

interface StepAction {
  display: React.ReactType<Props>;
  onClick: (props: Props) => void;
  isDisabled?: (props: Props) => boolean;
  closeOnClick?: boolean;
}
const actions: StepAction[] = [
  {
    display: () => <React.Fragment>Rename</React.Fragment>,
    onClick: () => alert('TODO')
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
    onClick: () => alert('TODO'),
    isDisabled: ({ location, stepTree }) => !location.pathname.startsWith(getStepUrl(stepTree.step))
  },
  {
    display: () => <React.Fragment>Revise</React.Fragment>,
    onClick: () => alert('todo'),
    isDisabled: ({ isNested }) => isNested
  },
  {
    display: () => <React.Fragment>Make nested strategy</React.Fragment>,
    onClick: () => alert('todo'),
    isDisabled: ({ stepTree, isNested }) => isNested || stepTree.primaryInput != null
  },
  {
    display: ({ isExpanded }) => <React.Fragment>{isExpanded ? 'Hide nested' : 'Show nested'}</React.Fragment>,
    onClick: ({ nestedId, isExpanded, onCollapseNestedStrategy, onExpandNestedStrategy }) => {
      if (nestedId == null) return;
      if (isExpanded) onCollapseNestedStrategy(nestedId);
      else onExpandNestedStrategy(nestedId);
    }
  },
  {
    display: () => <React.Fragment>Insert step before</React.Fragment>,
    onClick: () => alert('todo')
  },
  {
    display: () => <React.Fragment>Delete</React.Fragment>,
    onClick: () => alert('todo')
  }
]

export default withRouter(function StepDetailsDialog(props: Props) {
  const {
    isOpen,
    stepTree,
    nestedDisplayName,
    isNested,
    onClose,
  } = props;
  const { step } = stepTree;
  
  return (
    <Dialog
      className={cx("--StepDetails")}
      title={(
        <React.Fragment>
          <div>Details for "{nestedDisplayName || step.customName}"</div>
          <div className={cx("--StepActions")}>
            {actions.map((action, index) => (
              <div key={index}>
                <button type="button" className="link" onClick={() => {
                  if (action.onClick) action.onClick(props);
                  if (action.closeOnClick) onClose();
                }}
                disabled={action.isDisabled ? action.isDisabled(props) : false}
              ><action.display {...props}/></button>
              </div>
            ))}
          </div>
        </React.Fragment>
      )}
      open={isOpen}
      onClose={onClose}
    >
      { isNested ? <NestedStepDetails {...props}/>
      : stepTree.primaryInput && stepTree.secondaryInput ? <CombineStepDetails {...props} />
      : <StepDetails {...props} /> }
    </Dialog>
  );
});