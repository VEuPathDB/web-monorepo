import CardBasedIndexController from 'ebrc-client/controllers/CardBasedIndexController';

import { getStaticSiteData } from '../selectors/siteData';
import getHomeContent from '../data/homeContent';

const searchesUserEmails = [ 'eupathdb@gmail.com' ];

export default function IndexControllerWrapper() {
  return function IndexController() {
    return (
      <CardBasedIndexController
        searchesUserEmails={searchesUserEmails}
        getSiteData={getStaticSiteData}
        getHomeContent={getHomeContent}
      />
    )
  }
}
