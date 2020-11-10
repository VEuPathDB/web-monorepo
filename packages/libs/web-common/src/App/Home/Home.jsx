import React from 'react';
import { Showcase } from 'ebrc-client/App/Showcase';
import { News } from 'ebrc-client/App/NewsSidebar';

import './HomePage.scss';

const HomePage = ({ newsSidebar, twitterUrl, webAppUrl, projectId, siteData, attemptAction, homeContent }) =>
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

export default HomePage;
