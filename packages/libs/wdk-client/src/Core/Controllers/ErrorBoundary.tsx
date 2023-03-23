import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { notifyUnhandledError } from '../../Actions/UnhandledErrorActions';
import Error from '../../Components/PageStatus/Error';

type Props = {
  renderError?: () => React.ReactNode;
  children?: React.ReactNode;
  dispatch: Dispatch;
};

type State = {
  hasError: boolean;
};

class ErrorBoundary extends React.Component<Props, State> {
  state = {
    hasError: false,
  };

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true });
    this.props.dispatch(notifyUnhandledError(error, info));
  }

  render() {
    return this.state.hasError ? (
      this.props.renderError ? (
        this.props.renderError()
      ) : (
        <Error />
      )
    ) : (
      this.props.children
    );
  }
}

export default connect()(ErrorBoundary);
