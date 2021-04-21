import React, { Suspense, useCallback, useState } from 'react';

import { Link, IconAlt } from '@veupathdb/wdk-client/lib/Components';

import { NewOrganismsBanner } from './NewOrganismsBanner';
import {
  useAvailableOrganisms,
  useNewOrganisms,
  usePreferredOrganismsEnabledState,
  usePreferredOrganismsState,
  useProjectId,
} from '../hooks/preferredOrganisms';

import './PreferredOrganismsLink.scss';

export function PreferredOrganismsLink() {
  return (
    <div className="PreferredOrganismsLink--Container">
      <Link className="PreferredOrganismsLink" to="/preferred-organisms">
        <IconAlt fa="gear" /> My Organism Preferences{' '}
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
  const [preferredOrganismEnabled] = usePreferredOrganismsEnabledState();
  const [preferredOrganisms] = usePreferredOrganismsState();

  return !preferredOrganismEnabled ? (
    <>(disabled)</>
  ) : (
    <>
      ({preferredOrganisms.length} of {availableOrganisms.size})
    </>
  );
}

function NewOrganismsBannerController() {
  const newOrganisms = useNewOrganisms();
  const projectId = useProjectId();
  const [showBanner, setShowBanner] = useState(true);

  const onDismiss = useCallback(() => {
    setShowBanner(false);
  }, []);

  const newOrganismCount = newOrganisms.size;

  return !showBanner || newOrganismCount === 0 ? null : (
    <NewOrganismsBanner
      newOrganismCount={newOrganismCount}
      projectId={projectId}
      onDismiss={onDismiss}
    />
  );
}
