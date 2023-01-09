import React from 'react';

import Icon from 'wdk-client/Components/Icon/IconAlt';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';

import 'wdk-client/Components/Icon/HelpIcon.scss';

type Props = {
  children: string | React.ReactElement<any>;
};

export default function HelpIcon (props: Props) {
  return (
    <Tooltip
      title={props.children}
      interactive
    >
      <button type="button" className="link HelpTrigger">
        <Icon fa="question-circle"/>
      </button>
    </Tooltip>
  )
};
