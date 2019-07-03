import React from 'react';
import { NavLink } from 'react-router-dom';
import Dialog from 'wdk-client/Components/Overlays/Dialog';
import { cxStepBoxes as cx } from 'wdk-client/Views/Strategy/ClassNames';
import CombineStepDetails from 'wdk-client/Views/Strategy/CombineStepDetails';
import StepDetails from 'wdk-client/Views/Strategy/StepDetails';
import { StepBoxProps } from 'wdk-client/Views/Strategy/Types';
import NestedStepDetails from 'wdk-client/Views/Strategy/NestedStepDetails';

interface Props extends StepBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StepDetailsDialog(props: Props) {
  const {
    isOpen,
    stepTree,
    nestedDisplayName,
    isNested,
    nestedId,
    isExpanded,
    onClose,
    onCollapseNestedStrategy,
    onExpandNestedStrategy,
  } = props;
  const { step } = stepTree;
  
  return (
    <Dialog
      className={cx("--StepDetails")}
      title={(
        <React.Fragment>
          <div>Details for "{nestedDisplayName || step.customName}"</div>
          <div className={cx("--StepActions")}>
            <div><button className="link" type="button" onClick={() => alert("TODO")}>Rename</button></div>
            <div><NavLink to={`/workspace/strategies/${step.strategyId}/${step.id}`}>View</NavLink></div>
            <div><button className="link" type="button" onClick={() => alert("TODO")}>Analyze</button></div>
            <div><button className="link" type="button" onClick={() => alert("TODO")}>Revise</button></div>
            <div><button className="link" type="button" disabled={isNested} onClick={() => alert("TODO")}>Make nested strategy</button></div>
            <div><button className="link" type="button" disabled={!isNested || !nestedId} onClick={() => {
              if (nestedId == null) return;
              if (isExpanded) onCollapseNestedStrategy(nestedId);
              else onExpandNestedStrategy(nestedId);
            }}>
              {isExpanded ? 'Hide nested' : 'Show nested'}
            </button></div>
            <div><button className="link" type="button" onClick={() => alert("TODO")}>Insert step before</button></div>
            <div><button className="link" type="button" onClick={() => alert("TODO")}>Delete</button></div>
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
}