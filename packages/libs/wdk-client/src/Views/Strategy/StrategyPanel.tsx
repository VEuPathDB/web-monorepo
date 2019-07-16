import React from 'react';
import { IconAlt, SaveableTextEditor } from 'wdk-client/Components';
import Modal from 'wdk-client/Components/Overlays/Modal';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { AddStepPanel } from 'wdk-client/Views/Strategy/AddStepPanel';
import SaveStrategyForm from 'wdk-client/Views/Strategy/SaveStrategyForm';
import { UiStepTree } from 'wdk-client/Views/Strategy/Types';
import StepBoxes from './StepBoxes';
import './StrategyPanel.css';



const cx = makeClassNameHelper('StrategyPanel');

interface Props {
  strategy: StrategyDetails;
  uiStepTree: UiStepTree;
  insertStepVisibility?: number;
  activeModal?: string;
  setActiveModal: (type: string) => void;
  clearActiveModal: () => void;
  onStrategyRename: (name: string) => void;
  onStrategyCopy: (signature: string) => void;
  onStrategySave: (name: string, isPublic: boolean, description?: string) => void;
  onStrategyDelete: () => void;
  onShowInsertStep: (stepId: number) => void;
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
    uiStepTree,
    strategy,
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
  return (
    <div className={cx()}>
      <h2 className={cx('--Heading')}>
        <div>Search Strategy:</div>
        <div className={cx('--StrategyName')}>
          <SaveableTextEditor value={strategy.name} displayValue={(value, handleEdit) => <em onClick={handleEdit}>{value}{strategy.isSaved ? '' : ' *'}</em>} onSave={props.onStrategyRename}/>
        </div>
      </h2>
      <div className={cx('--Panel')}>
        <StrategyControls {...props}/>
        <div>
          <StepBoxes
            stepTree={uiStepTree}
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
      </div>
      <StrategyActionModal {...props} />
      {props.insertStepVisibility && (
        <Modal>
          <div>
            <AddStepPanel
              strategyId={props.strategy.strategyId}
              addType={props.insertStepVisibility === strategy.rootStepId
                ? { type: 'append' }
                : { type: 'insertBefore', stepId: props.insertStepVisibility}
              }
            />
            <button type="button" onClick={() => onHideInsertStep()}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface StrategyAction {
  iconName: string;
  title: string;
  render: React.ReactType<Props>;
}

const StrategyActions: Record<string, StrategyAction> = {
  copy: {
    iconName: 'clone',
    title: 'Create a copy of your search strategy',
    render: (props: Props) => (
      <React.Fragment>
        <div>Are you sure you want to make a copy of your strategy?</div>
        <div><button className="btn" type="button" onClick={() => props.onStrategyCopy(props.strategy.signature)}>Yes, make a copy</button> <CloseModalButton {...props}>No thanks</CloseModalButton></div>
      </React.Fragment>
    )
  },

  save: {
    iconName: 'floppy-o',
    title: 'Save your search strategy',
    render: (props: Props) => <SaveStrategyForm {...props}/>
  },

  share: {
    iconName: 'share-alt',
    title: 'Share your search strategy',
    render: (props: Props) => (
      <React.Fragment>
        <div>
          Copy the URL to share your search strategy:
          <br/><input type="text" autoFocus readOnly style={{ width: '20em' }} onFocus={e => e.target.select()} value={`https://plasmodb.org/import/${props.strategy.signature}`}/>
        </div>
        <div><CloseModalButton {...props}>Close</CloseModalButton></div>
      </React.Fragment>
    )
  },

  delete: {
    iconName: 'trash-o',
    title: 'Delete your search strategy',
    render: (props: Props) => (
      <React.Fragment>
        <div>Are you sure you want to delete your strategy?</div>
        <div><button className="btn"  type="button" onClick={() => props.onStrategyDelete()}>Yes, delete my strategy</button> <CloseModalButton {...props}>No thanks</CloseModalButton></div>
      </React.Fragment>
    )
  }
}

function CloseModalButton(props: Props & { children: React.ReactNode }) {
  return (
    <button type="button" className="btn" onClick={() => props.clearActiveModal()}>{props.children}</button>
  )
}

function StrategyControls(props: Props) {
  return (
    <div className={cx('--Controls')}>
      {Object.entries(StrategyActions).map(([ key, action ]) => (
        <div>
          <button type="button" key={key} className="link" onClick={() => props.setActiveModal(key)}><IconAlt fa={action.iconName}/></button>
        </div>
      ))}
    </div>
  );
}

function StrategyActionModal(props: Props) {
  const action = props.activeModal && StrategyActions[props.activeModal];
  if (!action) return null;
  return (
    <Modal>
      <div className={cx('--Action')}>
        <h3>{action.title}</h3>
        <action.render {...props}/>
      </div>
    </Modal>
  )
}

