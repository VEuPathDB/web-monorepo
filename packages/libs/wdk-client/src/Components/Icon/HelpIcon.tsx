import React, { ReactNode } from "react";

import Icon from '../../Components/Icon/IconAlt';
import { Tooltip } from '@veupathdb/coreui';

import '../../Components/Icon/HelpIcon.scss';

type Props = {
  children: NonNullable<ReactNode>;
};

export default function HelpIcon(props: Props) {
  return (
    <Tooltip title={props.children} interactive>
      <button type="button" className="link HelpTrigger">
        <Icon fa="question-circle" />
      </button>
    </Tooltip>
  );
}
