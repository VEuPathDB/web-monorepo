import * as React from 'react';
import { conditionallyTransition } from '../Actions/UserActions';
import PageController from '../Core/Controllers/PageController';
import { wrappable } from '../Utils/ComponentUtils';
import NotFound from '../Views/NotFound/NotFound';
import { RootState } from '../Core/State/Types';
import { connect } from 'react-redux';
import { Link } from '../Components';
import { ALL_VEUPATHDB_PROJECTS } from '@veupathdb/web-common/lib/config';
import { formatList } from '@veupathdb/web-common/lib/util/formatters';

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
      case 'account-deleted':
        return {
          tabTitle: 'Account Deleted',
          pageTitle: 'Your account has been deleted',
          pageContent: (
            <div>
              <p>
                All your personal information has been removed from our systems
                and any contributions you have made have been anonymized.
              </p>
              <p>
                Thank you for using VEuPathDB. If you wish to use our services
                again in the future, you are welcome to create a new account.
              </p>
              <p>
                <strong>Note:</strong> If you were not expecting to see this
                message, remember that all VEuPathDB component sites (
                {formatList(ALL_VEUPATHDB_PROJECTS, 'or')}) share the same user
                registration system. You have likely deleted your account from a
                sister site. If this is not the case please{' '}
                <Link to="/contact-us">contact the helpdesk</Link>.
              </p>
            </div>
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
