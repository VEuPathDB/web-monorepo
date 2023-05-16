import React, { Suspense } from 'react';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import {
  edaServiceUrl,
  edaSingleAppMode,
  projectId,
  webAppUrl,
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
          siteHomeUrl: webAppUrl,
          // TODO Remove hardcoded logo after demo
          // Hardcode veupathdb logo for now.
          // siteLogoSrc: `${webAppUrl}/images/VEuPathDB/icons-footer/${projectId.toLowerCase()}.png`,
          siteLogoSrc: `${webAppUrl}/images/VEuPathDB/icons-footer/VEuPathDB.png`,
          siteName: projectConfig?.displayName ?? '',
        }}
        sharingUrl={''}
      />
    </Suspense>
  );
}
