/**
 * based on react-sidebar-v2: https://github.com/condense/react-leaflet-sidebarv2/blob/master/src/Sidebar.js
 * converting prop-types to typescript, additional features, cleanning typescript errors, and converting to function component
 */

import React from 'react';
// import { MapComponent } from 'react-leaflet'

//resize CSS
import './sidebar-resize.css';

//re-resizable
import { Resizable } from 're-resizable';
const resizeRightOnly = {
  top: false,
  right: true,
  bottom: false,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false,
};

/**
 * Type definitions for react-leaflet-sidebarv2 0.6, taken from Definitely Typed
 * But some modifications are made
 * Project: https://github.com/condense/react-leaflet-sidebarv2
 * Definitions by: Vikram Pareddy <https://github.com/vikram-gsu>
 * Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
 */

type Icon = string | React.ReactElement;
type Anchor = 'top' | 'bottom';
type Position = 'left' | 'right';

type TabType = React.ReactElement | Array<React.ReactElement>;

export interface TabProps {
  id: string;
  header: string;
  icon: Icon;
  anchor?: Anchor;
  disabled?: boolean;
  onClose?: () => void;
  closeIcon?: Icon;
  position?: Position;
  active?: boolean;
  children?: TabType;
}

export interface SidebarProps {
  id: string;
  collapsed: boolean;
  position: Position;
  selected: string;
  closeIcon?: Icon;
  onClose?: () => void;
  onOpen?: (id: string) => void;
  //change children as optional for component
  children?: TabType;
}

//extend TabProps to have divider prop
interface TabPropsAdd extends TabProps {
  //divider=true, then use divider
  divider?: boolean;
}

//change from TabProps to TabPropsAdd for considering divider icon
export function Tab(props: TabPropsAdd) {
  const active = props.active ? ' active' : '';
  let closeIcon;
  if (typeof props.closeIcon === 'string')
    closeIcon = <i className={props.closeIcon} />;
  else if (typeof props.closeIcon === 'object') closeIcon = props.closeIcon;
  else {
    //change fontawesome fa to fas
    const closecls =
      props.position === 'right' ? 'fas fa-caret-right' : 'fas fa-caret-left';
    closeIcon = <i className={closecls} />;
  }
  return (
    // change className
    <div id={props.id} className={'leaflet-sidebar-pane' + active}>
      <h1 className="leaflet-sidebar-header">
        {props.header}
        <div className="leaflet-sidebar-close" onClick={props.onClose}>
          {closeIcon}
        </div>
      </h1>
      {props.children}
    </div>
  );
}

//using type definition from type-react-leaflet-sidebarv2.ts
// // https://github.com/facebook/react/issues/2979#issuecomment-222379916
// const TabType = PropTypes.shape({
//   type: PropTypes.oneOf([Tab])
// });
// type TabType = React.ReactElement<Tab> | Array<React.ReactElement<Tab>>;

//changed MapComponent to React.Component
export function Sidebar(props: SidebarProps) {
  function onClose(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    props.onClose && props.onClose();
  }

  function onOpen(e: React.MouseEvent, tabid: string) {
    e.preventDefault();
    e.stopPropagation();
    props.onOpen && props.onOpen(tabid);
  }

  //set tab as any for now
  function renderTab(tab: any) {
    let icon;
    if (typeof tab.props.icon === 'string')
      icon = <i className={tab.props.icon} />;
    else if (typeof tab.props.icon === 'object') icon = tab.props.icon;
    const active = tab.props.id === props.selected ? ' active' : '';
    const disabled = tab.props.disabled ? ' disabled' : '';

    //line divider using image file (made by DK)
    if (tab.props.disabled && tab.props.divider) {
      return (
        <li
          className={'sidebartabs' + active + disabled}
          key={tab.props.id}
          title={tab.props.header}
        >
          <a
            href={'#' + tab.props.id}
            role="tab"
            onClick={(e) => tab.props.disabled || onOpen(e, tab.props.id)}
          >
            <img src="./img/line-divider.png" />
          </a>
        </li>
      );
    } else {
      return (
        //add title attribute here for tooltip effect
        <li
          className={'sidebartabs' + active + disabled}
          key={tab.props.id}
          title={tab.props.header}
        >
          <a
            href={'#' + tab.props.id}
            role="tab"
            onClick={(e) => tab.props.disabled || onOpen(e, tab.props.id)}
          >
            {icon}
          </a>
        </li>
      );
    }
  }

  //children here is a content inside <Tab> so set it as any for now
  function renderPanes(children: any) {
    return React.Children.map(children, (p) =>
      React.cloneElement(p, {
        onClose: onClose,
        closeIcon: props.closeIcon,
        active: p.props.id === props.selected,
        position: props.position || 'left',
      })
    );
  }

  // Override render() so the <Map> element contains a div we can render to
  //change sidebar -> leaflet-sidebar
  const position = ' leaflet-sidebar-' + (props.position || 'left');
  const collapsed = props.collapsed ? ' collapsed' : '';

  const allTabs = React.Children.toArray(props.children).filter((c) => !!c);
  //for now tab type at filter() is set to any for avoiding the type error on tab.props
  const bottomtabs = allTabs.filter(
    (tab: any) => tab.props.anchor === 'bottom'
  );
  const toptabs = allTabs.filter((tab: any) => tab.props.anchor !== 'bottom');

  return (
    // change className; not clear why ref is used here so it is removed for now
    // <div id={this.props.id} className={"leaflet-sidebar leaflet-touch" + position + collapsed}
    //   ref={el => this.rootElement = el}>
    <div
      id={props.id}
      className={'leaflet-sidebar leaflet-touch' + position + collapsed}
    >
      <div className="leaflet-sidebar-tabs">
        <ul role="tablist">
          {' '}
          {/* Top-aligned */}
          {toptabs.map((toptab) => renderTab(toptab))}
        </ul>
        <ul role="tablist">
          {' '}
          {/* Bottom-aligned */}
          {bottomtabs.map((bottomtab) => renderTab(bottomtab))}
        </ul>
      </div>
      {/* set re-resizable here for implementing resize functionality */}
      <Resizable
        className="leaflet-sidebar-content"
        minWidth={420}
        enable={resizeRightOnly}
      >
        {renderPanes(allTabs)}
        {/* icon for showing two vertical bar like displaying resizable */}
        <div className="ui-resizable-e fas fa-grip-lines-vertical"></div>
      </Resizable>
    </div>
  );
}
