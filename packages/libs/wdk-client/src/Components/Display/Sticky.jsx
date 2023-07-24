import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class Sticky extends React.Component {
  constructor(props) {
    super(props);
    this.updateIsFixed = this.updateIsFixed.bind(this);
    this.state = { isFixed: false, height: null, width: null };
  }

  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
    window.addEventListener('scroll', this.updateIsFixed, { passive: true });
    window.addEventListener('wheel', this.updateIsFixed, { passive: true });
    window.addEventListener('resize', this.updateIsFixed, { passive: true });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateIsFixed, { passive: true });
    window.removeEventListener('wheel', this.updateIsFixed, { passive: true });
    window.removeEventListener('resize', this.updateIsFixed, { passive: true });
  }

  // Set position to fixed if top is above threshold, otherwise
  // set position to absolute.
  updateIsFixed() {
    // See https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    let rect = this.node.getBoundingClientRect();
    if (rect.top < 0 && this.state.isFixed === false) {
      let contentNode = this.node.children[0];
      let contentRect = contentNode.getBoundingClientRect();
      this.setState({
        isFixed: true,
        height: rect.height,
        width: contentRect.width,
      });
    } else if (rect.top >= 0 && this.state.isFixed === true) {
      this.setState({
        isFixed: false,
        height: null,
        width: null,
      });
    }
  }

  render() {
    return (
      // This node is used to track scroll position
      <div style={{ height: this.state.height }}>
        {this.props.children(this.state)}
      </div>
    );
  }
}

Sticky.propTypes = {
  children: PropTypes.func.isRequired,
};

export default Sticky;
