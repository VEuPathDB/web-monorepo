import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Tooltip from 'wdk-client/Components/Overlays/Tooltip';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { Step, StepTree } from 'wdk-client/Utils/WdkUser';
import { UiStepTree, StepBoxesProps } from 'wdk-client/Views/Strategy/Types';
import StepDetailsDialog from 'wdk-client/Views/Strategy/StepDetailsDialog';
import { cxStepBoxes as cx } from 'wdk-client/Views/Strategy/ClassNames';

/**
 * Render each step of a strategy as a grid.
 */
export default function StepBoxes(props: StepBoxesProps) {
  return (
    <React.Fragment>
      <div className={cx()}>
        <StepTree {...props}/>
        <Tooltip
          position={{ my: 'top center', at: 'bottom center' }}
          content="Combine the results of your strategy with the results of a new search, or convert the results of your strategy with available data transformations."
        >
          <button
            className={cx('--InsertStepButton')}
            type="button" onClick={() => props.onShowInsertStep(props.stepTree.step.id)}
          >Continue building</button>
        </Tooltip>
      </div>
      <ExpandedSteps {...props}/>
    </React.Fragment>
  )
}

function StepTree(props: StepBoxesProps) {
  const { stepTree } = props;
  const { step, primaryInput, secondaryInput } = stepTree;

  // FIXME How should we handle this case?
  if (step == null) {
    return (
      <div>Oops... could not find a step</div>
    );
  }

  return (
    <React.Fragment>
      {primaryInput && <StepTree {...props} stepTree={primaryInput} />}
      <div className={cx('--Slot')}>
        <Plugin
          context={{
            type: 'stepBox',
            name: step.searchName,
            searchName: step.searchName,
            recordClassName: step.recordClassName
          }}
          pluginProps={{
            ...props,
            stepTree,
            isNested: false,
            isExpanded: false,
          }}
          defaultComponent={StepBox}
        />
        {secondaryInput &&
          <Plugin
            context={{
              type: 'stepBox',
              name: step.searchName,
              searchName: step.searchName,
              recordClassName: step.recordClassName
            }}
            pluginProps={{
              ...props,
              stepTree: secondaryInput,
              nestedId: step.id,
              isNested: step.expandedName != null && step.expandedName !== step.customName,
              isExpanded: step.expandedName != null && step.expanded,
              nestedDisplayName: step.expandedName,
            }}
            defaultComponent={StepBox}
          />
        }
      </div>
    </React.Fragment>
  );
}

interface StepBoxProps extends StepBoxesProps {
  nestedId?: number;
  isNested: boolean;
  isExpanded: boolean;
  nestedDisplayName?: string;
}

function StepBox(props: StepBoxProps) {
  const [ detailVisibility, setDetailVisibility ] = useState(false);
  const { stepTree, isNested, nestedId, isExpanded, onCollapseNestedStrategy, onExpandNestedStrategy, nestedDisplayName } = props;
  const { step, primaryInput, secondaryInput, color } = stepTree;
  const StepComponent = primaryInput && secondaryInput && !isNested ? CombinedStepBoxContent
    : primaryInput && !isNested ? TransformStepBoxContent
    : LeafStepBoxContent;
  const classModifier = primaryInput && secondaryInput && !isNested ? 'combined'
    : primaryInput && !isNested ? 'transform'
    : 'leaf';
  const nestedModifier = isNested ? 'nested' : '';

  const editButton = (
    <button
      type="button"
      onClick={() => setDetailVisibility(true)}
      className={cx("--EditButton")}
    >
      <div style={{ fontSize: '.8em'}}>Edit</div>
    </button>
  );

  const stepDetails = (
    <StepDetailsDialog {...props} isOpen={detailVisibility} onClose={() => setDetailVisibility(false)}/>
  )

  return (
    <div className={cx("--Box")}>
      <NavLink
        replace
        style={isExpanded ? { borderColor: color } : {}}
        className={cx("--BoxLink", classModifier, nestedModifier)}
        activeClassName={cx("--BoxLink", classModifier + "_active")}
        to={`/workspace/strategies/${step.strategyId}/${step.id}`}
      >
        <StepComponent {...props} />
      </NavLink>
      {editButton}
      {stepDetails}
    </div>
  );
}

function LeafStepBoxContent(props: StepBoxProps) {
  const { stepTree, isNested, nestedDisplayName } = props;
  const { step, recordClass } = stepTree;
  return (
    <React.Fragment>
      <StepName step={step} nestedDisplayName={isNested ? nestedDisplayName : undefined}/>
      <StepCount step={step} recordClass={recordClass}/>
    </React.Fragment>
  );
}

function TransformStepBoxContent(props: StepBoxProps) {
  const { step, recordClass } = props.stepTree;
  return (
    <React.Fragment>
      <StepName step={step}/>
      <StepCount step={step} recordClass={recordClass}/>
    </React.Fragment>
  );
}

function CombinedStepBoxContent(props: StepBoxProps) {
  const { step, recordClass } = props.stepTree;
  return (
    <React.Fragment>
      <CombinedStepIcon step={step}/>
      <StepCount step={step} recordClass={recordClass}/>
    </React.Fragment>
  );
}

function CombinedStepIcon(props: { step: Step }) {
  const { step } = props;
  return (
    <div className={cx('--CombineOperator', step.searchConfig.parameters.bq_operator)}/>
  );
}

function StepName(props: { step: Step, nestedDisplayName?: string }) {
  const { step, nestedDisplayName } = props;
  return <div className={cx('--StepName')}>{nestedDisplayName || step.customName}</div>;
}

function StepCount(props: { step: Step, recordClass: RecordClass }) {
  const { step, recordClass } = props;
  const recordClassDisplayName = recordClass && (
    step.estimatedSize === 1 ? recordClass.shortDisplayName : recordClass.shortDisplayNamePlural
  );
  return <div className={cx('--StepCount')}>{step.estimatedSize.toLocaleString()} {recordClassDisplayName}</div>
}

interface ExpandedStepProps {
  stepTree?: UiStepTree;
  onShowInsertStep: (stepId: number) => void;
  onHideInsertStep: () => void;
  onExpandNestedStrategy: (stepId: number) => void;
  onCollapseNestedStrategy: (stepId: number) => void;
}

/**
 * Recurisvely render expanded steps
 */
export function ExpandedSteps(props: ExpandedStepProps) {
  const { stepTree } = props;

  if (stepTree == null || stepTree == null) return null;

  return (
    <React.Fragment>
      <ExpandedSteps {...props} stepTree={stepTree.primaryInput}/>
      {stepTree.secondaryInput && stepTree.step.expanded && (
        <React.Fragment>
          <div className="StrategyPanel--NestedTitle">Expanded view of <em>{stepTree.step.expandedName}</em> <button className="link" type="button" onClick={() => props.onCollapseNestedStrategy(stepTree.step.id)}>close</button></div>
          <div className="StrategyPanel--Panel" style={{ display: 'block', boxShadow: `0 0 0 2px ${stepTree.secondaryInput.color}` }}>
            <StepBoxes {...props} stepTree={stepTree.secondaryInput}/>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

