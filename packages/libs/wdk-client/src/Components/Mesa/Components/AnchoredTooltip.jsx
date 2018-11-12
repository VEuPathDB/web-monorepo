import React from 'react';
import { debounce } from 'lodash';

import Tooltip from 'wdk-client/Components/Mesa/Components/Tooltip';
import Events from 'wdk-client/Components/Mesa/Utils/Events';

class AnchoredTooltip extends React.Component {
  constructor (props) {
    super(props);
    this.getPosition = this.getPosition.bind(this);
    this.updatePosition = debounce(this.updatePosition.bind(this), 100);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.childWrapperRef = React.createRef();
  }

  componentDidMount () {
    this.listeners = {
      scroll: Events.add('scroll', this.updatePosition),
      resize: Events.add('resize', this.updatePosition),
      MesaScroll: Events.add('MesaScroll', this.updatePosition),
      MesaReflow: Events.add('MesaReflow', this.updatePosition)
    };
  }

  componentWillUnmount () {
    Object.values(this.listeners).forEach(listenerId => Events.remove(listenerId));
  }

  updatePosition() {
    this.forceUpdate();
  }

  getPosition () {
    const element = this.childWrapperRef.current;
    if (!element) return undefined;

    const offset = element.getBoundingClientRect();
    const { top, left } = offset;
    return { left, top: Math.ceil(top) + Math.ceil(element.offsetHeight) };
  }

  render () {
    const { props } = this;
    const children = (<div ref={this.childWrapperRef} style={{ display: 'inline-block' }} children={props.children} />);
    const extractedProps = { ...props, children };

    return (
      <Tooltip
        corner="top-left"
        className="AnchoredTooltip"
        getPosition={this.getPosition}
        {...extractedProps}
      />
    );
  }
}

export default AnchoredTooltip;
