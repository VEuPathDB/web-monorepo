import React, { Suspense } from 'react';

import { Link, IconAlt } from '@veupathdb/wdk-client/lib/Components';

import { useAvailableOrganisms, usePreferredOrganismsState } from '@veupathdb/preferred-organisms/lib/hooks/preferredOrganisms';

import './PreferredOrganismsLink.scss';

export function PreferredOrganismsLink() {
  return (
    <Link className="PreferredOrganismsLink" to="/preferred-organisms">
      <IconAlt fa="gear" />
      {' '}
      My Organism Preferences
      {' '}
      <Suspense fallback={null}>
        <PreferredOrganismsCount />
      </Suspense>
    </Link>
  );
}

function PreferredOrganismsCount() {
  const availableOrganisms = useAvailableOrganisms();
  const [ preferredOrganisms ] = usePreferredOrganismsState();

  return <>({preferredOrganisms.length} of {availableOrganisms.size})</>;
}
