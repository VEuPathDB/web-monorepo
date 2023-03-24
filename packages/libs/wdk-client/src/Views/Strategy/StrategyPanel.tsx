import React, { useMemo } from 'react';
import { SubmissionMetadata } from '../../Actions/QuestionActions';
import { SaveableTextEditor, Loading } from '../../Components';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import { QuestionController } from '../../Controllers';
import { StrategyDetails } from '../../Utils/WdkUser';
import { AddStepPanel } from '../../Views/Strategy/AddStepPanel';
import { AddType, PartialUiStepTree } from '../../Views/Strategy/Types';
import StepBoxes from './StepBoxes';
import { StrategyControls } from '../../Views/Strategy/StrategyControls';

import './StrategyPanel.css';
import { Plugin } from '../../Utils/ClientPlugin';
import Icon from '../../Components/Icon/IconAlt';
import { CommonModal as StrategyModal } from '../../Components';

const cx = makeClassNameHelper('StrategyPanel');

interface Props {
  isLoading: boolean;
  hasError: boolean;
  strategy?: StrategyDetails;
  uiStepTree?: PartialUiStepTree;
  insertStepVisibility?: AddType;
  reviseFormStepId?: number;
  showCloseButton?: boolean;
  setReviseFormStepId: (stepId?: number) => void;
  onStrategyRename: (name: string) => void;
  onStrategyClose: () => void;
  onStrategyCopy: (signature: string) => void;
  onStrategySave: (
    name: string,
    isPublic: boolean,
    description?: string
  ) => void;
  onStrategyDelete: () => void;
  onShowInsertStep: (addType: AddType) => void;
  onHideInsertStep: () => void;
  onMakeNestedStrategy: (branchStepId: number) => void;
  onMakeUnnestedStrategy: (branchStepId: number) => void;
  onExpandNestedStrategy: (branchStepId: number) => void;
  onCollapseNestedStrategy: (branchStepId: number) => void;
  onRenameStep: (stepId: number, newName: string) => void;
  onRenameNestedStrategy: (branchStepId: number, newName: string) => void;
  onAnalyzeStep: () => void;
  onDeleteStep: (stepId: number, deleteSubtree?: boolean) => void;
}

export default function StrategyPanel(props: Props) {
  const {
    isLoading,
    hasError,
    uiStepTree,
    strategy,
    insertStepVisibility,
    reviseFormStepId,
    showCloseButton,
    onStrategyClose,
    setReviseFormStepId,
    onShowInsertStep,
    onHideInsertStep,
    onMakeNestedStrategy,
    onMakeUnnestedStrategy,
    onExpandNestedStrategy,
    onCollapseNestedStrategy,
    onRenameStep,
    onRenameNestedStrategy,
    onAnalyzeStep,
    onDeleteStep,
  } = props;

  const reviseStep =
    reviseFormStepId != null && strategy != null
      ? strategy.steps[reviseFormStepId]
      : undefined;

  const submissionMetadata: SubmissionMetadata | undefined = useMemo(() => {
    if (
      strategy?.strategyId == null ||
      reviseStep?.id == null ||
      reviseStep?.searchConfig == null
    ) {
      return undefined;
    }

    return {
      type: 'edit-step',
      strategyId: strategy.strategyId,
      stepId: reviseStep.id,
      previousSearchConfig: reviseStep.searchConfig,
    };
  }, [strategy?.strategyId, reviseStep?.id, reviseStep?.searchConfig]);

  return (
    <div className={cx()}>
      <h2 className={cx('--Heading')}>
        {/*<div>Search Strategy:</div>*/}
        {hasError ? (
          <em>Error...</em>
        ) : strategy == null ? (
          <em>Loading...</em>
        ) : (
          <div className={cx('--StrategyName')}>
            <SaveableTextEditor
              value={strategy.name}
              displayValue={(value, handleEdit) => (
                <em onClick={handleEdit}>
                  {value}
                  {strategy.isSaved ? '' : ' *'}
                </em>
              )}
              onSave={props.onStrategyRename}
            />
          </div>
        )}
      </h2>
      <div className={cx('--Panel')}>
        {!hasError && (isLoading || strategy == null || uiStepTree == null) ? (
          <Loading className={cx('--Loading')} />
        ) : null}
        {showCloseButton && (
          <div className={cx('--CloseButton')} title="Close this strategy.">
            <button className="link" onClick={() => onStrategyClose()}>
              <Icon fa="times" />
            </button>
          </div>
        )}
        {hasError ? (
          <div style={{ padding: '1em' }}>
            This strategy could not be loaded due to a server error.
          </div>
        ) : strategy != null && uiStepTree != null ? (
          <>
            <StrategyControls strategyId={strategy.strategyId} />
            <div className={cx('--StepBoxesContainer')}>
              <StepBoxes
                stepTree={uiStepTree}
                setReviseFormStepId={setReviseFormStepId}
                onShowInsertStep={onShowInsertStep}
                onHideInsertStep={onHideInsertStep}
                onMakeNestedStrategy={onMakeNestedStrategy}
                onMakeUnnestedStrategy={onMakeUnnestedStrategy}
                onExpandNestedStrategy={onExpandNestedStrategy}
                onCollapseNestedStrategy={onCollapseNestedStrategy}
                onRenameStep={onRenameStep}
                onRenameNestedStrategy={onRenameNestedStrategy}
                onAnalyzeStep={onAnalyzeStep}
                onDeleteStep={onDeleteStep}
              />
            </div>
          </>
        ) : null}
      </div>
      {strategy != null &&
      uiStepTree != null &&
      insertStepVisibility != null ? (
        <AddStepPanel
          strategy={strategy}
          addType={insertStepVisibility}
          onHideInsertStep={onHideInsertStep}
          uiStepTree={uiStepTree}
        />
      ) : null}
      {strategy != null && reviseStep != null && submissionMetadata != null ? (
        <StrategyModal title="Revise your step" onClose={setReviseFormStepId}>
          <div className={cx('--ReviseForm')}>
            <Plugin
              context={{
                type: 'questionController',
                recordClassName: reviseStep.recordClassName,
                searchName: reviseStep.searchName,
              }}
              pluginProps={{
                question: reviseStep.searchName,
                recordClass: reviseStep.recordClassName,
                submissionMetadata,
                submitButtonText: 'Revise',
              }}
              defaultComponent={QuestionController}
              fallback={<Loading />}
            />
          </div>
        </StrategyModal>
      ) : null}
    </div>
  );
}
