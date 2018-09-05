import PropTypes from 'prop-types';
import * as React from 'react';

import Error from '../../Components/PageStatus/Error';
import { DispatchAction } from '../../Core/CommonTypes';
import { emptyAction } from '../../Utils/ActionCreatorUtils';

type Props = {
  renderError?: () => React.ReactNode;
  children?: React.ReactNode;
  dispatchAction?: DispatchAction;
}

type State = {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {

  static contextTypes = {
    dispatchAction: PropTypes.func
  }

  // FIXME Use new context API https://reactjs.org/docs/context.html
  // context: {
  //   dispatchAction?: DispatchAction
  // }

  state = {
    hasError: false
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true });

    const dispatch: DispatchAction | undefined = this.props.dispatchAction || this.context.dispatchAction;
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

}