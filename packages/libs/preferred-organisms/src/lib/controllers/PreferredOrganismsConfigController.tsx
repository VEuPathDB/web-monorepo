import { useMemo, useState } from 'react';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { PreferredOrganismsConfig } from '../components/PreferredOrganismsConfig';
import {
  useAvailableOrganisms,
  useNewOrganisms,
  useOrganismTree,
  usePreferredOrganismsEnabledState,
  usePreferredOrganismsState,
  useProjectId,
  useSavePreferredOrganisms,
  useTogglePreferredOrganisms,
} from '../hooks/preferredOrganisms';
import { useReferenceStrains } from '../hooks/referenceStrains';

export function PreferredOrganismsConfigController() {
  useSetDocumentTitle('My Organism Preferences');

  const availableOrganisms = useAvailableOrganisms();

  const organismTree = useOrganismTree();

  const [preferredOrganisms] = usePreferredOrganismsState();
  const [configSelection, setConfigSelection] = useState(preferredOrganisms);

  const savingPreferredOrganismsDisabled = useMemo(() => {
    const configSelectionSet = new Set(configSelection);
    const preferredOrganismsSet = new Set(preferredOrganisms);

    if (configSelectionSet.size !== preferredOrganismsSet.size) {
      return false;
    }

    return (
      configSelection.every((configOrganism) =>
        preferredOrganismsSet.has(configOrganism)
      ) &&
      preferredOrganisms.every((preferredOrganism) =>
        configSelectionSet.has(preferredOrganism)
      )
    );
  }, [configSelection, preferredOrganisms]);

  const savePreferredOrganisms = useSavePreferredOrganisms(configSelection);

  const projectIdValue = useProjectId();

  const referenceStrains = useReferenceStrains();

  const newOrganisms = useNewOrganisms();

  const [preferredOrganismsEnabled] = usePreferredOrganismsEnabledState();

  const togglePreferredOrganisms = useTogglePreferredOrganisms();

  return (
    <PreferredOrganismsConfig
      availableOrganisms={availableOrganisms}
      configSelection={configSelection}
      newOrganisms={newOrganisms}
      organismTree={organismTree}
      preferredOrganismsEnabled={preferredOrganismsEnabled}
      projectId={projectIdValue}
      referenceStrains={referenceStrains}
      savePreferredOrganisms={savePreferredOrganisms}
      savingPreferredOrganismsDisabled={savingPreferredOrganismsDisabled}
      setConfigSelection={setConfigSelection}
      togglePreferredOrganisms={togglePreferredOrganisms}
    />
  );
}
