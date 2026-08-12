import { ReactElement, ReactNode } from 'react';
import { Runnable } from '../../../Utils';

import './SecondaryButton.scss';

export interface SecondaryButtonProps {
  readonly children: ReactNode;
  readonly disabled: boolean;
  readonly onClick: Runnable;
}

export function SecondaryButton(props: SecondaryButtonProps): ReactElement {
  return <button type="button" className="ud-secondary-action" {...props}>
    {props.children}
  </button>;
}
