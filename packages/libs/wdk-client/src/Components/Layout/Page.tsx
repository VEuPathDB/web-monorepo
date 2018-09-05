/**
 * Page wrapper used by view controllers.
 */
import React from 'react';
import {wrappable} from '../../Utils/ComponentUtils';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from '../../Core/Controllers/ErrorBoundary';

type Props = {
  children: React.ReactChild | null;
};

function Page(props: Props) {
  return (
    <div className="wdk-RootContainer">
      <ErrorBoundary><Header/></ErrorBoundary>
      <div className="wdk-PageContent">{props.children}</div>
      <ErrorBoundary><Footer/></ErrorBoundary>
    </div>
  );
}

export default wrappable(Page);
