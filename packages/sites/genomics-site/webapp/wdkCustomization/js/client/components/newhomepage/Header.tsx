import React from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import './Header.scss';

const cx = makeClassNameHelper('ebrc-Header');

type Props = {
  containerClassName?: string;
}

export const Header = ({ containerClassName }: Props) => {
  const className = containerClassName ? `${cx()} ${containerClassName}` : cx();

  return (
    <header className={className}>
    </header>
  );
};
