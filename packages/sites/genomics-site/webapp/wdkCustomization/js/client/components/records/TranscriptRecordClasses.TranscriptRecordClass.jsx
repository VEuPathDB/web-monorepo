import React from 'react';
import { connect } from 'react-redux';

import { requestTranscriptFilterPreference, requestTranscriptFilterUpdate } from '../../util/transcriptFilters';

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
    .find(recordClass => recordClass.name === 'GeneRecordClasses.GeneRecordClass')
});

export const RecordLink = connect(mapStateToGeneRecordLinkProps)(GeneRecordLink);


// -----------
// ResultTable
// -----------

class TranscriptViewFilter extends React.Component {
  componentDidMount() {
    this.props.requestTranscriptFilterPreference();
  }
  render() {
    // TODO When Checkbox toggled:
    // - PATCH User preferences with transcript filter value
    // - dispatch fulfillAnswer so that we get answer value with filter applied (or not)
    const {
      answer: { meta: { totalCount, displayTotalCount, viewTotalCount, displayViewTotalCount } },
      recordClass: { displayName, displayNamePlural, nativeDisplayName, nativeDisplayNamePlural },
      isEnabled,
      isLoading,
      requestTranscriptFilterUpdate
    } = this.props;

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
            onChange={() => requestTranscriptFilterUpdate(!isEnabled)}
          />
          <label htmlFor={toggleId}>Show Only One {nativeDisplayName} Per Gene</label>
          {isLoading && <div style={{ color: 'gray', padding: '0 1em', fontWeight: 'normal' }}>...updating results</div>}
        </div>
      </div>
    )
  }
}

const ConnectedTranscriptViewFilter = connect(
  state => state.transcriptFilters,
  {
    requestTranscriptFilterPreference,
    requestTranscriptFilterUpdate
  }
)(TranscriptViewFilter);

export function ResultTable(props) {
  return <React.Fragment>
    <ConnectedTranscriptViewFilter {...props}/>
    <props.DefaultComponent {...props}/>
  </React.Fragment>
}
