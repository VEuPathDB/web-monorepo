import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import React from 'react';
import { useHistory, useRouteMatch } from 'react-router';
import Path from 'path';
import { Analysis, NewAnalysis } from '../core';
import { ActionIconButton } from './ActionIconButton';
import { Button, Icon } from '@material-ui/core';
import { cx } from './Utils';

interface Props {
  analysis: Analysis | NewAnalysis;
  setAnalysisName: (name: string) => void;
  copyAnalysis?: () => Promise<{ analysisId: string }>;
  saveAnalysis: () => Promise<void>;
  deleteAnalysis?: () => Promise<void>;
  onFilterIconClick?: () => void;
  globalFiltersDialogOpen?: boolean;
}

export function AnalysisSummary(props: Props) {
  const {
    analysis,
    setAnalysisName,
    copyAnalysis,
    deleteAnalysis,
    onFilterIconClick,
    globalFiltersDialogOpen,
  } = props;
  const history = useHistory();
  const { url } = useRouteMatch();
  const handleCopy =
    copyAnalysis &&
    (async () => {
      const res = await copyAnalysis();
      history.replace(Path.resolve(url, `../${res.analysisId}`));
    });
  const handleDelete =
    deleteAnalysis &&
    (async () => {
      await deleteAnalysis();
      history.replace(Path.resolve(url, '..'));
    });
  return (
    <div className={cx('-AnalysisSummary')}>
      <div className={cx('-AnalysisSummaryLeft')}>
        <SaveableTextEditor
          className={cx('-AnalysisNameEditBox')}
          value={analysis.displayName}
          onSave={setAnalysisName}
        />
        {analysis.descriptor.subset.descriptor.length > 0 && onFilterIconClick && (
          <Button
            className={cx('-SeeAllFiltersButton')}
            onClick={onFilterIconClick}
            startIcon={<Icon className="fa fa-filter" />}
          >
            {(globalFiltersDialogOpen ? 'Hide' : 'Show') + ' all filters'}
          </Button>
        )}
      </div>
      <div className={cx('-AnalysisSummaryRight')}>
        {handleCopy && (
          <ActionIconButton
            iconClassName="clone"
            hoverText="Copy analysis"
            action={handleCopy}
          />
        )}
        {handleDelete && (
          <ActionIconButton
            iconClassName="trash"
            hoverText="Delete analysis"
            action={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
