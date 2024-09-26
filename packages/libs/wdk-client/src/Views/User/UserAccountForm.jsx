import PropTypes from 'prop-types';
import React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import ApplicationSpecificProperties from '../../Views/User/ApplicationSpecificProperties';
import UserPassword from '../../Views/User/Password/UserPassword';
import UserIdentity from '../../Views/User/UserIdentity';
import { useWdkService } from '../../Hooks/WdkServiceHook';

/**
 * This React component provides the form wrapper and enclosed fieldsets for the user profile/account form.
 * @param props
 * @returns {XML}
 * @constructor
 */
const UserAccountForm = (props) => {
  let {
    wdkConfig,
    user,
    onPropertyChange,
    onPreferenceChange,
    onEmailChange,
    onConfirmEmailChange,
    showChangePasswordBox,
    disableSubmit,
    onSubmit,
    submitButtonText,
  } = props;
  const vocabulary = useWdkService(
    (wdkService) => wdkService.getUserProfileVocabulary().catch(() => ({})),
    []
  );
  return (
    <form
      className="wdk-UserProfile-profileForm"
      name="userProfileForm"
      onSubmit={onSubmit}
    >
      <p>
        <i className="fa fa-asterisk"></i> = required
      </p>
      <UserIdentity
        user={user}
        onEmailChange={onEmailChange}
        onConfirmEmailChange={onConfirmEmailChange}
        onPropertyChange={onPropertyChange}
        propDefs={wdkConfig.userProfileProperties}
        vocabulary={vocabulary}
      />
      <br />
      {!showChangePasswordBox ? (
        ''
      ) : (
        <UserPassword user={user} wdkConfig={wdkConfig} />
      )}
      <br />
      <ApplicationSpecificProperties
        user={user}
        onPropertyChange={onPropertyChange}
        propDefs={wdkConfig.userProfileProperties}
        onPreferenceChange={onPreferenceChange}
      />
      <div>
        <input
          type="submit"
          value={submitButtonText}
          disabled={disableSubmit}
        />
      </div>
    </form>
  );
};

UserAccountForm.propTypes = {
  /** The user object to be modified */
  user: PropTypes.object.isRequired,

  /** Whether to show change password box */
  showChangePasswordBox: PropTypes.bool.isRequired,

  /** Indicates whether submit button should be enabled/disabled */
  disableSubmit: PropTypes.bool.isRequired,

  /** The on change handler for the email text box */
  onEmailChange: PropTypes.func.isRequired,

  /** The on change handler for the confirm email text box */
  onConfirmEmailChange: PropTypes.func.isRequired,

  /** Creates on change handlers for property inputs */
  onPropertyChange: PropTypes.func.isRequired,

  /** The on change handler for preference changes */
  onPreferenceChange: PropTypes.func.isRequired,

  /** The on submit handler for the form */
  onSubmit: PropTypes.func.isRequired,

  /** Text that should appear on the submit button */
  submitButtonText: PropTypes.string.isRequired,

  /** WDK config for setting correct change password link */
  wdkConfig: PropTypes.object.isRequired,
};

export default wrappable(UserAccountForm);
