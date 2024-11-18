import React from 'react';
import { Link } from 'react-router-dom';

import './UserMenu.scss';

import { IconAlt as Icon } from '@veupathdb/wdk-client/lib/Components';
import { showLogoutWarning } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';

class UserMenu extends React.Component {
  constructor(props) {
    super(props);
    this.renderMenu = this.renderMenu.bind(this);
  }

  renderMenu() {
    const { user, actions } = this.props;
    const items = user.isGuest
      ? [
          {
            icon: 'sign-in',
            text: 'Login',
            route: `/user/login?destination=${encodeURIComponent(
              window.location
            )}`,
          },
          {
            icon: 'user-plus',
            text: 'Register',
            route: '/user/registration',
            target: '_blank',
          },
        ]
      : [
          {
            icon: 'vcard',
            text: 'My Profile',
            route: '/user/profile',
          },
          {
            icon: 'power-off',
            text: 'Log Out',
            onClick: () => actions.showLogoutWarning(),
          },
        ];

    return (
      <div className="UserMenu-Pane">
        {items.map((item, key) => {
          const { route, target, onClick } = item;
          const className = 'UserMenu-Pane-Item';

          if (onClick) {
            return (
              <button type="button" className={className} onClick={onClick}>
                <Icon fa={item.icon + ' UserMenu-Pane-Item-Icon'} />
                {item.text}
              </button>
            );
          }

          return (
            <Link key={key} className={className} to={route} target={target}>
              <Icon fa={item.icon + ' UserMenu-Pane-Item-Icon'} />
              {item.text}
            </Link>
          );
        })}
      </div>
    );
  }

  render() {
    const { user } = this.props;
    if (!user) return null;

    const { isGuest, properties = {} } = user;
    const iconClass = 'user-circle' + (isGuest ? '-o' : '');
    const Menu = this.renderMenu;

    return (
      <div className="box UserMenu">
        <Icon className="UserMenu-Icon" fa={iconClass} />
        <span className="UserMenu-Title">
          {typeof isGuest === 'undefined'
            ? '...'
            : isGuest !== false
            ? 'Guest'
            : properties.firstName}
        </span>
        <Menu />
      </div>
    );
  }
}

export default UserMenu;
