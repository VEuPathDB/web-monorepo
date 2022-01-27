import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

// Components
import ConfirmPublicAnalysis from './ConfirmPublicAnalysis';
import Login from './Login';
import NameAnalysis from './NameAnalysis';
import { Modal } from '@veupathdb/core-components';

// Definitions
import { AnalysisState } from '../../core';

// Hooks
import { useLoginCallbacks } from './hooks';

type ShareFromAnalyisProps = {
  visible: boolean;
  toggleVisible: (visible: boolean) => void;
  /** A callback to open a login form. */
  showLoginForm: () => void;
  analysisState: AnalysisState;
};

export default function PublishFromAnalysis({
  visible,
  toggleVisible,
  showLoginForm,
  analysisState,
}: ShareFromAnalyisProps) {
  const userLoggedIn = useWdkService((wdkService) =>
    wdkService.getCurrentUser().then((user) => !user.isGuest)
  );

  const loginCallbacks = useLoginCallbacks({ showLoginForm, toggleVisible });

  return (
    <Modal
      title="Make Analysis Public"
      visible={visible}
      toggleVisible={toggleVisible}
      includeCloseButton={true}
      themeRole="primary"
      styleOverrides={{
        size: { width: 700, height: 425 },
        content: {
          paddingTop: 0,
          paddingRight: 50,
          paddingBottom: 0,
          paddingLeft: 25,
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
        <ConfirmPublicAnalysis
          makeAnalysisPublic={() => analysisState.setIsPublic(true)}
          toggleVisible={toggleVisible}
        />
      )}
    </Modal>
  );
}
