import React, { useRef } from 'react';
import { UserProfileFormData } from '../../StoreModules/UserProfileStoreModule';
import { getChangeHandler, wrappable } from '../../Utils/ComponentUtils';
import { UserPreferences } from '../../Utils/WdkUser';
import UserAccountForm from '../../Views/User/UserAccountForm';
import './Profile/UserProfile.scss';

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

export interface UserFormContainerProps {
  globalData: { config?: any };
  userFormData?: UserProfileFormData;
  previousUserFormData?: UserProfileFormData;
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
  errorMessage?: string;
  userEvents: {
    submitProfileForm: (userData: UserProfileFormData) => void;
    updateProfileForm: (newState: UserProfileFormData) => void;
    resetProfileForm?: (formData: UserProfileFormData) => void;
  };
  shouldHideForm: boolean;
  hiddenFormMessage: string;
  titleText: string;
  introComponent?: React.ComponentType;
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

  function onPropertyChange(field: string, submitNow: boolean = false) {
    return (newValue: any): void => {
      const previousState = currentUserFormData;
      const newUserFormData = {
        ...previousState,
        properties: {
          ...previousState.properties,
          [field]: newValue,
        },
      };
      props.userEvents.updateProfileForm(newUserFormData);
      if (submitNow) {
        props.userEvents.submitProfileForm(newUserFormData);
      }
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
      if (input instanceof HTMLInputElement && !input.reportValidity()) {
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
          <div className="wdk-UserProfile-title">
            <h1>{props.titleText}</h1>
            {
              // If this is a profile (so the user is not a guest), we want to show the user if they
              // have subscribed.
              // Fix before merge. We just need some new types around
              //@ts-ignore
              !props.globalData.user.isGuest && (
                // user.isSubscribed ? (
                // Add icon here
                <h3>Unsubscribed</h3>
                //) : (
                // Add icon here
                // <h4>Subscribed</h4>
                // )
              )
            }
          </div>
          {props.introComponent && <props.introComponent />}
          <UserAccountForm
            user={currentUserFormData}
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
