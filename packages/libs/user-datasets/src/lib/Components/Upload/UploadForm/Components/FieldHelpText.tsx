import { ReactElement, ReactNode } from 'react';

export interface FieldHelpTextProps {
  readonly className?: string;
  readonly children: ReactNode;
}

export function FieldHelpText(props: FieldHelpTextProps): ReactElement {
  const className = props.className
    ? 'description column-2 ' + props.className
    : 'description column-2';

  return <p className={className}>{props.children}</p>;
}
