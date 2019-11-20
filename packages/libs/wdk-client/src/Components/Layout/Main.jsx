import React, { Component } from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

class Main extends Component {
  render() {
    return <div className={this.props.className}>
      {this.props.children}
    </div>
  }
}

export default wrappable(Main);
