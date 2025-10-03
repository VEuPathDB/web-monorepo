import React from 'react';
import { Link } from 'react-router-dom';

import { IconAlt as Icon } from '@veupathdb/wdk-client/lib/Components';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { useSubscriptionGroups } from '@veupathdb/wdk-client/lib/Hooks/SubscriptionGroups';
import { userIsSubscribed } from '@veupathdb/wdk-client/lib/Utils/Subscriptions';
import { showSubscriptionProds } from '../../config';

import './UserMenu.scss';
import {
  UserLoggedIn,
  UserWarn,
  UserCheck,
  UserGuest,
} from '../../../../coreui/lib';

interface Actions {
  showLoginForm: (destination: string) => void;
  showLogoutWarning: () => void;
}

interface UserMenuProps {
  user: User;
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

export const UserMenu: React.FC<UserMenuProps> = ({ user, actions }) => {
  const subscriptionGroups = useSubscriptionGroups();
  const { properties = {} } = user;
  const isGuest = user.isGuest;

  // Don't determine subscription status while still loading
  const isSubscribed = userIsSubscribed(user, subscriptionGroups);

  const renderMenu = (): JSX.Element => {
    const items: MenuItem[] = [
      {
        icon: 'vcard',
        text: 'My Account',
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
        {renderItems(items)}
        {subscriptionGroups == null || !showSubscriptionProds ? null : ( // Still loading subscription data - don't show subscription status
          <>
            <hr style={{ margin: '10px 0', borderColor: '#ccc' }} />
            <Link
              to="/user/profile/#subscription"
              className="UserMenu-Pane-Item UserMenu-Pane-Item--interactive"
            >
              {isSubscribed ? (
                <>
                  <Icon fa="check-circle UserMenu-Pane-Item-Icon UserMenu-StatusIcon--success" />
                  Subscribed
                </>
              ) : (
                <>
                  <Icon fa="exclamation-triangle UserMenu-Pane-Item-Icon UserMenu-StatusIcon--warning" />
                  Not subscribed
                </>
              )}
            </Link>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={'box UserMenu UserMenu--expanded'}>
      <div className="UserMenu-IconContainer">
        {isGuest ? (
          <UserGuest className="UserMenu-GuestIcon" />
        ) : subscriptionGroups == null ? (
          // Still loading subscription groups
          <UserLoggedIn className="UserMenu-LoggedInIcon" />
        ) : isSubscribed ? (
          <UserCheck className="UserMenu-StatusIcon" />
        ) : showSubscriptionProds ? (
          <UserWarn className="UserMenu-StatusIcon" />
        ) : (
          <UserLoggedIn className="UserMenu-LoggedInIcon" />
        )}
      </div>
      <span className={'UserMenu-Title UserMenu-Title--expanded'}>
        {properties.firstName}
      </span>
      {renderMenu()}
    </div>
  );
};

export const UserMenuGuest: React.FC<Omit<UserMenuProps, 'user'>> = ({
  actions,
}) => {
  const renderMenu = (): JSX.Element => {
    const items: MenuItem[] = [
      {
        icon: 'sign-in',
        text: 'Login',
        onClick: () => actions.showLoginForm(window.location.href),
      },
      {
        icon: 'user-plus',
        text: 'Register',
        route: '/user/registration',
      },
    ];

    return <div className="UserMenu-Pane">{renderItems(items)}</div>;
  };

  // Return structure mostly mimics the UserMenu for consistency, but importantly
  // does not have the 'expanded' part of the class names.
  return (
    <div className={'box UserMenu'}>
      <div className="UserMenu-IconContainer">
        <UserGuest className="UserMenu-GuestIcon" />
      </div>
      <span className={'UserMenu-Title'}>Guest</span>
      {renderMenu()}
    </div>
  );
};

function renderItems(items: MenuItem[]): JSX.Element[] {
  return items.map(({ route, target, onClick, icon, text }) => {
    const key = icon; // previously we used the index but this was creating a warning
    const className = 'UserMenu-Pane-Item UserMenu-Pane-Item--interactive';

    if (onClick) {
      return (
        <button key={key} type="button" className={className} onClick={onClick}>
          <Icon fa={icon + ' UserMenu-Pane-Item-Icon'} />
          {text}
        </button>
      );
    }

    if (route) {
      // Blur on mouse out to prevent menu lingering via :focus-within
      return (
        <Link
          key={key}
          className={className}
          to={route}
          target={target}
          onMouseOut={(e) => e.currentTarget.blur()}
        >
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
  });
}
