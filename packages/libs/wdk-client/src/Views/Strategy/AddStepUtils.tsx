import React from 'react';

type Props = {
  containerClassName?: string,
  children: React.ReactNode
}

export const MenuChoicesContainer = ({
  containerClassName,
  children
}: Props) =>
  <div className={`${containerClassName || ''} MenuChoicesContainer`}>
    {children}
  </div>;

export const MenuChoice = ({ containerClassName, children }: Props) =>
  <div className={`${containerClassName || ''} MenuChoice`}>
    {children}
  </div>;
  