import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import React from 'react';
import { useHistory, useRouteMatch } from 'react-router';
import Path from 'path';
import { Analysis } from '../core';
import { ActionIconButton } from './ActionIconButton';
import { cx } from './Utils';

interface Props {
  analysis: Analysis;
  setAnalysisName: (name: string) => void;
  copyAnalysis: () => Promise<{ id: string }>;
  saveAnalysis: () => Promise<void>;
  deleteAnalysis: () => Promise<void>;
  onFilterIconClick: () => void;
}

export function AnalysisSummary(props: Props) {
  const {
    analysis,
    setAnalysisName,
    copyAnalysis,
    deleteAnalysis,
    onFilterIconClick,
  } = props;
  const history = useHistory();
  const { url } = useRouteMatch();
  const handleCopy = async () => {
    const res = await copyAnalysis();
    history.replace(Path.resolve(url, `../${res.id}`));
  };
  const handleDelete = async () => {
    await deleteAnalysis();
    history.replace(Path.resolve(url, '..'));
  };
  return (
    <div className={cx('-AnalysisSummary')}>
      <div className={cx('-AnalysisSummaryLeft')}>
        <SaveableTextEditor
          className={cx('-AnalysisNameEditBox')}
          value={analysis.name}
          onSave={setAnalysisName}
        />
        {analysis.filters.length > 0 && (
          <ActionIconButton
            iconClassName="filter"
            hoverText="See all filters"
            action={onFilterIconClick}
          />
        )}
      </div>
      <div className={cx('-AnalysisSummaryRight')}>
        <ActionIconButton
          iconClassName="download"
          hoverText="Bulk download study"
          action={() => {
            alert('Coming soon');
          }}
        />
        <ActionIconButton
          iconClassName="clone"
          hoverText="Copy analysis"
          action={handleCopy}
        />
        <ActionIconButton
          iconClassName="trash"
          hoverText="Delete analysis"
          action={handleDelete}
        />
      </div>
    </div>
  );
}
