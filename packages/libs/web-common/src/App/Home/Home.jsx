import React from 'react';
import { Showcase } from '../../App/Showcase';
import { News } from '../../App/NewsSidebar';

import './HomePage.scss';

export default function HomePage({
  newsSidebar,
  twitterUrl,
  webAppUrl,
  projectId,
  siteData,
  attemptAction,
  homeContent,
}) {
  return (
    <div className="HomePage">
      <div className="Showcase-Section">
        {homeContent.map((section, idx) => (
          <Showcase
            studies={siteData.studies.entities}
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
