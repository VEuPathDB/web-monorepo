import React from 'react';
import { NavLink } from 'react-router-dom';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { Step, StepTree } from 'wdk-client/Utils/WdkUser';
import { UiStepTree } from 'wdk-client/Views/Strategy/Types';
import './StepBoxes.css';


const cx = makeClassNameHelper('StepBoxes');

interface Props {
  stepTree: UiStepTree;
  onShowInsertStep: (stepId: number) => void;
  onHideInsertStep: () => void;
  onExpandNestedStrategy: (stepId: number) => void;
  onCollapseNestedStrategy: (stepId: number) => void;
}

/**
 * Render each step of a strategy as a grid.
 */
export default function StepBoxes(props: Props) {
  return (
    <React.Fragment>
      <div className={cx()}>
        <StepTree {...props}/>
        <button type="button" onClick={() => props.onShowInsertStep(props.stepTree.step.id)}>Continue building</button>
      </div>
      <ExpandedSteps {...props}/>
    </React.Fragment>
  )
}

interface StepTreeProps {
  stepTree: UiStepTree;
}

function StepTree(props: StepTreeProps) {
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
      {primaryInput && <StepTree stepTree={primaryInput} />}
      <div className={cx('--Slot')}>
        <Plugin
          context={{
            type: 'stepBox',
            name: step.searchName,
            searchName: step.searchName,
            recordClassName: step.recordClassName
          }}
          pluginProps={{
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
              stepTree: secondaryInput,
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

interface StepBoxProps {
  stepTree: UiStepTree,
  isNested: boolean;
  isExpanded: boolean;
  nestedDisplayName?: string;
}

function StepBox(props: StepBoxProps) {
  const { stepTree, isNested, isExpanded } = props;
  const { step, primaryInput, secondaryInput, color } = stepTree;
  const StepComponent = primaryInput && secondaryInput && !isNested ? CombinedStepBoxContent
    : primaryInput && !isNested ? TransformStepBoxContent
    : LeafStepBoxContent;
  const classModifier = primaryInput && secondaryInput && !isNested ? 'combined'
    : primaryInput && !isNested ? 'transform'
    : 'leaf';
  const nestedModifier = isNested ? 'nested' : '';
  return (
    <NavLink
      replace
      style={ isExpanded ? { borderColor: color } : {}}
      className={cx('--Box', classModifier, nestedModifier)}
      activeClassName={cx('--Box', classModifier + '_active')}
      to={`/workspace/strategies/${step.strategyId}/${step.id}`}
    >
      <StepComponent {...props}/>
    </NavLink>
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
