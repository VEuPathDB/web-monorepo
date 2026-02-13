import React from 'react';
import { debounce } from 'lodash';

import MesaTooltip from './MesaTooltip';
import Events from '../Utils/Events';

interface Position {
  left?: number;
  top?: number;
}

interface AnchoredTooltipProps {
  className?: string;
  children?: React.ReactNode;
  content: React.ReactNode;
  [key: string]: any;
}

class AnchoredTooltip extends React.Component<AnchoredTooltipProps> {
  private childWrapperRef: React.RefObject<HTMLDivElement>;
  private listeners: { scroll?: string; resize?: string } = {};
  public updatePosition: (() => void) & { cancel: () => void };

  constructor(props: AnchoredTooltipProps) {
    super(props);
    this.getPosition = this.getPosition.bind(this);
    this.updatePosition = debounce(this._updatePosition.bind(this), 100);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.childWrapperRef = React.createRef();
  }

  componentDidMount() {
    this.listeners = {
      scroll: Events.add('scroll', this.updatePosition),
      resize: Events.add('resize', this.updatePosition),
    };
  }

  componentWillUnmount() {
    Object.values(this.listeners).forEach((listenerId) => {
      if (listenerId) Events.remove(listenerId);
    });
    this.updatePosition.cancel();
  }

  _updatePosition() {
    this.forceUpdate();
  }

  getPosition(): Position {
    const element = this.childWrapperRef.current;
    if (!element) return { left: 0, top: 0 };

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
