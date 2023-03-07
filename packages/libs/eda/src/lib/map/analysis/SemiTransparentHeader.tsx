import { ReactElement, ReactNode } from 'react';
import ArrowRight from '@veupathdb/coreui/dist/components/icons/ChevronRight';
import {
  makeClassNameHelper,
  safeHtml,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import { ANALYSIS_NAME_MAX_LENGTH } from '../../core/utils/analysis';
import './SemiTransparentHeader.scss';

export type SemiTransparentHeaderLogoProps = {
  href: string;
  siteName: string;
  src: string;
};

export type SemiTransparentHeaderProps = {
  analysisName?: string;
  entityDisplayName: string;
  filterList?: ReactElement;
  isExpanded: boolean;
  logoProps: SemiTransparentHeaderLogoProps;
  onAnalysisNameEdit: (newName: string) => void;
  onToggleExpand: () => void;
  studyName: string;
  totalEntityCount: number | undefined;
  totalEntityInSubsetCount: number | undefined;
  visibleEntityCount: number | undefined;
};

/**
 * <SemiTransparentHeader /> has the following responsibilities:
 *  - Worrying about being collapsed/expanded.
 *  - Presenting the smallest amount of information to allow the user
 *    to make sense of a map analysis.
 */
export function SemiTransparentHeader({
  analysisName,
  entityDisplayName,
  filterList,
  isExpanded,
  logoProps,
  onAnalysisNameEdit,
  onToggleExpand,
  studyName,
  totalEntityCount = 0,
  totalEntityInSubsetCount = 0,
  visibleEntityCount = 0,
}: SemiTransparentHeaderProps) {
  const semiTransparentHeader = makeClassNameHelper('SemiTransparentHeader');

  return (
    <header
      className={`${semiTransparentHeader()} ${
        !isExpanded ? semiTransparentHeader('--collapsed') : ''
      }`}
    >
      <div
        className={`${semiTransparentHeader('__Contents')} ${
          isExpanded ? '' : 'screenReaderOnly'
        }`}
      >
        <div className={semiTransparentHeader('__LogoContainer')}>
          <a href={logoProps.href}>
            <img src={logoProps.src} alt={logoProps.siteName} />
          </a>
        </div>
        <HeaderContent
          filterList={filterList}
          studyName={studyName}
          analysisName={analysisName}
          onAnalysisNameEdit={onAnalysisNameEdit}
        />
      </div>
      <div className={semiTransparentHeader('__SampleCounter')}>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>{entityDisplayName}</th>
            </tr>
          </thead>
          <tbody>
            <tr title={`There are X total samples.`}>
              <td>All</td>
              <td>{totalEntityCount}</td>
            </tr>
            <tr
              title={`You've subset all samples down to ${totalEntityInSubsetCount} entites.`}
            >
              <td>Subset</td>
              <td>{totalEntityInSubsetCount}</td>
            </tr>
            <tr
              title={`${visibleEntityCount} samples of your subset samples visible at your current viewport.`}
            >
              <td>Visible</td>
              <td>{visibleEntityCount}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <OpenCloseToggleButton
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
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

type OpenCloseToggleButtonProps = {
  isExpanded: boolean;
  onToggleExpand: () => void;
};
function OpenCloseToggleButton({
  isExpanded,
  onToggleExpand,
}: OpenCloseToggleButtonProps) {
  const expandToggleContainer = makeClassNameHelper('OpenCloseToggleButton');
  return (
    <div className={expandToggleContainer()}>
      <button
        className={`Button ${
          isExpanded ? '' : expandToggleContainer('--collapsed')
        }`}
        onClick={onToggleExpand}
      >
        <div
          className={`${expandToggleContainer('__SvgContainer')} ${
            isExpanded ? '' : expandToggleContainer('__SvgContainer--collapsed')
          }`}
          aria-hidden
        >
          <ArrowRight
            className={`${expandToggleContainer('__ArrowIcon')} ${
              isExpanded ? '' : expandToggleContainer('__ArrowIcon--collapsed')
            }`}
          />
        </div>

        <span className="screenReaderOnly">
          {isExpanded ? 'Close' : 'Open'} header.
        </span>
      </button>
    </div>
  );
}
