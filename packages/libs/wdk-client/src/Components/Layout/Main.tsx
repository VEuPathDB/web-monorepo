import React, { Component } from 'react';
import { wrappable } from '../../Utils/ComponentUtils';

interface Props {
  className?: string;
  children?: React.ReactNode;
}

class Main extends Component<Props> {
  render() {
    return <div className={this.props.className}>{this.props.children}</div>;
  }
}

export default wrappable(Main);
