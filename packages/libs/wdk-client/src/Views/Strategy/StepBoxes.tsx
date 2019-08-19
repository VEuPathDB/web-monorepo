import { toUpper, noop } from 'lodash';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Tooltip from 'wdk-client/Components/Overlays/Tooltip';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { Step, StepTree } from 'wdk-client/Utils/WdkUser';
import { StepBoxesProps, StepBoxProps, isTransformUiStepTree, isCombineUiStepTree } from 'wdk-client/Views/Strategy/Types';
import StepDetailsDialog from 'wdk-client/Views/Strategy/StepDetailsDialog';
import { cxStepBoxes as cx } from 'wdk-client/Views/Strategy/ClassNames';
import { useBinaryStepBoxClassName } from 'wdk-client/Utils/Operations';

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
            type="button" onClick={() => props.onShowInsertStep({ type: 'append', primaryInputStepId: props.stepTree.step.id })}
          ><i className="fa fa-plus"/> Extend your search strategy</button>
        </Tooltip>
      </div>
      <ExpandedSteps {...props}/>
    </React.Fragment>
  )
}

/**
 * Recursively render the step tree. Steps are rendered into "slots", where a
 * slot contains a primary input and its secondary input if it has one (the
 * left-most rendered step, and transforms, do not have seondary inputs)
 *
 * We also close over provided handlers with the appropriate step id and
 * sequence of actions.
 */
function StepTree(props: StepBoxesProps) {
  const {
    stepTree,
    isDeleteable = true
  } = props;
  const { step, primaryInput, secondaryInput, question } = stepTree;
  // primary input is deleteable if the current step accepts
  // the record type of the primary input's primary input record type,
  // or if the primary input does not have a primary input.
  const primaryInputIsDeletable = primaryInput != null && question.allowedPrimaryInputRecordClassNames != null && (
    primaryInput.primaryInput == null ||
    question.allowedPrimaryInputRecordClassNames.includes(primaryInput.primaryInput.step.recordClassName)
  )

  return (
    <React.Fragment>
      {primaryInput && <StepTree {...props} stepTree={primaryInput} isDeleteable={primaryInputIsDeletable} />}
      <div className={cx('--Slot')}>
        <Plugin<StepBoxProps>
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
            isDeleteable,
            renameStep: (newName: string) => props.onRenameStep(step.id, newName),
            // no-op; primary inputs cannot be nested
            makeNestedStrategy: noop,
            makeUnnestStrategy: noop,
            collapseNestedStrategy: noop,
            expandNestedStrategy: noop,
            showNewAnalysisTab: () => props.onAnalyzeStep(),
            showReviseForm: () => props.setReviseFormStepId(step.id),
            insertStepBefore: () => props.onShowInsertStep({ type: 'insert-before', outputStepId: step.id }),
            deleteStep: () => props.onDeleteStep(step.id)
          }}
          defaultComponent={StepBox}
        />
        {secondaryInput &&
          <Plugin<StepBoxProps>
            context={{
              type: 'stepBox',
              name: secondaryInput.step.searchName,
              searchName: secondaryInput.step.searchName,
              recordClassName: secondaryInput.step.recordClassName
            }}
            pluginProps={{
              stepTree: secondaryInput,
              isNested: secondaryInput.isNested,
              isExpanded: step.expanded,
              isDeleteable,
              renameStep: (newName: string) => {
                if (secondaryInput.isNested) {
                  props.onRenameNestedStrategy(step.id, newName);
                }
                else {
                  props.onRenameStep(secondaryInput.step.id, newName);
                }
              },
              makeNestedStrategy: () => {
                props.onMakeNestedStrategy(step.id);
                props.onExpandNestedStrategy(step.id);
              },
              makeUnnestStrategy: () => {
                props.onMakeUnnestedStrategy(step.id);
                props.onCollapseNestedStrategy(step.id);
                // Use empty string to indicate that the step should not be rendered as a nested strategy
                props.onRenameNestedStrategy(step.id, '');
              },
              collapseNestedStrategy: () => {
                props.onCollapseNestedStrategy(step.id);
              },
              expandNestedStrategy: () => {
                props.onExpandNestedStrategy(step.id);
              },
              showNewAnalysisTab: () => props.onAnalyzeStep(),
              showReviseForm: () => props.setReviseFormStepId(secondaryInput.step.id),
              insertStepBefore: () => props.onShowInsertStep({ type: 'insert-before', outputStepId: step.id }),
              deleteStep: () => props.onDeleteStep(step.id)
            }}
            defaultComponent={StepBox}
          />
        }
      </div>
    </React.Fragment>
  );
}

function StepBox(props: StepBoxProps) {
  const [ detailVisibility, setDetailVisibility ] = useState(false);
  const { isNested, stepTree } = props;
  const { step, color } = stepTree;

  const StepComponent = isCombineUiStepTree(stepTree) && !isNested ? CombineStepBoxContent
    : isTransformUiStepTree(stepTree) && !isNested ? TransformStepBoxContent
    : LeafStepBoxContent;
  const classModifier = isCombineUiStepTree(stepTree) && !isNested ? 'combined'
    : isTransformUiStepTree(stepTree) && !isNested ? 'transform'
    : 'leaf';
  const nestedModifier = isNested ? 'nested' : '';
  const borderColor = isNested && stepTree.nestedControlStep && stepTree.nestedControlStep.expanded ? color : undefined;

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
  );

  const filterIcon = step.isFiltered && (
    <i className={`${cx('--FilterIcon')} fa fa-filter`}/>
  );

  const title = step.validation.isValid ? undefined : 'This step is no longer valid and must be revised to view results.';

  return (
    <div title={title} className={cx("--Box", step.validation.isValid ? 'valid' : 'invalid')}>
      <NavLink
        replace
        style={{ borderColor }}
        className={cx("--BoxLink", classModifier, nestedModifier)}
        activeClassName={cx("--BoxLink", classModifier + "_active")}
        to={`/workspace/strategies/${step.strategyId}/${step.id}`}
      >
        <StepComponent {...props} />
      </NavLink>
      {editButton}
      {stepDetails}
      {filterIcon}
    </div>
  );
}

function LeafStepBoxContent(props: StepBoxProps) {
  const { stepTree, isNested } = props;
  const { step, recordClass, nestedControlStep } = stepTree;
  return (
    <React.Fragment>
      <StepName step={step} nestedControlStep={isNested ? nestedControlStep : undefined} />
      <StepCount step={step} recordClass={recordClass}/>
    </React.Fragment>
  );
}

function TransformStepBoxContent(props: StepBoxProps) {
  const { step, recordClass } = props.stepTree;
  return (
    <React.Fragment>
      <div className={cx('--TransformInputArrow')}>&#9654;</div>
      <StepName step={step}/>
      <StepCount step={step} recordClass={recordClass}/>
    </React.Fragment>
  );
}

function CombineStepBoxContent(props: StepBoxProps) {
  const { step, recordClass } = props.stepTree;
  return (
    <React.Fragment>
      <CombinedStepIcon step={step} />
      <StepCount step={step} recordClass={recordClass}/>
    </React.Fragment>
  );
}

function CombinedStepIcon(props: { step: Step }) {
  const { step } = props;
  const operatorClassName = useBinaryStepBoxClassName(step);

  return (
    <div className={operatorClassName}>
      <div className={cx('--CombinePrimaryInputArrow')}>&#9654;</div>
      <div className={cx('--CombineSecondaryInputArrow')}>&#9660;</div>
    </div>
  );
}

function StepName(props: { step: Step, nestedControlStep?: Step }) {
  const { step, nestedControlStep } = props;
  const displayName = nestedControlStep && nestedControlStep.expandedName || step.customName;
  return <div className={cx('--StepName')}>{displayName}</div>;
}

function StepCount(props: { step: Step, recordClass: RecordClass }) {
  const { step, recordClass } = props;
  const recordClassDisplayName = recordClass && (
    step.estimatedSize === 1 ? recordClass.shortDisplayName : recordClass.shortDisplayNamePlural
  );
  const count = step.estimatedSize != null ? step.estimatedSize.toLocaleString() : '?';
  return <div className={cx('--StepCount')}>{count} {recordClassDisplayName}</div>
}

/**
 * Recurisvely render expanded steps
 */
export function ExpandedSteps(props: StepBoxesProps) {
  const { stepTree } = props;

  if (stepTree == null || stepTree == null) return null;

  return (
    <React.Fragment>
      {stepTree.primaryInput && <ExpandedSteps {...props} stepTree={stepTree.primaryInput}/>}
      {stepTree.secondaryInput && stepTree.secondaryInput.isNested && stepTree.step.expanded && (
        <React.Fragment>
          <div className="StrategyPanel--NestedTitle">Expanded view of <em>{stepTree.step.expandedName || stepTree.secondaryInput.step.customName}</em> <button className="link" type="button" onClick={() => props.onCollapseNestedStrategy(stepTree.step.id)}>close</button></div>
          <div className="StrategyPanel--Panel" style={{ display: 'block', boxShadow: `0 0 0 2px ${stepTree.secondaryInput.color}` }}>
            <StepBoxes {...props} stepTree={stepTree.secondaryInput}/>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

