import React from 'react';

import './UserMenu.scss';

import { IconAlt as Icon } from 'wdk-client/Components';

class UserMenu extends React.Component {
  constructor (props) {
    super(props);
    this.state = { isHovered: false };
    this.renderMenu = this.renderMenu.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  onMouseEnter (event) {
    this.setState({ isHovered: true });
  }

  onMouseLeave (event) {
    this.setState({ isHovered: false });
  }

  renderMenu () {
    const { user, actions, webAppUrl } = this.props;
    const { showLoginForm } = actions;
    const { isHovered } = this.state;
    const { properties } = user;
    const { firstName, lastName } = properties;
    const items = user.isGuest
      ? [
        { icon: 'power-off', text: 'Login', onClick: () => actions.showLoginForm(window.location.href) },
        { icon: 'user-plus', text: 'Register', href: webAppUrl + '/app/user/registration', target: '_blank' }
      ] : [
        { icon: 'vcard', text: [ firstName, lastName ].join(' '), href: webAppUrl + '/app/user/profile' },
        { icon: 'power-off', text: 'Log Out', onClick: () => actions.showLogoutWarning(window.location.href) }
      ];

    return (
      <div className={'UserMenu-Pane' + (!isHovered ? ' inert' : '')}>
        {items.map((item, key) => {
          const { onClick, href, target } = item;
          const className = 'UserMenu-Pane-Item';
          let props = { className, key, onClick: onClick ? onClick: () => null };
          if (href) props = Object.assign({}, props, { href, target });
          const Element = href ? 'a' : 'div';
          return (
            <Element {...props}>
              <Icon fa={item.icon + ' UserMenu-Pane-Item-Icon'} />{item.text}
            </Element>
          );
        })}
      </div>
    );
  }

  render () {
    const { onMouseEnter, onMouseLeave } = this;
    const { user } = this.props;
    if (!user) return null;

    const { isGuest, properties } = user;
    const iconClass = 'user-circle' + (isGuest ? '-o' : '');
    const Menu = this.renderMenu;

    return (
      <box
        className="UserMenu"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}>
        <Icon className="UserMenu-Icon" fa={iconClass} />
        <span className="UserMenu-Title">
          {isGuest ? 'Guest' : properties.firstName}
        </span>
        <Menu />
      </box>
    );
  }
};

export default UserMenu;
