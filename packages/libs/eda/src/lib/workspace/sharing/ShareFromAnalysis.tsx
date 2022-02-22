import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { Modal } from '@veupathdb/coreui';

// Definitions
import { AnalysisState } from '../../core';

// Components
import NameAnalysis from './NameAnalysis';
import Login from './Login';
import ConfirmShareAnalysis from './ConfirmShareAnalysis';

// Utilities
import { getAnalysisId } from '../../core/utils/analysis';

// Hooks
import { useLoginCallbacks } from './hooks';

type ShareFromAnalyisProps = {
  visible: boolean;
  toggleVisible: (visible: boolean) => void;
  analysisState: AnalysisState;
  /**
   * The base of the URL from which to being sharing links.
   * This is passed down through several component layers. */
  sharingUrlPrefix: string;
  /** A callback to open a login form. */
  showLoginForm: () => void;
};

export default function ShareFromAnalysis({
  visible,
  toggleVisible,
  showLoginForm,
  analysisState,
  sharingUrlPrefix,
}: ShareFromAnalyisProps) {
  const userLoggedIn = useWdkService((wdkService) =>
    wdkService.getCurrentUser().then((user) => !user.isGuest)
  );

  const loginCallbacks = useLoginCallbacks({ showLoginForm, toggleVisible });

  const sharingUrl = new URL(
    `/analysis/${getAnalysisId(analysisState.analysis)}`,
    sharingUrlPrefix
  ).href;

  return (
    <Modal
      title="Share Analysis"
      visible={visible}
      toggleVisible={toggleVisible}
      includeCloseButton={true}
      themeRole="primary"
      styleOverrides={{
        size: { width: 700, height: 450 },
        content: {
          padding: {
            top: 0,
            right: 50,
            bottom: 0,
            left: 25,
          },
        },
      }}
    >
      {!userLoggedIn ? (
        <Login {...loginCallbacks} />
      ) : analysisState.analysis?.displayName === 'Unnamed Analysis' ? (
        <NameAnalysis
          currentName={analysisState.analysis.displayName}
          updateName={analysisState.setName}
        />
      ) : (
        <ConfirmShareAnalysis sharingURL={sharingUrl} />
      )}
    </Modal>
  );
}
