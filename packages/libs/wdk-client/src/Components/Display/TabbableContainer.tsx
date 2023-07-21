import $ from 'jquery';
import React from 'react';

type RKeyboardEvent = React.KeyboardEvent<HTMLDivElement>;

type Props = {
  autoFocus: boolean;
  className?: string;
  onKeyDown?: (event: RKeyboardEvent) => void;
};

/**
 * Creates a container that allows a user to cycle among all tabbable elements.
 * This is useful for components such as dialogs and dropdown menus.
 */
class TabbableContainer extends React.Component<Props> {
  static defaultProps = {
    autoFocus: false,
  };

  node: HTMLElement | null;

  constructor(props: Props) {
    super(props);
    this.node = null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    if (
      this.props.autoFocus &&
      this.node &&
      // only do this if the current active node is
      // not a descendent of container
      !this.node.contains(document.activeElement)
    ) {
      this.node.focus();
      // $(this.node).find(':tabbable:first').focus();
    }
  }

  handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (typeof this.props.onKeyDown === 'function') {
      this.props.onKeyDown(event);
    }

    this.containTab(event);
  }

  // prevent user from tabbing out of dropdown
  // manually tab since os x removes some controls from the tabindex by default
  containTab(event: RKeyboardEvent) {
    if (event.key !== 'Tab') {
      return;
    }
    let tabbables = $(':tabbable', this.node!);
    let l = tabbables.length;
    let index = tabbables.index($(event.target as HTMLElement));
    let delta = event.shiftKey ? l - 1 : 1;
    let nextIndex = (index + delta) % l;
    let nextTarget = tabbables[nextIndex];
    if (nextTarget == null) {
      nextTarget = tabbables[0];
    }
    nextTarget.focus();
    event.preventDefault();
  }

  render() {
    return (
      <div
        ref={(node) => (this.node = node)}
        tabIndex={-1}
        {...this.props}
        onKeyDown={this.handleKeyDown}
      />
    );
  }
}

export default TabbableContainer;
