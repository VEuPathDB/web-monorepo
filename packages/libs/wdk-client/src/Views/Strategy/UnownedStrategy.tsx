import * as React from 'react';
import { Link } from "react-router-dom";
import Banner from 'wdk-client/Components/Banners/Banner';
import { IconAlt } from 'wdk-client/Components';
import { StrategyActions } from './StrategyControls';

export default function UnownedStrategy() {
  return (
    <Banner banner={{
      type: 'danger',
      message: <div style={{ fontSize: '1.25em' }}>
        The requested strategy does not exist, or you do not own it. If the requested strategy belongs to someone else, ask them to use the share button (<IconAlt fa={StrategyActions.share.iconName}/>) to share the strategy with you. <Link to="/workspace/strategies">Dismiss</Link>
      </div>
    }}/>
  );
}
