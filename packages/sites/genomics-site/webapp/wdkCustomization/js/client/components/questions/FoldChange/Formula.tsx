import React, { ReactNode } from 'react';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import './Formula.scss';

const cx = makeClassNameHelper('wdk-Formula');

interface FormulaProps {
  leftHandSide: ReactNode;
  operator: string;
  rightHandSide: ReactNode;
}

export const Formula: React.FunctionComponent<FormulaProps> = ({
  leftHandSide,
  operator,
  rightHandSide,
}) => (
  <div className={cx()}>
    <div className={cx('LeftHandSide')}>{leftHandSide}</div>
    <div className={cx('Operator')}>{operator}</div>
    <div className={cx('RightHandSide')}>{rightHandSide}</div>
  </div>
);
