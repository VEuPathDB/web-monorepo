import React, { useState, ReactNode, useEffect, useCallback } from 'react';
import { Prompt } from 'react-router-dom';
import { wrappable } from '../../Utils/ComponentUtils';
import ApplicationSpecificProperties from '../../Views/User/ApplicationSpecificProperties';
import UserIdentity from '../../Views/User/UserIdentity';
import UserSubscriptionManagement from '../../Views/User/UserSubscriptionManagement';
import ProfileNavigationSection, {
  SectionKey,
  useCurrentProfileNavigationSection,
} from '../../Views/User/ProfileNavigationSection';
import { useWdkService } from '../../Hooks/WdkServiceHook';
import { useSubscriptionGroups } from '../../Hooks/SubscriptionGroups';
import { User, UserPreferences } from '../../Utils/WdkUser';
import {
  SaveButton,
  OutlinedButton,
  FilledButton,
} from '@veupathdb/coreui/lib/components/buttons';
import './Profile/UserProfile.scss';
import { FormStatus } from '../../../../coreui/lib/components/buttons/SaveButton';
import Loading from '../../Components/Loading';
import './UserAccountForm.scss';
import { UserProfileFormData } from '../../StoreModules/UserProfileStoreModule';
import { UserSecurityForm } from './UserSecurityForm';
import { Dialog } from '../../Components';

// Props interface
export interface UserAccountFormProps {
  wdkConfig: any;
  user: User;
  userProfileFormData: UserProfileFormData;
  onPropertyChange: (
    field: string,
    submitAfterChange?: boolean
  ) => (value: any) => void;
  onPreferenceChange: (prefs: UserPreferences) => void;
  onEmailChange: (value: string) => void;
  onConfirmEmailChange: (value: string) => void;
  onUserDataSubmit: (event: React.FormEvent) => void;
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
  onDiscardChanges: () => void;
  onDeleteAccount: () => void;
  singleFormMode?: boolean;
  highlightMissingFields?: boolean;
  showSubscriptionProds?: boolean;
  deleteAccountStatus?: {
    status: 'idle' | 'deleting' | 'loggingOut' | 'done' | 'error';
    message?: string;
  };
}

/**
 * React component providing the form wrapper and sections for user profile.
 */
function UserAccountForm(props: UserAccountFormProps) {
  const {
    wdkConfig,
    user,
    userProfileFormData,
    onPropertyChange,
    onPreferenceChange,
    onEmailChange,
    onConfirmEmailChange,
    onUserDataSubmit,
    formStatus,
    onDiscardChanges,
    onDeleteAccount,
    singleFormMode = false,
    showSubscriptionProds,
    deleteAccountStatus,
  } = props;

  const [activeSection, navigateToSection] =
    useCurrentProfileNavigationSection();
  const [pendingSection, setPendingSection] = useState<SectionKey | null>(null);
  const [displayedFormStatus, setDisplayedFormStatus] =
    useState<FormStatus>(formStatus);
  const hasUnsavedChanges = formStatus === 'modified';
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Track formStatus changes to prevent stale "Saved" state when switching tabs
  // This ensures the Save button shows current status rather than previous section's status.
  // See other invocations of `setDisplayedFormStatus` for overriding back to 'new'
  useEffect(() => {
    setDisplayedFormStatus(formStatus);
  }, [formStatus]);

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

  const handleSuccess = useCallback(() => setDisplayedFormStatus('new'), []);

  // Map deleteAccountStatus to SaveButton's FormStatus
  const getDeleteButtonStatus = (): FormStatus => {
    if (!deleteAccountStatus) return 'modified';
    switch (deleteAccountStatus.status) {
      case 'idle':
        return 'modified';
      case 'deleting':
      case 'loggingOut':
        return 'pending';
      case 'done':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'modified';
    }
  };

  const vocabulary = useWdkService(
    (wdkService) =>
      wdkService.getUserProfileVocabulary().catch((error) => {
        console.error(error);
        return {} as Record<string, any>;
      }),
    []
  );

  const subscriptionGroups = useSubscriptionGroups();

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
  const saveButton = (
    <div
      style={{
        marginTop: '1em',
        display: 'flex',
        gap: '0.5em',
        alignItems: 'center',
      }}
    >
      <SaveButton
        formStatus={displayedFormStatus}
        onPress={(e) => {
          e.preventDefault();
          onUserDataSubmit(e);
        }}
        themeRole="primary"
        onSuccess={handleSuccess}
        savedStateDuration={2000}
      />
      {hasUnsavedChanges && (
        <OutlinedButton
          text="Discard changes"
          onPress={() => onDiscardChanges && onDiscardChanges()}
          themeRole="primary"
        />
      )}
    </div>
  );

  const renderSectionContent = (): ReactNode => {
    switch (activeSection) {
      case 'profile':
        return (
          <div>
            <form
              className="wdk-UserProfile-profileForm wdk-UserProfile-accountForm"
              name="userAccountForm"
              onSubmit={onUserDataSubmit}
            >
              <UserIdentity
                user={userProfileFormData}
                onEmailChange={onEmailChange}
                onConfirmEmailChange={onConfirmEmailChange}
                onPropertyChange={onPropertyChange}
                propDefs={wdkConfig.userProfileProperties}
                vocabulary={vocabulary}
                highlightMissingFields={props.highlightMissingFields}
              />
              {saveButton}
            </form>
            <p style={{ padding: '10px' }}></p>
            <div className="wdk-UserProfile-profileForm wdk-UserProfile-accountForm">
              <h2>Delete my account</h2>
              <p>
                All your personal information will be removed from our systems
                and any contributions you have made will be anonymized.
              </p>
              <OutlinedButton
                text="Delete My Account"
                onPress={() => setShowDeleteConfirmModal(true)}
                themeRole="error"
              />
            </div>
          </div>
        );
      case 'subscription':
        if (!subscriptionGroups) {
          return (
            <div className="subscriptions-loading">
              Loading subscription information... <Loading />
            </div>
          );
        }
        return (
          <UserSubscriptionManagement
            user={user}
            subscriptionGroups={subscriptionGroups}
            onPropertyChange={onPropertyChange}
            onSuccess={handleSuccess}
            saveButton={saveButton}
            formStatus={displayedFormStatus}
            showSubscriptionProds={showSubscriptionProds}
          />
        );
      case 'preferences':
        return (
          <form
            className="wdk-UserProfile-profileForm wdk-UserProfile-preferencesForm"
            name="userPreferencesForm"
            onSubmit={onUserDataSubmit}
          >
            <ApplicationSpecificProperties
              user={userProfileFormData}
              onPropertyChange={onPropertyChange}
              propDefs={wdkConfig.userProfileProperties}
              onPreferenceChange={onPreferenceChange}
            />
            {saveButton}
          </form>
        );
      case 'security':
        return (
          <div className="wdk-UserProfile-profileForm">
            <UserSecurityForm {...props} />
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
          user={userProfileFormData}
          onEmailChange={onEmailChange}
          onConfirmEmailChange={onConfirmEmailChange}
          onPropertyChange={onPropertyChange}
          propDefs={wdkConfig.userProfileProperties}
          vocabulary={vocabulary}
          highlightMissingFields={props.highlightMissingFields}
        />
        <br />
        <ApplicationSpecificProperties
          user={userProfileFormData}
          onPropertyChange={onPropertyChange}
          propDefs={wdkConfig.userProfileProperties}
          onPreferenceChange={onPreferenceChange}
        />
        <br />
        {saveButton}
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
      <div className="wdk-UserAccountForm">
        <ProfileNavigationSection
          activeSection={activeSection}
          pendingSection={pendingSection}
          setPendingSection={setPendingSection}
          onSectionChange={handleSectionChange}
          hasUnsavedChanges={hasUnsavedChanges}
          onSaveChanges={onUserDataSubmit}
        />
        <div className="UserAccountSectionContent">
          {renderSectionContent()}
        </div>
      </div>
      {/* Confirmation modal for account deletion */}
      <Dialog
        open={showDeleteConfirmModal}
        modal={true}
        title="Confirmation"
        description={<div>Confirm you want to delete your account.</div>}
        onClose={() => setShowDeleteConfirmModal(false)}
      >
        <div style={{ padding: '1em', width: 550, display: 'grid' }}>
          <p
            style={{
              fontSize: '1.2em',
              fontWeight: 500,
              marginBottom: '1em',
              justifySelf: 'center',
            }}
          >
            Are you sure you want to delete your account?
          </p>
          <p
            style={{
              fontSize: '1.2em',
              justifySelf: 'center',
              textAlign: 'center',
              width: 400,
            }}
          >
            All your personal information will be removed from our systems and
            any contributions you have made will be anonymized.
          </p>
          <p
            style={{
              fontSize: '1.2em',
              fontWeight: 600,
              justifySelf: 'center',
              textAlign: 'center',
              width: 400,
              marginTop: '1em',
            }}
          >
            This action cannot be undone.
          </p>
          <div
            style={{
              marginTop: '3em',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <SaveButton
              customText={{
                save: 'Yes, delete my account',
                saving: 'Deleting account...',
                saved: 'Deleted',
              }}
              formStatus={getDeleteButtonStatus()}
              onPress={(e) => {
                e.preventDefault();
                onDeleteAccount();
              }}
              themeRole="error"
              styleOverrides={{
                container: {
                  width: 'auto',
                  minWidth: 'max-content',
                },
              }}
              savedStateDuration={2000}
              onSuccess={() => {
                console.log(
                  '[UserAccountForm] SaveButton onSuccess - redirecting to goodbye page'
                );
                window.location.assign('/a/app/user/message/account-deleted');
              }}
            />
            <FilledButton
              text="No, keep my account"
              onPress={() => setShowDeleteConfirmModal(false)}
              themeRole="success"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default wrappable(UserAccountForm);
