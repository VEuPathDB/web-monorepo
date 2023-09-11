import $ from 'jquery';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindAll, throttle } from 'lodash';
import { isNodeOverflowing } from '@veupathdb/web-common/lib/util/domUtils';

/**
 * Renders buttons to scroll scroll vertically.
 */
export default class VerticalScrollHelper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leftButtonActive: false,
      rightButtonActive: false,
    };
    this.node = null;
    bindAll(this, 'setNode', 'scrollLeft', 'scrollRight');
    this.updateButtonState = throttle(this.updateButtonState.bind(this), 250);
  }

  componentDidMount() {
    this.updateButtonState();
    window.addEventListener('resize', this.updateButtonState);
  }

  componentWillReceiveProps() {
    this.updateButtonState();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateButtonState);
  }

  setNode(node) {
    this.node = node;
  }

  updateButtonState() {
    this.setState({
      showButtons: isNodeOverflowing(this.node),
      leftButtonActive: this.node.scrollLeft > 0,
      rightButtonActive:
        this.node.scrollWidth - this.node.scrollLeft > this.node.clientWidth,
    });
  }

  scrollLeft(event) {
    event.preventDefault();
    this.updateScroll(this.node.clientWidth * -1);
  }

  scrollRight(event) {
    event.preventDefault();
    this.updateScroll(this.node.clientWidth);
  }

  updateScroll(scrollDelta) {
    // this.node.scrollLeft += scrollDelta;
    $(this.node).animate(
      { scrollLeft: this.node.scrollLeft + scrollDelta },
      this.updateButtonState
    );
  }

  renderLeftButton() {
    return this.renderButton(
      <i className="fa fa-lg fa-chevron-left" />,
      this.state.leftButtonActive,
      this.scrollLeft
    );
  }

  renderRightButton() {
    return this.renderButton(
      <i className="fa fa-lg fa-chevron-right" />,
      this.state.rightButtonActive,
      this.scrollRight
    );
  }

  renderButton(text, active, onClick) {
    return (
      <button
        className="eupathdb-VerticalScrollHelperButton"
        disabled={!active}
        onClick={onClick}
      >
        {text}
      </button>
    );
  }

  renderButtons() {
    if (this.state.showButtons) {
      return (
        <div className="eupathdb-VerticalScrollHelperButtonContainer">
          {this.renderLeftButton()}
          {this.renderRightButton()}
        </div>
      );
    }
  }

  render() {
    return (
      <div className="eupathdb-VerticalScrollHelper">
        <div ref={this.setNode} style={{ overflow: 'hidden' }}>
          {this.props.children}
        </div>
        {this.renderButtons()}
      </div>
    );
  }
}

VerticalScrollHelper.propTypes = {
  children: PropTypes.element.isRequired,
  scrollDelta: PropTypes.number.isRequired,
};

VerticalScrollHelper.defaultProps = {
  scrollDelta: 50,
};
