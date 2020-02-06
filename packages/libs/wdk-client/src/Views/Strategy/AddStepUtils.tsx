import React from 'react';

type MenuChoicesContainerProps = {
  containerClassName: string,
  children: React.ReactNode
}

export const MenuChoicesContainer = ({
  containerClassName,
  children
}: MenuChoicesContainerProps) => 
  <div className={`${containerClassName} MenuChoicesContainer`}>
    {children}
  </div>;

type MenuChoiceProps = {
  children: React.ReactNode
};

export const MenuChoice = ({ children }: MenuChoiceProps) => 
  <div className="MenuChoice">
    {children}
  </div>;
  