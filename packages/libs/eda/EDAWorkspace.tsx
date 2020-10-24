import React from 'react';
import { StudyRecord } from './Types';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';

import './EDAWorkspace.scss';
import { cx } from './Utils';
import { Analysis } from 'ebrc-client/modules/eda-workspace-core/types/analysis';
import { EDAAnalysis } from './EDAAnalysis';

interface Props {
  studyRecord: StudyRecord;
  analysis: Analysis;
  setAnalysisName: (name: string) => void;
  copyAnalysis: () => void;
  saveAnalysis: () => void;
  deleteAnalysis: () => void;
}
export default function EDAWorkspace(props: Props) {
  const { studyRecord, analysis, setAnalysisName,copyAnalysis, saveAnalysis, deleteAnalysis } = props;
  return (
    <div className={cx()}>
      <EDAWorkspaceHeading
        studyRecord={studyRecord}
      />
      <EDAAnalysis
        analysis={analysis}
        setAnalysisName={setAnalysisName}
        copyAnalysis={copyAnalysis}
        saveAnalysis={saveAnalysis}
        deleteAnalysis={deleteAnalysis}
      />
    </div>
  );
}
