import React from 'react';

import NavItem from './NavItem';

class NavMenu extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { items, config } = this.props;
    return (
      <row className="NavMenu">
        {!items ? null : items.map((item, key) => (
          <NavItem
            item={item}
            config={config}
            key={key}
          />
        ))}
      </row>
    );
  }
};

export default NavMenu;
