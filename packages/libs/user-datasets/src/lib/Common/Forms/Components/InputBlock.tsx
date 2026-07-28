import React, { ReactElement, ReactNode, useState } from 'react';
import { Consumer } from '../../../Utils';

export interface InputBlockProps {
  readonly header: ReactNode;
  readonly className?: string;
  readonly children: ReactNode;
}

export function InputBlock(props: InputBlockProps): ReactElement {
  const [expanded, setExpanded] = useState(true);

  let cn = 'input-block';

  if (!expanded) cn += ' collapsed';

  if (props.className) cn += props.className;

  return (
    <div className={cn}>
      <InputBlockHeader
        expanded={expanded}
        setExpanded={setExpanded}
      >
        {props.header}
      </InputBlockHeader>

      {props.children}
    </div>
  );
}

interface InputBlockHeaderProps {
  readonly expanded: boolean;
  readonly setExpanded: Consumer<boolean>;
  readonly children: ReactNode;
}

function InputBlockHeader(props: InputBlockHeaderProps) {
  const cn = 'fa ' + (props.expanded ? 'fa-chevron-down' : 'fa-chevron-right');

  return (
    <h4 onClick={() => props.setExpanded(!props.expanded)}>
      <i className={cn}></i>
      {props.children}
    </h4>
  );
}
