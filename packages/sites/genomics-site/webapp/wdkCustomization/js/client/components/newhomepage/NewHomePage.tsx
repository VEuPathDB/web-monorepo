import React, { FunctionComponent } from 'react';

import { ErrorBoundary } from 'wdk-client/Controllers';
import { Footer } from './Footer';
import { Header } from './Header';
import { Main } from './Main';
import { NewsPane } from './NewsPane';
import { SearchPane } from './SearchPane';
import { makeVpdbClassNameHelper } from './Utils';

import './VEuPathDB.scss';

const cx = makeVpdbClassNameHelper('RootContainer');

export const NewHomePage: FunctionComponent = props => (
  <div className={cx()}>
    <ErrorBoundary><Header /></ErrorBoundary>
    <ErrorBoundary><SearchPane /></ErrorBoundary>
    <Main>
      {props.children}
    </Main>
    <ErrorBoundary><NewsPane /> </ErrorBoundary>
    <ErrorBoundary><Footer /></ErrorBoundary>
  </div>
);
