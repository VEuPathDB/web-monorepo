import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import NameAnalysis from './NameAnalysis';
import Login from './Login';
import ConfirmPublicAnalysis from './ConfirmPublicAnalysis';
import { AnalysisSummary, SingleAnalysisPatchRequest } from '../../core';
import { Modal } from '@veupathdb/core-components';

type ShareFromAnalysesListProps = {
  visible: boolean;
  toggleVisible: (visible: boolean) => void;
  analysis?: AnalysisSummary;
  updateAnalysis: (id: string, patch: SingleAnalysisPatchRequest) => void;
};

export default function ShareFromAnalysesList({
  visible,
  toggleVisible,
  analysis,
  updateAnalysis,
}: ShareFromAnalysesListProps) {
  const userLoggedIn = useWdkService((wdkService) =>
    wdkService.getCurrentUser().then((user) => !user.isGuest)
  );

  return (
    <Modal
      title="Make Analysis Public"
      visible={visible && analysis !== undefined}
      toggleVisible={toggleVisible}
      includeCloseButton={true}
      themeRole="primary"
      styleOverrides={{ size: { width: 700, height: 400 } }}
    >
      {!userLoggedIn ? (
        <Login toggleVisible={toggleVisible} />
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
