import { isEqual } from 'lodash';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';

import {
  showLoginForm,
  showLogoutWarning,
} from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';
import { Link, IconAlt } from '@veupathdb/wdk-client/lib/Components';
import DeferredDiv from '@veupathdb/wdk-client/lib/Components/Display/DeferredDiv';
import { DispatchAction } from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import UserMenu from '../../App/UserMenu';
import { SocialMediaLinks } from '../../components/homepage/SocialMediaLinks';
import { SiteSearchInput } from '../SiteSearch/SiteSearchInput';
import { SITE_SEARCH_ROUTE } from '../SiteSearch/SiteSearchConstants';

import { webAppUrl } from '../../config';

import { combineClassNames } from './Utils';

import './Header.scss';

const cx = makeClassNameHelper('ebrc-Header');

const HAMBURGER_SCREEN_SIZE = 1013;

const useWebAppUrl = (): string => {
  // FIXME: Pull this from global data
  return webAppUrl;
};

type StateProps = {
  user?: User;
};

type DispatchProps = {
  actions: {
    showLoginForm: (url: string) => void;
    showLogoutWarning: () => void;
  };
};

type OwnProps = {
  containerClassName?: string;
  menuItems: HeaderMenuItem[];
  onShowAnnouncements: () => void;
  showAnnouncementsToggle: boolean;
  branding: ReactNode;
};

type Props = StateProps & DispatchProps & RouteComponentProps<any> & OwnProps;

type FocusType = 'hover' | 'click' | 'unfocused';

type HeaderMenuItemBase<T> = {
  key: string;
  display: ReactNode;
  tooltip?: string;
  metadata?: T;
};

interface RouteMenuItem<T> extends HeaderMenuItemBase<T> {
  type: 'reactRoute';
  url: string;
  target?: string;
}

interface WebAppMenuItem<T> extends HeaderMenuItemBase<T> {
  type: 'webAppRoute';
  url: string;
  target?: string;
}

interface ExternalLinkMenuItem<T> extends HeaderMenuItemBase<T> {
  type: 'externalLink';
  url: string;
  rel?: string;
  target?: string;
}

interface SubmenuItem<T> extends HeaderMenuItemBase<T> {
  type: 'subMenu';
  items: HeaderMenuItem<T>[];
}

interface CustomMenuItem<T> extends HeaderMenuItemBase<T> {
  type: 'custom';
}

export type HeaderMenuItem<T = {}> =
  | RouteMenuItem<T>
  | WebAppMenuItem<T>
  | ExternalLinkMenuItem<T>
  | SubmenuItem<T>
  | CustomMenuItem<T>;

const hasAsAncestor = (e: Element, ancestorCandidate: Element): boolean => {
  if (e === ancestorCandidate) {
    return true;
  } else if (!e.parentElement) {
    return false;
  } else {
    return hasAsAncestor(e.parentElement, ancestorCandidate);
  }
};

const HeaderView = withRouter(
  ({
    containerClassName,
    menuItems,
    actions,
    user,
    location,
    onShowAnnouncements,
    showAnnouncementsToggle,
    branding,
  }: Props) => {
    const menuBarRef = useRef<HTMLDivElement>(null);
    const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
    const [focusType, setFocusType] = useState<FocusType>('unfocused');
    const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

    const toggleHamburgerMenu = useCallback(() => {
      setShowHamburgerMenu(!showHamburgerMenu);
    }, [showHamburgerMenu]);

    const dismissSubmenus = useCallback(() => {
      setFocusType('unfocused');
      setSelectedMenuItems([]);
    }, []);

    const closeSubmenusOnClickout = useCallback(
      (e: MouseEvent) => {
        if (
          menuBarRef.current &&
          e.target instanceof Element &&
          !hasAsAncestor(e.target, menuBarRef.current)
        ) {
          if (selectedMenuItems.length) {
            dismissSubmenus();
          }
        }
      },
      [selectedMenuItems, menuBarRef.current, dismissSubmenus]
    );

    useEffect(() => {
      window.addEventListener('click', closeSubmenusOnClickout);

      return () => {
        window.removeEventListener('click', closeSubmenusOnClickout);
      };
    }, [closeSubmenusOnClickout]);

    useEffect(() => {
      setShowHamburgerMenu(false);
      dismissSubmenus();
    }, [location.pathname, location.pathname]);

    return (
      <header className={combineClassNames(cx(), containerClassName)}>
        <a href="https://veupathdb.org" className={cx('ProjectBranding')}></a>
        <div className={cx('BrandingContainer')}>{branding}</div>
        <button
          className={cx('Hamburger')}
          type="button"
          onClick={toggleHamburgerMenu}
        >
          <IconAlt fa="bars" />
        </button>
        <div
          ref={menuBarRef}
          className={cx(
            'MenuBar',
            showHamburgerMenu ? 'hamburger-shown' : 'hamburger-hidden'
          )}
        >
          <MenuItemGroup
            menuItems={menuItems}
            selectedItems={selectedMenuItems}
            setSelectedItems={setSelectedMenuItems}
            focusType={focusType}
            setFocusType={setFocusType}
            dismissSubmenus={dismissSubmenus}
          />
        </div>
        <SiteSearchInput siteSearchURL={webAppUrl + SITE_SEARCH_ROUTE} />
        <UserMenu webAppUrl={webAppUrl} user={user} actions={actions} />
        <SocialMediaLinks
          showAnnouncementsToggle={showAnnouncementsToggle}
          onShowAnnouncements={onShowAnnouncements}
        />
      </header>
    );
  }
);

const mapStateToProps = (state: RootState): StateProps => ({
  user: state.globalData.user,
});

const mapDispatchToProps = (dispatch: DispatchAction): DispatchProps => ({
  actions: {
    showLoginForm: (url: string) => dispatch(showLoginForm(url)),
    showLogoutWarning: () => dispatch(showLogoutWarning()),
  },
});

export const Header = connect(mapStateToProps, mapDispatchToProps)(HeaderView);

type MenuItemGroupProps = {
  menuItems: HeaderMenuItem[];
  path?: string[];
  selectedItems: string[];
  focusType: FocusType;
  setSelectedItems: (newSelectedItems: string[]) => void;
  setFocusType: (newFocusType: FocusType) => void;
  dismissSubmenus: () => void;
};

const MenuItemGroup = ({
  menuItems,
  path = [],
  selectedItems,
  focusType,
  setSelectedItems,
  setFocusType,
  dismissSubmenus,
}: MenuItemGroupProps) => (
  <div className={cx('MenuItemGroup')}>
    {menuItems.map((menuItem) => (
      <HeaderMenuItemContent
        key={menuItem.key}
        item={menuItem}
        path={[...path, menuItem.key]}
        selectedItems={selectedItems}
        focusType={focusType}
        setSelectedItems={setSelectedItems}
        setFocusType={setFocusType}
        dismissSubmenus={dismissSubmenus}
      />
    ))}
  </div>
);

type HeaderMenuItemContentProps = {
  item: HeaderMenuItem;
  path: string[];
  selectedItems: string[];
  focusType: FocusType;
  setSelectedItems: (newSelectedItems: string[]) => void;
  setFocusType: (newFocusType: FocusType) => void;
  dismissSubmenus: () => void;
};

const HeaderMenuItemContent = ({
  item,
  path,
  selectedItems,
  focusType,
  setSelectedItems,
  setFocusType,
  dismissSubmenus,
}: HeaderMenuItemContentProps) => {
  const webAppUrl = useWebAppUrl();

  const onMouseEnter =
    item.type === 'subMenu'
      ? (e: React.MouseEvent) => {
          // Note that we don't open items on hover when we're using the hamburger menu
          // FIXME Find a cleaner way to do this
          if (focusType !== 'click' && !isHamburgerWidth()) {
            setFocusType('hover');
            setSelectedItems(path);
          }
        }
      : undefined;

  const onMouseLeave =
    item.type === 'subMenu'
      ? (e: React.MouseEvent) => {
          if (focusType === 'hover') {
            dismissSubmenus();
          }
        }
      : undefined;

  const selected = selectedItems.includes(item.key);

  return (
    <div
      className={cx('MenuItemContent')}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {item.type === 'reactRoute' ? (
        <Link to={item.url} target={item.target} onClick={dismissSubmenus}>
          {item.display}
        </Link>
      ) : item.type === 'webAppRoute' ? (
        <a
          title={item.tooltip}
          href={`${webAppUrl}${item.url}`}
          target={item.target}
          onClick={dismissSubmenus}
        >
          {item.display}
        </a>
      ) : item.type === 'externalLink' ? (
        <a
          title={item.tooltip}
          href={item.url}
          rel={item.rel}
          target={item.target}
          onClick={dismissSubmenus}
        >
          {item.display}
        </a>
      ) : item.type === 'subMenu' && path.length === 1 ? (
        <div
          className={cx('SubmenuGroup', selected ? 'selected' : 'unselected')}
          aria-haspopup
          aria-expanded={selected}
          onClick={(e) => {
            if (!(e.target instanceof HTMLAnchorElement)) {
              setFocusType('click');
            }
          }}
        >
          <a
            title={item.tooltip}
            href="#"
            onClick={(e) => {
              e.preventDefault();

              if (isEqual(selectedItems, path)) {
                // We have clicked on a submenu header a second time
                if (focusType !== 'click') {
                  setFocusType('click');
                } else {
                  dismissSubmenus();
                }
              } else {
                // We have clicked a different submenu header than the previous one
                if (isHamburgerWidth()) {
                  setFocusType('click');
                } else {
                  setFocusType('hover');
                }
                setSelectedItems(path);
              }
            }}
          >
            {item.display}
          </a>
          <DeferredDiv
            visible={selected}
            className={cx('MenuItemGroupContainer')}
          >
            <MenuItemGroup
              menuItems={item.items}
              path={path}
              selectedItems={selectedItems}
              focusType={focusType}
              setSelectedItems={setSelectedItems}
              setFocusType={setFocusType}
              dismissSubmenus={dismissSubmenus}
            />
          </DeferredDiv>
        </div>
      ) : item.type === 'subMenu' ? (
        <details>
          <summary>
            <span>{item.display}</span>
          </summary>
          {item.items.map((subItem) => (
            <HeaderMenuItemContent
              key={subItem.key}
              item={subItem}
              path={[...path, subItem.key]}
              selectedItems={selectedItems}
              focusType={focusType}
              setSelectedItems={setSelectedItems}
              setFocusType={setFocusType}
              dismissSubmenus={dismissSubmenus}
            />
          ))}
        </details>
      ) : (
        item.display
      )}
    </div>
  );
};

function isHamburgerWidth() {
  return document.documentElement.clientWidth <= HAMBURGER_SCREEN_SIZE;
}
