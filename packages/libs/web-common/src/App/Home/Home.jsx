import React, { useContext, useMemo } from 'react';
import { useAnalysisList } from '@veupathdb/eda/lib/core/hooks/analysis';
import { AnalysisClient } from '@veupathdb/eda/lib/core/api/analysis-api';
import { Showcase } from 'ebrc-client/App/Showcase';
import { News } from 'ebrc-client/App/NewsSidebar';
import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import './HomePage.scss';

export default function  HomePage({ newsSidebar, twitterUrl, webAppUrl, projectId, siteData, attemptAction, homeContent }) {
  const { wdkService } = useContext(WdkDepdendenciesContext);
  const analysisClient = useMemo(() => new AnalysisClient({
    baseUrl: '/eda-data'
  }, wdkService), [wdkService]);
  const { analyses } = useAnalysisList(analysisClient);
  return (
    <div className="HomePage">
      <div className="Showcase-Section">
        {homeContent.map((section, idx) => (
          <Showcase
            studies={siteData.studies.entities}
            analyses={analyses}
            content={section}
            prefix={webAppUrl}
            projectId={projectId}
            attemptAction={attemptAction}
            key={idx}
          />
        ))}
      </div>
      <div className="News-Section">
        <News twitterUrls={[twitterUrl]} {...newsSidebar} />
      </div>
    </div>
  );
}
