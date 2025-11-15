import { isEmpty, identity } from 'lodash';
import React from 'react';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

interface MenuItem {
  id?: string;
  text: string | React.ReactNode;
  tooltip?: string;
  url?: string;
  webAppUrl?: string;
  route?: string;
  target?: string;
  onClick?: (e: React.MouseEvent) => void;
  loginRequired?: boolean;
  beta?: boolean;
  new?: boolean;
  children?: MenuItem[];
  include?: string[];
  exclude?: string[];
}

interface MenuProps {
  webAppUrl: string;
  showLoginWarning?: (feature: string, url: string) => void;
  items: MenuItem[];
  isGuest?: boolean;
  projectId: string;
}

/**
 * Site menu
 */
export default function Menu(props: MenuProps) {
  return (
    <ul className="eupathdb-Menu">
      {props.items.filter(identity).map((item, index) => (
        <MenuItem
          key={item.id || index}
          item={item}
          webAppUrl={props.webAppUrl}
          isGuest={props.isGuest}
          showLoginWarning={props.showLoginWarning}
          projectId={props.projectId}
        />
      ))}
    </ul>
  );
}

interface MenuItemProps {
  webAppUrl: string;
  showLoginWarning?: (feature: string, url: string) => void;
  item: MenuItem;
  isGuest?: boolean;
  projectId: string;
}

/**
 * Site menu item.
 */
function MenuItem(props: MenuItemProps) {
  let { item, webAppUrl, showLoginWarning, isGuest, projectId } = props;

  if (!include(item, projectId)) return null;

  let handleClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>
  ) => {
    if (item.onClick) {
      item.onClick(e);
    }
    if (item.loginRequired && isGuest && showLoginWarning) {
      e.preventDefault();
      e.stopPropagation();
      showLoginWarning(
        'use this feature',
        (e.currentTarget as HTMLAnchorElement).href
      );
    }
  };
  let baseClassName = 'eupathdb-MenuItemText';
  let className =
    baseClassName +
    ' ' +
    baseClassName +
    '__' +
    item.id +
    (item.beta ? ' ' + baseClassName + '__beta' : '') +
    (item.new ? ' ' + baseClassName + '__new' : '') +
    (!isEmpty(item.children) ? ' ' + baseClassName + '__parent' : '');

  return (
    <li className={`eupathdb-MenuItem eupathdb-MenuItem__${item.id}`}>
      {item.url ? (
        <a
          onClick={handleClick}
          className={className}
          title={item.tooltip}
          href={item.url}
          target={item.target}
        >
          {renderItemText(item.text)}
        </a>
      ) : item.webAppUrl ? (
        <a
          onClick={handleClick}
          className={className}
          title={item.tooltip}
          href={webAppUrl + item.webAppUrl}
        >
          {renderItemText(item.text)}
        </a>
      ) : item.route ? (
        <Link
          onClick={handleClick}
          className={className}
          title={item.tooltip}
          to={item.route}
        >
          {renderItemText(item.text)}
        </Link>
      ) : (
        <div className={className} title={item.tooltip}>
          {renderItemText(item.text)}
        </div>
      )}

      {!isEmpty(item.children) && (
        <ul className="eupathdb-Submenu">
          {item.children!.filter(identity).map((childItem, index) => (
            <MenuItem {...props} key={childItem.id || index} item={childItem} />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Determine is menu item should be include for projectId
 */
function include(item: MenuItem, projectId: string) {
  const { include, exclude } = item;
  return (
    (include == null && exclude == null) ||
    (include != null && include.indexOf(projectId) !== -1) ||
    (exclude != null && exclude.indexOf(projectId) === -1)
  );
}

/**
 * Returns a render compatible element
 */
function renderItemText(text: string | React.ReactNode) {
  return typeof text === 'string' ? safeHtml(text) : text;
}
