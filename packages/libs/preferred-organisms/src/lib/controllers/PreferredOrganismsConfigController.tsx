import { useCallback, useEffect, useMemo, useState } from 'react';
import { Prompt } from 'react-router-dom';

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
  const revertConfigSelection = useCallback(() => {
    setConfigSelection(preferredOrganisms);
  }, [preferredOrganisms]);

  const savingPreferredOrganismsDisabled = useMemo(() => {
    const configSelectionSet = new Set(configSelection);
    const preferredOrganismsSet = new Set(preferredOrganisms);

    if (configSelectionSet.size === 0) {
      return true;
    }

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

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!savingPreferredOrganismsDisabled) {
        e.preventDefault();
        e.returnValue = '';
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [savingPreferredOrganismsDisabled]);

  return (
    <>
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
        revertConfigSelection={revertConfigSelection}
        togglePreferredOrganisms={togglePreferredOrganisms}
      />
      <Prompt
        when={!savingPreferredOrganismsDisabled}
        message="Do you want to leave this page? Your unsaved changes to My Organism Preferences will be discarded."
      />
    </>
  );
}
