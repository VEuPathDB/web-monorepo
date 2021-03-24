import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { PreferredOrganismsConfig } from '../components/PreferredOrganismsConfig';
import {
  useAvailableOrganisms,
  useOrganismTree,
  usePreferredOrganismsState,
  useProjectId,
} from '../hooks/preferredOrganisms';

export function PreferredOrganismsConfigController() {
  useSetDocumentTitle('Configure My Organisms');

  const availableOrganisms = useAvailableOrganisms();

  const organismTree = useOrganismTree();

  const [
    preferredOrganismsState,
    setPreferredOrganismsState,
  ] = usePreferredOrganismsState();

  const projectIdValue = useProjectId();

  return (
    <PreferredOrganismsConfig
      availableOrganisms={availableOrganisms}
      configSelection={preferredOrganismsState}
      organismTree={organismTree}
      projectId={projectIdValue}
      setConfigSelection={setPreferredOrganismsState}
    />
  );
}
