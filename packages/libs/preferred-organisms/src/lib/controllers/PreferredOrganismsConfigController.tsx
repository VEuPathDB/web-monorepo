import { useCallback } from 'react';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { PreferredOrganismsConfig } from '../components/PreferredOrganismsConfig';
import {
  useAvailableOrganisms,
  useNewOrganisms,
  useOrganismTree,
  usePreferredOrganismsEnabled,
  usePreferredOrganismsState,
  useProjectId,
} from '../hooks/preferredOrganisms';
import { useReferenceStrains } from '../hooks/referenceStrains';

export function PreferredOrganismsConfigController() {
  useSetDocumentTitle('My Organism Preferences');

  const availableOrganisms = useAvailableOrganisms();

  const organismTree = useOrganismTree();

  const [
    preferredOrganismsState,
    setPreferredOrganismsState,
  ] = usePreferredOrganismsState();

  const projectIdValue = useProjectId();

  const referenceStrains = useReferenceStrains();

  const newOrganisms = useNewOrganisms();

  const [
    preferredOrganismsEnabled,
    setPreferredOrganismsEnabled,
  ] = usePreferredOrganismsEnabled();

  const togglePreferredOrganisms = useCallback(() => {
    setPreferredOrganismsEnabled(
      (preferredOrganismsEnabled) => !preferredOrganismsEnabled
    );
  }, [setPreferredOrganismsEnabled]);

  return (
    <PreferredOrganismsConfig
      availableOrganisms={availableOrganisms}
      configSelection={preferredOrganismsState}
      newOrganisms={newOrganisms}
      organismTree={organismTree}
      preferredOrganismsEnabled={preferredOrganismsEnabled}
      projectId={projectIdValue}
      referenceStrains={referenceStrains}
      setConfigSelection={setPreferredOrganismsState}
      togglePreferredOrganisms={togglePreferredOrganisms}
    />
  );
}
