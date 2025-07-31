import React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';

interface Section {
  key: string;
  label: string;
}

interface ProfileNavigationSectionProps {
  activeSection: string;
  onSectionChange: (sectionKey: string, discardChanges?: boolean) => void;
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
  const handleSectionClick = (sectionKey: string) => {
    if (hasUnsavedChanges && sectionKey !== activeSection) {
      if (
        window.confirm(
          'You have unsaved changes. Do you want to leave this section without saving? Your changes will be lost.'
        )
      ) {
        onSectionChange(sectionKey, true); // true = discard changes
      }
    } else {
      onSectionChange(sectionKey, false);
    }
  };

  return (
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
              <span style={{ marginLeft: '0.5em', color: '#ff6b35' }}>•</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default wrappable(ProfileNavigationSection);
