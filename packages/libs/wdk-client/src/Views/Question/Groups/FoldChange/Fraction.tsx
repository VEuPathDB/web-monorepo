import React, { ReactNode } from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import 'wdk-client/Views/Question/Groups/FoldChange/Fraction.scss';

interface FractionProps {
  numerator: ReactNode;
  denominator: ReactNode;
}

const cx = makeClassNameHelper('wdk-Fraction');

export const Fraction: React.FunctionComponent<FractionProps> = ({
  numerator,
  denominator
}) =>
  <div className={cx()}>
    <div className={cx('Numerator')}>{numerator}</div>
    <div className={cx('Denominator')}>{denominator}</div>
  </div>;
