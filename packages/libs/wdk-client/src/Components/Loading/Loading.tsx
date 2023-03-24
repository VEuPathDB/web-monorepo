import { flow } from 'lodash';
import React from 'react';
import { findDOMNode } from 'react-dom';
import { Spinner } from 'spin.js';
import { delay, wrappable } from '../../Utils/ComponentUtils';

import 'spin.js/spin.css';
import '../../Components/Loading/Loading.css';

type Props = {
  /** Additional class name to use for container element */
  className?: string;

  /** Additional style properties to apply */
  style?: React.CSSProperties;

  /** Radius in pixels of the inner circle */
  radius?: number;

  /** top position of the spinner relative to its container */
  top?: string;

  /** left position of the spinner relative to its container */
  left?: string;

  children?: React.ReactNode;
};

/**
 * See http://fgnass.github.io/spin.js/
 */
class Loading extends React.Component<Props> {
  private spinner?: Spinner;

  componentDidMount() {
    const { radius = 8, top = '50%', left = '50%' } = this.props;
    const opts = {
      lines: 11, // The number of lines to draw
      length: 3, // The length of each line
      width: 2, // The line thickness
      radius: radius, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 100, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top, // Top position relative to parent
      left, // Left position relative to parent
    };
    const node = findDOMNode(this) as HTMLElement;
    this.spinner = new Spinner(opts).spin(node);
  }

  componentWillUnmount() {
    if (this.spinner) this.spinner.stop();
  }

  render() {
    const { className = '', style } = this.props;
    return (
      <div style={style} className={`wdk-Loading ${className}`}>
        {this.props.children}
      </div>
    );
  }
}

const enhance = flow(delay<Props>(200), wrappable);

export default enhance(Loading);
