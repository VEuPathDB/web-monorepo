import React from 'react';

import './SiteMenu.scss';
import SiteMenuItem from './SiteMenuItem';

class SiteMenu extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { items, config } = this.props;
    return (
      <div className="row SiteMenu">
        {!items ? null : items.map((item, key) => (
          <SiteMenuItem
            key={key}
            item={item}
            config={config}
          />
        ))}
      </div>
    );
  }
};

export default SiteMenu;
