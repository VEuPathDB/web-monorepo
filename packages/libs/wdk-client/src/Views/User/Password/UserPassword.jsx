import PropTypes from 'prop-types';
import React from 'react';
import { wrappable } from '../../../Utils/ComponentUtils';
import ChangePasswordLink from '../../../Views/User/Password/ChangePasswordLink';
import { Button } from '@material-ui/core';

/**
 * This React stateless function provides a link to the password change form inside a password change fieldset
 * @param props
 * @returns {XML}
 * @constructor
 */
const UserPassword = (props) => {
  return (
    <Button variant="outlined" color="primary" component={ChangePasswordLink}>
      Change your password
    </Button>
  );
};

UserPassword.propTypes = {
  /** The user object to be modified */
  user: PropTypes.object.isRequired,

  /** WDK config object from which to determine change password link */
  wdkConfig: PropTypes.object.isRequired,
};

export default wrappable(UserPassword);
