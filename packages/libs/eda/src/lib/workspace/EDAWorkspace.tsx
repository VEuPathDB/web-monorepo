import { isNewAnalysis } from '../core/utils/analysis';

import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { AnalysisPanel } from './AnalysisPanel';
import { useWorkspaceAnalysis } from './hooks/analyses';

interface Props {
  studyId: string;
  analysisId?: string;
  /**
   * The base of the URL from which to being sharing links.
   * This is passed down through several component layers. */
  sharingUrlPrefix: string;
  /**
   * A callback to open a login form.
   * This is also passed down through several component layers. */
  showLoginForm: () => void;
}

export const EDAWorkspace = ({
  studyId,
  analysisId,
  sharingUrlPrefix,
  showLoginForm,
}: Props) => {
  const analysisState = useWorkspaceAnalysis(studyId, analysisId);

  return (
    <>
      <EDAWorkspaceHeading analysisState={analysisState} />
      <AnalysisPanel
        analysisState={analysisState}
        hideCopyAndSave={isNewAnalysis(analysisState.analysis)}
        sharingUrlPrefix={sharingUrlPrefix}
        showLoginForm={showLoginForm}
      />
    </>
  );
};
