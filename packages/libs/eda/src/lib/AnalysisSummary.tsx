import React from 'react';
import { useHistory } from 'react-router';
import { cx } from './Utils';
import { ActionIconButton } from './ActionIconButton';
import { Analysis } from '@veupathdb/eda-workspace-core';
import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  analysis: Analysis;
  setAnalysisName: (name: string) => void;
  copyAnalysis: () => Promise<string>;
  saveAnalysis: () => void;
  deleteAnalysis: () => void;
}

export function AnalysisSummary(props: Props) {
  const {
    analysis,
    setAnalysisName,
    copyAnalysis,
    saveAnalysis,
    deleteAnalysis,
  } = props;
  const history = useHistory();
  const handleCopy = async () => {
    const id = await copyAnalysis();
    history.push(id);
  };
  return (
    <div className={cx('-AnalysisSummary')}>
      <SaveableTextEditor
        className={cx('-AnalysisNameEditBox')}
        value={analysis.name}
        onSave={setAnalysisName}
      />
      <ActionIconButton
        iconClassName="clone"
        hoverText="Copy analysis"
        action={handleCopy}
      />
      <ActionIconButton
        iconClassName="floppy-o"
        hoverText="Save analysis"
        action={saveAnalysis}
      />
      <ActionIconButton
        iconClassName="trash"
        hoverText="Delete analysis"
        action={deleteAnalysis}
      />
    </div>
  );
}
