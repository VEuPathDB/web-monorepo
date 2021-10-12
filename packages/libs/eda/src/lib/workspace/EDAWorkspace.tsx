import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { AnalysisPanel } from './AnalysisPanel';
import { useWorkspaceAnalysis } from './hooks/analyses';
import { isNewAnalysis } from '../core/utils/analysis';

interface Props {
  studyId: string;
  analysisId?: string;
}

export const EDAWorkspace = ({ studyId, analysisId }: Props) => {
  const analysisState = useWorkspaceAnalysis(studyId, analysisId);

  return (
    <>
      <EDAWorkspaceHeading analysisState={analysisState} />
      <AnalysisPanel
        analysisState={analysisState}
        hideCopyAndSave={isNewAnalysis(analysisState.analysis)}
      />
    </>
  );
};
