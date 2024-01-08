import { ReactElement, ReactNode } from 'react';
import {
  makeClassNameHelper,
  safeHtml,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import { ANALYSIS_NAME_MAX_LENGTH } from '../../core/utils/analysis';
import './MapHeader.scss';
import { mapSidePanelBackgroundColor } from '../constants';
import { SiteInformationProps } from './Types';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import { Link, useHistory } from 'react-router-dom';
import { EdaIcon } from '@veupathdb/coreui';

export type MapNavigationProps = {
  analysisName?: string;
  filterList?: ReactElement;
  siteInformation: SiteInformationProps;
  onAnalysisNameEdit: (newName: string) => void;
  studyName: string;
  /** children of this component will be rendered in flex children
     distributed across the bottom edge of the header, hanging down like tabs */
  children: ReactNode;
  mapTypeDetails?: ReactNode;
  showLinkToEda: boolean;
};

/**
 * <MapHeader /> has the following responsibilities:
 *  - Presenting the smallest amount of information to allow the user
 *    to make sense of a map analysis.
 */
export function MapHeader({
  analysisName,
  filterList,
  siteInformation,
  onAnalysisNameEdit,
  studyName,
  children,
  mapTypeDetails,
  showLinkToEda,
}: MapNavigationProps) {
  const mapHeader = makeClassNameHelper('MapHeader');
  const { siteName } = siteInformation;
  const theme = useUITheme();
  const history = useHistory();

  return (
    <header
      style={{
        /**
         * If VectorBase => use light sage background color
         * If theme is present => use lightest shade of primary theme color
         * Default: mapNavigationBackgroundColor
         */
        background:
          siteName === 'VectorBase'
            ? '#F5FAF1'
            : theme?.palette.primary.hue[100] ?? mapSidePanelBackgroundColor,
        // Mimics shadow used in Google maps
        boxShadow:
          '0 1px 2px rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
      }}
      className={`${mapHeader()}`}
    >
      <div className={`${mapHeader('__Contents')}`}>
        <div className={mapHeader('__LogoContainer')}>
          <a href={siteInformation.siteHomeUrl}>
            <img
              src={siteInformation.siteLogoSrc}
              alt={siteInformation.siteName}
            />
          </a>
        </div>
        <HeaderContent
          filterList={filterList}
          studyName={studyName}
          analysisName={analysisName}
          onAnalysisNameEdit={onAnalysisNameEdit}
        />
      </div>
      {showLinkToEda && (
        <Link
          to={history.location.pathname.replace('/maps/', '/analyses/')}
          style={{
            color: theme?.palette.primary.hue[theme.palette.primary.level],
            paddingLeft: 10,
            paddingRight: 10,
            fontSize: '1.2em',
            marginLeft: 'auto',
            marginRight: '2em',
            fontWeight: 500,
          }}
        >
          <EdaIcon fill="currentColor" /> Explore in {siteName}
        </Link>
      )}
      {mapTypeDetails}
      <HangingTabs>{children}</HangingTabs>
    </header>
  );
}

function HangingTabs({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        top: '100%',
        bottom: 0,
        display: 'flex',
        justifyContent: 'space-evenly',
      }}
    >
      {children}
    </div>
  );
}

type HeaderContentProps = {
  analysisName?: string;
  filterList?: ReactNode;
  onAnalysisNameEdit: (newName: string) => void;
  studyName: string;
};
function HeaderContent({
  analysisName = '',
  filterList,
  onAnalysisNameEdit,
  studyName,
}: HeaderContentProps) {
  const headerContent = makeClassNameHelper('HeaderContent');

  return (
    <div className={headerContent()}>
      <div>
        <h1 className={headerContent('__AnalysisTitle')}>
          <strong>MapVEu &mdash; </strong>
          <span className={headerContent('__StudyName')}>
            {safeHtml(studyName)}
          </span>
          <SaveableTextEditor
            displayValue={analysisName}
            maxLength={ANALYSIS_NAME_MAX_LENGTH}
            onSave={onAnalysisNameEdit}
            value={analysisName}
          />
        </h1>
      </div>
      {filterList}
    </div>
  );
}
