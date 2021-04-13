import React, { Suspense, useCallback, useState } from 'react';

import { Link, IconAlt } from '@veupathdb/wdk-client/lib/Components';

import { NewOrganismsBanner } from '@veupathdb/preferred-organisms/lib/components/NewOrganismsBanner';
import {
  useAvailableOrganisms,
  useNewOrganisms,
  usePreferredOrganismsEnabled,
  usePreferredOrganismsState,
  useProjectId,
} from '@veupathdb/preferred-organisms/lib/hooks/preferredOrganisms';

import './PreferredOrganismsLink.scss';

export function PreferredOrganismsLink() {
  return (
    <div className="PreferredOrganismsLink--Container">
      <Link className="PreferredOrganismsLink" to="/preferred-organisms">
        <IconAlt fa="gear" />
        {' '}
        My Organism Preferences
        {' '}
        <Suspense fallback={null}>
          <PreferredOrganismsCount />
        </Suspense>
      </Link>
      <Suspense fallback={null}>
        <NewOrganismsBannerController />
      </Suspense>
    </div>
  );
}

function PreferredOrganismsCount() {
  const availableOrganisms = useAvailableOrganisms();
  const [ preferredOrganismEnabled ] = usePreferredOrganismsEnabled();
  const [ preferredOrganisms ] = usePreferredOrganismsState();

  return !preferredOrganismEnabled
    ? <>(disabled)</>
    : <>({preferredOrganisms.length} of {availableOrganisms.size})</>;
}

function NewOrganismsBannerController() {
  const newOrganisms = useNewOrganisms();
  const projectId = useProjectId();
  const [ showBanner, setShowBanner ] = useState(true);

  const onDismiss = useCallback(() => {
    setShowBanner(false);
  }, []);

  const newOrganismCount = newOrganisms.size;

  return !showBanner || newOrganismCount === 0
    ? null
    : <NewOrganismsBanner
        newOrganismCount={newOrganismCount}
        projectId={projectId}
        onDismiss={onDismiss}
      />
}
