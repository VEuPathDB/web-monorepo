import { useOrganismTree } from '@veupathdb/web-common/lib/hooks/organisms';

import { PreferredOrganismsConfig } from '../components/PreferredOrganismsConfig';

export function PreferredOrganismsConfigController() {
  const organismTree = useOrganismTree(true);

  return organismTree == null ? null : (
    <PreferredOrganismsConfig organismTree={organismTree} />
  );
}
