import React, { Suspense } from 'react';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import {
  edaServiceUrl,
  edaSingleAppMode,
  projectId,
  rootUrl,
  webAppUrl,
  communityDatasetsEnabled,
} from '../config';

const EdaMap = React.lazy(() => import('@veupathdb/eda/lib/map'));

export function EdaMapController() {
  const projectConfig = useWdkService((wdkService) => wdkService.getConfig());
  return (
    <Suspense fallback={<Loading />}>
      <EdaMap
        singleAppMode={edaSingleAppMode}
        edaServiceUrl={edaServiceUrl}
        siteInformationProps={{
          loginUrl: '/user/login',
          // the client app's home page (e.g. /plasmo/app), not the legacy
          // webapp root (webAppUrl), which the dev server proxies elsewhere
          siteHomeUrl: rootUrl,
          siteLogoSrc: `${webAppUrl}/images/VEuPathDB/icons-footer/${projectId.toLowerCase()}.png`,
          siteName: projectConfig?.displayName ?? '',
        }}
        sharingUrlPrefix={'/maps'}
        showLinkToEda
        enablePublicUserDatasets={!!communityDatasetsEnabled}
      />
    </Suspense>
  );
}
