import React from 'react';
import { Link } from 'react-router-dom';

import { IconAlt as Icon } from '@veupathdb/wdk-client/lib/Components';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import './UserMenu.scss';

interface Actions {
  showLoginForm: (destination: string) => void;
  showLogoutWarning: () => void;
}

interface UserMenuProps {
  user?: User;
  actions: Actions;
  webAppUrl?: string; // passed in in several places but not used - potentially remove?
}

interface MenuItem {
  icon: string;
  text: string;
  onClick?: () => void;
  route?: string;
  target?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, actions }) => {
  if (!user) return null;

  const { isGuest, properties = {} } = user;
  const iconClass = 'user-circle' + (isGuest ? '-o' : '');

  const renderMenu = (): JSX.Element => {
    const items: MenuItem[] = isGuest
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
          const className =
            'UserMenu-Pane-Item UserMenu-Pane-Item--interactive';

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

          if (route) {
            return (
              <Link key={key} className={className} to={route} target={target}>
                <Icon fa={icon + ' UserMenu-Pane-Item-Icon'} />
                {text}
              </Link>
            );
          }

          return (
            <div key={key} className="UserMenu-Pane-Item">
              <Icon fa={icon + ' UserMenu-Pane-Item-Icon'} />
              {text}
            </div>
          );
        })}
        <hr style={{ margin: '10px 0', borderColor: '#ccc' }} />
        {isGuest === false ? (
          <div className="UserMenu-Pane-Item">
            <Icon fa="check-circle UserMenu-Pane-Item-Icon UserMenu-StatusIcon--success" />
            Subscribed
          </div>
        ) : (
          <Link
            to="/user/profile/#subscription"
            className="UserMenu-Pane-Item UserMenu-Pane-Item--interactive"
          >
            <Icon fa="exclamation-triangle UserMenu-Pane-Item-Icon UserMenu-StatusIcon--warning" />
            Unsubscribed
          </Link>
        )}
      </div>
    );
  };

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
      {renderMenu()}
    </div>
  );
};

export default UserMenu;
