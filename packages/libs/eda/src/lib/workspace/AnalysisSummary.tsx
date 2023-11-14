import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import { useHistory, useRouteMatch } from 'react-router';
import Path from 'path';
import { Analysis, NewAnalysis } from '../core';
import { cx } from './Utils';
import { ANALYSIS_NAME_MAX_LENGTH } from '../core/utils/analysis';

// Components
import {
  Copy,
  Filter,
  Share,
  Trash,
} from '@veupathdb/coreui/lib/components/icons';
import { Chip, FilledButton, FloatingButton } from '@veupathdb/coreui';
import { Public } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';

interface Props {
  analysis: Analysis | NewAnalysis;
  setAnalysisName: (name: string) => void;
  copyAnalysis?: () => Promise<{ analysisId: string }>;
  saveAnalysis: () => Promise<void>;
  deleteAnalysis?: () => Promise<void>;
  onFilterIconClick?: () => void;
  globalFiltersDialogOpen?: boolean;
  displaySharingModal?: () => void;
  mapLink?: string;
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
    mapLink,
  } = props;
  const history = useHistory();
  const theme = useUITheme();
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
          maxLength={ANALYSIS_NAME_MAX_LENGTH}
        />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '0.8em',
        }}
      >
        {analysis.isPublic && (
          <Chip
            text="Public Analysis"
            themeRole="secondary"
            staticState="pressed"
            styleOverrides={{
              container: { marginLeft: 20, marginRight: 5 },
            }}
          />
        )}
        {analysis.descriptor.subset.descriptor.length > 0 && onFilterIconClick && (
          <FilledButton
            text={(globalFiltersDialogOpen ? 'Hide' : 'Show') + ' all filters'}
            onPress={onFilterIconClick}
            textTransform="capitalize"
            icon={Filter}
            themeRole="primary"
            styleOverrides={{
              container: { textTransform: 'none', width: 155, marginLeft: 25 },
            }}
          />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
        {displaySharingModal && (
          <FilledButton
            text="Share Analysis"
            onPress={displaySharingModal}
            icon={Share}
            themeRole="primary"
            styleOverrides={{
              container: { textTransform: 'none', marginRight: 10 },
            }}
          />
        )}
        {mapLink && (
          <Link
            to={mapLink}
            style={{
              color: theme?.palette.primary.hue[theme.palette.primary.level],
              paddingLeft: 10,
              paddingRight: 10,
              fontSize: '.7em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.5ex',
            }}
          >
            <Public /> Explore in Interactive Map
          </Link>
        )}

        {handleCopy && (
          <FloatingButton
            ariaLabel="Copy Analysis"
            tooltip="Copy analysis"
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
            ariaLabel="Delete Analysis"
            tooltip="Delete analysis"
            icon={Trash}
            onPress={handleDelete}
            themeRole="primary"
            styleOverrides={{
              container: { paddingLeft: 10, paddingRight: 10 },
            }}
          />
        )}
      </div>
    </div>
  );
}
