import React from 'react';

import Icon from './IconAlt';
import Tooltip from '../../Components/Overlays/Tooltip';

type Props = {
  children: string | React.ReactElement<any>;
  tooltipPosition?: {
    my?: string;
    at?: string;
  };
}

export default function HelpIcon (props: Props) {
  return (
    <Tooltip content={props.children} position={props.tooltipPosition}>
      <div className="HelpTrigger">
        <Icon fa="question-circle"/>
      </div>
    </Tooltip>
  )
};
