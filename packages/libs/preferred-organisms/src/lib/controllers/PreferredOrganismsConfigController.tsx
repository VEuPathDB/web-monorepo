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
  useUpdatePreferredOrganisms,
} from '../hooks/preferredOrganisms';
import { useReferenceStrains } from '../hooks/referenceStrains';

export function PreferredOrganismsConfigController() {
  useSetDocumentTitle('My Organism Preferences');

  const availableOrganisms = useAvailableOrganisms();

  const organismTree = useOrganismTree();

  const [preferredOrganisms] = usePreferredOrganismsState();
  const updatePreferredOrganisms = useUpdatePreferredOrganisms();

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
      newOrganisms={newOrganisms}
      organismTree={organismTree}
      preferredOrganisms={preferredOrganisms}
      preferredOrganismsEnabled={preferredOrganismsEnabled}
      projectId={projectIdValue}
      referenceStrains={referenceStrains}
      savePreferredOrganisms={updatePreferredOrganisms}
      togglePreferredOrganisms={togglePreferredOrganisms}
    />
  );
}
