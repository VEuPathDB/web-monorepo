import React from 'react';
import PropTypes from 'prop-types';

import BodyLayer from './BodyLayer';
import { EventsFactory } from '../Utils/Events';

class Tooltip extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isShown: false,
      isFocus: false,
      isHovered: false,
      isDisengaged: true,
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.getHideDelay = this.getHideDelay.bind(this);
    this.getShowDelay = this.getShowDelay.bind(this);
    this.getCornerClass = this.getCornerClass.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
    this.engageTooltip = this.engageTooltip.bind(this);
    this.disengageTooltip = this.disengageTooltip.bind(this);
    this.renderTooltipContent = this.renderTooltipContent.bind(this);
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-= Lifecycle -=-=-=-=-=-=-=-=-=-=-=-= */

  componentDidMount() {
    if (!this.el) {
      console.error(`
        Tooltip Error: Can't setup focusIn/focusOut events.
        Element ref could not be found; was render interrupted?
      `);
    } else {
      this.events = EventsFactory(this.el);
      this.events.use({
        focusIn: this.engageTooltip,
        keypress: this.engageTooltip,
        mouseEnter: this.engageTooltip,

        focusOut: this.disengageTooltip,
        mouseLeave: this.disengageTooltip,
      });
    }
  }

  componentWillUnmount() {
    if (this.events) this.events.clearAll();
    clearTimeout(this.hideTimeout);
    clearTimeout(this.showTimeout);
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-= Utilities -=-=-=-=-=-=-=-=-=-=-=-= */

  static getOffset(node) {
    return node.getBoundingClientRect();
  }

  getShowDelay() {
    const { showDelay } = this.props;
    return typeof showDelay === 'number' ? showDelay : 250;
  }
  getHideDelay() {
    let { hideDelay } = this.props;
    return typeof hideDelay === 'number' ? hideDelay : 500;
  }

  getCornerClass() {
    const { corner } = this.props;
    if (typeof corner !== 'string' || !corner.length) return 'no-corner';
    return corner
      .split(' ')
      .filter((s) => s)
      .join('-');
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-= Show/Hide -=-=-=-=-=-=-=-=-=-=-=-= */

  showTooltip() {
    // compute position, or get from props
    if (this.props.position && this.props.getPosition) {
      console.error(
        'Warning: Tooltip expected either `props.position` or `props.getPosition`, but both were provided. ' +
          'Please update your render method to use one or the other. Using `props.position`.'
      );
    }

    const position = this.props.position
      ? this.props.position
      : this.props.getPosition
      ? this.props.getPosition()
      : undefined;

    this.setState({ isShown: true, position });

    if (this.hideTimeout) clearTimeout(this.hideTimeout);
  }

  hideTooltip() {
    if (!this.state.isDisengaged) return;
    this.setState({ isShown: false });
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-= Engage/Disengage -=-=-=-=-=-=-=-=-=-=-=-= */

  engageTooltip() {
    this.setState({ isDisengaged: false });
    this.showTimeout = setTimeout(() => {
      this.showTooltip();
      if (this.hideTimeout) clearTimeout(this.hideTimeout);
    }, this.getShowDelay());
  }

  disengageTooltip() {
    this.setState({ isDisengaged: true });
    if (this.showTimeout) clearTimeout(this.showTimeout);
    this.hideTimeout = setTimeout(this.hideTooltip, this.getHideDelay());
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-= Renderers -=-=-=-=-=-=-=-=-=-=-=-= */

  renderTooltipContent() {
    const { isDisengaged, position } = this.state;
    const { content, style, renderHtml } = this.props;

    const opacity = isDisengaged ? 0.01 : 1;
    const { top, left } = Object.assign({ top: 0, left: 0 }, position);
    const existingStyle = style && Object.keys(style).length ? style : {};
    const contentStyle = Object.assign(
      {},
      { top, left, opacity },
      existingStyle
    );

    const cornerClass = this.getCornerClass();
    const disengagedClass = isDisengaged ? ' Tooltip-Content--Disengaged' : '';
    const className = ['Tooltip-Content', cornerClass, disengagedClass].join(
      ' '
    );

    return (
      <div
        style={contentStyle}
        className={className}
        onMouseEnter={this.engageTooltip}
        onMouseLeave={this.disengageTooltip}
      >
        {renderHtml ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          content
        )}
      </div>
    );
  }

  render() {
    const { isShown } = this.state;
    const TooltipContent = this.renderTooltipContent;

    const { children, className } = this.props;
    return (
      <div
        className={'Tooltip' + (className ? ' ' + className : '')}
        ref={(el) => (this.el = el)}
      >
        {!isShown ? null : (
          <BodyLayer className="Tooltip-Wrapper">
            <TooltipContent />
          </BodyLayer>
        )}
        {children}
      </div>
    );
  }
}

Tooltip.propTypes = {
  hideDelay: PropTypes.number,
  showDelay: PropTypes.number,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
  className: PropTypes.string,
  content: PropTypes.node,
  corner: PropTypes.string,
  fadeOut: PropTypes.bool,
  position: PropTypes.object,
  style: PropTypes.object,
  getPosition: PropTypes.func,
  renderHtml: PropTypes.bool,
};

export default Tooltip;
