import { ReactElement, ReactNode } from 'react';
import { Runnable } from '../../../Utils';

import './SecondaryButton.scss';

export interface SecondaryButtonProps {
  readonly children: ReactNode;
  readonly disabled: boolean;
  readonly onClick: Runnable;
}

export function SecondaryButton({
  children,
  ...attrs
}: SecondaryButtonProps): ReactElement {
  return <button type="button" className="ud-secondary-action" {...attrs}>
    {children}
  </button>;
}
