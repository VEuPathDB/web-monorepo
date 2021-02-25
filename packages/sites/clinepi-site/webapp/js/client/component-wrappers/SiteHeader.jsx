import React, { useState } from 'react';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import Header from '@veupathdb/web-common/lib/App/Header';
import { DataRestrictionDaemon } from '@veupathdb/web-common/lib/App/DataRestriction';
import DisclaimerModal from '../components/DisclaimerModal';

import makeHeaderMenuItems from '../data/headerMenuItems';
import { getStaticSiteData } from '../selectors/siteData';

import logoUrl from 'site/images/symbol-small.png';
import heroImageUrl from 'site/images/global.jpg';

export default function SiteHeaderWrapper() {
  return function SiteHeader() {
    const [searchTerm, setSearchTerm] = useSessionBackedState('', "SiteHeader__filterString", s => s, s => s );
    return (
      <React.Fragment>
        <Header
          logoUrl={logoUrl}
          heroImageUrl={heroImageUrl}
          heroImagePosition="left 33%"
          titleWithoutDB="ClinEpi"
          subTitle="Clinical Epidemiology Resources"
          tagline="Advancing global public health by facilitating the exploration and analysis of epidemiological studies"
          getSiteData={getStaticSiteData}
          makeHeaderMenuItems={makeHeaderMenuItems}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <DisclaimerModal />
        <DataRestrictionDaemon />
      </React.Fragment>
    )
  }
}
