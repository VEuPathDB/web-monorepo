import React, { useRef } from 'react';
import { GlobalData } from '../../StoreModules/GlobalData';
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
  globalData: GlobalData;
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
  singleFormMode?: boolean;
  highlightMissingFields?: boolean;
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

  function onPropertyChange(field: string, submitAfterUpdate?: boolean) {
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
      if (submitAfterUpdate) {
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
      'input[type=text],input[type=email],select'
    );
    let valid = true;
    inputs.forEach((input) => {
      if (
        (input instanceof HTMLInputElement ||
          input instanceof HTMLSelectElement) &&
        !input.reportValidity()
      ) {
        valid = false;
      }
    });
    if (valid) {
      // Update the initial state reference to the current data being saved
      // This ensures that "Reset form" will reset to the last saved state, not the original page load state
      initialUserStateRef.current = currentUserFormData;
      props.userEvents.submitProfileForm(currentUserFormData);
    }
  }

  function onDiscardChanges(): void {
    if (props.userEvents.resetProfileForm) {
      props.userEvents.resetProfileForm(initialUserStateRef.current);
    } else {
      props.userEvents.updateProfileForm(initialUserStateRef.current);
    }
  }

  // for this purpose, easier to not confirm against groups; any value will do
  // (though technically it could clash with the subscriptionGroups-based checks elsewhere)
  const subscribed =
    props.globalData?.user?.properties?.subscriptionToken !== '';

  return (
    <div className="wdk-UserProfile">
      {props.shouldHideForm ? (
        <div>{props.hiddenFormMessage}</div>
      ) : (
        <>
          <div className="wdk-UserProfile-title">
            <h1>{props.titleText}</h1>
            <h3>{!subscribed && 'Not'} Subscribed</h3>
          </div>
          {props.introComponent && <props.introComponent />}
          {props.globalData.user && (
            <UserAccountForm
              user={props.globalData.user}
              userProfileFormData={currentUserFormData}
              onEmailChange={onEmailChange}
              onConfirmEmailChange={onConfirmEmailChange}
              onPropertyChange={onPropertyChange}
              onPreferenceChange={onPreferenceChange}
              onUserDataSubmit={onSubmit}
              wdkConfig={props.globalData.config}
              onDiscardChanges={onDiscardChanges}
              formStatus={props.formStatus}
              singleFormMode={props.singleFormMode}
              highlightMissingFields={props.highlightMissingFields}
            />
          )}
        </>
      )}
    </div>
  );
}

export default wrappable(UserFormContainer);
