import React from 'react';

import './HomePage.scss';
import homeContent from 'Client/data/homeContent';
import { Showcase } from 'Client/App/Showcase';
import { RestrictionTrigger } from 'Client/App/DataRestriction';

class HomePage extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { webAppUrl, projectId, siteData } = this.props;
    const sections = homeContent(siteData);
    return (
      <div className="HomePage">
        {sections.map((section, idx) => (
          <Showcase
            content={section}
            prefix={webAppUrl}
            projectId={projectId}
            key={idx}
          />
        ))}
      </div>
    );
  }
};

export default HomePage;
