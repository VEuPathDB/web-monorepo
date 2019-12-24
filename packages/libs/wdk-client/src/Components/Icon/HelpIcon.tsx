import React from 'react';

import Icon from 'wdk-client/Components/Icon/IconAlt';
import Tooltip, { TooltipPosition } from 'wdk-client/Components/Overlays/Tooltip';

import 'wdk-client/Components/Icon/HelpIcon.scss';

type Props = {
  children: string | React.ReactElement<any>;
  tooltipPosition?: TooltipPosition;
  tooltipShowEvent?: string;
  tooltipHideEvent?: string;
};

export default function HelpIcon (props: Props) {
  return (
    <Tooltip 
      content={props.children} 
      position={props.tooltipPosition} 
      showEvent={props.tooltipShowEvent}
      hideEvent={props.tooltipHideEvent}
    >
      <button type="button" className="link HelpTrigger">
        <Icon fa="question-circle"/>
      </button>
    </Tooltip>
  )
};
