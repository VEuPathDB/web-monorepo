import React from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { RecordClass } from 'wdk-client/Utils/WdkModel';

import 'wdk-client/Views/Strategy/PrimaryInputLabel.scss';

const cx = makeClassNameHelper('PrimaryInputLabel');

type Props = {
  resultSetSize: number | undefined,
  recordClass: RecordClass;
};

export const PrimaryInputLabel = ({
  resultSetSize,
  recordClass
}: Props) =>
  <div className={cx()}>
    <div className={cx('--Text')}>
      {resultSetSize !== undefined ? resultSetSize.toLocaleString() : '?'}
      <br />
      {resultSetSize === 1 
        ? recordClass.displayName
        : recordClass.displayNamePlural
      }
    </div>
    <div className={cx('--Arrow')}>
      <svg viewBox="1 0 36 72">
        <polygon 
          points="0 0, 36 36, 0 72"
          fill="#f1f1f1"
          stroke="black"
        />
      </svg>
    </div>
  </div>;
