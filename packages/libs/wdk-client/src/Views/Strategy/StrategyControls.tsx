import { find } from 'lodash';
import React from 'react';
import {IconAlt, Modal} from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import EditStrategyForm from 'wdk-client/Views/Strategy/EditStrategyForm';
import SaveAsStrategyForm from 'wdk-client/Views/Strategy/SaveAsStrategyForm';
import {StrategySummary, SaveStrategyOptions, EditStrategySpec} from 'wdk-client/Utils/WdkUser';
import {makeClassNameHelper} from 'wdk-client/Utils/ComponentUtils';

import {connect} from 'react-redux';
import {clearActiveModal, setActiveModal} from 'wdk-client/Actions/StrategyWorkspaceActions';
import {requestDuplicateStrategy, requestDeleteStrategy, requestPatchStrategyProperties, requestSaveAsStrategy} from 'wdk-client/Actions/StrategyActions';

import './StrategyControls.scss';

const cx = makeClassNameHelper('StrategyControls');

interface OwnProps {
  activeModal?: {
    type: string;
    strategyId: number;
  }
  strategySummaries?: StrategySummary[];
}

interface DispatchProps {
  setActiveModal: (activeModal: { type: string, strategyId: number }) => void;
  clearActiveModal: () => void;
  copyStrategy: (signature: string) => void;
  deleteStrategy: (strategyId: number) => void;
  renameStrategy: (strategyId: number, name: string) => void;
  saveStrategy: (strategyId: number, targetName: string, options: SaveStrategyOptions) => void;
  editStrategy: (strategyId: number, properties: EditStrategySpec) => void;
}

const dispatchProps: DispatchProps = {
  clearActiveModal,
  setActiveModal,
  copyStrategy: (sourceStrategySignature: string) => requestDuplicateStrategy({ sourceStrategySignature }),
  deleteStrategy: (strategyId: number) => requestDeleteStrategy(strategyId),
  renameStrategy: (strategyId: number, name: string) => requestPatchStrategyProperties(strategyId, { name }),
  saveStrategy: (strategyId: number, targetName: string, options: SaveStrategyOptions) =>
    requestSaveAsStrategy(strategyId, targetName, options),
  editStrategy: (strategyId: number, properties: EditStrategySpec) =>
    requestPatchStrategyProperties(strategyId, properties)
}

type Props = OwnProps & DispatchProps;

interface ActionProps extends DispatchProps {
  strategy: StrategySummary;
  strategySummaries: StrategySummary[];
}

interface StrategyAction {
  iconName: string;
  title: string;
  render: React.ReactType<ActionProps>;
}

// FIXME Find a cleaner way to assmeble the share URL - ideally without using window.location and/or rootUrl
const ShareAction = connect(
  ({ globalData }: RootState, { strategy: { signature }}: ActionProps) => ({
    shareUrl: 
    `${window.location.origin}${globalData.siteConfig.rootUrl as string}/import/${signature}`
  })
)(_ShareAction);

function _ShareAction (props: ActionProps & { shareUrl: string }) {
  const { strategy } = props;
  if (!strategy.isSaved) {
    return (
      <React.Fragment>
        <div>Before you can share your strategy, you need to save it. Would you like to do that now?</div>
        <div>
          <button className="btn" type="button" onClick={() => {
              props.setActiveModal({ type: 'save', strategyId: strategy.strategyId });
            }}>Yes, save my strategy</button> <CloseModalButton {...props}>No thanks</CloseModalButton>
        </div>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <div>
        Copy the URL to share your search strategy:
        <br/>
        <input 
          type="text" 
          autoFocus 
          readOnly 
          style={{ width: '20em' }} 
          onFocus={e => e.target.select()} 
          value={props.shareUrl}
        />
      </div>
      <div><CloseModalButton {...props}>Close</CloseModalButton></div>
    </React.Fragment>
  );
}

export const StrategyActions: Record<string, StrategyAction> = {
  copy: {
    iconName: 'clone',
    title: 'Copy',
    render: (props: ActionProps) => (
      <React.Fragment>
        <div>Are you sure you want to make a copy of your strategy?</div>
        <div>
          <button className="btn" type="button" onClick={() => {
              props.copyStrategy(props.strategy.signature);
              props.clearActiveModal();
            }}>Yes, make a copy</button> <CloseModalButton {...props}>No thanks</CloseModalButton></div>
      </React.Fragment>
    )
  },

  edit: {
    iconName: 'pencil-square-o',
    title: 'Edit details',
    render: (props: ActionProps) => <EditStrategyForm {...props}/>
  },

  save: {
    iconName: 'floppy-o',
    title: 'Save as',
    render: (props: ActionProps) => <SaveAsStrategyForm {...props}/>
  },

  share: {
    iconName: 'share-alt',
    title: 'Share',
    render: ShareAction
  },

  delete: {
    iconName: 'trash-o',
    title: 'Delete',
    render: (props: ActionProps) => (
      <React.Fragment>
        <div>Are you sure you want to delete your strategy?</div>
        <div><button className="btn"  type="button" onClick={() => {
          props.deleteStrategy(props.strategy.strategyId);
          props.clearActiveModal();
        }}>Yes, delete my strategy</button> <CloseModalButton {...props}>No thanks</CloseModalButton></div>
      </React.Fragment>
    )
  }
}

function _StrategyActionModal(props: Props) {
  const { activeModal, strategySummaries, ...callbacks } = props;
  if ( activeModal == null || strategySummaries == null ) return null;

  const action = StrategyActions[activeModal.type];
  const strategy = find<StrategySummary>(strategySummaries, strat => strat.strategyId === activeModal.strategyId);

  if (action == null || strategy == null) return null;

  return (
    <Modal>
      <div className={cx('--Action')}>
        <h3>{action.title}</h3>
        <action.render {...callbacks} strategySummaries={strategySummaries} strategy={strategy}/>
      </div>
    </Modal>
  )
}

export const StrategyActionModal = connect(null, dispatchProps)(_StrategyActionModal)

function CloseModalButton(props: Props & { children: React.ReactNode }) {
  return (
    <button type="button" className="btn" onClick={() => props.clearActiveModal()}>{props.children}</button>
  )
}

interface StrategyControlsProps {
  strategyId: number;
}

function _StrategyControls(props: StrategyControlsProps & DispatchProps) {
  const { strategyId, setActiveModal } = props;
  return (
    <div className={cx('--Controls')}>
        {Object.entries(StrategyActions).map(([ type, action ]) => (
      <div key={type} title={action.title}>
        <button type="button" className="link" onClick={() => setActiveModal({ type, strategyId })}><IconAlt fa={action.iconName}/></button>
      </div>
        ))}
    </div>
  );
}

export const StrategyControls = connect(null, dispatchProps)(_StrategyControls);
