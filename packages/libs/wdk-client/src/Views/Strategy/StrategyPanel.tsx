import React from 'react';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { IconAlt, Link, SaveableTextEditor } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import StepBoxes from './StepBoxes';

import './StrategyPanel.css';
import Modal from 'wdk-client/Components/Overlays/Modal';

const cx = makeClassNameHelper('StrategyPanel');

interface Props {
  strategy: StrategyDetails;
  action?: string;
}

export default function StrategyPanel(props: Props) {
  const { strategy, action } = props;
  return (
    <div className={cx()}>
      <h2 className={cx('--Heading')}>
        <div className={cx('--StrategyCount')}>
          {strategy.estimatedSize ? strategy.estimatedSize.toLocaleString() : '?'} {strategy.recordClassName}      
        </div>
        <div>
          Search Strategy:
        </div>
        <div className={cx('--StrategyName')}>
          <SaveableTextEditor value={strategy.name} onSave={() => alert("We'll get to that soon...")}/>
         </div>
      </h2>
      <div className={cx('--Panel')}>
        <StrategyControls strategy={strategy}/>
        <StepBoxes steps={strategy.steps} stepTree={strategy.stepTree}/>
      </div>
      <StrategyActionModal strategy={strategy} action={action}/>
    </div>
  );
}

interface StrategyControlProps {
  strategy: StrategyDetails;
}

interface StrategyAction {
  iconName: string;
  title: string;
  render: (props: StrategyActionModelProps) => JSX.Element;
}

const StrategyActions: Record<string, StrategyAction> = {
  copy: {
    iconName: 'clone',
    title: 'Create a copy of your search strategy',
    render: (props: StrategyActionModelProps) => (
      <React.Fragment>
        <div>Are you sure you want to make a copy of the strategy {props.strategy.name}?</div>
        <div><button type="button">Yes, make a copy</button> <Link replace to="#">No thanks</Link></div>
      </React.Fragment>
    )
  },

  save: {
    iconName: 'floppy-o',
    title: 'Save your search strategy',
    render: (props: StrategyActionModelProps) => (
      <React.Fragment>
        <div>TODO: Complete form</div>
        <div><Link replace to="#">Close</Link></div>
      </React.Fragment>
    )
  },

  share: {
    iconName: 'share-alt',
    title: 'Share your search strategy',
    render: (props: StrategyActionModelProps) => (
      <React.Fragment>
        <div>
          Copy the URL to share your search strategy:
          <br/><input type="text" autoFocus readOnly style={{ width: '20em' }} onFocus={e => e.target.select()} value={`https://plasmodb.org/import/${props.strategy.signature}`}/>
        </div>
        <div><Link replace to="#">Close</Link></div>
      </React.Fragment>
    )
  },

  delete: {
    iconName: 'trash-o',
    title: 'Delete your search strategy',
    render: (props: StrategyActionModelProps) => (
      <React.Fragment>
        <div>Are you sure you want to delete the strategy {props.strategy.name}?</div>
        <div><button type="button">Yes, delete my strategy</button> <Link replace to="#">No thanks</Link></div>
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

interface StrategyActionModelProps {
  strategy: StrategyDetails;
  action?: string;
}

function StrategyActionModal(props: StrategyActionModelProps) {
  const action = props.action && StrategyActions[props.action];
  if (!action) return null;
  return (
    <Modal>
      <div className={cx('--Action')}>
        <h3>{action.title}</h3>
        {action.render(props)}
      </div>
    </Modal>
  )
}