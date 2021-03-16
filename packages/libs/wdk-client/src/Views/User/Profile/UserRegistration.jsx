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
    (AmoebaDB, CryptoDB, FungiDB, GiardiaDB, MicrosporidiaDB,
    PiroplasmaDB, PlasmoDB, SchistoDB, ToxoDB, TrichDB, TriTrypDB, VectorBase or VEuPathDB)<br/>
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
        <li>permanently save Search Strategies</li>
        <li>use a Basket to make a set of IDs of interest</li>
        <li>use Favorites to mark IDs of interest, for fast access</li>
        <li>add a comment on Genes, Sequences and other record types</li>
        <li>set site preferences</li>
      </ul>
    </div>
  </div>
);

let PrivacyPolicy = () => (
  <div style={descriptionBoxStyle}>
    <div style={{fontSize:"1.2em"}}>
      <a title="It will open in a new tab" target="_blank" href="/a/app/static-content/privacyPolicy.html">
        <b>VEuPathDB Websites Privacy Policy</b></a> 
    </div>
    <table>
      <tbody>
        <tr>
          <td width="40%">
            <p><b>How we will use your email:</b></p>
            <div id="cirbulletlist">
              <ul>
                <li>confirm your subscription</li>
                <li>if you subscribe to them, send infrequent email alerts</li>
                <li>NOTHING ELSE.  We will not release the email list.</li>
              </ul>
            </div>
          </td>
          <td>
            <p><b>How we will use your name and institution:</b></p>
            <div id="cirbulletlist">
              <ul>
                <li>if you add a comment to a Gene or a Sequence, your name and institution will be displayed with the comment.</li>
                <li>if you make a search strategy public, your name and institution will be displayed with it.</li>
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
