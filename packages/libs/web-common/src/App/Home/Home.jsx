import React, { useEffect } from 'react';
import { useAnalysisList } from '@veupathdb/eda/lib/core/hooks/analysis';
import { mockAnalysisStore } from '@veupathdb/eda/lib/workspace/Mocks';
import { Showcase } from 'ebrc-client/App/Showcase';
import { News } from 'ebrc-client/App/NewsSidebar';

import './HomePage.scss';

export default function  HomePage({ newsSidebar, twitterUrl, webAppUrl, projectId, siteData, attemptAction, homeContent }) {
  const { analyses } = useAnalysisList(mockAnalysisStore);
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
