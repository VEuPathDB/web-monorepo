import React from 'react';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { IconAlt, Link } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import StepBoxes from './StepBoxes';

import './StrategyPanel.scss';

const cx = makeClassNameHelper('StrategyPanel');

interface Props {
  strategy: StrategyDetails;
  selectedStepId?: number;
}

export default function StrategyPanel(props: Props) {
  const { strategy } = props;
  return (
    <div className={cx()}>
      <h2 className={cx('__Heading')}>
        {strategy.estimatedSize.toLocaleString()} {strategy.recordClassName} &mdash; {strategy.name}
      </h2>

      <div className={cx('__Panel')}>
        <StrategyControls strategy={strategy}/>
        <StepBoxes steps={strategy.steps} stepTree={strategy.stepTree}/>
      </div>

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
