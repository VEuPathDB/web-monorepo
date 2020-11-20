import React, { ReactNode } from 'react';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import './Fraction.scss';

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
