import { get } from 'lodash';
import React, { useState } from 'react';
import { connect } from 'react-redux';

import {
  isTranscripFilterEnabled,
  requestTranscriptFilterUpdate
} from '../../util/transcriptFilters';
import {useWdkEffect} from 'wdk-client/Service/WdkService';
import {alert} from 'wdk-client/Utils/Platform';

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
  return <React.Fragment>
    <ConnectedTranscriptViewFilter {...props}/>
    <props.DefaultComponent {...props}/>
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
  const [ uniqueOrthologValues, setUniqueOrthologValues ] = useState(null);
  useWdkEffect(wdkService => {
    wdkService.getStepColumnReport(
      step.id,
      ORTHOLOG_COLUMN_FILTER_NAME,
      ORTHOLOG_COLUMN_FILTER_TOOL,
      { maxValues: 0 }
    ).then(
      result => {
        const { uniqueValues } = result;
        setUniqueOrthologValues(uniqueValues);
      },
      error => {
        alert('Oops... something went wrong', 'An error was encountered.');
        wdkService.submitError(error);
      }
    );
  }, [step]);

  return uniqueOrthologValues && (
    <React.Fragment>
      <DefaultComponent {...props}/>
      <div style={{ order: 1, fontSize: '1.4em', marginLeft: '.5em' }}>
        ({uniqueOrthologValues.toLocaleString()} orthologs)
      </div>
    </React.Fragment>
  );
}
