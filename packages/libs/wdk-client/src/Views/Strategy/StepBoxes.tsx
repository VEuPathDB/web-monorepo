import React from 'react';
import { NavLink } from 'react-router-dom';
import { Step, StepTree } from 'wdk-client/Utils/WdkUser';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';

import './StepBoxes.css';

const cx = makeClassNameHelper('StepBoxes');

interface Props {
  steps: Record<number, Step>;
  stepTree: StepTree;
}

/**
 * Render each step of a strategy as a grid.
 */
export default function StepBoxes(props: Props) {
  const { stepTree, steps } = props;
  const expandedStepTree = findExpandedStepTree(stepTree, steps);
  return (
    <React.Fragment>
      <div className={cx()}>
        <StepTree {...props}/>
      </div>
      {expandedStepTree && <StepBoxes {...props} stepTree={expandedStepTree}/>}
    </React.Fragment>
  )
}

interface StepTreeProps {
  steps: Record<string, Step>;
  stepTree: StepTree;
  isChild?: boolean;
}

function StepTree(props: StepTreeProps) {
  const { stepTree, steps, isChild = false } = props;
  const step = steps[stepTree.stepId];

  // FIXME How should we handle this case?
  if (step == null) {
    return (
      <div>Oops... could not find a step</div>
    );
  }

  const { secondaryInput } = stepTree;

  return (
    <React.Fragment>
      {stepTree.primaryInput && <StepTree stepTree={stepTree.primaryInput} steps={steps} isChild/>}
      <div className={cx('--Slot')}>
        <Plugin
          context={{
            type: 'stepBox',
            name: step.searchName,
            searchName: step.searchName,
            recordClassName: step.recordClassName
          }}
          pluginProps={{
            step,
            hasPrimaryInput: stepTree.primaryInput != null,
            hasSecondaryInput: stepTree.secondaryInput != null,
            isChild
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
              step: steps[secondaryInput.stepId],
              hasPrimaryInput: secondaryInput.primaryInput != null,
              hasSecondaryInput: secondaryInput.secondaryInput != null,
              isChild
            }}
            defaultComponent={StepBox}
          />
        }
      </div>
    </React.Fragment>
  );
}

interface StepBoxProps {
  step: Step;
  hasPrimaryInput: boolean;
  hasSecondaryInput: boolean;
  isChild: boolean;
}

function StepBox(props: StepBoxProps) {
  const { hasPrimaryInput, hasSecondaryInput, step } = props;
  const StepComponent = hasPrimaryInput && hasSecondaryInput ? CombinedStepBoxContent
    : hasPrimaryInput ? TransformStepBoxContent
    : LeafStepBoxContent;
  const classModifier = hasPrimaryInput && hasSecondaryInput ? 'combined'
    : hasPrimaryInput ? 'transform'
    : 'leaf';
  return (
    <NavLink className={cx('--Box', classModifier)} activeClassName={cx('--Box', classModifier + '_active')} to={`/workspace/strategies/${step.strategyId}/${step.id}`} replace>
      <StepComponent {...props}/>
    </NavLink>
  );
}

function LeafStepBoxContent(props: StepBoxProps) {
  const { step } = props;
  return (
    <React.Fragment>
      <StepName step={step}/>
      <StepCount step={step}/>
    </React.Fragment>
  );
}

function TransformStepBoxContent(props: StepBoxProps) {
  const { step } = props;
  return (
    <React.Fragment>
      <StepName step={step}/>
      <StepCount step={step}/>
    </React.Fragment>
  );
}

function CombinedStepBoxContent(props: StepBoxProps) {
  const { step } = props;
  return (
    <React.Fragment>
      <CombinedStepIcon step={step}/>
      <StepCount step={step}/>
    </React.Fragment>
  );
}

function CombinedStepIcon(props: { step: Step }) {
  const { step } = props;
  return (
    <div className={cx('--CombineOperator', step.searchConfig.parameters.bq_operator)}/>
  );
}

function StepName(props: { step: Step }) {
  const { step } = props;
  return <div className={cx('--StepName')}>{step.customName}</div>;
}

function StepCount(props: { step: Step }) {
  const { step } = props;
  return <div className={cx('--StepCount')}>{step.estimatedSize.toLocaleString()} {step.recordClassName}</div>
}

function findExpandedStepTree(stepTree: StepTree, steps: Record<number, Step>): StepTree | undefined {
  // TODO Find first collapsible step that is expanded
  return undefined;
}
