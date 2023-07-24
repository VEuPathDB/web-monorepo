import { isEmpty, identity } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

/**
 * Site menu
 */
export default function Menu(props) {
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

Menu.propTypes = {
  webAppUrl: PropTypes.string.isRequired,
  showLoginWarning: PropTypes.func,
  items: PropTypes.array.isRequired,
  isGuest: PropTypes.bool,
  projectId: PropTypes.string.isRequired,
};

/**
 * Site menu item.
 */
function MenuItem(props) {
  let { item, webAppUrl, showLoginWarning, isGuest, projectId } = props;

  if (!include(item, projectId)) return null;

  let handleClick = (e) => {
    if (item.onClick) {
      item.onClick(e);
    }
    if (item.loginRequired && isGuest) {
      e.preventDefault();
      e.stopPropagation();
      showLoginWarning('use this feature', e.currentTarget.href);
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
          {item.children.filter(identity).map((childItem, index) => (
            <MenuItem {...props} key={childItem.id || index} item={childItem} />
          ))}
        </ul>
      )}
    </li>
  );
}

MenuItem.propTypes = {
  webAppUrl: PropTypes.string.isRequired,
  showLoginWarning: PropTypes.func,
  item: PropTypes.object.isRequired,
  isGuest: PropTypes.bool,
  projectId: PropTypes.string.isRequired,
};

/**
 * Determine is menu item should be include for projectId
 */
function include(item, projectId) {
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
function renderItemText(text) {
  return typeof text === 'string' ? safeHtml(text) : text;
}
