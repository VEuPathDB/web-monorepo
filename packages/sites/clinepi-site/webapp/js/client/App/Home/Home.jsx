import React from 'react';

import getCopy from 'Client/data/Copy';
import getSections from 'Client/data/Sections';

import { Hero } from 'Client/App/Hero';
import { Showcase } from 'Client/App/Showcase';

class HomePage extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { prefix } = this.props;
    const Copy = getCopy(prefix);
    const Sections = getSections(prefix);

    return (
      <div className="HomePage">
        <Hero image={Copy.heroImage} position={Copy.heroPosition}>
          <h1 dangerouslySetInnerHTML={{ __html: Copy.heading }} />
          <h3 dangerouslySetInnerHTML={{ __html: Copy.tagline }} />
          <p dangerouslySetInnerHTML={{ __html: Copy.intro }} />
        </Hero>
        {/* <row className="ribbon">{Copy.cta}</row> */}
        {Sections.map((section, idx) => (
          <Showcase content={section} key={idx} />
        ))}
      </div>
    );
  }
};

export default HomePage;
