import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { cxStepBoxes as cx } from 'wdk-client/Views/Strategy/ClassNames';

export const TransformIcon = () => {
  const ref = useRef<SVGSVGElement>(null);
  const [ height, setHeight ] = useState(0);

  const resizeTransformIcon = useCallback(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight);
    }
  }, [ ref.current ]);

  // Resize the transform icon whenever the window is resized
  useLayoutEffect(() => {
    window.addEventListener('resize', resizeTransformIcon);

    return () => {
      window.removeEventListener('resize', resizeTransformIcon);
    };
  }, [ resizeTransformIcon ]);

  useLayoutEffect(() => {
    resizeTransformIcon();
  }, [ resizeTransformIcon ]);

  return (
//     <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 600 400" style="&#10;    height: 22.7969px;&#10;">
//   <circle cx="225" cy="200" r="150" stroke="black" stroke-width="0.085em" vector-effect="non-scaling-stroke" fill="#b3b3b3" stroke-dasharray="2"/>
//   <circle cx="375" cy="200" r="150" stroke="black" stroke-width="0.085em" vector-effect="non-scaling-stroke" fill="#b3b3b3" stroke-dasharray="2"/>
//   <path d="M 300 329.9038105676658 A 150 150 0 0 0 300 70.0961894323342" stroke="black" stroke-width="0.085em" vector-effect="non-scaling-stroke" fill="#b3b3b3" stroke-dasharray="2"/>
// </svg>
    // <path d="M 50 0 L 10 0 C 35 60, 35 60, 10 120 L 250 120 C 275 60, 275 60, 250 0 L 50 0" stroke="black" stroke-width="0.17em" vector-effect="non-scaling-stroke" stroke-dasharray="5.5"></path>
    <div className={cx('--TransformIconContainer')}>
      <svg
        className={cx('--TransformIconInputSide')}
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 50 120"
        height={`${height}px`}
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
        ref={ref}
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
        height={`${height}px`}
      >
        <path
          d="M 0 0 L 10 0 C 35 60, 35 60, 10 120 L 0 120"
          stroke="black"
          strokeWidth="0.17em"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};
