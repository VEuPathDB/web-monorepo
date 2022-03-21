import * as React from 'react';
import { Link } from "react-router-dom";
import Banner from '@veupathdb/coreui/dist/components/banners/Banner';
import { IconAlt } from 'wdk-client/Components';
import { StrategyActions } from './StrategyControls';

export default function UnownedStrategy() {
  return (
    <Banner
      banner={{
        type: 'danger',
        message:
          <div style={{ fontSize: '1.25em' }}>
            To access one of your strategies, please make sure you are logged in. <br />
            If you are already logged in, then either the requested strategy does not exist, or it belongs to another user. <br />
            <br />
            If another user is sharing a strategy with you, ask them to use the share button (<IconAlt fa={StrategyActions.share.iconName} />) in their panel,
              to generate a valid URL that you may use to make a copy of their strategy.  <br />
            <br />
            <Link to="/workspace/strategies">Dismiss</Link>
          </div>,
        pinned: true
      }}
    />
  );
}
