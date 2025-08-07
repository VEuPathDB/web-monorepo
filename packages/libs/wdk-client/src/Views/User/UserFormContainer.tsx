import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserProfileFormData } from '../../StoreModules/UserProfileStoreModule';
import { getChangeHandler, wrappable } from '../../Utils/ComponentUtils';
import { UserPreferences } from '../../Utils/WdkUser';
import UserAccountForm from '../../Views/User/UserAccountForm';

export function getDescriptionBoxStyle() {
  return {
    align: 'left' as const,
    width: '550px',
    margin: '25px 20px',
    border: '1px solid black',
    padding: '1em',
    lineHeight: '1.5em',
  };
}

export function FormMessage({
  message,
  messageClass,
}: {
  message: string;
  messageClass: string;
}) {
  return message === '' ? null : <div className={messageClass}>{message}</div>;
}

export function IntroComponent() {
  return (
    <div style={{ paddingBottom: '2em' }}>
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

export interface UserFormContainerProps {
  globalData: { config?: any };
  userFormData?: UserProfileFormData;
  previousUserFormData?: UserProfileFormData;
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
  errorMessage?: string;
  userEvents: {
    updateProfileForm: (newState: UserProfileFormData) => void;
    resetProfileForm?: (formData: UserProfileFormData) => void;
  };
  shouldHideForm: boolean;
  hiddenFormMessage: string;
  titleText: string;
  introComponent?: React.ComponentType;
  showChangePasswordBox: boolean;
  submitButtonText: string;
  onSubmit: (userData: UserProfileFormData) => void;
  singleFormMode?: boolean;
}

function UserFormContainer(props: UserFormContainerProps) {
  const currentUserFormData = props.userFormData ?? {}; // can be missing in the registration form, of course
  const initialUserStateRef = useRef<UserProfileFormData>(currentUserFormData);

  function validateEmailConfirmation(newState: UserProfileFormData): void {
    const userEmail = newState.email;
    const confirmUserEmail = newState.confirmEmail;
    if (userEmail != null && confirmUserEmail != null) {
      const elem = document.getElementById('confirmUserEmail');
      if (elem instanceof HTMLInputElement) {
        if (userEmail !== confirmUserEmail) {
          elem.setCustomValidity('Both email entries must match.');
        } else {
          elem.setCustomValidity('');
        }
      }
    }
  }

  function onEmailFieldChange(field: string, newValue: any): void {
    const updater = (newState: UserProfileFormData) => {
      validateEmailConfirmation(newState);
      props.userEvents.updateProfileForm(newState);
      return newState;
    };
    const handler = getChangeHandler(field, updater, currentUserFormData);
    handler(newValue);
  }

  const onEmailChange = (newValue: string): void => {
    onEmailFieldChange('email', newValue);
  };

  const onConfirmEmailChange = (newValue: string): void => {
    onEmailFieldChange('confirmEmail', newValue);
  };

  function onPropertyChange(field: string) {
    return (newValue: any): void => {
      const previousState = currentUserFormData;
      const newProps = { ...previousState.properties, [field]: newValue };
      props.userEvents.updateProfileForm({
        ...previousState,
        properties: newProps,
      });
    };
  }

  function onPreferenceChange(newPreferences: UserPreferences): void {
    const updatedUserData = {
      ...props.userFormData,
      preferences: newPreferences,
    };
    props.userEvents.updateProfileForm(updatedUserData);
  }

  function onSubmit(event: React.FormEvent): void {
    event.preventDefault();
    validateEmailConfirmation(currentUserFormData);
    const inputs = document.querySelectorAll(
      'input[type=text],input[type=email]'
    );
    let valid = true;
    inputs.forEach((input) => {
      if (input instanceof HTMLInputElement && !input.checkValidity()) {
        valid = false;
      }
    });
    if (valid) {
      // Update the initial state reference to the current data being saved
      // This ensures that "Reset form" will reset to the last saved state, not the original page load state
      initialUserStateRef.current = currentUserFormData;
      props.onSubmit(currentUserFormData);
    }
  }

  function onDiscardChanges(): void {
    if (props.userEvents.resetProfileForm) {
      props.userEvents.resetProfileForm(initialUserStateRef.current);
    } else {
      props.userEvents.updateProfileForm(initialUserStateRef.current);
    }
  }

  return (
    <div className="wdk-UserProfile">
      {props.shouldHideForm ? (
        <div>{props.hiddenFormMessage}</div>
      ) : (
        <>
          <h1>{props.titleText}</h1>
          {props.introComponent ? <props.introComponent /> : <IntroComponent />}
          <UserAccountForm
            user={currentUserFormData}
            showChangePasswordBox={props.showChangePasswordBox}
            onEmailChange={onEmailChange}
            onConfirmEmailChange={onConfirmEmailChange}
            onPropertyChange={onPropertyChange}
            onPreferenceChange={onPreferenceChange}
            onUserDataSubmit={onSubmit}
            submitButtonText={props.submitButtonText}
            wdkConfig={props.globalData.config}
            onDiscardChanges={onDiscardChanges}
            formStatus={props.formStatus}
            singleFormMode={props.singleFormMode}
          />
        </>
      )}
    </div>
  );
}

export default wrappable(UserFormContainer);
