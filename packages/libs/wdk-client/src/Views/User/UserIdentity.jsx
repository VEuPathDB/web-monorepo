import PropTypes from 'prop-types';
import React from 'react';
import TextArea from '../../Components/InputControls/TextArea';
import TextBox from '../../Components/InputControls/TextBox';
import SingleSelect from '../../Components/InputControls/SingleSelect';
import { wrappable } from '../../Utils/ComponentUtils';

/**
 * This React stateless function displays the user identification fieldset of the form.
 * @param props
 * @returns {XML}
 * @constructor
 */
const UserIdentity = (props) => {
  let { user, onPropertyChange, vocabulary } = props;
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
          required="required"
          onChange={props.onEmailChange}
          maxLength="255"
          size="80"
          placeholder="Your email or (optional) username can be used to log in"
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
          required="required"
          onChange={props.onConfirmEmailChange}
          maxLength="255"
          size="80"
          placeholder="Please re-type the same email as above"
        />
      </div>
      {props.propDefs.map((propDef) => {
        let { name, help, suggestText, displayName, inputType, isRequired } =
          propDef;
        let value = user.properties[name] ? user.properties[name] : '';
        return (
          <div key={name}>
            <label htmlFor={name}>
              {isRequired ? <i className="fa fa-asterisk"></i> : ''}
              {displayName}:
            </label>
            {inputType === 'text' ? (
              <TextBox
                id={name}
                name={name}
                placeholder={suggestText}
                value={value}
                required={isRequired}
                onChange={onPropertyChange(name)}
                maxLength="255"
                size="80"
              />
            ) : inputType === 'textbox' ? (
              <TextArea
                id={name}
                name={name}
                placeholder={suggestText}
                value={value}
                required={isRequired}
                onChange={onPropertyChange(name)}
                maxLength="3000"
                style={{ width: '40em', height: '5em' }}
              />
            ) : inputType === 'select' ? (
              <SingleSelect
                id={name}
                name={name}
                value={value}
                required={isRequired}
                onChange={onPropertyChange(name)}
                items={[{ value: '', display: '--' }].concat(
                  vocabulary?.[name] ?? []
                )}
              />
            ) : (
              <em>Unknown input type: {inputType}</em>
            )}
          </div>
        );
      })}
    </fieldset>
  );
};

UserIdentity.propTypes = {
  /** The user object to be modified */
  user: PropTypes.object.isRequired,

  /** The on change handler for email text box input */
  onEmailChange: PropTypes.func.isRequired,

  /** The on change handler for confirm email text box input */
  onConfirmEmailChange: PropTypes.func.isRequired,

  /** The on change handler for user profile properties inputs */
  onPropertyChange: PropTypes.func.isRequired,

  /** An array of the user properties configured in WDK model */
  propDefs: PropTypes.array.isRequired,
};

export default wrappable(UserIdentity);
