import React, { useMemo } from 'react';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import Header from '@veupathdb/web-common/lib/App/Header';
import { makeEdaRoute } from '@veupathdb/web-common/lib/routes';
import { DataRestrictionDaemon } from '@veupathdb/study-data-access/lib/data-restriction';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';

import DisclaimerModal from '../components/DisclaimerModal';
import makeHeaderMenuItemsFactory from '../data/headerMenuItems';
import { getStaticSiteData } from '../selectors/siteData';

import logoUrl from 'site/images/symbol-small.png';
import heroImageUrl from 'site/images/global.jpg';

export default function SiteHeaderWrapper() {
  return function SiteHeader() {
    const [searchTerm, setSearchTerm] = useSessionBackedState('', "SiteHeader__filterString", s => s, s => s );

    const permissions = usePermissions();

    const makeHeaderMenuItems = useMemo(
      () => makeHeaderMenuItemsFactory(permissions), 
      [permissions]
    );

    return (
      <React.Fragment>
        <Header
          logoUrl={logoUrl}
          heroImageUrl={heroImageUrl}
          heroImagePosition="left 33%"
          titleWithoutDB="ClinEpi"
          subTitle="Clinical Epidemiology Resources"
          tagline="Share, explore, and visualize clinical and epidemiological data"
          getSiteData={getStaticSiteData}
          makeHeaderMenuItems={makeHeaderMenuItems}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <DisclaimerModal />
        <DataRestrictionDaemon makeStudyPageRoute={id => makeEdaRoute(id) + '/details'} />
      </React.Fragment>
    )
  }
}
