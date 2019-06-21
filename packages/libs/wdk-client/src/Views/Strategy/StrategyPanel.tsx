import React from 'react';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { IconAlt, Link, SaveableTextEditor } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import StepBoxes from './StepBoxes';

import Modal from 'wdk-client/Components/Overlays/Modal';
import {RecordClass} from 'wdk-client/Utils/WdkModel';
import SaveStrategyForm from 'wdk-client/Views/Strategy/SaveStrategyForm';

import './StrategyPanel.css';

const cx = makeClassNameHelper('StrategyPanel');

interface Props {
  strategy: StrategyDetails;
  stepId?: number;
  recordClassesByName: Record<string, RecordClass>;
  action?: string;
  onStrategyRename: (name: string) => void;
  onStrategyCopy: (signature: string) => void;
  onStrategySave: (name: string, isPublic: boolean, description?: string) => void;
  onStrategyDelete: () => void;
}

export default function StrategyPanel(props: Props) {
  const { recordClassesByName, strategy } = props;
  return (
    <div className={cx()}>
      <h2 className={cx('--Heading')}>
        <div>Search Strategy:</div>
        <div className={cx('--StrategyName')}>
          <SaveableTextEditor value={strategy.name} displayValue={(value, handleEdit) => <em onClick={handleEdit}>{value}{strategy.isSaved ? '' : ' *'}</em>} onSave={props.onStrategyRename}/>
        </div>
      </h2>
      <div className={cx('--Panel')}>
        <StrategyControls strategy={strategy}/>
        <StepBoxes recordClassesByName={recordClassesByName} steps={strategy.steps} stepTree={strategy.stepTree}/>
      </div>
      <StrategyActionModal {...props} />
    </div>
  );
}

interface StrategyControlProps {
  strategy: StrategyDetails;
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
        <div><button className="btn" type="button" onClick={() => props.onStrategyCopy(props.strategy.signature)}>Yes, make a copy</button> <Link className="btn" replace to="#">No thanks</Link></div>
      </React.Fragment>
    )
  },

  save: {
    iconName: 'floppy-o',
    title: 'Save your search strategy',
    render: SaveStrategyForm
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
        <div><Link className="btn" replace to="#">Close</Link></div>
      </React.Fragment>
    )
  },

  delete: {
    iconName: 'trash-o',
    title: 'Delete your search strategy',
    render: (props: Props) => (
      <React.Fragment>
        <div>Are you sure you want to delete your strategy?</div>
        <div><button className="btn"  type="button" onClick={() => props.onStrategyDelete()}>Yes, delete my strategy</button> <Link className="btn" replace to="#">No thanks</Link></div>
      </React.Fragment>
    )
  }
}

function StrategyControls(props: StrategyControlProps) {
  return (
    <div className={cx('--Controls')}>
      {Object.entries(StrategyActions).map(([ key, action ]) => (
        <Link key={key} to={`#${key}`} title={action.title} replace><IconAlt fa={action.iconName}/></Link>
      ))}
    </div>
  );
}

function StrategyActionModal(props: Props) {
  const action = props.action && StrategyActions[props.action];
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

