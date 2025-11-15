import React from 'react';
import { wrappable, getChangeHandler } from '../../../Utils/ComponentUtils';
import { SaveButton } from '@veupathdb/coreui/lib/components/buttons';
import TextBox from '../../../Components/InputControls/TextBox';
import { alert } from '../../../Utils/Platform';
import { User } from '../../../Utils/WdkUser';
import { FormStatus } from '../../../Actions/UserActions';

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserEvents {
  updateChangePasswordForm: (form: PasswordForm) => PasswordForm;
  savePassword: (oldPassword: string, newPassword: string) => void;
}

interface ChangePasswordFormProps {
  /** User object */
  user?: User;

  /** Contains values for form input fields */
  passwordForm: PasswordForm;

  /** Contains current status of the form */
  formStatus: FormStatus;

  /** Contains a message for the user if status is 'error' */
  errorMessage?: string;

  /** Object containing event handler functions */
  userEvents: UserEvents;
}

interface PasswordFieldProps {
  name: 'oldPassword' | 'newPassword' | 'confirmPassword';
  display: string;
  passwordForm: PasswordForm;
  userEvents: UserEvents;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  name,
  display,
  passwordForm,
  userEvents,
}) => {
  return (
    <div style={{ margin: '5px' }}>
      <label>{display}:</label>
      <TextBox
        type="password"
        value={passwordForm[name]}
        onChange={getChangeHandler(
          name,
          userEvents.updateChangePasswordForm,
          passwordForm
        )}
      />
    </div>
  );
};

function formValid(passwordForm: PasswordForm): boolean {
  const { oldPassword, newPassword, confirmPassword } = passwordForm;
  if (newPassword == '') {
    alert('Uh oh!', 'New password must be non-empty.  Please try again.');
    return false;
  } else if (newPassword !== confirmPassword) {
    alert('Uh oh!', 'Passwords must match.  Please try again.');
    return false;
  }
  return true;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = (props) => {
  const submitHandler = function (e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const form = props.passwordForm;
    if (formValid(form)) {
      props.userEvents.savePassword(form.oldPassword, form.newPassword);
    }
  };
  return (
    <div style={{ margin: '0 2em' }}>
      {!props.user || props.user.isGuest ? (
        <div>You must first log on to change your password.</div>
      ) : (
        <div>
          <h1>Change Password</h1>
          <div style={{ margin: '1em' }}>
            <form
              className="wdk-UserProfile-profileForm"
              name="userPasswordForm"
              onSubmit={submitHandler}
            >
              <PasswordField
                name="oldPassword"
                display="Old Password"
                passwordForm={props.passwordForm}
                userEvents={props.userEvents}
              />
              <PasswordField
                name="newPassword"
                display="New Password"
                passwordForm={props.passwordForm}
                userEvents={props.userEvents}
              />
              <PasswordField
                name="confirmPassword"
                display="Confirm Password"
                passwordForm={props.passwordForm}
                userEvents={props.userEvents}
              />
              <div style={{ marginLeft: '115px' }}>
                <SaveButton
                  formStatus={props.formStatus}
                  onPress={submitHandler}
                  customText={{
                    save: 'Submit',
                  }}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default wrappable(ChangePasswordForm);
