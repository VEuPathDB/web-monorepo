import React from 'react';

export type AttributeProps = {
  readonly label: string;

  readonly children: React.ReactNode;

  readonly className?: string;
}

export const Attribute = (props: AttributeProps) => (
  <>
    <dt>{props.label}</dt>
    <dd>{props.children}</dd>
  </>
);

export default Attribute;