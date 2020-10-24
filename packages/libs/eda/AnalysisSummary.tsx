import React from 'react';
import { Analysis } from 'ebrc-client/modules/eda-workspace-core/types/analysis';
import { cx } from './Utils';
import { SaveableTextEditor } from 'wdk-client/Components';
import { ActionIconButton } from './ActionIconButton';

interface Props {
  analysis: Analysis;
  setAnalysisName: (name: string) => void;
  copyAnalysis: () => void;
  saveAnalysis: () => void;
  deleteAnalysis: () => void;
};

export function AnalysisSummary(props: Props) {
  const { analysis, setAnalysisName, copyAnalysis, saveAnalysis, deleteAnalysis } = props;
  return (
    <div className={cx('-AnalysisSummary')}>
      <SaveableTextEditor
        className={cx('-AnalysisNameEditBox')}
        value={analysis.name}
        onSave={setAnalysisName}
      />
      <ActionIconButton iconClassName="clone" hoverText="Copy analysis" action={copyAnalysis}/>
      <ActionIconButton iconClassName="floppy-o" hoverText="Save analysis" action={saveAnalysis}/>
      <ActionIconButton iconClassName="trash" hoverText="Delete analysis" action={deleteAnalysis}/>
    </div>
  );
}
