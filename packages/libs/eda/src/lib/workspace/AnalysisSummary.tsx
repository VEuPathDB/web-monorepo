import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import { useHistory, useRouteMatch } from 'react-router';
import Path from 'path';
import { Analysis, NewAnalysis } from '../core';
import { cx } from './Utils';

// Components
import {
  FilledButton,
  FloatingButton,
  OutlinedButton,
} from '@veupathdb/core-components/dist/components/buttons';
import {
  Copy,
  Filter,
  Share,
  Trash,
} from '@veupathdb/core-components/dist/components/icons';

interface Props {
  analysis: Analysis | NewAnalysis;
  setAnalysisName: (name: string) => void;
  copyAnalysis?: () => Promise<{ analysisId: string }>;
  saveAnalysis: () => Promise<void>;
  deleteAnalysis?: () => Promise<void>;
  onFilterIconClick?: () => void;
  globalFiltersDialogOpen?: boolean;
  displaySharingModal?: () => void;
}

export function AnalysisSummary(props: Props) {
  const {
    analysis,
    setAnalysisName,
    copyAnalysis,
    deleteAnalysis,
    onFilterIconClick,
    globalFiltersDialogOpen,
    displaySharingModal,
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
    <div
      id="Analysis Control Bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.65em',
        justifyContent: 'flex-start',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <SaveableTextEditor
          className={cx('-AnalysisNameEditBox')}
          value={analysis.displayName}
          onSave={(newName) => newName && setAnalysisName(newName)}
        />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '0.8em',
        }}
      >
        {handleCopy && (
          <FloatingButton
            iconOnly={true}
            icon={Copy}
            onPress={handleCopy}
            themeRole="primary"
            styleOverrides={{
              container: { paddingLeft: 10, paddingRight: 10 },
            }}
          />
        )}
        {handleDelete && (
          <FloatingButton
            iconOnly={true}
            icon={Trash}
            onPress={handleDelete}
            themeRole="primary"
            styleOverrides={{
              container: { paddingLeft: 10, paddingRight: 10 },
            }}
          />
        )}
        {analysis.isPublic && (
          <OutlinedButton
            text="Public Analysis"
            onPress={() => null}
            themeRole="secondary"
            styleOverrides={{
              container: { textTransform: 'none', marginLeft: 10 },
            }}
          />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
        {analysis.descriptor.subset.descriptor.length > 0 && onFilterIconClick && (
          <FilledButton
            text={(globalFiltersDialogOpen ? 'Hide' : 'Show') + ' all filters'}
            onPress={onFilterIconClick}
            icon={Filter}
            themeRole="primary"
            styleOverrides={{
              container: { textTransform: 'none', width: 155 },
            }}
          />
        )}
        {displaySharingModal && !analysis.isPublic && (
          <FilledButton
            text="Make Analysis Public"
            onPress={displaySharingModal}
            icon={Share}
            themeRole="primary"
            styleOverrides={{
              container: { textTransform: 'none', marginLeft: 10 },
            }}
          />
        )}
      </div>
    </div>
  );
}
