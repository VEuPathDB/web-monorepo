import { isEqual, orderBy } from 'lodash';
import React from 'react';
import { State } from '../../StoreModules/MatchedTranscriptsFilterStoreModule';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';

import './MatchedTranscriptsFilter.scss';
import { FilterSummary } from '../../Actions/MatchedTranscriptsFilterActions';

const cx = makeClassNameHelper('MatchedTranscriptsFilter');

type Props = Required<State> & {
  filterValue: {
    values: string[];
  };
  description: string;
  optionLeadin: string;
  optionLabel: Record<string, string>;
  toggleExpansion: (expand: boolean) => void;
  updateFilter: (selection: string[]) => void;
  updateSelection: (selections: string[]) => void;
};

export default function MatchedTranscriptsFilter(props: Props) {
  const {
    expanded,
    summary,
    selection = props.filterValue.values,
    description,
    optionLabel,
    optionLeadin,
    toggleExpansion,
    updateFilter,
    updateSelection,
    filterValue,
  } = props;

  if (!hasMissingTranscripts(summary)) return null;

  const buttonDisabled = isEqual(selection, filterValue.values);
  const sortedKeys = orderBy(Object.keys(summary), (entry) =>
    entry.replace(/Y/g, '0').replace(/N/g, '1')
  );

  return (
    <div className={cx()}>
      <div className={cx('-Heading')}>
        <i className="fa fa-exclamation-circle" /> {description}
        <button
          type="button"
          className={`${cx('-ExpandButton')} wdk-Link`}
          onClick={() => toggleExpansion(!expanded)}
        >
          {expanded ? 'Collapse' : 'Explore'}
        </button>
      </div>
      {expanded && (
        <div className={cx('-FilterPanel')}>
          <div>
            <strong>{optionLeadin}:</strong>
          </div>
          <div className={cx('-FilterOptions')}>
            {sortedKeys.map((criteria) => {
              const inputId = `MatchedTranscript--${criteria}`;
              const isSelected = selection.includes(criteria);
              const isDisabled = summary[criteria] == 0;
              return (
                <div
                  key={criteria}
                  className={cx(
                    '-FilterOption',
                    isDisabled && 'disabled',
                    criteria
                  )}
                >
                  <div>
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor={inputId}>
                      {optionLabel[criteria] || 'unknown'}
                    </label>
                  </div>
                  <div>
                    <img src={require(`./images/${criteria}.png`)} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>{summary[criteria].toLocaleString()}</strong>
                  </div>
                  <div>transcripts</div>
                </div>
              );
              function handleChange() {
                const newSelection = sortedKeys.filter((key) =>
                  key === criteria ? !isSelected : selection.includes(key)
                );
                updateSelection(newSelection);
              }
            })}
          </div>
          <div className={cx('-ApplyButtonContainer')}>
            <button
              type="button"
              disabled={buttonDisabled}
              onClick={() => updateFilter(selection)}
            >
              Apply selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function hasMissingTranscripts(summary: FilterSummary) {
  return Object.keys(summary).some(
    (key) => key.includes('N') && summary[key] > 0
  );
}
