/**
 * Page wrapper used by view controllers.
 */
import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { wrappable, makeClassNameHelper } from '../../Utils/ComponentUtils';
import Header from '../../Components/Layout/Header';
import Footer from '../../Components/Layout/Footer';
import ErrorBoundary from '../../Core/Controllers/ErrorBoundary';
import { useScrollUpOnRouteChange } from '../../Hooks/Page';

export type Props = RouteComponentProps<any> & {
  classNameModifier?: string;
  children: React.ReactNode;
  requireLogin: boolean;
  isFullScreen?: boolean;
  isAccessDenied?: boolean;
};

const cx = makeClassNameHelper('wdk-RootContainer');
const pageContentCx = makeClassNameHelper('wdk-PageContent');

function Page(props: Props) {
  useScrollUpOnRouteChange();
  return (
    <div className={cx('', props.classNameModifier)}>
      {!props.isFullScreen && (
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>
      )}
      <ErrorBoundary>
        <div className={pageContentCx('', props.isFullScreen && 'fullscreen')}>
          {props.children}
        </div>
      </ErrorBoundary>
      {!props.isFullScreen && (
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default wrappable(withRouter(Page));
