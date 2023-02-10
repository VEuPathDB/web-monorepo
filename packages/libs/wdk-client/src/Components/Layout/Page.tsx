/**
 * Page wrapper used by view controllers.
 */
import React, { useEffect } from 'react';
import { withRouter, RouteComponentProps, useHistory } from 'react-router';
import {wrappable, makeClassNameHelper} from 'wdk-client/Utils/ComponentUtils';
import Header from 'wdk-client/Components/Layout/Header';
import Footer from 'wdk-client/Components/Layout/Footer';
import ErrorBoundary from 'wdk-client/Core/Controllers/ErrorBoundary';
import { useScrollUpOnRouteChange } from 'wdk-client/Hooks/Page';
import { useDispatch } from 'react-redux';
import { showLoginForm } from 'wdk-client/Actions/UserSessionActions';
import { useWdkService } from 'wdk-client/Hooks/WdkServiceHook';

export type Props = RouteComponentProps<any> & {
  classNameModifier?: string;
  children: React.ReactChild;
  requireLogin: boolean;
};

const cx = makeClassNameHelper('wdk-RootContainer');

function Page(props: Props) {
  const dispatch = useDispatch();
  const user = useWdkService(wdkService => wdkService.getCurrentUser());
  useEffect(() => {
    if (props.requireLogin === false || user == null) return;
    if (user.isGuest) dispatch(showLoginForm())
  }, [props.requireLogin, dispatch, user]);

  useScrollUpOnRouteChange();

  if (user == null) return null;

  if (user.isGuest && props.requireLogin) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '2em',
      height: '100vh',
    }}>
      <div>
        You must be logged in to access this site.
      </div>
      <button onClick={() => dispatch(showLoginForm())}>
        Login
      </button>
    </div>
  )

  return (
    <div className={cx('', props.classNameModifier)}>
      <ErrorBoundary><Header/></ErrorBoundary>
      <div className="wdk-PageContent">{props.children}</div>
      <ErrorBoundary><Footer/></ErrorBoundary>
    </div>
  );
}

export default wrappable(withRouter(Page));
