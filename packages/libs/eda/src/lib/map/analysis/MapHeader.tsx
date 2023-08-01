import { CSSProperties, ReactElement, ReactNode } from 'react';
import {
  makeClassNameHelper,
  safeHtml,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import { ANALYSIS_NAME_MAX_LENGTH } from '../../core/utils/analysis';
import './MapHeader.scss';
import {
  mapSidePanelBackgroundColor,
  mapSidePanelBorder,
  SiteInformationProps,
} from '..';
import { StudyEntity } from '../../core';
import { makeEntityDisplayName } from '../../core/utils/study-metadata';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';

export type MapNavigationProps = {
  analysisName?: string;
  outputEntity?: StudyEntity;
  filterList?: ReactElement;
  siteInformation: SiteInformationProps;
  onAnalysisNameEdit: (newName: string) => void;
  studyName: string;
  totalEntityCount: number | undefined;
  totalEntityInSubsetCount: number | undefined;
  visibleEntityCount: number | undefined;
  overlayActive: boolean;
};

/**
 * <MapHeader /> has the following responsibilities:
 *  - Presenting the smallest amount of information to allow the user
 *    to make sense of a map analysis.
 */
export function MapHeader({
  analysisName,
  outputEntity,
  filterList,
  siteInformation,
  onAnalysisNameEdit,
  studyName,
  totalEntityCount = 0,
  totalEntityInSubsetCount = 0,
  visibleEntityCount = 0,
  overlayActive,
}: MapNavigationProps) {
  const mapHeader = makeClassNameHelper('MapHeader');
  const { format } = new Intl.NumberFormat();
  const { siteName } = siteInformation;
  const theme = useUITheme();

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
      {outputEntity && (
        <div className={`${mapHeader('__SampleCounter')}`}>
          <p>{makeEntityDisplayName(outputEntity, true)}</p>
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
              <tr
                title={`There are ${format(
                  totalEntityCount
                )} ${makeEntityDisplayName(
                  outputEntity,
                  totalEntityCount > 1
                )} in the dataset.`}
              >
                <td>All</td>
                <td>{format(totalEntityCount)}</td>
              </tr>
              <tr
                title={`After filtering, there are ${format(
                  totalEntityInSubsetCount
                )} ${makeEntityDisplayName(
                  outputEntity,
                  totalEntityInSubsetCount > 1
                )} in the subset.`}
              >
                <td>Filtered</td>
                <td>{format(totalEntityInSubsetCount)}</td>
              </tr>
              <tr
                title={`${format(visibleEntityCount)} ${makeEntityDisplayName(
                  outputEntity,
                  visibleEntityCount > 1
                )} are in the current viewport${
                  overlayActive
                    ? ', and have data for the painted variable'
                    : ''
                }.`}
              >
                <td>View</td>
                <td>{format(visibleEntityCount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
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
