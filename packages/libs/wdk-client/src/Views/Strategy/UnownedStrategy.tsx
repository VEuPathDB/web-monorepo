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
        The requested strategy does not exist, or it belongs to another user. In the latter case, ask them to use the share button (<IconAlt fa={StrategyActions.share.iconName}/>) to generate a valid URL that you may use to make a copy of their strategy. <Link to="/workspace/strategies">Dismiss</Link>
      </div>
    }}/>
  );
}
