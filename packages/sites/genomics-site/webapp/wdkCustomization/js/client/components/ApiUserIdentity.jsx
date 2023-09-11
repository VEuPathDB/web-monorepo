import React from 'react';
import { TextBox } from '@veupathdb/wdk-client/lib/Components';
import { getChangeHandler } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

/**
 * This React stateless function is an override of the WDK React component that displays the Identification fieldset of the User Profile / Account form.
 * Title and department data are not currently collected by the ApiDB and so are left off this version of the fieldset.
 * @param props
 * @returns {XML} - modified identification fieldset
 * @constructor
 */
const ApiUserIdentity = (props) => {
  let user = props.user;
  return (
    <fieldset>
      <legend>Identification</legend>
      <div>
        <label htmlFor="userEmail">
          <i className="fa fa-asterisk"></i>Email:
        </label>
        <TextBox
          type="email"
          id="userEmail"
          value={user.email}
          onChange={props.onEmailChange('email')}
          maxLength="255"
          size="100"
          required
          placeholder="Your email is used as your unique user id"
        />
      </div>
      <div>
        <label htmlFor="confirmUserEmail">
          <i className="fa fa-asterisk"></i>Retype Email:
        </label>
        <TextBox
          type="email"
          id="confirmUserEmail"
          value={user.confirmEmail}
          onChange={props.onEmailChange('confirmEmail')}
          maxLength="255"
          size="100"
          required
          placeholder="Your email is used as your unique user id"
        />
      </div>
      <div>
        <label htmlFor="firstName">
          <i className="fa fa-asterisk"></i>First Name:
        </label>
        <TextBox
          id="firstName"
          value={user.firstName}
          onChange={props.onTextChange('firstName')}
          maxLength="50"
          size="25"
          required
        />
      </div>
      <div>
        <label htmlFor="middleName">Middle Name:</label>
        <TextBox
          id="middleName"
          value={user.middleName}
          onChange={props.onTextChange('middleName')}
          maxLength="50"
          size="25"
        />
      </div>
      <div>
        <label htmlFor="lastName">
          <i className="fa fa-asterisk"></i>Last Name:
        </label>
        <TextBox
          id="lastName"
          value={user.lastName}
          onChange={props.onTextChange('lastName')}
          maxLength="50"
          size="25"
          required
        />
      </div>
      <div>
        <label htmlFor="organization">
          <i className="fa fa-asterisk"></i>Organization:
        </label>
        <TextBox
          id="organization"
          value={user.organization}
          onChange={props.onTextChange('organization')}
          maxLength="255"
          size="100"
          required
        />
      </div>
    </fieldset>
  );
};

export default ApiUserIdentity;
