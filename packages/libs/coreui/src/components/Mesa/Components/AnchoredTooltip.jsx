import React from 'react';
import { debounce } from 'lodash';

import MesaTooltip from './MesaTooltip';
import Events from '../Utils/Events';
import { MESA_SCROLL_EVENT, MESA_REFLOW_EVENT } from '../Ui/MesaContants';

class AnchoredTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.getPosition = this.getPosition.bind(this);
    this.updatePosition = debounce(this.updatePosition.bind(this), 100);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.childWrapperRef = React.createRef();
  }

  componentDidMount() {
    this.listeners = {
      scroll: Events.add('scroll', this.updatePosition),
      resize: Events.add('resize', this.updatePosition),
      MesaScroll: Events.add(MESA_SCROLL_EVENT, this.updatePosition),
      MesaReflow: Events.add(MESA_REFLOW_EVENT, this.updatePosition),
    };
  }

  componentWillUnmount() {
    Object.values(this.listeners).forEach((listenerId) =>
      Events.remove(listenerId)
    );
    this.updatePosition.cancel();
  }

  updatePosition() {
    this.forceUpdate();
  }

  getPosition() {
    const element = this.childWrapperRef.current;
    if (!element) return undefined;

    const offset = element.getBoundingClientRect();
    const { top, left } = offset;
    return { left, top: Math.ceil(top) + Math.ceil(element.offsetHeight) };
  }

  render() {
    const { props } = this;
    const children = (
      <div
        ref={this.childWrapperRef}
        style={{ display: 'inline-block' }}
        children={props.children}
      />
    );
    const extractedProps = { ...props, children };

    return (
      <MesaTooltip
        corner="top-left"
        className="AnchoredTooltip"
        getPosition={this.getPosition}
        {...extractedProps}
      />
    );
  }
}

export default AnchoredTooltip;
