import { useCallback, useEffect, useMemo, useState } from 'react';
import { Prompt } from 'react-router-dom';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { PreferredOrganismsConfig } from '../components/PreferredOrganismsConfig';
import {
  useAvailableOrganisms,
  useNewOrganisms,
  useOrganismTree,
  usePreferredOrganismsState,
  useProjectId,
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

  const projectIdValue = useProjectId();

  const referenceStrains = useReferenceStrains();

  const newOrganisms = useNewOrganisms();

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
        projectId={projectIdValue}
        referenceStrains={referenceStrains}
        savePreferredOrganisms={savePreferredOrganisms}
        savingPreferredOrganismsEnabled={savingPreferredOrganismsEnabled}
        setConfigSelection={setConfigSelection}
        revertConfigSelection={revertConfigSelection}
      />
      <Prompt
        when={!configIsUnchanged}
        message="Do you want to leave this page? Your unapplied changes will be discarded."
      />
    </>
  );
}
