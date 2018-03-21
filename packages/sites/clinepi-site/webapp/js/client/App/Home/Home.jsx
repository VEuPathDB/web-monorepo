import React from 'react';

import './HomePage.scss';
import homeSections from 'Client/data/homeSections';
import { Showcase } from 'Client/App/Showcase';
import { RestrictionTrigger } from 'Client/App/DataRestriction';

class HomePage extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    console.info('home gettin props', this.props);
    const { webAppUrl, projectId } = this.props;
    return (
      <div className="HomePage">
        {homeSections.map((section, idx) => (
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
