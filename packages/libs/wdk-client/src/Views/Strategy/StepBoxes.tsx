import { noop } from 'lodash';
import React, { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Tooltip } from '@veupathdb/coreui';
import { Plugin } from '../../Utils/ClientPlugin';
import { RecordClass } from '../../Utils/WdkModel';
import { Step } from '../../Utils/WdkUser';
import { makeStepBoxDisplayName } from '../../Views/Strategy/StrategyUtils';
import {
  StepBoxesProps,
  StepBoxProps,
  isTransformUiStepTree,
  isCombineUiStepTree,
  isCompleteUiStepTree,
  PartialUiStepTree,
  isPartialCombineUiStepTree,
} from '../../Views/Strategy/Types';
import StepDetailsDialog from '../../Views/Strategy/StepDetailsDialog';
import { cxStepBoxes as cx } from '../../Views/Strategy/ClassNames';
import { useBinaryStepBoxClassName } from '../../Utils/Operations';

import { TransformIcon } from '../../Views/Strategy/TransformIcon';

const INVALID_SEARCH_TITLE =
  'This step refers to a search that is no longer valid. In order to fix your strategy, this step must be deleted.';
const INVALID_PARAMS_TITLE =
  'This step contains a configuration that is no longer valid and must be revised to view results.';
const INVALID_NESTED_TITLE =
  'This nested strategy contains a step that is no longer valid. Expand this nested strategy to see which steps need to be updated.';

export const ADD_STEP_BUTTON_VERBIAGE =
  'Combine the results of your strategy with the results of a new search, or convert the results of your strategy with available data transformations.';

/**
 * Render each step of a strategy as a grid.
 */
export default function StepBoxes(props: StepBoxesProps) {
  return (
    <React.Fragment>
      <div className={cx()}>
        <StepTree {...props} />
        <Tooltip placement="bottom" title={ADD_STEP_BUTTON_VERBIAGE}>
          <button
            className={cx('--InsertStepButton')}
            type="button"
            onClick={() =>
              props.onShowInsertStep({
                type: 'append',
                stepId: props.stepTree.step.id,
              })
            }
          >
            <i className="fa fa-plus" /> <div>Add a step</div>
          </button>
        </Tooltip>
      </div>
      <ExpandedSteps {...props} />
    </React.Fragment>
  );
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
  const { stepTree, isDeleteable = true } = props;

  if (!isCompleteUiStepTree(stepTree)) {
    return (
      <UnknownQuestionStepBox
        stepTree={stepTree}
        deleteStep={() => props.onDeleteStep(stepTree.step.id)}
      />
    );
  }

  const { step, primaryInput, secondaryInput, question, areInputsValid } =
    stepTree;

  // primary input is deleteable if the current step accepts
  // the record type of the primary input's primary input record type,
  // or if the primary input does not have a primary input.
  const primaryInputIsDeletable =
    primaryInput != null &&
    question.allowedPrimaryInputRecordClassNames != null &&
    (primaryInput.primaryInput == null ||
      question.allowedPrimaryInputRecordClassNames.includes(
        primaryInput.primaryInput.step.recordClassName
      ));

  return (
    <React.Fragment>
      {primaryInput && (
        <StepTree
          {...props}
          stepTree={primaryInput}
          isDeleteable={primaryInputIsDeletable}
        />
      )}
      <div className={cx('--Slot')}>
        <Plugin
          context={{
            type: 'stepBox',
            name: step.searchName,
            searchName: step.searchName,
            recordClassName: step.recordClassName,
          }}
          pluginProps={{
            stepTree,
            isAnalyzable: question.isAnalyzable,
            isNested: false,
            isExpanded: false,
            areInputsValid,
            isDeleteable,
            renameStep: (newName: string) =>
              props.onRenameStep(step.id, newName),
            // no-op; primary inputs cannot be nested
            makeNestedStrategy: noop,
            makeUnnestStrategy: noop,
            collapseNestedStrategy: noop,
            expandNestedStrategy: noop,
            showNewAnalysisTab: () => props.onAnalyzeStep(),
            showReviseForm: () => props.setReviseFormStepId(step.id),
            insertStepBefore: (
              selectedOperation?: string,
              pageHistory?: string[]
            ) =>
              props.onShowInsertStep({
                type: 'insert-before',
                stepId: step.id,
                selectedOperation,
                pageHistory,
              }),
            insertStepAfter: (
              selectedOperation?: string,
              pageHistory?: string[]
            ) =>
              props.onShowInsertStep({
                type: 'append',
                stepId: step.id,
                selectedOperation,
                pageHistory,
              }),
            deleteStep: () => props.onDeleteStep(step.id),
          }}
          defaultComponent={StepBox}
        />
        {secondaryInput &&
          (!isCompleteUiStepTree(secondaryInput) ? (
            <UnknownQuestionStepBox
              stepTree={secondaryInput}
              deleteStep={() => props.onDeleteStep(secondaryInput.step.id)}
            />
          ) : (
            <Plugin
              context={{
                type: 'stepBox',
                name: secondaryInput.step.searchName,
                searchName: secondaryInput.step.searchName,
                recordClassName: secondaryInput.step.recordClassName,
              }}
              pluginProps={{
                stepTree: secondaryInput,
                isAnalyzable: secondaryInput.question.isAnalyzable,
                isNested: secondaryInput.isNested,
                areInputsValid: secondaryInput.areInputsValid,
                isExpanded: step.expanded,
                isDeleteable,
                renameStep: (newName: string) => {
                  if (secondaryInput.isNested) {
                    props.onRenameNestedStrategy(step.id, newName);
                  } else {
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
                showReviseForm: () =>
                  props.setReviseFormStepId(secondaryInput.step.id),
                insertStepBefore: (
                  selectedOperation?: string,
                  pageHistory?: string[]
                ) =>
                  props.onShowInsertStep({
                    type: 'insert-before',
                    stepId: step.id,
                    selectedOperation,
                    pageHistory,
                  }),
                insertStepAfter: (
                  selectedOperation?: string,
                  pageHistory?: string[]
                ) =>
                  props.onShowInsertStep({
                    type: 'append',
                    stepId: secondaryInput.step.id,
                    selectedOperation,
                    pageHistory,
                  }),
                deleteStep: () =>
                  props.onDeleteStep(step.id, secondaryInput.isNested),
              }}
              defaultComponent={StepBox}
            />
          ))}
        <div className={cx('--SlotLabel')}>Step {stepTree.slotNumber}</div>
      </div>
    </React.Fragment>
  );
}

export function LeafPreview() {
  return (
    <div className={cx('--Box', 'valid')}>
      <div className={cx('--BoxLink', 'leaf', 'new-step-preview')}></div>
    </div>
  );
}

export const combinedPreviewFactory = (operatorClassName: string) => () =>
  (
    <div className={cx('--Box', 'valid')}>
      <div className={cx('--BoxLink', 'combined', 'new-step-preview')}>
        <div className={operatorClassName}>
          <div className={cx('--CombinePrimaryInputArrow')}></div>
          <div className={cx('--CombineSecondaryInputArrow')}></div>
        </div>
        <div className={cx('--StepCount')}></div>
      </div>
    </div>
  );

export const BooleanPreview = combinedPreviewFactory(
  cx('--CombineOperator', 'PREVIEW')
);

export function TransformPreview() {
  return (
    <div className={cx('--Box', 'valid')}>
      <div className={cx('--BoxLink', 'transform', 'new-step-preview')}>
        <div className={cx('--TransformInputArrow')}></div>
        <TransformIcon isPreview />
        <div className={cx('--TransformDetails')}>
          <div className={cx('--StepName')}></div>
          <div className={cx('--StepCount')}></div>
        </div>
      </div>
    </div>
  );
}

function UnknownQuestionStepBox({
  stepTree,
  deleteStep,
}: {
  stepTree: PartialUiStepTree;
  deleteStep: () => void;
}) {
  const deleteButton = (
    <button
      type="button"
      onClick={() => deleteStep()}
      className={cx('--EditButton')}
    >
      <div style={{ fontSize: '.8em' }}>Delete</div>
    </button>
  );
  return (
    <div title={INVALID_SEARCH_TITLE} className={cx('--Box', 'invalid')}>
      <div className={cx('--BoxLink', 'leaf')}>
        <StepName
          step={stepTree.step}
          isCombine={isPartialCombineUiStepTree(stepTree)}
        />
        <StepCount step={stepTree.step} recordClass={stepTree.recordClass} />
      </div>
      {deleteButton}
    </div>
  );
}

type PreviewStepBoxesProps = {
  stepTree: PartialUiStepTree;
  fromSlot: number;
  toSlot: number;
  insertType: 'append' | 'insert-before';
  insertAtSlot: number;
  newOperationStepBox: ReactNode;
  newInputStepBox: ReactNode;
};

const existingStepPreviewProps = {
  isAnalyzable: false,
  isExpanded: false,
  isDeleteable: false,
  renameStep: noop,
  makeNestedStrategy: noop,
  makeUnnestStrategy: noop,
  collapseNestedStrategy: noop,
  expandNestedStrategy: noop,
  showNewAnalysisTab: noop,
  showReviseForm: noop,
  insertStepBefore: noop,
  insertStepAfter: noop,
  deleteStep: noop,
};

export function PreviewStepBoxes(props: PreviewStepBoxesProps) {
  const previewModifier =
    props.insertType === 'append'
      ? 'appending-step'
      : props.insertAtSlot > 1
      ? 'inserting-between-steps'
      : 'prepending-step';

  return (
    <div className={cx('', 'preview', previewModifier)}>
      <PreviewStepTree {...props} />
    </div>
  );
}

/**
 * Recursively render the step tree. Steps are rendered into "slots", where a
 * slot contains a primary input and its secondary input if it has one (the
 * left-most rendered step, and transforms, do not have seondary inputs)
 *
 * We also close over provided handlers with the appropriate step id and
 * sequence of actions.
 */
function PreviewStepTree(props: PreviewStepBoxesProps) {
  const {
    stepTree,
    fromSlot,
    toSlot,
    insertType,
    insertAtSlot,
    newInputStepBox,
    newOperationStepBox,
  } = props;

  if (!isCompleteUiStepTree(stepTree)) {
    return <UnknownQuestionStepBox stepTree={stepTree} deleteStep={noop} />;
  }

  const { step, primaryInput, secondaryInput, areInputsValid } = stepTree;

  const existingStepBox = (
    <Plugin
      context={{
        type: 'stepBox',
        name: step.searchName,
        searchName: step.searchName,
        recordClassName: step.recordClassName,
      }}
      pluginProps={{
        stepTree,
        isNested: false,
        areInputsValid,
        ...existingStepPreviewProps,
      }}
      defaultComponent={ExistingStepPreviewBox}
    />
  );

  const existingStepSecondaryInputBox =
    secondaryInput &&
    (!isCompleteUiStepTree(secondaryInput) ? (
      <UnknownQuestionStepBox stepTree={secondaryInput} deleteStep={noop} />
    ) : (
      <Plugin
        context={{
          type: 'stepBox',
          name: secondaryInput.step.searchName,
          searchName: secondaryInput.step.searchName,
          recordClassName: secondaryInput.step.recordClassName,
        }}
        pluginProps={{
          stepTree: secondaryInput,
          isNested: secondaryInput.isNested,
          areInputsValid: secondaryInput.areInputsValid,
          ...existingStepPreviewProps,
        }}
        defaultComponent={ExistingStepPreviewBox}
      />
    ));

  const shouldRenderExistingSlotContent =
    fromSlot <= stepTree.slotNumber && stepTree.slotNumber <= toSlot;

  return (
    <React.Fragment>
      {primaryInput && <PreviewStepTree {...props} stepTree={primaryInput} />}
      {shouldRenderExistingSlotContent ? (
        <SlotContent
          insertType={insertType}
          insertAtSlot={insertAtSlot}
          currentSlot={stepTree.slotNumber}
          existingStepBox={existingStepBox}
          existingStepSecondaryInputBox={existingStepSecondaryInputBox}
          newInputStepBox={newInputStepBox}
          newOperationStepBox={newOperationStepBox}
        />
      ) : (
        <div className={cx('--Slot')}></div>
      )}
    </React.Fragment>
  );
}

type SlotContentProps = {
  insertType: 'append' | 'insert-before';
  insertAtSlot: number;
  currentSlot: number;
  existingStepBox: ReactNode;
  existingStepSecondaryInputBox: ReactNode;
  newOperationStepBox: ReactNode;
  newInputStepBox: ReactNode;
};

function SlotContent({
  insertType,
  insertAtSlot,
  currentSlot,
  existingStepBox,
  existingStepSecondaryInputBox,
  newOperationStepBox,
  newInputStepBox,
}: SlotContentProps) {
  if (currentSlot !== insertAtSlot) {
    return (
      <React.Fragment>
        <div className={cx('--Slot')}>
          {existingStepBox}
          {existingStepSecondaryInputBox}
          <div className={cx('--SlotLabel')}>
            Step {currentSlot > insertAtSlot ? currentSlot + 1 : currentSlot}
          </div>
        </div>
      </React.Fragment>
    );
  } else if (insertType === 'append') {
    return (
      <React.Fragment>
        <div className={cx('--Slot')}>
          {existingStepBox}
          {existingStepSecondaryInputBox}
          <div className={cx('--SlotLabel')}>Step {currentSlot}</div>
        </div>
        <div className={cx('--Slot')}>
          {newOperationStepBox}
          {newInputStepBox}
          <div className={cx('--SlotLabel')}>Step {currentSlot + 1}</div>
        </div>
      </React.Fragment>
    );
  } else if (insertAtSlot >= 2) {
    return (
      <React.Fragment>
        <div className={cx('--Slot')}>
          {newOperationStepBox}
          {newInputStepBox}
          <div className={cx('--SlotLabel')}>Step {currentSlot}</div>
        </div>
        <div className={cx('--Slot')}>
          {existingStepBox}
          {existingStepSecondaryInputBox}
          <div className={cx('--SlotLabel')}>Step {currentSlot + 1}</div>
        </div>
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <div className={cx('--Slot')}>
          {newInputStepBox}
          <div className={cx('--SlotLabel')}>Step 1</div>
        </div>
        <div className={cx('--Slot')}>
          {newOperationStepBox}
          {existingStepBox}
          <div className={cx('--SlotLabel')}>Step 2</div>
        </div>
      </React.Fragment>
    );
  }
}

const stepBoxFactory = (isPreview: boolean) => (props: StepBoxProps) => {
  const { isNested, areInputsValid, stepTree, deleteStep, showReviseForm } =
    props;
  const { step, color, primaryInput, secondaryInput } = stepTree;

  const [isDetailVisible, setDetailVisibility] = useState(false);

  const StepComponent =
    isCombineUiStepTree(stepTree) && !isNested
      ? CombineStepBoxContent
      : isTransformUiStepTree(stepTree) && !isNested
      ? TransformStepBoxContent
      : LeafStepBoxContent;
  const classModifier =
    isCombineUiStepTree(stepTree) && !isNested
      ? 'combined'
      : isTransformUiStepTree(stepTree) && !isNested
      ? 'transform'
      : 'leaf';
  const nestedModifier = isNested ? 'nested' : '';
  const previewModifier = isPreview ? 'existing-step-preview' : '';
  const borderColor =
    isNested &&
    stepTree.nestedControlStep &&
    stepTree.nestedControlStep.expanded
      ? color
      : undefined;
  const allowRevise = !isNested && !isCombineUiStepTree(stepTree);

  const hasValidSearch =
    (primaryInput == null || isCompleteUiStepTree(primaryInput)) &&
    (secondaryInput == null || isCompleteUiStepTree(secondaryInput));

  const editButton = isPreview ? null : hasValidSearch || isNested ? (
    <button
      type="button"
      onClick={
        !step.validation.isValid && allowRevise
          ? () => showReviseForm()
          : () => setDetailVisibility(true)
      }
      className={cx('--EditButton')}
    >
      <div style={{ fontSize: '.8em' }}>Edit</div>
    </button>
  ) : (
    <button
      type="button"
      onClick={() => deleteStep()}
      className={cx('--EditButton')}
    >
      <div style={{ fontSize: '.8em' }}>Delete</div>
    </button>
  );

  const stepDetails = isPreview ? null : (
    <StepDetailsDialog
      {...props}
      allowRevise={allowRevise}
      isOpen={isDetailVisible}
      onClose={() => setDetailVisibility(false)}
    />
  );

  const filterIcon = step.isFiltered && (
    <i className={`${cx('--FilterIcon')} fa fa-filter`} />
  );

  const title = !hasValidSearch
    ? INVALID_SEARCH_TITLE
    : !step.validation.isValid
    ? INVALID_PARAMS_TITLE
    : isNested && !areInputsValid
    ? INVALID_NESTED_TITLE
    : undefined;

  const isValid = step.validation.isValid && (isNested ? areInputsValid : true);

  return (
    <div title={title} className={cx('--Box', isValid ? 'valid' : 'invalid')}>
      <NavLink
        replace
        style={{ borderColor }}
        className={cx(
          '--BoxLink',
          classModifier,
          nestedModifier,
          previewModifier
        )}
        activeClassName={cx('--BoxLink', classModifier + '_active')}
        to={`/workspace/strategies/${step.strategyId}/${step.id}`}
        onClick={(e) => {
          if (isPreview) {
            e.preventDefault();
          }
        }}
      >
        <StepComponent {...props} />
      </NavLink>
      {editButton}
      {stepDetails}
      {filterIcon}
    </div>
  );
};

const StepBox = stepBoxFactory(false);
const ExistingStepPreviewBox = stepBoxFactory(true);

function LeafStepBoxContent(props: StepBoxProps) {
  const { stepTree, isNested } = props;
  const { step, recordClass, nestedControlStep } = stepTree;
  return (
    <React.Fragment>
      <StepName
        step={step}
        isCombine={isPartialCombineUiStepTree(stepTree)}
        nestedControlStep={isNested ? nestedControlStep : undefined}
      />
      <StepCount step={step} recordClass={recordClass} />
    </React.Fragment>
  );
}

function TransformStepBoxContent(props: StepBoxProps) {
  const { step, recordClass } = props.stepTree;
  return (
    <React.Fragment>
      <div className={cx('--TransformInputArrow')}></div>
      <TransformIcon />
      <div className={cx('--TransformDetails')}>
        <StepName
          step={step}
          isCombine={isPartialCombineUiStepTree(props.stepTree)}
        />
        <StepCount step={step} recordClass={recordClass} />
      </div>
    </React.Fragment>
  );
}

function CombineStepBoxContent(props: StepBoxProps) {
  const { step, recordClass } = props.stepTree;
  return (
    <React.Fragment>
      <CombinedStepIcon step={step} />
      <StepCount step={step} recordClass={recordClass} />
    </React.Fragment>
  );
}

function CombinedStepIcon(props: { step: Step }) {
  const { step } = props;
  const operatorClassName = useBinaryStepBoxClassName(step);

  return (
    <div className={operatorClassName}>
      <div className={cx('--CombinePrimaryInputArrow')}></div>
      <div className={cx('--CombineSecondaryInputArrow')}></div>
    </div>
  );
}

function StepName(props: {
  step: Step;
  isCombine: boolean;
  nestedControlStep?: Step;
}) {
  const { step, isCombine, nestedControlStep } = props;
  const displayName = makeStepBoxDisplayName(
    step,
    isCombine,
    nestedControlStep
  );
  return <div className={cx('--StepName')}>{displayName}</div>;
}

function StepCount(props: { step: Step; recordClass?: RecordClass }) {
  const { step, recordClass } = props;
  const recordClassDisplayName =
    recordClass &&
    (step.estimatedSize === 1
      ? recordClass.shortDisplayName
      : recordClass.shortDisplayNamePlural);
  const count =
    step.estimatedSize != null ? step.estimatedSize.toLocaleString() : '?';
  return (
    <div className={cx('--StepCount')}>
      {count} {recordClassDisplayName}
    </div>
  );
}

/**
 * Recurisvely render expanded steps
 */
export function ExpandedSteps(props: StepBoxesProps) {
  const { stepTree } = props;

  if (stepTree == null || stepTree == null) return null;

  return (
    <React.Fragment>
      {stepTree.primaryInput && (
        <ExpandedSteps {...props} stepTree={stepTree.primaryInput} />
      )}
      {stepTree.secondaryInput &&
        stepTree.secondaryInput.isNested &&
        stepTree.step.expanded && (
          <React.Fragment>
            <div className="StrategyPanel--NestedTitle">
              Expanded view of{' '}
              <em>
                {makeStepBoxDisplayName(
                  stepTree.secondaryInput.step,
                  isPartialCombineUiStepTree(stepTree.secondaryInput),
                  stepTree.step
                )}
              </em>
            </div>
            <div
              className="StrategyPanel--Panel"
              style={{ border: `.1em solid ${stepTree.secondaryInput.color}` }}
            >
              <div style={{ fontSize: '1.4em', padding: '.35em .4em' }}>
                <button
                  className="link"
                  type="button"
                  onClick={() =>
                    props.onCollapseNestedStrategy(stepTree.step.id)
                  }
                >
                  <i className="fa fa-times" />
                </button>
              </div>
              <div className="StrategyPanel--StepBoxesContainer">
                <StepBoxes {...props} stepTree={stepTree.secondaryInput} />
              </div>
            </div>
          </React.Fragment>
        )}
    </React.Fragment>
  );
}
