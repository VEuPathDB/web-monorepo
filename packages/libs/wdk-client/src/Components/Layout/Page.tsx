/**
 * Page wrapper used by view controllers.
 */
import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import {wrappable, makeClassNameHelper} from 'wdk-client/Utils/ComponentUtils';
import Header from 'wdk-client/Components/Layout/Header';
import Footer from 'wdk-client/Components/Layout/Footer';
import ErrorBoundary from 'wdk-client/Core/Controllers/ErrorBoundary';
import { useScrollUpOnRouteChange } from 'wdk-client/Hooks/Page';

export type Props = RouteComponentProps<any> & {
  classNameModifier?: string;
  children: React.ReactChild;
};

const cx = makeClassNameHelper('wdk-RootContainer');

function Page(props: Props) {
  useScrollUpOnRouteChange();

  return (
    <div className={cx('', props.classNameModifier)}>
      <ErrorBoundary><Header/></ErrorBoundary>
      <div className="wdk-PageContent">{props.children}</div>
      <ErrorBoundary><Footer/></ErrorBoundary>
    </div>
  );
}

export default wrappable(withRouter(Page));
