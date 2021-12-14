import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import NameAnalysis from './NameAnalysis';
import Login from './Login';
import ConfirmPublicAnalysis from './ConfirmPublicAnalysis';
import { AnalysisState } from '../../core';
import { Modal } from '@veupathdb/core-components';

type ShareFromAnalyisProps = {
  visible: boolean;
  toggleVisible: (visible: boolean) => void;
  analysisState: AnalysisState;
};

export default function ShareFromAnalysis({
  visible,
  toggleVisible,
  analysisState,
}: ShareFromAnalyisProps) {
  const userLoggedIn = useWdkService((wdkService) =>
    wdkService.getCurrentUser().then((user) => !user.isGuest)
  );

  return (
    <Modal
      title="Make Analysis Public"
      visible={visible}
      toggleVisible={toggleVisible}
      includeCloseButton={true}
      themeRole="primary"
      styleOverrides={{
        size: { width: 700, height: 400 },
        content: {
          paddingTop: 0,
          paddingRight: 50,
          paddingBottom: 25,
          paddingLeft: 25,
        },
      }}
    >
      {!userLoggedIn ? (
        <Login toggleVisible={toggleVisible} />
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
