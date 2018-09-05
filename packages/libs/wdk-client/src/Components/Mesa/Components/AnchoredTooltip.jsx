import React from 'react';

import Tooltip from './Tooltip';
import Events from '../Utils/Events';

class AnchoredTooltip extends React.Component {
  constructor (props) {
    super(props);
    this.state = { position: {} };
    this.updateOffset = this.updateOffset.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }

  componentDidMount () {
    this.updateOffset();
    this.listeners = {
      scroll: Events.add('scroll', this.updateOffset),
      resize: Events.add('resize', this.updateOffset),
      MesaScroll: Events.add('MesaScroll', this.updateOffset),
      MesaReflow: Events.add('MesaReflow', this.updateOffset)
    };
    setTimeout(() => this.updateOffset(), 300);
  }

  componentWillUnmount () {
    Object.values(this.listeners).forEach(listenerId => Events.remove(listenerId));
  }

  updateOffset () {
    const { element } = this;
    if (!element) return;
    const offset = element.getBoundingClientRect();
    const { top, left } = offset;
    const position = { left, top: Math.ceil(top) + Math.ceil(element.offsetHeight) };
    this.setState({ position });
  }

  render () {
    const { props } = this;
    const { position } = this.state;
    const ref = (el) => this.element = el;
    const children = (<div ref={ref} style={{ display: 'inline-block' }} children={props.children} />);
    const extractedProps = { ...props, position, children };

    return (
      <Tooltip
        corner="top-left"
        className="AnchoredTooltip"
        {...extractedProps}
      />
    );
  }
};

export default AnchoredTooltip;
