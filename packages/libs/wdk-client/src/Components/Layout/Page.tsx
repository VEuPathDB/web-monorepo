/**
 * Page wrapper used by view controllers.
 */
import React from 'react';
import {wrappable} from 'wdk-client/Utils/ComponentUtils';
import Header from 'wdk-client/Components/Layout/Header';
import Footer from 'wdk-client/Components/Layout/Footer';
import ErrorBoundary from 'wdk-client/Core/Controllers/ErrorBoundary';

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
