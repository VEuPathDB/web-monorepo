import React from 'react';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import { Loading } from '../../Components';

import './LoadingOverlay.scss';

interface Props {
  className?: string;
  children?: React.ReactChild;
}

const cx = makeClassNameHelper('LoadingOverlay');

/**
 * Adds an overlay to the containing block DOM element (see https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block).
 * The containing block is determined by CSS properties, so it important to take this into consideration.
 */
export default function LoadingOverlay(props: Props) {
  return (
    <div className={props.className || cx()}>
      <Loading className={cx('-Spinner')} top="40%">
        {props.children}
      </Loading>
    </div>
  );
}
