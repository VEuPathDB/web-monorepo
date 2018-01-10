import React from 'react';

import SiteMenuItem from './SiteMenuItem';

class SiteMenu extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { items, config } = this.props;
    return (
      <row className="SiteMenu">
        {!items ? null : items.map((item, key) => (
          <SiteMenuItem
            key={key}
            item={item}
            config={config}
          />
        ))}
      </row>
    );
  }
};

export default SiteMenu;
