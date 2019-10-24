import React, { FunctionComponent } from 'react';

import { makeVpdbClassNameHelper } from './Utils';

const cx = makeVpdbClassNameHelper('Main');

export const Main: FunctionComponent = props => (
  <main className={cx()}>
    {props.children}
  </main>
);
