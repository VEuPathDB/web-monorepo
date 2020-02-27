/**
 * Page wrapper used by view controllers.
 */
import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import {wrappable, makeClassNameHelper} from 'wdk-client/Utils/ComponentUtils';
import Header from 'wdk-client/Components/Layout/Header';
import Footer from 'wdk-client/Components/Layout/Footer';
import ErrorBoundary from 'wdk-client/Core/Controllers/ErrorBoundary';

type Props = RouteComponentProps<any> & {
  classNameModifier?: string;
  children: React.ReactChild;
};

const cx = makeClassNameHelper('wdk-RootContainer');

class Page extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    if (
      this.props.history.action !== 'REPLACE' &&
      (
        (prevProps.location.pathname !== this.props.location.pathname) ||
        (prevProps.location.search !== this.props.location.search)
      )
    ) {
      window.scrollTo(0, 0);
    }
  }
  render () {
    return (
      <div className={cx('', this.props.classNameModifier)}>
        <ErrorBoundary><Header/></ErrorBoundary>
        <div className="wdk-PageContent">{this.props.children}</div>
        <ErrorBoundary><Footer/></ErrorBoundary>
      </div>
    );
  }
}

export default wrappable(withRouter(Page));
