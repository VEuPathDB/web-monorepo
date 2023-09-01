import React, { FunctionComponent } from 'react';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { combineClassNames } from './Utils';

const cx = makeClassNameHelper('ebrc-Main');

type Props = {
  containerClassName?: string;
};

export const Main: FunctionComponent<Props> = (props) => (
  <main className={combineClassNames(cx(), props.containerClassName)}>
    {props.children}
  </main>
);
