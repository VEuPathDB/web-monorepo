import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { useWorkspaceAnalysis } from './hooks/analyses';
import { ReactNode } from 'react';

interface Props {
  studyId: string;
  analysisId?: string;
  children: ReactNode;
}

export const EDAWorkspace = ({ studyId, analysisId, children }: Props) => {
  const analysisState = useWorkspaceAnalysis(studyId, analysisId);

  return (
    <>
      <EDAWorkspaceHeading analysisState={analysisState} />
      {children}
    </>
  );
};
