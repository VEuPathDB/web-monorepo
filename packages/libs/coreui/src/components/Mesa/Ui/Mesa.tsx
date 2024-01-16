import React from 'react';

import MesaController from './MesaController';
import { MesaStateProps } from '../types';

type Props<Row, Key extends string> = {
  state: MesaStateProps<Row, Key>;
  children?: React.ReactNode;
};

function Mesa<Row, Key extends string>(props: Props<Row, Key>) {
  const { state, children } = props;
  return <MesaController {...state}>{children}</MesaController>;
}

export default Mesa;
