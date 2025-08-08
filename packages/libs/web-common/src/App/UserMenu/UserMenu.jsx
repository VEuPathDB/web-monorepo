import React from 'react';
import { Link } from 'react-router-dom';

import { IconAlt as Icon } from '@veupathdb/wdk-client/lib/Components';

import './UserMenu.scss';

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
            onClick: () => actions.showLoginForm(window.location.href),
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
        {items.map(({ route, target, onClick, icon, text }) => {
          const key = icon; // previously we used the index but this was creating a warning
          const className = 'UserMenu-Pane-Item';

          if (onClick) {
            return (
              <button
                key={key}
                type="button"
                className={className}
                onClick={onClick}
              >
                <Icon fa={icon + ' UserMenu-Pane-Item-Icon'} />
                {text}
              </button>
            );
          }

          return (
            <Link key={key} className={className} to={route} target={target}>
              <Icon fa={icon + ' UserMenu-Pane-Item-Icon'} />
              {text}
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
        <div className="UserMenu-IconContainer">
          <Icon className="UserMenu-Icon" fa={iconClass} />
          {/* TODO: Replace isGuest check with isSubscribed property when available */}
          {isGuest === false && (
            <Icon
              className="UserMenu-StatusIcon UserMenu-StatusIcon--success"
              fa="check-circle"
            />
          )}
          {isGuest === true && (
            <Icon
              className="UserMenu-StatusIcon UserMenu-StatusIcon--warning"
              fa="exclamation-triangle"
            />
          )}
        </div>
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
