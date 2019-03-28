import React from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  visible: boolean;
}

interface State {
  shouldRender: boolean;
}

/**
 * Defers rendering of children until the first time `visible`
 * is true. After that, if `visible` is false, children will
 * be hidden with the style display: none. Note that this component
 * wraps children with a `div` element.
 */
export default class DeferredDiv extends React.Component<Props, State> {
  state = {
    shouldRender: this.props.visible
  };

  componentDidUpdate() {
    if (!this.state.shouldRender && this.props.visible) {
      this.setState({ shouldRender: true });
    }
  }

  render() {
    if (!this.state.shouldRender) return null;

    const { visible, ...divProps } = this.props;
    return (
      <div {...divProps} style={ visible ? divProps.style : { ...divProps.style, display: 'none' } }/>
    );
  }
}
