import React, { useMemo, useState, useCallback } from 'react';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import Header from '@veupathdb/web-common/lib/App/Header';
import { useDiyDatasets } from '@veupathdb/web-common/lib/hooks/diyDatasets';
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
    const [searchTerm, setSearchTerm] = useSessionBackedState(
      '',
      'SiteHeader__filterString',
      (s) => s,
      (s) => s
    );

    const permissions = usePermissions();

    const { diyDatasets, communityDatasets, reloadDiyDatasets } =
      useDiyDatasets();

    // for now, we default to each studies section being open
    const [expandUserStudies, setExpandUserStudies] = useState(true);
    const [expandCommunityStudies, setExpandCommunityStudies] = useState(true);
    const [expandCuratedStudies, setExpandCuratedStudies] = useState(true);

    const handleStudiesMenuSearch = useCallback(
      (newValue) => {
        setSearchTerm(newValue);
        // open both studies sections onSearch only if diyDatasets exist
        if (newValue.length > 0 && diyDatasets && diyDatasets.length > 0) {
          setExpandUserStudies(true);
          setExpandCuratedStudies(true);
        }
      },
      [
        diyDatasets,
        setSearchTerm,
        setExpandUserStudies,
        setExpandCuratedStudies,
      ]
    );

    const makeHeaderMenuItems = useMemo(
      () =>
        makeHeaderMenuItemsFactory(
          permissions,
          diyDatasets,
          communityDatasets,
          reloadDiyDatasets,
          expandUserStudies,
          setExpandUserStudies,
          expandCommunityStudies,
          setExpandCommunityStudies,
          expandCuratedStudies,
          setExpandCuratedStudies
        ),
      [
        permissions,
        diyDatasets,
        communityDatasets,
        reloadDiyDatasets,
        expandUserStudies,
        setExpandUserStudies,
        expandCommunityStudies,
        setExpandCommunityStudies,
        expandCuratedStudies,
        setExpandCuratedStudies,
      ]
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
          setSearchTerm={handleStudiesMenuSearch}
        />
        <DisclaimerModal />
        <DataRestrictionDaemon
          makeStudyPageRoute={(id) => makeEdaRoute(id) + '/details'}
        />
      </React.Fragment>
    );
  };
}
