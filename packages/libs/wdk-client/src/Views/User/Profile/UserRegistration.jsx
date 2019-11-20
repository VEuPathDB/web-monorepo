import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import UserFormContainer, { UserFormContainerPropTypes } from 'wdk-client/Views/User/UserFormContainer';

let interpretFormStatus = (formStatus, errorMessage) => {
  // configure properties for banner and submit button enabling based on status
  let messageClass = "wdk-UserProfile-banner ", message = "", disableSubmit = false;
  switch (formStatus) {
    case 'new':
      disableSubmit = true;
      break;
    case 'modified':
      // don't give status and enable submit button
      break;
    case 'pending':
      message = "Submitting registration...";
      messageClass += "wdk-UserProfile-pending";
      disableSubmit = true;
      break;
    case 'success':
      message = "You have registered successfully.  Please check your email for a temporary password.";
      messageClass += "wdk-UserProfile-success";
      disableSubmit = true; // same as 'new'
      break;
    case 'error':
      message = errorMessage;
      messageClass += "wdk-UserProfile-error";
  }
  return { messageClass, message, disableSubmit };
}

let IntroText = () => (
  <div style={{width:"70%",textAlign:"center",margin:"15px"}}>
    IMPORTANT: If you already registered in another site<br/>
    (AmoebaDB, CryptoDB, EuPathDB, FungiDB, GiardiaDB, MicrosporidiaDB,
    PiroplasmaDB, PlasmoDB, SchistoDB, ToxoDB, TrichDB or TriTrypDB)<br/>
    you do NOT need to register again.
  </div>
);

let descriptionBoxStyle = {
  align:"left",
  width:"550px",
  margin:"25px 20px",
  border:"1px solid black",
  padding:"5px",
  lineHeight:"1.5em"
};

let WhyRegister = () => (
  <div style={descriptionBoxStyle}>
    <p><b>Why register/subscribe?</b> So you can:</p>
    <div id="cirbulletlist">
      <ul>
        <li>Have your strategies back the next time you login</li>
        <li>Use your basket to store temporarily IDs of interest, and either save, or download or access other tools</li>
        <li>Use your favorites to store IDs of permanent interest, for faster access to its record page</li>
        <li>Add a comment on genes and sequences</li>
        <li>Set site preferences, such as items per page displayed in the query result</li>
      </ul>
    </div>
  </div>
);

let PrivacyPolicy = () => (
  <div style={descriptionBoxStyle}>
    <div style={{fontSize:"1.2em"}}>
      <a title="It will open in a new tab" target="_blank" href="/documents/EuPathDB_Website_Privacy_Policy.shtml">
        <b>EuPathDB Websites Privacy Policy</b></a> 
    </div>
    <table>
      <tbody>
        <tr>
          <td width="40%">
            <p><b>How we will use your email:</b></p>
            <div id="cirbulletlist">
              <ul>
                <li>Confirm your subscription</li>
                <li>Send you infrequent alerts if you subscribe to receive them</li>
                <li>NOTHING ELSE.  We will not release the email list.</li>
              </ul>
            </div>
          </td>
          <td>
            <p><b>How we will use your name and institution:</b></p>
            <div id="cirbulletlist">
              <ul>
                <li>If you add a comment to a Gene or a Sequence, your name and institution will be displayed with the comment.</li>
                <li>If you make one of your strategies Public, your name and institution will be displayed with it.</li>
                <li>NOTHING ELSE.  We will not release your name or institution.</li>
              </ul>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

/**
 * React component for the user profile/account form
 * @type {*|Function}
 */
let UserRegistration = props => (

  <div>
    <UserFormContainer {...props}
        shouldHideForm={!props.globalData.user.isGuest}
        hiddenFormMessage="You must log out before registering a new user."
        titleText="Registration"
        introComponent={IntroText}
        statusDisplayFunction={interpretFormStatus}
        showChangePasswordBox={false}
        submitButtonText="Register"
        onSubmit={props.userEvents.submitRegistrationForm}/>
    {!props.globalData.user.isGuest ? '' : (
      <div>
        <WhyRegister/>
        <PrivacyPolicy/>
      </div>
    )}
  </div>

);

UserRegistration.propTypes = UserFormContainerPropTypes;

export default wrappable(UserRegistration);
