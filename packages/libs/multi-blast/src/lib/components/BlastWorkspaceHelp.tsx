import { useLocation } from 'react-router';

import ExternalContentController from '@veupathdb/web-common/lib/controllers/ExternalContentController';
import { useCommunitySiteRootUrl } from '@veupathdb/web-common/lib/hooks/staticData';

export function BlastWorkspaceHelp() {
  const communitySiteUrl = useCommunitySiteRootUrl();
  const location = useLocation();

  return communitySiteUrl == null ? null : (
    <ExternalContentController
      url={
        communitySiteUrl + 'multiblast.html' + location.search + location.hash
      }
    />
  );
}
