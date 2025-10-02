import React from 'react';
import { Link } from 'react-router-dom';
import TextArea from '../../Components/InputControls/TextArea';
import TextBox from '../../Components/InputControls/TextBox';
import SingleSelect from '../../Components/InputControls/SingleSelect';
import { wrappable } from '../../Utils/ComponentUtils';
import { Grid } from '@material-ui/core';
import './Profile/UserProfile.scss';
import { ServiceConfig } from '../../Service/ServiceBase';
import { UserProfileFormData } from '../../StoreModules/UserProfileStoreModule';

// this ought to be typed "higher up" but doesn't seem to be
// see `getUserProfileVocabulary` in OauthService.ts
type VocabularyItem = {
  value: string;
  display: string;
};

type Vocabulary = Record<string, VocabularyItem[]>;

type UserProfileProperty = ServiceConfig['userProfileProperties'][number] & {
  suggestText?: string;
  isMultiLine?: boolean;
};

interface UserIdentityProps {
  /** The user object to be modified */
  user: UserProfileFormData;

  /** The on change handler for email text box input */
  onEmailChange: (value: string) => void;

  /** The on change handler for confirm email text box input */
  onConfirmEmailChange: (value: string) => void;

  /** The on change handler for user profile properties inputs */
  onPropertyChange: (field: string) => (value: any) => void;

  /** An array of the user properties configured in WDK model */
  propDefs: UserProfileProperty[];

  /** Vocabulary for select fields */
  vocabulary?: Vocabulary;

  /** Whether to highlight missing required fields */
  highlightMissingFields?: boolean;
}

/**
 * This React stateless function displays the user identification fieldset of the form.
 */
const UserIdentity = (props: UserIdentityProps) => {
  const {
    user,
    onPropertyChange,
    vocabulary = {},
    highlightMissingFields,
  } = props;

  return (
    <>
      <h2>Profile</h2>
      <PrivacyPolicyLink />
      <p>
        <i className="fa fa-asterisk"></i> = required
      </p>
      <h3>Contact</h3>

      <Grid
        container
        justifyContent="flex-start"
        spacing={1}
        alignItems="center"
      >
        <Grid item xs={6} md={4} lg={3}>
          <h4>
            <i className="fa fa-asterisk"></i>Email:{' '}
          </h4>
        </Grid>
        <Grid item xs={6} md={8} lg={9}>
          <TextBox
            type="email"
            id="userEmail"
            value={user.email}
            required
            onChange={props.onEmailChange}
            maxLength={255}
            size={80}
            placeholder="Your email or (optional) username can be used to log in"
            className={
              highlightMissingFields && !user.email
                ? 'field-required-empty'
                : ''
            }
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <h4>
            <i className="fa fa-asterisk"></i>Retype Email:
          </h4>
        </Grid>
        <Grid item xs={6} md={8} lg={9}>
          <TextBox
            type="email"
            id="confirmUserEmail"
            value={user.confirmEmail}
            required
            onChange={props.onConfirmEmailChange}
            maxLength={255}
            size={80}
            placeholder="Please re-type the same email as above"
            className={
              highlightMissingFields && !user.confirmEmail
                ? 'field-required-empty'
                : ''
            }
          />
        </Grid>
      </Grid>
      <h3>Information</h3>
      <Grid
        container
        spacing={1}
        justifyContent="flex-start"
        alignItems="center"
        style={{ marginBottom: '3em' }}
      >
        {props.propDefs
          .filter((def) => def.name !== 'subscriptionToken')
          .map((propDef) => {
            const {
              name,
              help,
              suggestText,
              displayName,
              isMultiLine,
              inputType,
              isRequired,
            } = propDef;
            const value = user.properties?.[name] ?? '';
            return (
              <>
                <Grid item key={name} xs={6} md={4} lg={3}>
                  <h4>
                    {isRequired ? <i className="fa fa-asterisk"></i> : ''}
                    {displayName}:
                  </h4>
                </Grid>
                <Grid item xs={6} md={8} lg={9} key={name + '_input'}>
                  {inputType === 'text' ? (
                    <TextBox
                      id={name}
                      name={name}
                      placeholder={suggestText}
                      value={value}
                      required={isRequired}
                      onChange={onPropertyChange(name)}
                      maxLength={255}
                      size={80}
                      className={
                        highlightMissingFields && isRequired && !value
                          ? 'field-required-empty'
                          : ''
                      }
                    />
                  ) : inputType === 'textbox' ? (
                    <TextArea
                      id={name}
                      name={name}
                      placeholder={suggestText}
                      value={value}
                      required={isRequired}
                      onChange={onPropertyChange(name)}
                      maxLength={3000}
                      style={{ width: '40em', height: '5em' }}
                      className={
                        highlightMissingFields && isRequired && !value
                          ? 'field-required-empty'
                          : ''
                      }
                    />
                  ) : inputType === 'select' ? (
                    <SingleSelect
                      name={name}
                      value={value}
                      required={isRequired}
                      onChange={onPropertyChange(name)}
                      items={[{ value: '', display: '--' }].concat(
                        vocabulary[name] ?? []
                      )}
                      className={
                        highlightMissingFields && isRequired && !value
                          ? 'field-required-empty'
                          : ''
                      }
                    />
                  ) : (
                    <em>Unknown input type: {inputType}</em>
                  )}
                </Grid>
              </>
            );
          })}
      </Grid>
    </>
  );
};

export default wrappable(UserIdentity);

function PrivacyPolicyLink() {
  return (
    <div>
      Review our&nbsp;
      <Link
        title="View the privacy policy in a new tab"
        target="_blank"
        to="/static-content/privacyPolicy.html"
      >
        <b>VEuPathDB Websites Privacy Policy</b>
      </Link>
      .
    </div>
  );
}
