import React from 'react';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { IconAlt, Link } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import StepBoxes from './StepBoxes';

import './StrategyPanel.scss';
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
      <h2 className={cx('__Heading')}>
        {strategy.estimatedSize ? strategy.estimatedSize.toLocaleString() : '?'} {strategy.recordClassName} &mdash; {strategy.name}
      </h2>
      <div className={cx('__Panel')}>
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

function StrategyControls(props: StrategyControlProps) {
  return (
    <div className={cx('__Controls')}>
      <Link to={'#copy'} replace title="make a copy of this strategy">
        <IconAlt fa="clone"/>
      </Link>
      <Link to={'#save'} replace title="save this strategy">
        <IconAlt fa="floppy-o"/>
      </Link>
      <Link to={'#share'} replace title="share this strategy">
        <IconAlt fa="share-alt"/>
      </Link>
      <Link to={'#delete'} replace title="delete this strategy">
        <IconAlt fa="trash-o"/>
      </Link>
    </div>
  );
}

interface StrategyActionModelProps {
  strategy: StrategyDetails;
  action?: string;
}

function StrategyActionModal(props: StrategyActionModelProps) {
  if (!props.action) return null;
  return (
    <Modal>
      <div className={cx('__Action')}>
        <div>Ok, we're going to do this action: {props.action}.</div>
        <Link to="#" replace>close</Link>
      </div>
    </Modal>
  )
}