import PropTypes from 'prop-types';
import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import TextBox from 'wdk-client/Components/InputControls/TextBox';

/**
 * This React stateless function provides a link to the password change form inside a password change fieldset
 * @param props
 * @returns {XML}
 * @constructor
 */
const UserPasswordReset = props => {
  let { emailText, message, updatePasswordResetEmail, submitPasswordReset } = props;
  let submitHandler = event => {
    event.preventDefault();
    submitPasswordReset(emailText);
  };
  return (
    <div style={{marginBottom:"2em"}}>
      <form onSubmit={submitHandler}>
        <h1>Reset Password</h1>
        { !message ? '' : <span style={{color:"red"}}>{message}</span> }
        <p>
          Please enter your registration username or email below and click 'Submit'.  An
          email containing a new, temporary password will be sent shortly.
        </p><p>
          <TextBox value={emailText} onChange={updatePasswordResetEmail}/>
        </p><p>
          <input type="submit" value="Submit"/>
        </p>
      </form>
    </div>
  );
};

UserPasswordReset.propTypes = {

  /** current email typed in textbox */
  emailText: PropTypes.string.isRequired,

  /** message to be shown to the user */
  message: PropTypes.string,

  /** event handler to call when textbox content changes */
  updatePasswordResetEmail: PropTypes.func.isRequired,

  /** event handler to call when form is submitted */
  submitPasswordReset: PropTypes.func.isRequired
};

export default wrappable(UserPasswordReset);
