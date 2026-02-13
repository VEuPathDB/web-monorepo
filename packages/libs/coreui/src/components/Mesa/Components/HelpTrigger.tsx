import React from 'react';
import Icon from './Icon';
import AnchoredTooltip from './AnchoredTooltip';

interface HelpTriggerProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

class HelpTrigger extends React.Component<HelpTriggerProps> {
  constructor(props: HelpTriggerProps) {
    super(props);
  }

  render() {
    const { props } = this;
    const content = props.children;
    const className =
      'Trigger HelpTrigger' + (props.className ? ' ' + props.className : '');
    const children = <Icon fa="question-circle" />;
    const newProps = { ...props, content, children, className };
    return <AnchoredTooltip {...newProps} />;
  }
}

export default HelpTrigger;
