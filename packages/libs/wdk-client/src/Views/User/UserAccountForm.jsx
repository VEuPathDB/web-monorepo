import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import ApplicationSpecificProperties from '../../Views/User/ApplicationSpecificProperties';
import UserPassword from '../../Views/User/Password/UserPassword';
import UserIdentity from '../../Views/User/UserIdentity';
import UserSubscriptionManagement from '../../Views/User/UserSubscriptionManagement';
import ProfileNavigationSection from '../../Views/User/ProfileNavigationSection';
import { useWdkService } from '../../Hooks/WdkServiceHook';

/**
 * This React component provides the form wrapper and enclosed fieldsets for the user profile/account form.
 * @param props
 * @returns {XML}
 * @constructor
 */
const UserAccountForm = (props) => {
  let {
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
    previousUserFormData,
  } = props;

  const [activeSection, setActiveSection] = useState('account');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const vocabulary = useWdkService(
    (wdkService) =>
      wdkService.getUserProfileVocabulary().catch((error) => {
        console.error(error);
        return {};
      }),
    []
  );

  // Track changes between current user data and previous data
  useEffect(() => {
    if (previousUserFormData) {
      const hasChanges =
        JSON.stringify(user) !== JSON.stringify(previousUserFormData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [user, previousUserFormData]);

  const handleSectionChange = (sectionKey, discardChanges = false) => {
    if (discardChanges && props.onDiscardChanges) {
      props.onDiscardChanges();
    }
    setActiveSection(sectionKey);
  };

  const renderSectionContent = () => {
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
              <input type="submit" value="Save" disabled={disableSubmit} />
              <button
                type="button"
                style={{ marginLeft: '0.5em' }}
                onClick={() =>
                  props.onDiscardChanges && props.onDiscardChanges()
                }
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
              <input type="submit" value="Save" disabled={disableSubmit} />
              <button
                type="button"
                style={{ marginLeft: '0.5em' }}
                onClick={() =>
                  props.onDiscardChanges && props.onDiscardChanges()
                }
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
              <input type="submit" value="Save" disabled={disableSubmit} />
              <button
                type="button"
                style={{ marginLeft: '0.5em' }}
                onClick={() =>
                  props.onDiscardChanges && props.onDiscardChanges()
                }
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
};

UserAccountForm.propTypes = {
  /** The user object to be modified */
  user: PropTypes.object.isRequired,

  /** Whether to show change password box */
  showChangePasswordBox: PropTypes.bool.isRequired,

  /** Indicates whether submit button should be enabled/disabled */
  disableSubmit: PropTypes.bool.isRequired,

  /** The on change handler for the email text box */
  onEmailChange: PropTypes.func.isRequired,

  /** The on change handler for the confirm email text box */
  onConfirmEmailChange: PropTypes.func.isRequired,

  /** Creates on change handlers for property inputs */
  onPropertyChange: PropTypes.func.isRequired,

  /** The on change handler for preference changes */
  onPreferenceChange: PropTypes.func.isRequired,

  /** The on submit handler for the form */
  onSubmit: PropTypes.func.isRequired,

  /** Text that should appear on the submit button */
  submitButtonText: PropTypes.string.isRequired,

  /** WDK config for setting correct change password link */
  wdkConfig: PropTypes.object.isRequired,

  /** Previous user form data for change detection */
  previousUserFormData: PropTypes.object,

  /** Handler for discarding changes */
  onDiscardChanges: PropTypes.func,
};

export default wrappable(UserAccountForm);
