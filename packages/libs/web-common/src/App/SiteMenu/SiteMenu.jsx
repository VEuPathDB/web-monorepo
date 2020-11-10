import React from 'react';

import './SiteMenu.scss';
import SiteMenuItem from './SiteMenuItem';

class SiteMenu extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { items, config, actions, user} = this.props;
    return (
      <div className="row SiteMenu">
        {!items ? null : items.map((item, key) => (
          <SiteMenuItem
            key={key}
            item={item}
            config={config}
            actions={actions}
            user={user}
          />
        ))}
      </div>
    );
  }
};

export default SiteMenu;
