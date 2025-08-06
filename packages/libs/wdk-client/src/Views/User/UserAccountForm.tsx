import React, { useState, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Prompt } from 'react-router-dom';
import { wrappable } from '../../Utils/ComponentUtils';
import ApplicationSpecificProperties from '../../Views/User/ApplicationSpecificProperties';
import UserPassword from '../../Views/User/Password/UserPassword';
import UserIdentity from '../../Views/User/UserIdentity';
import UserSubscriptionManagement from '../../Views/User/UserSubscriptionManagement';
import ProfileNavigationSection, {
  SectionKey,
  useCurrentProfileNavigationSection,
} from '../../Views/User/ProfileNavigationSection';
import { useWdkService } from '../../Hooks/WdkServiceHook';
import { UserProfileFormData } from '../../StoreModules/UserProfileStoreModule';
import { UserPreferences } from '../../Utils/WdkUser';

// Props interface
export interface UserAccountFormProps {
  wdkConfig: any;
  user: UserProfileFormData;
  onPropertyChange: (field: string) => (value: any) => void;
  onPreferenceChange: (prefs: UserPreferences) => void;
  onEmailChange: (value: string) => void;
  onConfirmEmailChange: (value: string) => void;
  showChangePasswordBox: boolean;
  disableSubmit: boolean;
  onUserDataSubmit: (event: React.FormEvent) => void;
  submitButtonText: string;
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
  onDiscardChanges?: () => void;
  singleFormMode?: boolean;
}

/**
 * React component providing the form wrapper and sections for user profile.
 */
function UserAccountForm(props: UserAccountFormProps) {
  const {
    wdkConfig,
    user,
    onPropertyChange,
    onPreferenceChange,
    onEmailChange,
    onConfirmEmailChange,
    showChangePasswordBox,
    disableSubmit,
    onUserDataSubmit,
    submitButtonText,
    formStatus,
    onDiscardChanges,
    singleFormMode = false,
  } = props;

  const [activeSection, navigateToSection] =
    useCurrentProfileNavigationSection();
  const [pendingSection, setPendingSection] = useState<SectionKey | null>(null);
  const hasUnsavedChanges = formStatus === 'modified';

  // Browser navigation protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const vocabulary = useWdkService(
    (wdkService) =>
      wdkService.getUserProfileVocabulary().catch((error) => {
        console.error(error);
        return {} as Record<string, any>;
      }),
    []
  );

  // Section switch handler
  const handleSectionChange = (
    sectionKey: SectionKey,
    discardChanges = false
  ) => {
    if (discardChanges && onDiscardChanges) {
      onDiscardChanges();
    }
    navigateToSection(sectionKey);
  };

  // Renders the content for the active section
  const renderSectionContent = (): ReactNode => {
    switch (activeSection) {
      case 'account':
        return (
          <form
            className="wdk-UserProfile-profileForm wdk-UserProfile-accountForm"
            name="userAccountForm"
            onSubmit={onUserDataSubmit}
          >
            <UserIdentity
              user={user}
              onEmailChange={onEmailChange}
              onConfirmEmailChange={onConfirmEmailChange}
              onPropertyChange={onPropertyChange}
              propDefs={wdkConfig.userProfileProperties}
              vocabulary={vocabulary}
            />
            <p>
              <i className="fa fa-asterisk"></i> = required
            </p>
            <div style={{ marginTop: '1em' }}>
              <input
                type="submit"
                value={submitButtonText}
                disabled={disableSubmit}
              />
              <button
                type="button"
                style={{ marginLeft: '0.5em' }}
                onClick={() => onDiscardChanges && onDiscardChanges()}
              >
                Reset form
              </button>
            </div>
          </form>
        );
      case 'subscription':
        return <UserSubscriptionManagement user={user} />;
      case 'preferences':
        return (
          <form
            className="wdk-UserProfile-profileForm wdk-UserProfile-preferencesForm"
            name="userPreferencesForm"
            onSubmit={onUserDataSubmit}
          >
            <ApplicationSpecificProperties
              user={user}
              onPropertyChange={onPropertyChange}
              propDefs={wdkConfig.userProfileProperties}
              onPreferenceChange={onPreferenceChange}
            />
            <div style={{ marginTop: '1em' }}>
              <input
                type="submit"
                value={submitButtonText}
                disabled={disableSubmit}
              />
              <button
                type="button"
                style={{ marginLeft: '0.5em' }}
                onClick={() => onDiscardChanges && onDiscardChanges()}
              >
                Reset form
              </button>
            </div>
          </form>
        );
      case 'security':
        return (
          <div>
            {showChangePasswordBox && (
              <UserPassword user={user} wdkConfig={wdkConfig} />
            )}
            <p style={{ marginTop: '1em', fontStyle: 'italic' }}>
              Password changes are handled independently above.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Renders combined account + preferences form for registration
  const renderSingleForm = (): ReactNode => {
    return (
      <form
        className="wdk-UserProfile-profileForm wdk-UserProfile-registrationForm"
        name="userRegistrationForm"
        onSubmit={onUserDataSubmit}
      >
        <UserIdentity
          user={user}
          onEmailChange={onEmailChange}
          onConfirmEmailChange={onConfirmEmailChange}
          onPropertyChange={onPropertyChange}
          propDefs={wdkConfig.userProfileProperties}
          vocabulary={vocabulary}
        />
        <ApplicationSpecificProperties
          user={user}
          onPropertyChange={onPropertyChange}
          propDefs={wdkConfig.userProfileProperties}
          onPreferenceChange={onPreferenceChange}
        />
        <p>
          <i className="fa fa-asterisk"></i> = required
        </p>
        <div style={{ marginTop: '1em' }}>
          <input
            type="submit"
            value={submitButtonText}
            disabled={disableSubmit}
          />
          {onDiscardChanges && (
            <button
              type="button"
              style={{ marginLeft: '0.5em' }}
              onClick={onDiscardChanges}
            >
              Reset form
            </button>
          )}
        </div>
      </form>
    );
  };

  // Wait for vocabulary to load
  if (vocabulary == null) return null;

  // Render single form mode for registration
  if (singleFormMode) {
    return (
      <>
        <Prompt
          when={hasUnsavedChanges}
          message="Do you want to leave this page? Your unapplied changes will be discarded."
        />
        {renderSingleForm()}
      </>
    );
  }

  // Render tabbed interface for profile editing
  return (
    <>
      <Prompt
        when={hasUnsavedChanges && !pendingSection}
        message="Do you want to leave this page? Your unapplied changes will be discarded."
      />
      <div className="wdk-RecordContainer wdk-RecordContainer__withSidebar">
        <div className="wdk-RecordSidebarContainer">
          <div className="wdk-RecordSidebar">
            <ProfileNavigationSection
              activeSection={activeSection}
              pendingSection={pendingSection}
              setPendingSection={setPendingSection}
              onSectionChange={handleSectionChange}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </div>
          <div className="wdk-RecordMain">{renderSectionContent()}</div>
        </div>
      </div>
    </>
  );
}

export default wrappable(UserAccountForm);
