import PropTypes from 'prop-types';
import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import ChangePasswordLink from 'wdk-client/Views/User/Password/ChangePasswordLink';

/**
 * This React stateless function provides a link to the password change form inside a password change fieldset
 * @param props
 * @returns {XML}
 * @constructor
 */
const UserPassword = (props) => {
  return (
    <fieldset>
      <legend>Password</legend>
      <div>
        <ChangePasswordLink
            userEmail={props.user.email}
            changePasswordUrl={props.wdkConfig.changePasswordUrl}>
          Change your password
        </ChangePasswordLink>
      </div>
    </fieldset>
  );
};

UserPassword.propTypes = {

  /** The user object to be modified */
  user:  PropTypes.object.isRequired,

  /** WDK config object from which to determine change password link */
  wdkConfig:  PropTypes.object.isRequired
};

export default wrappable(UserPassword);
