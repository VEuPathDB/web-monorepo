import React from 'react';
import { State } from 'wdk-client/StoreModules/MatchedTranscriptsFilterStoreModule';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import './MatchedTranscriptsFilter.scss';

const cx = makeClassNameHelper('MatchedTranscriptsFilter');

type Props = Required<State> & {
  filterValue: {
    values: Array<'Y'|'N'>;
  };
  toggleExpansion: (expand: boolean) => void;
  updateFilter: (didMeetCriteria: boolean, didNotMeetCriteria: boolean) => void;
  updateSelection: (didMeetCriteria: boolean, didNotMeetCriteria: boolean) => void;
};

export default function MatchedTranscriptsFilter(props: Props) {
  const {
    expanded,
    didMeetCount,
    didNotMeetCount,
    didMeetCriteria,
    didNotMeetCriteria,
    toggleExpansion,
    updateFilter,
    updateSelection,
    filterValue
  } = props;

  if (didNotMeetCount == 0) return null;

  const didMeetCriteriaIsSelected = didMeetCriteria != null ? didMeetCriteria : filterValue.values.includes('Y');
  const didNotMeetCriteriaIsSelected = didNotMeetCriteria != null ? didNotMeetCriteria : filterValue.values.includes('N');
  const buttonDisabled = (
    didMeetCriteria == null ||
    didNotMeetCriteria == null || (
      didMeetCriteria === filterValue.values.includes('Y') &&
      didNotMeetCriteria === filterValue.values.includes('N')
    )
  );

  return (
    <div className={cx()}>
      <div className={cx('-Heading')}>
        <i className="fa fa-exclamation-circle"/> Some Genes in your result have Transcripts that did not meet the search criteria.
        <button
          type="button"
          className={`${cx('-ExpandButton')} wdk-Link`}
          onClick={() => toggleExpansion(!expanded)}
        >
          {expanded ? 'Collapse' : 'Explore'}
        </button>
      </div>
      {expanded &&
        <div className={cx('-FilterPanel')}>
          <div><strong>Include Transcripts that:</strong></div>
          <div className={cx('-FilterOptions')}>
            <div>
        <div><input id="MatchedTranscript--DidMeet" type="checkbox" checked={didMeetCriteriaIsSelected} onChange={() => updateSelection(!didMeetCriteriaIsSelected, didNotMeetCriteriaIsSelected)}/></div>
              <div><label htmlFor="MatchedTranscript--DidMeet">did meet the search criteria</label></div>
              <div><i className="fa fa-check-circle"/></div>
              <div style={{ textAlign: 'right' }}><strong>{didMeetCount}</strong></div>
              <div>transcripts</div>
            </div>
            <div>
              <div><input id="MatchedTranscript--DidNotMeet" type="checkbox" checked={didNotMeetCriteriaIsSelected} onChange={() => updateSelection(didMeetCriteriaIsSelected, !didNotMeetCriteriaIsSelected)}/></div>
              <div><label htmlFor="MatchedTranscript--DidNotMeet">did not meet the search criteria</label></div>
              <div><i className="fa fa-times-circle"/></div>
              <div style={{ textAlign: 'right' }}><strong>{didNotMeetCount}</strong></div>
              <div>transcripts</div>
            </div>
          </div>
          <div className={cx('-ApplyButtonContainer')}>
            <button type="button" disabled={buttonDisabled} onClick={() => updateFilter(didMeetCriteria, didNotMeetCriteria)}>
              Apply selection
            </button>
          </div>
        </div>
      }
    </div>
  );
}
