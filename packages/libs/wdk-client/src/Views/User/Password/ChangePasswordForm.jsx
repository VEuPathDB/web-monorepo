import PropTypes from 'prop-types';
import React from 'react';
import { wrappable, getChangeHandler } from 'wdk-client/Utils/ComponentUtils';
import { interpretFormStatus, FormMessage } from 'wdk-client/Views/User/UserFormContainer';
import TextBox from 'wdk-client/Components/InputControls/TextBox';
import { alert } from 'wdk-client/Utils/Platform';

let PasswordField = props => {
  let { name, display, passwordForm, userEvents } = props;
  return (
    <div style={{margin:'5px'}}>
      <label>{display}:</label>
      <TextBox type="password" value={passwordForm[name]}
          onChange={getChangeHandler(name, userEvents.updateChangePasswordForm, passwordForm)}
      />
    </div>
  );
}

function formValid(passwordForm) {
  let { oldPassword, newPassword, confirmPassword } = passwordForm;
  if (newPassword == '') {
    alert("Uh oh!", "New password must be non-empty.  Please try again.");
    return false;
  }
  else if (newPassword !== confirmPassword) {
    alert("Uh oh!", "Passwords must match.  Please try again.");
    return false;
  }
  return true;
}

let ChangePasswordForm = props => {
  let formConfig = interpretFormStatus(props.formStatus, props.errorMessage);
  let submitHandler = function() {
    let form = props.passwordForm;
    if (formValid(form)) {
      props.userEvents.savePassword(form.oldPassword, form.newPassword);
    }
  };
  return (
    <div style={{ margin: "0 2em"}}>
      {props.user.isGuest ?
        <div>You must first log on to change your password.</div> :
        <div>
          <h1>Change Password</h1>
          <FormMessage {...formConfig}/>
          <div style={{margin:'1em'}}>
            <form className="wdk-UserProfile-profileForm" name="userPasswordForm">
              <PasswordField name="oldPassword" display="Old Password" {...props}/>
              <PasswordField name="newPassword" display="New Password" {...props}/>
              <PasswordField name="confirmPassword" display="Confirm Password" {...props}/>
              <div style={{marginLeft:'115px'}}>
                <input type="button" disabled={formConfig.disableSubmit}
                    value="Submit" onClick={submitHandler}/>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  );
}

ChangePasswordForm.propTypes = {

  /** User object */
  user: PropTypes.object.isRequired,

  /** Contains values for form input fields */
  passwordForm: PropTypes.shape({
    oldPassword: PropTypes.string.isRequired,
    newPassword: PropTypes.string.isRequired,
    confirmPassword: PropTypes.string.isRequired
  }),

  /** Contains current status of the form */
  formStatus: PropTypes.string.isRequired, // Values: [ 'new', 'pending', 'success', 'error' ]

  /** Contains a message for the user if status is 'error' */
  errorMessage: PropTypes.string,

  /** Object containing event handler functions */
  userEvents: PropTypes.shape({

    /** Called with the new form state object when a form input changes */
    updateChangePasswordForm:  PropTypes.func.isRequired,

    /** Called when the user clicks the submit button */
    savePassword:  PropTypes.func.isRequired
  })

};

export default wrappable(ChangePasswordForm);
