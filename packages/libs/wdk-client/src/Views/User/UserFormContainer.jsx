import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import { getChangeHandler, wrappable } from 'wdk-client/Utils/ComponentUtils';
import UserAccountForm from 'wdk-client/Views/User/UserAccountForm';

export function getDescriptionBoxStyle() {
  return {
    align:"left",
    width:"550px",
    margin:"25px 20px",
    border:"1px solid black",
    padding:"1em",
    lineHeight:"1.5em"
  }
};

export function interpretFormStatus(formStatus, userFormData, errorMessage) {
  // configure properties for banner and submit button enabling based on status
  let messageClass="wdk-UserProfile-banner ", message="", disableSubmit = false;
  switch (formStatus) {
    case 'new':
      disableSubmit = true;
      break;
    case 'modified':
      message = "*** You have unsaved changes ***";
      messageClass += "wdk-UserProfile-modified";
      break;
    case 'pending':
      message = "Saving changes...";
      messageClass += "wdk-UserProfile-pending";
      disableSubmit = true;
      break;
    case 'success':
      message = "Your changes have been successfully saved.";
      messageClass += "wdk-UserProfile-success";
      disableSubmit = true; // same as 'new'
      break;
    case 'error':
      message = errorMessage;
      messageClass += "wdk-UserProfile-error";
  }
  let messageElement = ( <FormMessage messageClass={messageClass} message={message}/> );
  return { messageElement, disableSubmit };
}

export function FormMessage({ message, messageClass }) {
  return ( message == '' ? <noscript/> :
    <div className={messageClass}>{message}</div> );
}

export function IntroComponent() {
  return (
    <div style={{paddingBottom:"2em"}}>
      Review our&nbsp;
      <a title="It will open in a new tab" target="_blank" href="/a/app/static-content/privacyPolicy.html">
        <b>VEuPathDB Websites Privacy Policy</b>
      </a>.
    </div>
  );
}

function OutroComponent(props) {
  const projectId = useSelector(state => state.globalData.siteConfig.projectId);
  let showCrossBrcInfo = (projectId != "ClinEpiDB" && projectId != "MicrobiomeDB" && projectId != "AllClinEpiDB");
  return !showCrossBrcInfo ? null : (
    <div style={getDescriptionBoxStyle()}>
      <h4>About Bioinformatics Resource Centers</h4>
      <p>
        The <a target="_blank" href="https://www.niaid.nih.gov/research/bioinformatics-resource-centers">
        Bioinformatics Resource Centers</a> (BRCs) for Infectious Diseases program was initiated in 2004&nbsp;
        with the main objective of providing public access to computational platforms and analysis tools&nbsp;
        that enable  collecting, archiving, updating, and integrating a variety of genomics and related&nbsp;
        research data relevant to infectious diseases, and pathogens and their interaction with hosts.
      </p>
      <VisitOtherBrc {...props}/>
      <p>
        Sign up for cross-BRC email alerts <a target="_blank" href="https://lists.brcgateway.org/mailman/listinfo/brc-all">here</a>.
      </p>
    </div>
  );
}

export function VisitOtherBrc({user}) {
  const projectId = useSelector(state => state.globalData.siteConfig.projectId);
  if (projectId == "ClinEpiDB" || projectId == "MicrobiomeDB") return null;
  let clean = val => val ? encodeURIComponent(val) : "";
  let userDataQueryString =
    "?email=" + clean(user.email) +
    "&username=" + clean(user.properties.username) +
    "&first_name=" + clean(user.properties.firstName) +
    "&middle_name=" + clean(user.properties.middleName) +
    "&last_name=" + clean(user.properties.lastName) +
    "&affiliation=" + clean(user.properties.organization) +
    "&interests=" + clean(user.properties.interests);
  return (
    <p style={{margin:"1.5em 0"}}>
      Visit our partner Bioinformatics Resource Center,&nbsp;
      <a target="_blank" href="https://www.bv-brc.org">BV-BRC</a>, and&nbsp;
      <a target="_blank" href="https://www.bv-brc.org/login">log in</a> there or&nbsp;
      <a target="_blank" href={'https://www.bv-brc.org/register' + userDataQueryString}>register</a>.
    </p>
  );
}

/**
 * React component for the user profile/account form
 * @type {*|Function}
 */
class UserFormContainer extends React.Component {

  constructor(props) {
    super(props);
    this.onEmailChange = this.onEmailChange.bind(this);
    this.onConfirmEmailChange = this.onConfirmEmailChange.bind(this);
    this.onEmailFieldChange = this.onEmailFieldChange.bind(this);
    this.onPropertyChange = this.onPropertyChange.bind(this);
    this.onPreferenceChange = this.onPreferenceChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  render() {
    let formInterpreter = this.props.statusDisplayFunction || interpretFormStatus;
    let formConfig = formInterpreter(this.props.formStatus, this.props.previousUserFormData, this.props.errorMessage);

    return (
      <div className="wdk-UserProfile">
        {this.props.shouldHideForm ?
          <div>{this.props.hiddenFormMessage}</div> :
          <div>
            <h1>{this.props.titleText}</h1>
            <IntroComponent/>
            {formConfig.messageElement}
            <UserAccountForm
              user={this.props.userFormData}
              showChangePasswordBox={this.props.showChangePasswordBox}
              disableSubmit={formConfig.disableSubmit}
              onEmailChange={this.onEmailChange}
              onConfirmEmailChange={this.onConfirmEmailChange}
              onPropertyChange={this.onPropertyChange}
              onPreferenceChange={this.onPreferenceChange}
              onSubmit={this.onSubmit}
              submitButtonText={this.props.submitButtonText}
              wdkConfig={this.props.globalData.config}
            />
            <OutroComponent user={this.props.userFormData}/>
          </div>
        }
      </div>
    );
  }

  /**
   * Verifies that the email and the re-typed email match.  HTML5 validation doesn't handle this OOTB.
   * @param newState - new user state
   */
  validateEmailConfirmation(newState) {
    let userEmail = newState.email;
    let confirmUserEmail = newState.confirmEmail;
    if (userEmail != null  && confirmUserEmail != null) {
      let confirmUserEmailElement = document.getElementById("confirmUserEmail");
      userEmail !== confirmUserEmail ? confirmUserEmailElement.setCustomValidity("Both email entries must match.") : confirmUserEmailElement.setCustomValidity("");
    }
  }

  /**
   * Dynamically creates a change handler with the
   * @param {string} field
   * @param {string} newValue
   */
  onEmailFieldChange(field, newValue) {
    // create function to do validation and call form action creator
    let updater = newState => {
        this.validateEmailConfirmation(newState);
        this.props.userEvents.updateProfileForm(newState);
    };
    // create change handler for email field requested
    let handler = getChangeHandler(field, updater, this.props.userFormData);
    // call it with new value
    handler(newValue);
  }

  /**
   * Triggered by onChange handler of email TextBox.  Provides extra validation
   * step comparing email and confirmEmail.  Calls event to update form.
   * @param newValue - new value of email field
   * @returns {*}
   */
  onEmailChange(newValue) {
    this.onEmailFieldChange('email', newValue);
  }

  /**
   * Triggered by onChange handler of confirmEmail TextBox.  Provides extra validation
   * step comparing email and confirmEmail.  Calls event to update form.
   * @param newValue - new value of email field
   * @returns {*}
   */
  onConfirmEmailChange(newValue) {
    this.onEmailFieldChange('confirmEmail', newValue);
  }

  /**
   * Returns an onChange handler that should be triggered by a form element
   * that updates a user property.
   * @param field - name of user attribute being changed
   * @returns {*}
   */
  onPropertyChange(field) {
    let update = this.props.userEvents.updateProfileForm;
    let previousState = this.props.userFormData;
    return newValue => {
      let newProps = Object.assign({}, previousState.properties, { [field]: newValue });
      update(Object.assign({}, previousState, { properties: newProps }));
    };
  }

  /**
   * Should be triggered by a form element that updates user preferences.
   * Updates user data with state changes incorporated.
   * @param newPreferences - updated preferences
   * @returns {*}
   */
  onPreferenceChange(newPreferences) {
    let updatedUserData = Object.assign({}, this.props.userFormData, { preferences: newPreferences });
    this.props.userEvents.updateProfileForm(updatedUserData);
  }

  /**
   * Triggered by onSubmit handler of the user profile/account form.  Verifies
   * again that the email and re-typed version match. Then checks the validity
   * of all other inputs using HTML5 validity methods.  If all verifications
   * pass, the re-typed email attribute is removed from the user object (as it
   * was only introduced as a check of user typing) and the user object is saved.
   * @param event
   */
  onSubmit(event) {
    event.preventDefault();
    this.validateEmailConfirmation(this.props.userFormData);
    let inputs = document.querySelectorAll("input[type=text],input[type=email]");
    let valid = true;
    for(let input of inputs) {
      if(!input.checkValidity()) {
        valid = false;
        break;
      }
    }
    if(valid) {
      this.props.onSubmit(this.props.userFormData);
    }
  }
}

export let UserFormContainerPropTypes = {

  /** WDK config object */
  globalData: PropTypes.shape({ config: PropTypes.object.isRequired }),

  /** The user object to be modified */
  userFormData:  PropTypes.object.isRequired,

  /**
   *  Indicates the current status of form.  Display may change based on status.
   *  Acceptable values are: [ 'new', 'modified', 'pending', 'success', 'error' ]
   */
  formStatus: PropTypes.string,

  /**
   * Message to the user explaining an error outcome of the user's save attempt.
   */
  errorMessage: PropTypes.string,

  /** Hash holding the functions that trigger corresponding action creator actions */
  userEvents:  PropTypes.shape({

    /** Called with a parameter representing the new state when a form element changes */
    updateProfileForm:  PropTypes.func.isRequired

  })
};

UserFormContainer.propTypes = Object.assign({}, UserFormContainerPropTypes, {

  /** Whether form should be hidden based on current login status */
  shouldHideForm: PropTypes.bool.isRequired,

  /** Message to display if user accesses page when it should be hidden */
  hiddenFormMessage: PropTypes.string.isRequired,

  /** Page header title text */
  titleText: PropTypes.string.isRequired,

  /** Component to show intro about this page; will use empty span by default */
  introComponent: PropTypes.func,

  /** Function to determine the status messages at the top of the element */
  statusDisplayFunction: PropTypes.func,

  /** Whether to show change password box */
  showChangePasswordBox: PropTypes.bool.isRequired,

  /** Text to place in form submit button */
  submitButtonText: PropTypes.string.isRequired,

  /** Called with a parameter representing the user data to be saved */
  onSubmit:  PropTypes.func.isRequired

});

export default wrappable(UserFormContainer);
