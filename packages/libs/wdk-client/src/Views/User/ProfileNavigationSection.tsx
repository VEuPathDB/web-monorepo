import React, { useMemo, useState, useEffect, FormEvent } from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import Dialog from '../../Components/Overlays/Dialog';
import { useHistory, useLocation } from 'react-router';
import { FilledButton, OutlinedButton } from '@veupathdb/coreui';

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
  onSaveChanges?: (event: React.FormEvent) => void;
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
  onSaveChanges = () => {},
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

  const handleConfirmSave = (e: FormEvent) => {
    onSaveChanges(e);
    if (pendingSection) {
      onSectionChange(pendingSection, false); // false = do not discard changes
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
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={showConfirmDialog}
        modal={true}
        title="Unsaved Changes"
        onClose={handleCancelDiscard}
        className="wdk-Profile"
      >
        <div style={{ padding: '1em', width: 380, display: 'grid' }}>
          <p
            style={{
              fontSize: '1.2em',
              fontWeight: 500,
              marginBottom: 0,
              justifySelf: 'center',
            }}
          >
            Do you want to save or discard your changes?
          </p>
          <p style={{ fontSize: '1.2em', justifySelf: 'center' }}>
            Unsaved changes will be lost.
          </p>
          <div
            style={{
              marginTop: '3em',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <OutlinedButton text="Cancel" onPress={handleCancelDiscard} />
            <div style={{ display: 'inline-flex', gap: '0.5em' }}>
              <OutlinedButton text="Discard" onPress={handleConfirmDiscard} />
              <FilledButton text="Save" onPress={handleConfirmSave} />
            </div>
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
