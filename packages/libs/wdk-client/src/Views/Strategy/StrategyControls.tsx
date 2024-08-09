import { find } from 'lodash';
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconAlt } from '../../Components';
import { RootState } from '../../Core/State/Types';
import EditStrategyForm from '../../Views/Strategy/EditStrategyForm';
import SaveAsStrategyForm from '../../Views/Strategy/SaveAsStrategyForm';
import {
  StrategySummary,
  SaveStrategyOptions,
  EditStrategySpec,
  User,
} from '../../Utils/WdkUser';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';

import { connect } from 'react-redux';
import {
  clearActiveModal,
  setActiveModal,
} from '../../Actions/StrategyWorkspaceActions';
import {
  requestDuplicateStrategy,
  requestDeleteStrategy,
  requestPatchStrategyProperties,
  requestSaveAsStrategy,
} from '../../Actions/StrategyActions';

import './StrategyControls.scss';
import { showLoginWarning } from '../../Actions/UserSessionActions';
import { CommonModal as StrategyModal } from '../../Components';

const cx = makeClassNameHelper('StrategyControls');

interface OwnProps {
  activeModal?: {
    type: string;
    strategyId: number;
  };
  strategySummaries?: StrategySummary[];
}

interface DispatchProps {
  setActiveModal: (activeModal: { type: string; strategyId: number }) => void;
  clearActiveModal: () => void;
  showLoginWarning: (attemptedAction: string) => void;
  copyStrategy: (strategyId: number) => void;
  deleteStrategy: (strategyId: number) => void;
  renameStrategy: (strategyId: number, name: string) => void;
  saveStrategy: (
    strategyId: number,
    targetName: string,
    options: SaveStrategyOptions
  ) => void;
  editStrategy: (strategyId: number, properties: EditStrategySpec) => void;
}

const dispatchProps: DispatchProps = {
  clearActiveModal,
  setActiveModal,
  showLoginWarning,
  copyStrategy: (strategyId: number) => requestDuplicateStrategy(strategyId),
  deleteStrategy: (strategyId: number) => requestDeleteStrategy(strategyId),
  renameStrategy: (strategyId: number, name: string) =>
    requestPatchStrategyProperties(strategyId, { name }),
  saveStrategy: (
    strategyId: number,
    targetName: string,
    options: SaveStrategyOptions
  ) => requestSaveAsStrategy(strategyId, targetName, options),
  editStrategy: (strategyId: number, properties: EditStrategySpec) =>
    requestPatchStrategyProperties(strategyId, properties),
};

type Props = OwnProps & DispatchProps;

interface ActionProps extends DispatchProps {
  strategy: StrategySummary;
  strategySummaries: StrategySummary[];
}

interface StrategyAction {
  iconName: string;
  title: string;
  render: React.FC<ActionProps> | React.ComponentType<ActionProps>;
  loginRequired?: boolean;
}

function ShareAction(props: ActionProps) {
  const { strategy } = props;
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [shareUrl, setShareUrl] = useState('');
  // get full URL from import link to put in the input box
  useEffect(() => {
    if (anchorRef.current) setShareUrl(anchorRef.current.href);
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [anchorRef.current, inputRef.current]);
  if (!strategy.isSaved) {
    return (
      <React.Fragment>
        <div>
          Before you can share your strategy, you need to save it. Would you
          like to do that now?
        </div>
        <div>
          <button
            className="btn"
            type="button"
            onClick={() => {
              props.setActiveModal({
                type: 'save',
                strategyId: strategy.strategyId,
              });
            }}
          >
            Yes, save my strategy
          </button>{' '}
          <CloseModalButton {...props}>Cancel</CloseModalButton>
        </div>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <div>
        Copy the URL to share your search strategy:
        <br />
        <input
          ref={inputRef}
          type="text"
          readOnly
          style={{ width: '45em' }}
          value={shareUrl}
        />
        <Link
          style={{ display: 'none' }}
          innerRef={anchorRef as any}
          to={`/workspace/strategies/import/${strategy.signature}`}
        >
          link
        </Link>
      </div>
      <div>
        <CloseModalButton {...props}>Close</CloseModalButton>
      </div>
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
          <button
            className="btn"
            type="button"
            onClick={() => {
              props.copyStrategy(props.strategy.strategyId);
              props.clearActiveModal();
            }}
          >
            Yes, make a copy
          </button>{' '}
          <CloseModalButton {...props}>Cancel</CloseModalButton>
        </div>
      </React.Fragment>
    ),
  },

  edit: {
    iconName: 'pencil-square-o',
    title: 'Edit details',
    render: (props: ActionProps) => <EditStrategyForm {...props} />,
  },

  save: {
    iconName: 'floppy-o',
    title: 'Save as',
    render: (props: ActionProps) => <SaveAsStrategyForm {...props} />,
    loginRequired: true,
  },

  share: {
    iconName: 'share-alt',
    title: 'Share',
    render: ShareAction,
    loginRequired: true,
  },

  delete: {
    iconName: 'trash-o',
    title: 'Delete',
    render: (props: ActionProps) => (
      <React.Fragment>
        <div>Are you sure you want to delete your strategy?</div>
        <div>
          <button
            className="btn"
            type="button"
            onClick={() => {
              props.deleteStrategy(props.strategy.strategyId);
              props.clearActiveModal();
            }}
          >
            Yes, delete my strategy
          </button>{' '}
          <CloseModalButton {...props}>Cancel</CloseModalButton>
        </div>
      </React.Fragment>
    ),
  },
};

function _StrategyActionModal(props: Props) {
  const { activeModal, strategySummaries, ...callbacks } = props;
  if (activeModal == null || strategySummaries == null) return null;

  const action = StrategyActions[activeModal.type];
  const strategy = find<StrategySummary>(
    strategySummaries,
    (strat) => strat.strategyId === activeModal.strategyId
  );

  if (action == null || strategy == null) return null;

  return (
    <StrategyModal title={action.title} onClose={props.clearActiveModal}>
      <div className={cx('--Action')}>
        <action.render
          {...callbacks}
          strategySummaries={strategySummaries}
          strategy={strategy}
        />
      </div>
    </StrategyModal>
  );
}

export const StrategyActionModal = connect(
  null,
  dispatchProps
)(_StrategyActionModal);

function CloseModalButton(props: Props & { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="btn"
      onClick={() => props.clearActiveModal()}
    >
      {props.children}
    </button>
  );
}

interface StrategyControlsProps {
  strategyId: number;
  user?: User;
}

function mappedProps(state: RootState) {
  const { user } = state.globalData;
  return { user };
}

function _StrategyControls(props: StrategyControlsProps & DispatchProps) {
  const { strategyId, setActiveModal, user, showLoginWarning } = props;
  return (
    <div className={cx('--Controls')}>
      {Object.entries(StrategyActions).map(([type, action]) => (
        <div key={type} title={action.title}>
          <button
            type="button"
            className="link"
            onClick={() => handleClick({ type, strategyId }, action)}
          >
            <IconAlt fa={action.iconName} />
          </button>
        </div>
      ))}
    </div>
  );

  function handleClick(
    activeModal: { type: string; strategyId: number },
    action: StrategyAction
  ) {
    if (action.loginRequired && (user == null || user.isGuest)) {
      showLoginWarning(action.title.toLowerCase());
    } else {
      setActiveModal(activeModal);
    }
  }
}

export const StrategyControls = connect(
  mappedProps,
  dispatchProps
)(_StrategyControls);
