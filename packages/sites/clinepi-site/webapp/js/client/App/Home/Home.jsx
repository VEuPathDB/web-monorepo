import React from 'react';

import './HomePage.scss';
import homeContent from 'Client/data/homeContent';
import { Showcase } from 'Client/App/Showcase';
import { News } from 'Client/App/NewsSidebar';

const HomePage = ({ news, webAppUrl, projectId, siteData, attemptAction }) =>
  <div className="HomePage">
    <div className="Showcase-Section">
      {homeContent(siteData).map((section, idx) => (
        <Showcase
          content={section}
          prefix={webAppUrl}
          projectId={projectId}
          attemptAction={attemptAction}
          key={idx}
        />
      ))}
    </div>
    <div className="News-Section">
      <News webAppUrl={webAppUrl} news={news} />
    </div>
  </div>

export default HomePage;
