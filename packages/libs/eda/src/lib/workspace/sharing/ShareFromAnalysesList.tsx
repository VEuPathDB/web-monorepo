import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

// Components
import ConfirmPublicAnalysis from './ConfirmPublicAnalysis';
import Login from './Login';
import NameAnalysis from './NameAnalysis';
import { Modal } from '@veupathdb/core-components';

// Definitions
import { AnalysisSummary, SingleAnalysisPatchRequest } from '../../core';

// Hooks
import { useLoginCallbacks } from './hooks';

type ShareFromAnalysesListProps = {
  visible: boolean;
  toggleVisible: (visible: boolean) => void;
  showLoginForm?: () => void;
  analysis?: AnalysisSummary;
  updateAnalysis: (id: string, patch: SingleAnalysisPatchRequest) => void;
};

export default function ShareFromAnalysesList({
  visible,
  toggleVisible,
  showLoginForm = () => {},
  analysis,
  updateAnalysis,
}: ShareFromAnalysesListProps) {
  const userLoggedIn = useWdkService((wdkService) =>
    wdkService.getCurrentUser().then((user) => !user.isGuest)
  );

  const loginCallbacks = useLoginCallbacks({ showLoginForm, toggleVisible });

  return (
    <Modal
      title="Make Analysis Public"
      visible={visible && analysis !== undefined}
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
      ) : analysis?.displayName === 'Unnamed Analysis' ? (
        <NameAnalysis
          currentName={analysis.displayName}
          updateName={(name) =>
            updateAnalysis(analysis.analysisId, { displayName: name })
          }
        />
      ) : (
        <ConfirmPublicAnalysis
          makeAnalysisPublic={() =>
            updateAnalysis(analysis!.analysisId, { isPublic: true })
          }
          toggleVisible={toggleVisible}
        />
      )}
    </Modal>
  );
}
