/**
 * Page wrapper used by view controllers.
 */
import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import {wrappable} from 'wdk-client/Utils/ComponentUtils';
import Header from 'wdk-client/Components/Layout/Header';
import Footer from 'wdk-client/Components/Layout/Footer';
import ErrorBoundary from 'wdk-client/Core/Controllers/ErrorBoundary';

type Props = RouteComponentProps<any> & {
  children: React.ReactChild;
};

class Page extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    if (
      (prevProps.location.pathname !== this.props.location.pathname) ||
      (prevProps.location.search !== this.props.location.search)
     ) {
      window.scrollTo(0, 0);
    }
  }
  render () {
    return (
      <div className="wdk-RootContainer">
        <ErrorBoundary><Header/></ErrorBoundary>
        <div className="wdk-PageContent">{this.props.children}</div>
        <ErrorBoundary><Footer/></ErrorBoundary>
      </div>
    );
  }
}

export default wrappable(withRouter(Page));
