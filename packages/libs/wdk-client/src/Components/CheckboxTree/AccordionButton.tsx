import React from 'react';

interface AccordionButtonProps {
  toggleExpansion: (node: any) => void;
  node: any;
  expanded: boolean;
}

export default class AccordionButton extends React.Component<
  AccordionButtonProps,
  {}
> {
  constructor(props: AccordionButtonProps) {
    super(props);
    // hard bind the handleExpansion functions to the Accordion Button object
    this.handleExpansion = this.handleExpansion.bind(this);
  }

  handleExpansion() {
    this.props.toggleExpansion(this.props.node);
  }

  render() {
    return (
      <span
        className="wdk-CheckboxTree-accordionButton"
        onClick={this.handleExpansion}
      >
        {this.props.expanded ? (
          <i className="fa-li fa fa-caret-down"></i>
        ) : (
          <i className="fa-li fa wdk-CheckboxTree-icon fa-caret-right"></i>
        )}
      </span>
    );
  }
}
