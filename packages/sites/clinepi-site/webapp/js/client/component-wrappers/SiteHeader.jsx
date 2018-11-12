import React from 'react';
import Header from 'ebrc-client/App/Header';
import DisclaimerModal from '../components/DisclaimerModal';

import makeHeaderMenuItems from '../data/headerMenuItems';
import { getStaticSiteData } from '../selectors/siteData';

export default function SiteHeaderWrapper() {
  return function SiteHeader() {
    return (
      <React.Fragment>
        <Header
          getSiteData={getStaticSiteData}
          makeHeaderMenuItems={makeHeaderMenuItems}
        />
        <DisclaimerModal />
      </React.Fragment>
    )
  }
}
