import React from 'react';
import { wrappable } from '../../../Utils/ComponentUtils';
import TextBox from '../../../Components/InputControls/TextBox';

interface Props {
  /** current email typed in textbox */
  emailText: string;

  /** message to be shown to the user */
  message?: string;

  /** event handler to call when textbox content changes */
  updatePasswordResetEmail: (emailText: string) => void;

  /** event handler to call when form is submitted */
  submitPasswordReset: (emailText: string) => void;
}

/**
 * This React stateless function provides a link to the password change form inside a password change fieldset
 */
const UserPasswordReset: React.FC<Props> = (props) => {
  let { emailText, message, updatePasswordResetEmail, submitPasswordReset } =
    props;
  let submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitPasswordReset(emailText);
  };
  return (
    <div style={{ marginBottom: '2em' }}>
      <form onSubmit={submitHandler}>
        <h1>Reset Password</h1>
        {!message ? '' : <span style={{ color: 'red' }}>{message}</span>}
        <p>
          Please enter your registration username or email below and click
          'Submit'. An email containing a new, temporary password will be sent
          shortly.
        </p>
        <p>
          <TextBox value={emailText} onChange={updatePasswordResetEmail} />
        </p>
        <p>
          <input type="submit" value="Submit" />
        </p>
      </form>
    </div>
  );
};

export default wrappable(UserPasswordReset);
