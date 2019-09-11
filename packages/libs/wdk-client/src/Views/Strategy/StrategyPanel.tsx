import React from 'react';
import { SaveableTextEditor, Loading } from 'wdk-client/Components';
import Modal from 'wdk-client/Components/Overlays/Modal';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { AddStepPanel } from 'wdk-client/Views/Strategy/AddStepPanel';
import { UiStepTree, AddType } from 'wdk-client/Views/Strategy/Types';
import StepBoxes from './StepBoxes';
import {StrategyControls} from 'wdk-client/Views/Strategy/StrategyControls';

import './StrategyPanel.css';
import {Plugin} from 'wdk-client/Utils/ClientPlugin';
import Icon from 'wdk-client/Components/Icon/IconAlt';

const cx = makeClassNameHelper('StrategyPanel');

interface Props {
  isLoading: boolean;
  strategy?: StrategyDetails;
  uiStepTree?: UiStepTree;
  insertStepVisibility?: AddType;
  reviseFormStepId?: number;
  showCloseButton?: boolean;
  setReviseFormStepId: (stepId?: number) => void;
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

  const reviseStep = reviseFormStepId != null && strategy != null ? strategy.steps[reviseFormStepId] : undefined;

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
          {strategy != null && insertStepVisibility != null ? (
            <Modal className={cx('--Modal')}>
              <AddStepPanel
                strategy={strategy}
                addType={insertStepVisibility}
                onHideInsertStep={onHideInsertStep}
              />
            </Modal>
          ) : null}
      {strategy != null && reviseStep != null ? (
        <Modal className={cx('--Modal')}>
          <div className={cx('--ReviseForm')}>
            <button type="button" className="link" onClick={() => setReviseFormStepId()}>Close</button>
            {/* <h1>Revise step <em style={{ fontWeight: 'normal' }}>{reviseStep.customName}</em></h1> */}
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
        </Modal>
      ): null}
    </div>
  );
}
