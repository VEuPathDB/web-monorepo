import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import ApplicationSpecificProperties from '../../Views/User/ApplicationSpecificProperties';
import UserPassword from '../../Views/User/Password/UserPassword';
import UserIdentity from '../../Views/User/UserIdentity';
import UserSubscriptionManagement from '../../Views/User/UserSubscriptionManagement';
import ProfileNavigationSection from '../../Views/User/ProfileNavigationSection';
import { useWdkService } from '../../Hooks/WdkServiceHook';
import { User } from '../../Utils/WdkUser';

// Define supported section keys
type SectionKey = 'account' | 'subscription' | 'preferences' | 'security';

// Props interface
export interface UserAccountFormProps {
  wdkConfig: any;
  user: User;
  onPropertyChange: (field: string) => (value: any) => void;
  onPreferenceChange: (prefs: Record<string, any>) => void;
  onEmailChange: (value: string) => void;
  onConfirmEmailChange: (value: string) => void;
  showChangePasswordBox: boolean;
  disableSubmit: boolean;
  onSubmit: (event: React.FormEvent) => void;
  submitButtonText: string;
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
  onDiscardChanges?: () => void;
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
    onSubmit,
    submitButtonText,
    formStatus,
    onDiscardChanges,
  } = props;

  const [activeSection, setActiveSection] = useState<SectionKey>('account');
  const hasUnsavedChanges = formStatus === 'modified';

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
    setActiveSection(sectionKey);
  };

  // Renders the content for the active section
  const renderSectionContent = (): ReactNode => {
    switch (activeSection) {
      case 'account':
        return (
          <div>
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
                Cancel
              </button>
            </div>
          </div>
        );
      case 'subscription':
        return (
          <UserSubscriptionManagement
            user={user}
            onSubmit={onSubmit}
            disableSubmit={disableSubmit}
          />
        );
      case 'preferences':
        return (
          <div>
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
                Cancel
              </button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div>
            {showChangePasswordBox && (
              <UserPassword user={user} wdkConfig={wdkConfig} />
            )}
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
                Cancel
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Wait for vocabulary to load
  if (vocabulary == null) return null;

  return (
    <div className="wdk-RecordContainer wdk-RecordContainer__withSidebar">
      <div className="wdk-RecordSidebarContainer">
        <div className="wdk-RecordSidebar">
          <ProfileNavigationSection
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>
        <div className="wdk-RecordMain">
          <form
            className="wdk-UserProfile-profileForm"
            name="userProfileForm"
            onSubmit={onSubmit}
          >
            {renderSectionContent()}
          </form>
        </div>
      </div>
    </div>
  );
}

export default wrappable(UserAccountForm);
