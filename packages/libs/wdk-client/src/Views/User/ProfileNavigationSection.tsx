import React, { useMemo, useState, useEffect } from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import Dialog from '../../Components/Overlays/Dialog';
import { useHistory, useLocation } from 'react-router';

const SECTION_KEYS = [
  'account',
  'subscription',
  'preferences',
  'security',
] as const;
export type SectionKey = typeof SECTION_KEYS[number];

interface Section {
  key: SectionKey;
  label: string;
  icon?: React.ReactNode;
}

interface ProfileNavigationSectionProps {
  activeSection: SectionKey;
  pendingSection: SectionKey | null;
  setPendingSection: React.Dispatch<React.SetStateAction<SectionKey | null>>;
  onSectionChange: (sectionKey: SectionKey, discardChanges?: boolean) => void;
  hasUnsavedChanges: boolean;
  sections?: Section[];
}

const ProfileNavigationSection: React.FC<ProfileNavigationSectionProps> = ({
  activeSection,
  pendingSection,
  setPendingSection,
  onSectionChange,
  hasUnsavedChanges,
  sections = [
    { key: 'account', label: 'Account', icon: <i className="fa fa-user"></i> },
    {
      key: 'subscription',
      label: 'Subscription',
      icon: <i className="fa fa-bell"></i>,
    },
    {
      key: 'preferences',
      label: 'Preferences',
      icon: <i className="fa fa-cog"></i>,
    },
    {
      key: 'security',
      label: 'Security',
      icon: <i className="fa fa-lock"></i>,
    },
  ],
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSectionClick = (sectionKey: SectionKey) => {
    if (hasUnsavedChanges && sectionKey !== activeSection) {
      setPendingSection(sectionKey);
      setShowConfirmDialog(true);
    } else {
      onSectionChange(sectionKey, false);
    }
  };

  const handleConfirmDiscard = () => {
    if (pendingSection) {
      onSectionChange(pendingSection, true); // true = discard changes
    }
    setShowConfirmDialog(false);
    setPendingSection(null);
  };

  const handleCancelDiscard = () => {
    setShowConfirmDialog(false);
    setPendingSection(null);
  };

  return (
    <>
      <div className="wdk-ProfileNavigationSection">
        <div className="wdk-ProfileNavigationItems">
          {sections.map((section) => (
            <div
              key={section.key}
              className={`wdk-ProfileNavigationItem ${
                activeSection === section.key
                  ? 'wdk-ProfileNavigationItem__active'
                  : ''
              }`}
              onClick={() => handleSectionClick(section.key)}
              style={{ cursor: 'pointer' }}
            >
              {section.icon}
              {section.label}
              {hasUnsavedChanges && activeSection === section.key && (
                <span style={{ marginLeft: '1em', color: '#ff6b35' }}>
                  <i>unsaved changes</i>
                </span>
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

// section key helpers

function isSectionKey(s: string): s is SectionKey {
  return SECTION_KEYS.includes(s as SectionKey);
}

export const useCurrentProfileNavigationSection = (): [
  SectionKey,
  (section: SectionKey) => void
] => {
  const location = useLocation();
  const history = useHistory();

  // Get initial section from URL hash
  const initialSection = useMemo(() => {
    const cleanedHash = location.hash.replace(/^#/, '');
    return isSectionKey(cleanedHash) && SECTION_KEYS.includes(cleanedHash)
      ? cleanedHash
      : SECTION_KEYS[0];
  }, [location.hash]);

  const [currentSection, setCurrentSection] =
    useState<SectionKey>(initialSection);

  // Listen for location changes (browser back/forward)
  useEffect(() => {
    const cleanedHash = location.hash.replace(/^#/, '');
    const validSection =
      isSectionKey(cleanedHash) && SECTION_KEYS.includes(cleanedHash)
        ? cleanedHash
        : SECTION_KEYS[0];
    setCurrentSection(validSection);
  }, [location.hash]);

  // Function to navigate to a section
  const navigateToSection = (sectionKey: SectionKey) => {
    history.push(`${location.pathname}${location.search}#${sectionKey}`);
  };

  return [currentSection, navigateToSection];
};
