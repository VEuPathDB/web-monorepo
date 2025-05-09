/**
 * Register DOM element names to use the provided React Component.
 */

import { createRoot } from 'react-dom/client';
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
export function renderWithCustomElements(html, props) {
  return <ReactElementsContainer html={html} {...props} />;
}

class ReactElementsContainer extends Component {
  constructor(props) {
    super(props);
    this.roots = [];
  }

  componentDidMount() {
    this.node.innerHTML = this.props.html;
    for (let [nodeName, reactElementFactory] of reactCustomElements) {
      for (let target of this.node.querySelectorAll(nodeName)) {
        const root = createRoot(target);
        this.roots.push(root);
        let reactElement = reactElementFactory(target);
        root.render(reactElement);
      }
    }
    this.props.innerRef?.(this.node);
  }

  componentWillUnmount() {
    this.roots.forEach(function (root) {
      root.unmount();
    });
  }

  render() {
    return (
      <div ref={(node) => (this.node = node)} style={{ display: 'contents' }} />
    );
  }
}

ReactElementsContainer.defaultProps = {
  html: '',
};
