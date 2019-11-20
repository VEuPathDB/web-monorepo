import React from 'react';

import Icon from 'wdk-client/Components/Icon/IconAlt';
import Tooltip, { TooltipPosition } from 'wdk-client/Components/Overlays/Tooltip';

type Props = {
  children: string | React.ReactElement<any>;
  tooltipPosition?: TooltipPosition;
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
