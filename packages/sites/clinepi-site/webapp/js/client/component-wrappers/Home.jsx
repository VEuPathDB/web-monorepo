import React, { useContext, useMemo } from 'react';
import { useAnalysisList } from '@veupathdb/eda/lib/core/hooks/analysis';
import { AnalysisClient } from '@veupathdb/eda/lib/core/api/AnalysisClient';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { edaServiceUrl } from '@veupathdb/web-common/lib/config';
import { Showcase } from '@veupathdb/web-common/lib/App/Showcase';
import { News } from '@veupathdb/web-common/lib/App/NewsSidebar';
import { FeaturedTools } from '@veupathdb/web-common/lib/components/homepage/FeaturedTools';

import '@veupathdb/web-common/lib/App/Home/HomePage.scss';

export default function HomePage({
  newsSidebar,
  twitterUrl,
  webAppUrl,
  projectId,
  siteData,
  attemptAction,
  homeContent,
}) {
  const { wdkService } = useContext(WdkDependenciesContext);
  const analysisClient = useMemo(
    () =>
      new AnalysisClient(
        {
          baseUrl: edaServiceUrl,
        },
        wdkService
      ),
    [wdkService]
  );
  const { analyses } = useAnalysisList(analysisClient);
  return (
    <div className="HomePage">
      <div className="Showcase-Section">
        <FeaturedTools />
      </div>
      <div className="News-Section">
        <News twitterUrls={[twitterUrl]} {...newsSidebar} />
      </div>
    </div>
  );
}
