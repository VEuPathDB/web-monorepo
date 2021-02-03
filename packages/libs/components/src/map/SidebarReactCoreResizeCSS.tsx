/**
 * DKDK based on react-sidebar-v2: https://github.com/condense/react-leaflet-sidebarv2/blob/master/src/Sidebar.js
 * converting prop-types to typescript and some additional changes and cleanning typescript errors
 */

import React from 'react'
import { MapComponent } from 'react-leaflet'
//DKDK customized typescript by DK for react-leaflet-sidebarv2
import { SidebarProps, TabProps } from './type-react-leaflet-sidebarv2'
// //DKDK add css
// import './sidebar-style.css'

//DKDK react-resizable
// import { Resizable, ResizableBox } from 'react-resizable';
// import 'style-loader!css-loader!../css/styles.css';
// import ResizePanel from "react-resize-panel";

//DKDK resize css test
import './sidebar-resize.css'

//DKDK re-resizable
import { Resizable } from "re-resizable"
export const style = {
  // display: 'flex',
  // overflow-x: 'visible',
  // overflow-y: 'hidden',
  // DKDK this will remove scroll bar
  overflow: 'hidden',
  zIndex: -1,
  // overflow: 'visible',
  // alignItems: 'center',
  // justifyContent: 'center',
  border: 'solid 1px #ddd',
  // background: '#f0f0f0',

};
const resizeRightOnly = {
  top: false,
  right: true,
  bottom: false,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false
};


//DKDK extend TabProps to have divider prop
interface TabPropsAdd extends TabProps {
  //DKDK divider=true, then use divider
  divider?: boolean,
}

//DKDK change from TabProps to TabPropsAdd for considering divider icon
class Tab extends React.Component<TabPropsAdd, any> {
  render() {
    const active = this.props.active ? ' active' : '';
    let closeIcon;
    if (typeof(this.props.closeIcon) === 'string')
      closeIcon = <i className={this.props.closeIcon} />;
    else if (typeof(this.props.closeIcon) === 'object')
      closeIcon = this.props.closeIcon;
    else {
      //DKDK change fontawesome fa to fas
      const closecls = this.props.position === 'right' ? "fas fa-caret-right" : "fas fa-caret-left";
      closeIcon = <i className={closecls} />
    }
    return (
      // DKDK change className
      <div id={this.props.id} className={"leaflet-sidebar-pane" + active}>
        <h1 className="leaflet-sidebar-header">
          {this.props.header}
          <div className="leaflet-sidebar-close" onClick={this.props.onClose}>
            {closeIcon}
          </div>
        </h1>
        {this.props.children}
      </div>
    );
  }
}

//DKDK using type definition from type-react-leaflet-sidebarv2.ts
// // https://github.com/facebook/react/issues/2979#issuecomment-222379916
// const TabType = PropTypes.shape({
//   type: PropTypes.oneOf([Tab])
// });
type TabType = React.ReactElement<Tab> | Array<React.ReactElement<Tab>>;

//DKDK changed MapComponent to React.Component
class Sidebar extends React.Component<SidebarProps, any> {

  onClose(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onClose && this.props.onClose();
  }

  onOpen(e: React.MouseEvent, tabid: string) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onOpen && this.props.onOpen(tabid);
  }

  //DKDK temporarily set tab as any or Tab type?
  renderTab(tab: any) {
    let icon;
    if (typeof(tab.props.icon) === 'string')
      icon = <i className={tab.props.icon} />;
    else if (typeof(tab.props.icon) === 'object')
      icon = tab.props.icon;
    const active = tab.props.id === this.props.selected ? ' active' : '';
    const disabled = tab.props.disabled ? ' disabled' : '';

    //DKDK line divider using image file (made by DK)
    if (tab.props.disabled && tab.props.divider) {
      return (
        <li className={'sidebartabs' + active + disabled} key={tab.props.id} title={tab.props.header}>
          <a href={'#' + tab.props.id} role="tab" onClick={e => tab.props.disabled || this.onOpen(e, tab.props.id)}>
            <img src="./img/line-divider.png" />
          </a>
        </li>
      )
    } else {
        return (
        //DKDK add title attribute here for tooltip effect
        <li className={'sidebartabs' + active + disabled} key={tab.props.id} title={tab.props.header}>
          <a href={'#' + tab.props.id} role="tab" onClick={e => tab.props.disabled || this.onOpen(e, tab.props.id)}>
            {icon}
          </a>
        </li>
        )
    }
  }

  //DKDK children here is a content inside <Tab> so set it as any for now
  renderPanes(children: any) {
    return React.Children.map(children,
        p => React.cloneElement(p, {onClose: this.onClose.bind(this),
                                    closeIcon: this.props.closeIcon,
                                    active: p.props.id === this.props.selected,
                                    position: this.props.position || 'left'}));
  }

  // Override render() so the <Map> element contains a div we can render to
  render() {
    //DKDK change sidebar -> leaflet-sidebar
    const position = ' leaflet-sidebar-' + (this.props.position || 'left');
    const collapsed = this.props.collapsed ? ' collapsed' : '';

    const allTabs = React.Children.toArray(this.props.children).filter(c => !!c);
    // console.log('tabs = ', allTabs)
    //DKDK for now tab type at filter() is set to any for avoiding the type error on tab.props
    const bottomtabs = allTabs.filter((tab: any) => tab.props.anchor === 'bottom');
    const toptabs = allTabs.filter((tab: any) => tab.props.anchor !== 'bottom');
    // console.log('toptabs', toptabs)
    // console.log('this.rootElement = ', this.rootElement)
    // console.log('this.assignRootElementRef = ', this.assignRootElementRef)
    // const divRootElement = createRef()
    return (
      // DKDK change className; not clear why ref is used here so it is removed for now
      // <div id={this.props.id} className={"leaflet-sidebar leaflet-touch" + position + collapsed}
      //   ref={el => this.rootElement = el}>
      <div id={this.props.id} className={"leaflet-sidebar leaflet-touch" + position + collapsed}>
        <div className="leaflet-sidebar-tabs">
          <ul role="tablist">   {/* Top-aligned */}
            {toptabs.map(toptab => this.renderTab(toptab))}
          </ul>
          <ul role="tablist">   {/* Bottom-aligned */}
            {bottomtabs.map(bottomtab => this.renderTab(bottomtab))}
          </ul>
        </div>
        {/* DKDK add id and className for resizable */}
        {/* <Resizable className="leaflet-sidebar-content box" width={420} height={1000} resizeHandles={['w','e']}> */}
        {/* <div className='sidebar-wrap'> */}
        {/* <div className="leaflet-sidebar-content sidebar-resize horizontal"> */}
        {/* <ResizableBox className="box" width={420} height={"100vh"} axis="x"> */}
        {/* <ResizePanel direction="e"> */}
               {/* <Resizable defaultSize={{width: 420, height: '95%'}} className="leaflet-sidebar-content"> */}

        {/* <Resizable style={style} className="leaflet-sidebar-content" defaultSize={{width: 420, height: '100%'}} enable={resizeRightOnly} > */}

        {/* <Resizable style={style} defaultSize={{width: 420, height: '100%'}} className="leaflet-sidebar-content"
        enable={resizeRightOnly} handleClasses={{ right: 'right-handler' }} handleStyles={{ right: { right: 0, width: 10, height: 10, background: 'red' } }} > */}
        {/* <Resizable style={style} className="leaflet-sidebar-content" defaultSize={{width: 420, height: '100%'}}
        enable={resizeRightOnly} handleClasses={{ right: 'right-handler' }}
        handleStyles={{ right: { right: 0, width: 10, height: 10, display: 'inline-block', verticalAlign: 'middle', background: 'red' } }} > */}

        {/* <div className="leaflet-sidebar-content"> */}
        {/* <Resizable style={style} defaultSize={{width: '100%', height: '100%'}} > DKDK this only resize internal content */}
        <div className="leaflet-sidebar-content sidebar-resize horizontal">
        {/* <ResizableBox className="leaflet-sidebar-content box" width={420} height={500} handleSize={[20, 20]} resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}> */}
        {/* <Resizable className="leaflet-sidebar-content box" width={420} height={1000} axis='x'> */}
        <div>
          {this.renderPanes(allTabs)}
          {/* <div className="ui-resizable-handle ui-resizable-e fas fa-grip-lines-vertical" style={{zIndex: -1}}></div> */}
        </div>
          {/* </Resizable> */}
        </div>
        {/* </ResizePanel> */}
        {/* </div> */}
        {/* </Resizable> */}
        {/* </ResizableBox> */}
      </div>
    );
  }
}

export { Sidebar, Tab }
