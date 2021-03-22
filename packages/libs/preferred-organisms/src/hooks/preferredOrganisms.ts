import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { useOrganismTree } from '@veupathdb/web-common/lib/hooks/organisms';
import {
  fetchPreferredOrganisms,
  OrganismPreference,
} from '../utils/preferredOrganisms';

export function useOrganismPerference(): OrganismPreference | undefined {
  const organismTree = useOrganismTree(true);

  return useWdkService(
    async (wdkService) =>
      organismTree && fetchPreferredOrganisms(wdkService, organismTree),
    [organismTree]
  );
}
