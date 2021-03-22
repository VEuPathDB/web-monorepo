import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { useOrganismTree } from '@veupathdb/web-common/lib/hooks/organisms';

import { PreferredOrganismsConfig } from '../components/PreferredOrganismsConfig';

export function PreferredOrganismsConfigController() {
  useSetDocumentTitle('Configure My Organisms');

  const organismTree = useOrganismTree(true);

  return organismTree == null ? null : (
    <PreferredOrganismsConfig organismTree={organismTree} />
  );
}
