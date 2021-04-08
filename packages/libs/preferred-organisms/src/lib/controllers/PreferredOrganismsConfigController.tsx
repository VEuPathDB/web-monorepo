import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { PreferredOrganismsConfig } from '../components/PreferredOrganismsConfig';
import {
  useAvailableOrganisms,
  useNewOrganisms,
  useOrganismTree,
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

  return (
    <PreferredOrganismsConfig
      availableOrganisms={availableOrganisms}
      configSelection={preferredOrganismsState}
      newOrganisms={newOrganisms}
      organismTree={organismTree}
      projectId={projectIdValue}
      referenceStrains={referenceStrains}
      setConfigSelection={setPreferredOrganismsState}
    />
  );
}
