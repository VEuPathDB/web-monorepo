import { get } from 'lodash';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import {
  useWdkServiceWithRefresh,
  useWdkService,
} from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import {
  isTranscripFilterEnabled,
  requestTranscriptFilterUpdate
} from '../../util/transcriptFilters';

import { ResultExportSelector } from './ResultExportSelector';
import { useGeneListExportOptions } from './gene-list-export-utils';

// --------------
// GeneRecordLink
// --------------

function GeneRecordLink(props) {
  const { recordId, geneRecordClass, children } = props;
  const geneId = recordId
    .filter(part => part.name !== 'source_id')
    .map(part => part.name === 'gene_source_id' ? { ...part, name: 'source_id' } : part);
  return <props.DefaultComponent
    recordClass={geneRecordClass}
    recordId={geneId}
  >{children}</props.DefaultComponent>
}

const mapStateToGeneRecordLinkProps = state => ({
  geneRecordClass: state.globalData.recordClasses
    .find(recordClass => recordClass.fullName === 'GeneRecordClasses.GeneRecordClass')
});

export const RecordLink = connect(mapStateToGeneRecordLinkProps)(GeneRecordLink);


// -----------
// ResultTable
// -----------

function TranscriptViewFilter({
  answer: { meta: { totalCount, displayTotalCount, viewTotalCount } },
  recordClass: { name, displayName, displayNamePlural, nativeDisplayName, nativeDisplayNamePlural },
  globalViewFilters,
  isEnabled,
  isLoading,
  requestTranscriptFilterUpdate
}) {
  if (totalCount === displayTotalCount) return null;

  const display = displayTotalCount === 1 ? displayName : displayNamePlural;
  const nativeDisplay = totalCount === 1 ? nativeDisplayName : nativeDisplayNamePlural;
  const hiddenCount = isEnabled ? `(hiding ${(totalCount - viewTotalCount).toLocaleString()})` : null;
  const toggleId = "TranscriptViewFilter--Toggle";
  return (
    <div className="TranscriptViewFilter">
      <div>
        <div className="TranscriptViewFilter--Label">{display}:</div> {displayTotalCount.toLocaleString()}
      </div>
      <div>
        <div className="TranscriptViewFilter--Label">{nativeDisplay}:</div> {totalCount.toLocaleString()} {hiddenCount}
      </div>
      <div>
        <input
          id={toggleId}
          type="checkbox"
          checked={isEnabled}
          disabled={isLoading}
          onChange={() => requestTranscriptFilterUpdate(globalViewFilters[name], !isEnabled)}
        />
        <label htmlFor={toggleId}>Show Only One {nativeDisplayName} Per Gene</label>
        {isLoading && <div style={{ color: 'gray', padding: '0 1em', fontWeight: 'normal' }}>...updating results</div>}
      </div>
    </div>
  )
}

const ConnectedTranscriptViewFilter = connect(
  (state, props) => ({
    isEnabled: isTranscripFilterEnabled(state, { viewId: props.viewId }),
    globalViewFilters: get(state, ['resultTableSummaryView', props.viewId, 'globalViewFilters'], {})
  }),
  (dispatch, props) => ({
    requestTranscriptFilterUpdate: (...args) => dispatch(requestTranscriptFilterUpdate(props.viewId, ...args))
  })
)(TranscriptViewFilter);

export function ResultTable(props) {
  const exportOptions = useGeneListExportOptions(props.resultType);

  const renderToolbarContent = useCallback(({
    addColumnsNode,
    downloadLinkNode,
  }) => (
      <>
        <span
          className={
            exportOptions.length > 0
              ? 'TranscriptResultTableButton'
              : undefined
            }
        >
          {downloadLinkNode}
        </span>
        {
          exportOptions.length > 0 &&
          <ResultExportSelector options={exportOptions} />
        }
        <span
          className={
            exportOptions.length > 0
              ? 'TranscriptResultTableButton'
              : undefined
            }
        >
          {addColumnsNode}
        </span>
      </>
    ),
    [exportOptions]
  );

  return <React.Fragment>
    <ConnectedTranscriptViewFilter {...props}/>
    <props.DefaultComponent
      {...props}
      renderToolbarContent={renderToolbarContent}
    />
  </React.Fragment>
}

export function ResultPanelHeader(props) {
  return (
    <OrthologCount {...props}/>
  );
}

const ORTHOLOG_COLUMN_FILTER_NAME = 'gene_orthomcl_name';
const ORTHOLOG_COLUMN_FILTER_TOOL = 'byValue';

function OrthologCount(props) {
  const { step, DefaultComponent } = props;
  const uniqueOrthologValues = useWdkServiceWithRefresh(
    async wdkService => {
      try {
        const result = await wdkService.getStepColumnReport(
          step.id,
          ORTHOLOG_COLUMN_FILTER_NAME,
          ORTHOLOG_COLUMN_FILTER_TOOL,
          { omitHistogram: true }
        );

        return { available: true, value: result.statistics.numDistinctValues };
      } catch (error) {
        wdkService.submitErrorIfUndelayedAndNot500(error);

        return { available: false };
      }
    },
    [step]
  );

  return uniqueOrthologValues == null ? null : (
    <React.Fragment>
      <DefaultComponent {...props}/>
      {
        uniqueOrthologValues.available &&
        <div style={{ order: 1, fontSize: '1.4em', marginLeft: '.5em' }}>
          ({uniqueOrthologValues.value.toLocaleString()} ortholog groups)
        </div>
      }
    </React.Fragment>
  );
}
