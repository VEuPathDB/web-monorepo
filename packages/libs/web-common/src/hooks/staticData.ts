import { useSelector } from 'react-redux';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

export function useCommunitySiteRootUrl(): string | undefined {
  const communitySiteRootUrl = useSelector(
    (state: RootState) => state.globalData.siteConfig?.communitySite
  );

  return communitySiteRootUrl;
};

export function useCommunitySiteProjectUrl(): string | undefined {
  const communitySiteRootUrl = useCommunitySiteRootUrl();

  const displayName = useSelector(
    (state: RootState) => state.globalData.config?.displayName
  );

  // FIXME: Remove the OrthoMCL-related hardcoding
  return displayName == null || communitySiteRootUrl == null
    ? undefined
    : displayName === 'OrthoMCL'
    ? `${communitySiteRootUrl}VEuPathDB`
    : `${communitySiteRootUrl}${displayName}`;
};
