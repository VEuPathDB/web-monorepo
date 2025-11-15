/**
 * Register DOM element names to use the provided React Component.
 */

import { createRoot, Root } from 'react-dom/client';
import React, { Component } from 'react';

const reactCustomElements = new Map<
  string,
  (target: Element) => React.ReactElement
>();
const nodeNameRegexp = /^[a-z]+(-[a-z]+)+$/;

/** register a node name with a React Component */
export function registerCustomElement(
  nodeName: string,
  reactElementFactory: (target: Element) => React.ReactElement
): void {
  if (!nodeNameRegexp.test(nodeName)) {
    throw new Error(
      `The nodeName format of \`${nodeName}\` is not acceptable. Only ` +
        'lowercase letters and dashes are allowed, and nodeName ' +
        'must begin and end with a lowercase letter.'
    );
  }
  if (reactCustomElements.has(nodeName)) {
    console.error(
      `Warning: A React Component as already been registered with the nodeName \`${nodeName}\`.`
    );
    return;
  }
  reactCustomElements.set(nodeName, reactElementFactory);
}

interface ReactElementsContainerProps {
  html?: string;
  innerRef?: (node: HTMLDivElement) => void;
}

/**
 * Render provided HTML string as a React Component, replacing registered
 * custom elements with associated components.
 */
export function renderWithCustomElements(
  html: string,
  props?: Omit<ReactElementsContainerProps, 'html'>
): React.ReactElement {
  return <ReactElementsContainer html={html} {...props} />;
}

class ReactElementsContainer extends Component<ReactElementsContainerProps> {
  private node!: HTMLDivElement;
  private roots: Root[] = [];

  componentDidMount() {
    this.node.innerHTML = this.props.html || '';
    for (const [nodeName, reactElementFactory] of reactCustomElements) {
      for (const target of this.node.querySelectorAll(nodeName)) {
        const root = createRoot(target);
        this.roots.push(root);
        const reactElement = reactElementFactory(target);
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
      <div
        ref={(node) => (this.node = node!)}
        style={{ display: 'contents' }}
      />
    );
  }
}
