import { useCallback, useEffect, useMemo, useState } from 'react';
import { Prompt } from 'react-router-dom';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { PreferredOrganismsConfig } from '../components/PreferredOrganismsConfig';
import {
  useAvailableOrganisms,
  useDisplayName,
  useNewOrganisms,
  useOrganismTree,
  usePreferredOrganismsState,
  useSavePreferredOrganisms,
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

  const configIsUnchanged = useMemo(() => {
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

  const savingPreferredOrganismsEnabled =
    !configIsUnchanged && configSelection.length > 0;

  const savePreferredOrganisms = useSavePreferredOrganisms(configSelection);

  const displayName = useDisplayName();

  const referenceStrains = useReferenceStrains();

  const newOrganisms = useNewOrganisms();

  const toggleHelpVisible = useMemo(
    () => preferredOrganisms.length < availableOrganisms.size,
    [preferredOrganisms.length, availableOrganisms.size]
  );

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!configIsUnchanged) {
        e.preventDefault();
        e.returnValue = '';
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [configIsUnchanged]);

  return (
    <>
      <PreferredOrganismsConfig
        availableOrganisms={availableOrganisms}
        configSelection={configSelection}
        configIsUnchanged={configIsUnchanged}
        newOrganisms={newOrganisms}
        organismTree={organismTree}
        displayName={displayName}
        referenceStrains={referenceStrains}
        savePreferredOrganisms={savePreferredOrganisms}
        savingPreferredOrganismsEnabled={savingPreferredOrganismsEnabled}
        setConfigSelection={setConfigSelection}
        revertConfigSelection={revertConfigSelection}
        toggleHelpVisible={toggleHelpVisible}
      />
      <Prompt
        when={!configIsUnchanged}
        message="Do you want to leave this page? Your unapplied changes will be discarded."
      />
    </>
  );
}
