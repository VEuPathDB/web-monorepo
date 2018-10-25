import Header from 'ebrc-client/App/Header';

import makeHeaderMenuItems from '../data/headerMenuItems';
import { getStaticSiteData } from '../selectors/siteData';

export default function SiteHeaderWrapper() {
  return function SiteHeader() {
    return (
      <Header
        getSiteData={getStaticSiteData}
        makeHeaderMenuItems={makeHeaderMenuItems}
      />
    )
  }
}
