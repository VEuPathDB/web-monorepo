/**
 * Register DOM element names to use the provided React Component.
 */

import { render, unmountComponentAtNode } from 'react-dom';
import React, { Component } from 'react';

let reactCustomElements = new Map();
let nodeNameRegexp = /^[a-z]+(-[a-z]+)+$/;

/** register a node name with a React Component */
export function registerCustomElement(nodeName, reactElementFactory) {
  if (!nodeNameRegexp.test(nodeName)) {
    throw new Error(
      'The nodeName format of `%s` is not acceptable. Only ' +
        'lowercase letters and dashes are allowed, and nodeName ' +
        'must begin and end with a lowercase letter.',
      nodeName
    );
  }
  if (reactCustomElements.has(nodeName)) {
    console.error(
      'Warning: A React Component as already been registered with the nodeName `%s`.',
      nodeName
    );
    return;
  }
  reactCustomElements.set(nodeName, reactElementFactory);
}

/**
 * Render provided HTML string as a React Component, replacing registered
 * custom elements with associated components.
 */
export function renderWithCustomElements(html) {
  return <ReactElementsContainer html={html} />;
}

class ReactElementsContainer extends Component {
  constructor(props) {
    super(props);
    this.targets = [];
  }

  componentDidMount() {
    this.node.innerHTML = this.props.html;
    for (let [nodeName, reactElementFactory] of reactCustomElements) {
      for (let target of this.node.querySelectorAll(nodeName)) {
        this.targets.push(target);
        let reactElement = reactElementFactory(target);
        render(reactElement, target);
      }
    }
  }

  componentWillUnmount() {
    this.targets.forEach(function (target) {
      unmountComponentAtNode(target);
    });
  }

  render() {
    return <div ref={(node) => (this.node = node)} />;
  }
}

ReactElementsContainer.defaultProps = {
  html: '',
};
