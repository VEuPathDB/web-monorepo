import React from 'react';
import { SaveableTextEditor, Loading } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { AddStepPanel } from 'wdk-client/Views/Strategy/AddStepPanel';
import { AddType, PartialUiStepTree } from 'wdk-client/Views/Strategy/Types';
import StepBoxes from './StepBoxes';
import {StrategyControls} from 'wdk-client/Views/Strategy/StrategyControls';

import './StrategyPanel.css';
import {Plugin} from 'wdk-client/Utils/ClientPlugin';
import Icon from 'wdk-client/Components/Icon/IconAlt';
import { CommonModal as StrategyModal } from 'wdk-client/Components';
import StepDetailsDialog from './StepDetailsDialog';

const cx = makeClassNameHelper('StrategyPanel');

interface Props {
  isLoading: boolean;
  strategy?: StrategyDetails;
  uiStepTree?: PartialUiStepTree;
  insertStepVisibility?: AddType;
  reviseFormStepId?: number;
  detailModalStepId?: number;
  showCloseButton?: boolean;
  setReviseFormStepId: (stepId?: number) => void;
  setDetailModalStepId: (stepId?: number) => void;
  onStrategyRename: (name: string) => void;
  onStrategyClose: () => void;
  onStrategyCopy: (signature: string) => void;
  onStrategySave: (name: string, isPublic: boolean, description?: string) => void;
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
  onDeleteStep: (stepId: number) => void;
}

export default function StrategyPanel(props: Props) {
  const {
    isLoading,
    uiStepTree,
    strategy,
    insertStepVisibility,
    reviseFormStepId,
    detailModalStepId,
    showCloseButton,
    onStrategyClose,
    setReviseFormStepId,
    setDetailModalStepId,
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

  const reviseStep = reviseFormStepId != null && strategy != null ? strategy.steps[reviseFormStepId] : undefined;
  const detailStep = detailModalStepId != null && strategy != null ? strategy.steps[detailModalStepId] : undefined;

  return (
    <div className={cx()}>
      <h2 className={cx('--Heading')}>
        {/*<div>Search Strategy:</div>*/}
        {strategy == null ? <em>Loading...</em> :
          <div className={cx('--StrategyName')}>
            <SaveableTextEditor
              value={strategy.name}
              displayValue={(value, handleEdit) => <em onClick={handleEdit}>{value}{strategy.isSaved ? '' : ' *'}</em>}
              onSave={props.onStrategyRename}
            />
          </div>
        }
      </h2>
      <div className={cx('--Panel')}>
        {isLoading || strategy == null || uiStepTree == null ? <Loading className={cx('--Loading')}/> : null}
        {strategy && uiStepTree && showCloseButton && (
          <div className={cx('--CloseButton')} title="Close this strategy.">
            <button className="link" onClick={() => onStrategyClose()}>
              <Icon fa="times"/>
            </button>
          </div>
        )}
        {strategy != null && uiStepTree != null ?
          <>
            <StrategyControls strategyId={strategy.strategyId}/>
            <div className={cx('--StepBoxesContainer')}>
              <StepBoxes
                stepTree={uiStepTree}
                stepDetailVisibility={detailModalStepId}
                setStepDetailVisibility={setDetailModalStepId}
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
          </> : null}
          </div>
          {strategy != null && uiStepTree != null && insertStepVisibility != null ? (
            <AddStepPanel
              strategy={strategy}
              addType={insertStepVisibility}
              onHideInsertStep={onHideInsertStep}
              uiStepTree={uiStepTree}
            />
          ) : null}
      {strategy != null && reviseStep != null ? (
        <StrategyModal title="Revise your step" onClose={setReviseFormStepId} >
          <div className={cx('--ReviseForm')}>
            <Plugin
              context={{
                type: 'questionController',
                recordClassName: reviseStep.recordClassName,
                searchName: reviseStep.searchName
              }}
              pluginProps={{
                question: reviseStep.searchName,
                recordClass: reviseStep.recordClassName,
                submissionMetadata: {
                  type: 'edit-step',
                  strategyId: strategy.strategyId,
                  stepId: reviseStep.id,
                  previousSearchConfig: reviseStep.searchConfig
                },
                submitButtonText: 'Revise'
              }}
            />
          </div>
        </StrategyModal>
      ): null}
    </div>
  );
}
