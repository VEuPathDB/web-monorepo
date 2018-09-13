import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Error from '../../Components/PageStatus/Error';
import { emptyAction } from '../../Utils/ActionCreatorUtils';

type Props = {
  renderError?: () => React.ReactNode;
  children?: React.ReactNode;
  dispatch?: Dispatch;
}

type State = {
  hasError: boolean;
}

export default connect()(class ErrorBoundary extends React.Component<Props, State> {

  state = {
    hasError: false
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true });

    const { dispatch } = this.props;
    if (dispatch == null) {
      console.warn('`dispatchAction` function not found. Unable to log render error to server.');
    }
    else {
      dispatch(({ wdkService }) => {
        return wdkService.submitError(error, info).then(() => emptyAction)
      });
    }
  }

  render() {
    return this.state.hasError
      ? this.props.renderError ? this.props.renderError() : ( <Error/>)
      : this.props.children;
  }

})