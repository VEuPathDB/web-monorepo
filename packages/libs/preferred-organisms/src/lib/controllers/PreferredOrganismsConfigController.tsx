import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { PreferredOrganismsConfig } from '../components/PreferredOrganismsConfig';
import {
  useAvailableOrganisms,
  useOrganismTree,
  usePreferredOrganismsState,
  useProjectId,
} from '../hooks/preferredOrganisms';
import { useReferenceStrains } from '../hooks/referenceStrains';

export function PreferredOrganismsConfigController() {
  useSetDocumentTitle('Configure My Organisms');

  const availableOrganisms = useAvailableOrganisms();

  const organismTree = useOrganismTree();

  const [
    preferredOrganismsState,
    setPreferredOrganismsState,
  ] = usePreferredOrganismsState();

  const projectIdValue = useProjectId();

  const referenceStrains = useReferenceStrains();

  return (
    <PreferredOrganismsConfig
      availableOrganisms={availableOrganisms}
      configSelection={preferredOrganismsState}
      organismTree={organismTree}
      projectId={projectIdValue}
      referenceStrains={referenceStrains}
      setConfigSelection={setPreferredOrganismsState}
    />
  );
}
