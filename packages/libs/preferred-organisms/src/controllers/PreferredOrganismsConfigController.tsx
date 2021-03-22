import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { useOrganismTree } from '@veupathdb/web-common/lib/hooks/organisms';

import { PreferredOrganismsConfig } from '../components/PreferredOrganismsConfig';
import { useOrganismPerference } from '../hooks/preferredOrganisms';

export function PreferredOrganismsConfigController() {
  useSetDocumentTitle('Configure My Organisms');

  const organismPreference = useOrganismPerference();

  const organismTree = useOrganismTree(true);

  const projectId = useWdkService(async (wdkService) => {
    return (await wdkService.getConfig()).projectId;
  }, []);

  return organismPreference == null ||
    organismTree == null ||
    projectId == null ? null : (
    <PreferredOrganismsConfig
      organismPreference={organismPreference}
      organismTree={organismTree}
      projectId={projectId}
    />
  );
}
