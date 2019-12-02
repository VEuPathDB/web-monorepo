import React from 'react';

import { cxStepBoxes as cx } from 'wdk-client/Views/Strategy/ClassNames';

export const TransformIcon = () =>
  <div className={cx('--TransformIconContainer')}>
    <svg
      className={cx('--TransformIconInputSide')}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 50 120"
    >
      <path
        d="M 50 0 L 10 0 C 35 60, 35 60, 10 120 L 50 120"
        stroke="black"
        strokeWidth="0.17em"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
    <svg
      className={cx('--TransformIconContents')}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 120 120"
      preserveAspectRatio="none"
    >
      <path
        d="M 0 0 L 120 0 M 120 120 L 0 120"
        stroke="black"
        strokeWidth="0.17em"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
    <svg
      className={cx('--TransformIconOutputSide')}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 50 120"
    >
      <path
        d="M 0 0 L 10 0 C 35 60, 35 60, 10 120 L 0 120"
        stroke="black"
        strokeWidth="0.17em"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  </div>;
