import { CSSProperties, ReactElement, ReactNode } from 'react';
import {
  makeClassNameHelper,
  safeHtml,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import { ANALYSIS_NAME_MAX_LENGTH } from '../../core/utils/analysis';
import './MapHeader.scss';
import {
  mapNavigationBackgroundColor,
  mapNavigationBorder,
  SiteInformationProps,
} from '..';

export type MapNavigationProps = {
  analysisName?: string;
  entityDisplayName: string;
  filterList?: ReactElement;
  siteInformation: SiteInformationProps;
  onAnalysisNameEdit: (newName: string) => void;
  studyName: string;
  totalEntityCount: number | undefined;
  totalEntityInSubsetCount: number | undefined;
  visibleEntityCount: number | undefined;
};

/**
 * <MapHeader /> has the following responsibilities:
 *  - Presenting the smallest amount of information to allow the user
 *    to make sense of a map analysis.
 */
export function MapHeader({
  analysisName,
  entityDisplayName,
  filterList,
  siteInformation,
  onAnalysisNameEdit,
  studyName,
  totalEntityCount = 0,
  totalEntityInSubsetCount = 0,
  visibleEntityCount = 0,
}: MapNavigationProps) {
  const mapHeader = makeClassNameHelper('MapHeader');
  const { format } = new Intl.NumberFormat();

  return (
    <header
      style={{
        background: mapNavigationBackgroundColor,
        borderBottom: mapNavigationBorder,
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
      <div className={`${mapHeader('__SampleCounter')}`}>
        <p>{entityDisplayName}</p>
        <LeftBracket
          styles={{
            // Bring closer the content of the righthand side of
            // the bracket.
            marginLeft: 10,
          }}
        />
        <table>
          <thead>
            <tr>{/* <th colSpan={2}>{entityDisplayName}</th> */}</tr>
          </thead>
          <tbody>
            <tr title={`There are X total samples.`}>
              <td>All</td>
              <td>{format(totalEntityCount)}</td>
            </tr>
            <tr
              title={`You've subset all samples down to ${totalEntityInSubsetCount} entites.`}
            >
              <td>Subset</td>
              <td>{format(totalEntityInSubsetCount)}</td>
            </tr>
            <tr
              title={`${visibleEntityCount} samples of your subset samples visible at your current viewport.`}
            >
              <td>View</td>
              <td>{format(visibleEntityCount)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </header>
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
      <div className={headerContent('__SaveableTextEditorContainer')}>
        <SaveableTextEditor
          displayValue={(value: string, handleEdit: () => void) => {
            return (
              <h1
                className={headerContent('__AnalysisTitle')}
                onClick={handleEdit}
              >
                <span
                  // This allows users to highlight the study name,
                  // without editing the analysis name.
                  onClick={(e) => e.stopPropagation()}
                  className={headerContent('__StudyName')}
                >
                  {safeHtml(studyName, { style: { fontWeight: 'bold' } })}:{' '}
                </span>
                <span>{analysisName}</span>
              </h1>
            );
          }}
          maxLength={ANALYSIS_NAME_MAX_LENGTH}
          onSave={onAnalysisNameEdit}
          value={analysisName}
        />
      </div>
      {filterList}
    </div>
  );
}

type LeftBracketProps = {
  /** Should you need to adjust anything! */
  styles?: CSSProperties;
};
function LeftBracket(props: LeftBracketProps) {
  return (
    <div
      style={{
        border: '1px solid black',
        borderRight: 'none',
        height: '75%',
        width: 5,
        ...props.styles,
      }}
      aria-hidden
    ></div>
  );
}
