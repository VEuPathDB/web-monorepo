import React from 'react';
import Icon from '../../../Components/Mesa/Components/Icon';
import AnchoredTooltip from '../../../Components/Mesa/Components/AnchoredTooltip';

class HelpTrigger extends React.Component {
  constructor(props) {
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
