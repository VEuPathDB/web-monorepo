import CardBasedIndexController from 'ebrc-client/controllers/CardBasedIndexController';

import { getStaticSiteData } from '../selectors/siteData';
import getHomeContent from '../data/homeContent';

export default function IndexControllerWrapper() {
  return function IndexController() {
    return (
      <CardBasedIndexController
        getSiteData={getStaticSiteData}
        getHomeContent={getHomeContent}
      />
    )
  }
}
