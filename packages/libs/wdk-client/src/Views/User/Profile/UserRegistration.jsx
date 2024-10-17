import React from 'react';
import { wrappable } from '../../../Utils/ComponentUtils';
import UserFormContainer, {
  UserFormContainerPropTypes,
  FormMessage,
  getDescriptionBoxStyle,
} from '../../../Views/User/UserFormContainer';

let interpretFormStatus = (formStatus, userFormData, errorMessage) => {
  // configure properties for banner and submit button enabling based on status
  let messageClass = 'wdk-UserProfile-banner ',
    message = '',
    disableSubmit = false;
  switch (formStatus) {
    case 'new':
      disableSubmit = true;
      break;
    case 'modified':
      // don't give status and enable submit button
      break;
    case 'pending':
      message = 'Submitting registration...';
      messageClass += 'wdk-UserProfile-pending';
      disableSubmit = true;
      break;
    case 'success':
      // special case for success; include Joint-BRC advertisement
      message = (
        <div>
          <p>
            You have registered successfully. Please check your email (inbox and
            spam folder) for a temporary password.
          </p>
        </div>
      );
      messageClass += 'wdk-UserProfile-success';
      disableSubmit = true; // same as 'new'
      break;
    case 'error':
      message = errorMessage;
      messageClass += 'wdk-UserProfile-error';
  }
  let messageElement = (
    <FormMessage messageClass={messageClass} message={message} />
  );
  return { messageElement, disableSubmit };
};

let IntroText = () => (
  <div style={{ width: '70%', textAlign: 'center', margin: '15px' }}>
    IMPORTANT: If you already registered in another site
    <br />
    (AmoebaDB, CryptoDB, FungiDB, GiardiaDB, MicrosporidiaDB, PiroplasmaDB,
    PlasmoDB, SchistoDB, ToxoDB, TrichDB, TriTrypDB, VectorBase or VEuPathDB)
    <br />
    you do NOT need to register again.
  </div>
);

let WhyRegister = () => (
  <div style={getDescriptionBoxStyle()}>
    <h4>Why register/subscribe?</h4>
    <div id="cirbulletlist">
      <ul>
        <li>Permanently save Search Strategies</li>
        <li>Use a Basket to make a set of IDs of interest</li>
        <li>Use Favorites to mark IDs of interest, for fast access</li>
        <li>Add a comment on Genes, Sequences and other record types</li>
        <li>Set site preferences</li>
      </ul>
    </div>
  </div>
);

let PrivacyPolicy = () => (
  <div style={getDescriptionBoxStyle()}>
    <h4>
      <a
        title="It will open in a new tab"
        target="_blank"
        href="/a/app/static-content/privacyPolicy.html"
      >
        VEuPathDB Websites Privacy Policy
      </a>
    </h4>
    <table>
      <tbody>
        <tr>
          <td width="40%">
            <p>
              <b>How we will use your email:</b>
            </p>
            <div id="cirbulletlist">
              <ul>
                <li>Confirm your subscription.</li>
                <li>If you subscribe to them, send infrequent email alerts.</li>
                <li>NOTHING ELSE. We will not release the email list.</li>
              </ul>
            </div>
          </td>
          <td>
            <p>
              <b>How we will use your name and institution:</b>
            </p>
            <div id="cirbulletlist">
              <ul>
                <li>
                  If you add a comment to a Gene or a Sequence, your name and
                  institution will be displayed with the comment.
                </li>
                <li>
                  If you make a search strategy public, your name and
                  institution will be displayed with it.
                </li>
                <li>
                  NOTHING ELSE. We will not release your name or institution.
                </li>
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
let UserRegistration = (props) => (
  <div>
    <UserFormContainer
      {...props}
      shouldHideForm={!props.globalData.user.isGuest}
      hiddenFormMessage="You must log out before registering a new user."
      titleText="Registration"
      introComponent={IntroText}
      statusDisplayFunction={interpretFormStatus}
      showChangePasswordBox={false}
      submitButtonText="Register"
      onSubmit={props.userEvents.submitRegistrationForm}
    />
    {!props.globalData.user.isGuest ? (
      ''
    ) : (
      <div>
        <WhyRegister />
        <PrivacyPolicy />
      </div>
    )}
  </div>
);

UserRegistration.propTypes = UserFormContainerPropTypes;

export default wrappable(UserRegistration);
