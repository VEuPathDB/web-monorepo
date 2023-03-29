import * as React from 'react';
import { conditionallyTransition } from '../Actions/UserActions';
import PageController from '../Core/Controllers/PageController';
import { wrappable } from '../Utils/ComponentUtils';
import NotFound from '../Views/NotFound/NotFound';
import { RootState } from '../Core/State/Types';
import { connect } from 'react-redux';

type PageContent = {
  tabTitle: string;
  pageTitle: string;
  pageContent: React.ReactNode;
};

const ActionCreators = { conditionallyTransition };

type StateProps = Pick<RootState['globalData'], 'config'>;
type DispatchProps = typeof ActionCreators;
type OwnProps = { messageKey: string; requestUrl?: string };
type MergeProps = {
  ownProps: OwnProps;
  dispatchProps: DispatchProps;
  stateProps: StateProps;
};

class UserMessageController extends PageController<MergeProps> {
  getContactUrl() {
    return 'mailto:help@veupathdb.org';
  }

  getMessagePageContent(): PageContent {
    switch (this.props.ownProps.messageKey) {
      case 'password-reset-successful':
        return {
          tabTitle: 'Password Reset',
          pageTitle: 'Success!',
          pageContent: (
            <span>
              You will receive an email shortly containing a new, temporary
              password.
            </span>
          ),
        };
      case 'login-error':
        let prevPageUrl = this.props.ownProps.requestUrl;
        return {
          tabTitle: 'Login Problem',
          pageTitle: 'Unable to log in',
          pageContent: (
            <div>
              <p>
                An error has occurred and you could not be logged into this
                site. If this problem persists, please{' '}
                <a href={this.getContactUrl()}>contact us</a>.
              </p>
              {prevPageUrl == null ? (
                ''
              ) : (
                <p>
                  To return to your previous page,{' '}
                  <a href={prevPageUrl}>click here</a>.
                </p>
              )}
            </div>
          ),
        };
      default:
        return {
          tabTitle: 'Page Not Found',
          pageTitle: '',
          pageContent: <NotFound />,
        };
    }
  }

  loadData() {
    // if registered user is logged in, show profile instead of password reset message
    if (this.props.ownProps.messageKey == 'password-reset-successful') {
      this.props.dispatchProps.conditionallyTransition(
        (user) => !user.isGuest,
        '/user/profile'
      );
    }
  }

  isRenderDataLoaded(): boolean {
    return this.props.stateProps.config != null;
  }

  getActionCreators() {
    return ActionCreators;
  }

  getTitle() {
    return this.getMessagePageContent().tabTitle;
  }

  renderView() {
    let content = this.getMessagePageContent();
    return (
      <div>
        <h1>{content.pageTitle}</h1>
        {content.pageContent}
      </div>
    );
  }
}

const enhance = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  MergeProps,
  RootState
>(
  (state: RootState) => ({ config: state.globalData.config }),
  ActionCreators,
  (stateProps, dispatchProps, ownProps) => ({
    stateProps,
    dispatchProps,
    ownProps,
  })
);

export default enhance(wrappable(UserMessageController));
