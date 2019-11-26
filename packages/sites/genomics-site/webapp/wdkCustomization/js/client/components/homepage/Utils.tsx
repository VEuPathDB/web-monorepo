import { useSelector } from 'react-redux';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { RootState } from 'wdk-client/Core/State/Types';

export const makeVpdbClassNameHelper = (suffix: string, ...modifiers: any[]) => makeClassNameHelper(`vpdb-${suffix}`);

export const useCommunitySiteUrl = (): string | undefined => {
  const communitySiteUrl = useSelector(
    (state: RootState) => state.globalData.siteConfig && state.globalData.siteConfig.communitySite
  );

  return communitySiteUrl;
};
