import React, { useState } from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import Dialog from '../../Components/Overlays/Dialog';

// Define supported section keys
export type SectionKey =
  | 'account'
  | 'subscription'
  | 'preferences'
  | 'security';

interface Section {
  key: SectionKey;
  label: string;
}

interface ProfileNavigationSectionProps {
  activeSection: string;
  onSectionChange: (sectionKey: SectionKey, discardChanges?: boolean) => void;
  hasUnsavedChanges: boolean;
  sections?: Section[];
}

const ProfileNavigationSection: React.FC<ProfileNavigationSectionProps> = ({
  activeSection,
  onSectionChange,
  hasUnsavedChanges,
  sections = [
    { key: 'account', label: 'Account' },
    { key: 'subscription', label: 'Subscription' },
    { key: 'preferences', label: 'Preferences' },
    { key: 'security', label: 'Security' },
  ],
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSectionKey, setPendingSectionKey] =
    useState<SectionKey | null>(null);

  const handleSectionClick = (sectionKey: SectionKey) => {
    if (hasUnsavedChanges && sectionKey !== activeSection) {
      setPendingSectionKey(sectionKey);
      setShowConfirmDialog(true);
    } else {
      onSectionChange(sectionKey, false);
    }
  };

  const handleConfirmDiscard = () => {
    if (pendingSectionKey) {
      onSectionChange(pendingSectionKey, true); // true = discard changes
    }
    setShowConfirmDialog(false);
    setPendingSectionKey(null);
  };

  const handleCancelDiscard = () => {
    setShowConfirmDialog(false);
    setPendingSectionKey(null);
  };

  return (
    <>
      <div className="wdk-RecordNavigationSection">
        <div className="wdk-RecordNavigationSectionHeader">
          <h1>Profile</h1>
        </div>
        <div className="profile-navigation-items">
          {sections.map((section) => (
            <div
              key={section.key}
              className={`wdk-RecordNavigationItem ${
                activeSection === section.key
                  ? 'wdk-RecordNavigationItem__active'
                  : ''
              }`}
              onClick={() => handleSectionClick(section.key)}
              style={{ cursor: 'pointer' }}
            >
              {section.label}
              {hasUnsavedChanges && activeSection === section.key && (
                <span style={{ marginLeft: '0.5em', color: '#ff6b35' }}>⬤</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={showConfirmDialog}
        modal={true}
        title="Unsaved Changes"
        onClose={handleCancelDiscard}
      >
        <div style={{ padding: '1em' }}>
          <p>
            You have unsaved changes. Do you want to leave this section without
            saving? Your changes will be lost.
          </p>
          <div style={{ marginTop: '1.5em', textAlign: 'right' }}>
            <button
              type="button"
              onClick={handleCancelDiscard}
              style={{ marginRight: '0.5em' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDiscard}
              style={{
                backgroundColor: '#d9534f',
                color: 'white',
                border: '1px solid #d43f3a',
              }}
            >
              Discard Changes
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default wrappable(ProfileNavigationSection);
