import { ReactNode } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { EdaIcon } from '@veupathdb/coreui';
import { ANALYSIS_NAME_MAX_LENGTH } from '../../../core/utils/analysis';
import { SiteInformationProps } from '../Types';
import { mapUi, usePrimaryColor } from './ui';

interface Props {
  siteInformation: SiteInformationProps;
  studyName: string;
  analysisName?: string;
  onAnalysisNameEdit: (name: string) => void;
  showLinkToEda: boolean;
  /** buttons on the right (share, sign in, ...) */
  actions?: ReactNode;
}

/**
 * One compact row: where am I (site, study, analysis name) and the
 * analysis-level actions. Everything about the map itself lives on or
 * beside the map.
 */
export function MapTopBar({
  siteInformation,
  studyName,
  analysisName = '',
  onAnalysisNameEdit,
  showLinkToEda,
  actions,
}: Props) {
  const history = useHistory();
  const primary = usePrimaryColor();
  return (
    <header
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '6px 16px',
        background: mapUi.panelBackground,
        borderBottom: mapUi.border,
        minHeight: 48,
        flexShrink: 0,
      }}
    >
      <a
        href={siteInformation.siteHomeUrl}
        title={`${siteInformation.siteName} home`}
        css={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
      >
        <img
          src={siteInformation.siteLogoSrc}
          alt={siteInformation.siteName}
          css={{ height: 32 }}
        />
      </a>
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          flex: 1,
          lineHeight: 1.25,
        }}
      >
        <div
          css={{
            fontSize: 12,
            color: mapUi.muted,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Map &middot; {safeHtml(studyName)}
        </div>
        <div
          css={{
            fontSize: 16,
            fontWeight: 600,
            '.wdk-SaveableTextEditor': { fontSize: 16 },
          }}
          title="Analysis name (click to rename)"
        >
          <SaveableTextEditor
            displayValue={analysisName}
            maxLength={ANALYSIS_NAME_MAX_LENGTH}
            onSave={onAnalysisNameEdit}
            value={analysisName}
          />
        </div>
      </div>
      {showLinkToEda && (
        <Link
          to={history.location.pathname.replace('/maps/', '/analyses/')}
          title="Open this analysis (same filters and settings) in the Dataset Explorer"
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: primary,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <EdaIcon fill="currentColor" /> Open in Dataset Explorer
        </Link>
      )}
      {actions}
    </header>
  );
}
