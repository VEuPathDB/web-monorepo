import React, { ReactNode } from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import 'wdk-client/Views/Question/Groups/FoldChange/Formula.scss';

const cx = makeClassNameHelper('wdk-Formula');

interface FormulaProps {
  leftHandSide: ReactNode;
  operator: string;
  rightHandSide: ReactNode;
}

export const Formula: React.FunctionComponent<FormulaProps> = ({
  leftHandSide,
  operator,
  rightHandSide
}) =>
  <div className={cx()}>
    <div className={cx('LeftHandSide')}>{leftHandSide}</div>
    <div className={cx('Operator')}>{operator}</div>
    <div className={cx('RightHandSide')}>{rightHandSide}</div>
  </div>;
