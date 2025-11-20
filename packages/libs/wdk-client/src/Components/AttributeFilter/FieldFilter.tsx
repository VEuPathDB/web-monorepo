import React from 'react';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import Icon from '../../Components/Icon/IconAlt';
import EmptyField from '../../Components/AttributeFilter/EmptyField';
import MultiFieldFilter from '../../Components/AttributeFilter/MultiFieldFilter';
import SingleFieldFilter from '../../Components/AttributeFilter/SingleFieldFilter';
import { isMulti } from '../../Components/AttributeFilter/AttributeFilterUtils';
import {
  Field,
  Filter,
  FieldTreeNode,
  OntologyTermSummary,
} from '../../Components/AttributeFilter/Types';

const cx = makeClassNameHelper('field-detail');

/**
 * State for a particular field filter
 */
type FieldFilterState = {
  loading?: boolean;
  summary?: OntologyTermSummary;
  leafSummaries?: OntologyTermSummary[];
  errorMessage?: string;
  // member, range, multi specific settings
  [key: string]: any;
};

/**
 * Props for the FieldFilter component
 */
type FieldFilterProps = {
  displayName?: string;
  dataCount?: number | null;
  filteredDataCount?: number;
  filters?: Filter[];
  activeField?: Field | null;
  activeFieldState?: FieldFilterState;
  fieldTree?: FieldTreeNode;
  onFiltersChange?: (filters: Filter[]) => void;
  onMemberSort?: (sortBy: string) => void;
  onMemberSearch?: (searchTerm: string) => void;
  onRangeScaleChange?: (scale: string) => void;
  hideFieldPanel?: boolean;
  selectByDefault: boolean;
};

/**
 * Main interactive filtering interface for a particular field.
 */
function FieldFilter(props: FieldFilterProps) {
  let className = cx('', props.hideFieldPanel && 'fullWidth');

  return (
    <div className={className}>
      {!props.activeField ? (
        <EmptyField displayName={props.displayName || ''} />
      ) : (
        <React.Fragment>
          <h3>
            {props.activeField.display + ' '}
            {!props.activeFieldState ||
              (props.activeFieldState.loading && (
                <React.Fragment>
                  <Icon fa="circle-o-notch" className="fa-spin" />
                  <span className="sr-only">Loading...</span>
                </React.Fragment>
              ))}
          </h3>
          {props.activeField.description && (
            <div className="field-description">
              {props.activeField.description}
            </div>
          )}
          {props.activeField.variableName && (
            <div className="field-variableName">
              (<i>Provider label:</i> {props.activeField.variableName})
            </div>
          )}
          {props.activeFieldState && props.activeFieldState.errorMessage ? (
            <div style={{ color: 'darkred' }}>
              {props.activeFieldState.errorMessage}
            </div>
          ) : (props.activeFieldState &&
              props.activeFieldState.summary == null &&
              props.activeFieldState.leafSummaries == null) ||
            props.dataCount == null ? null : isMulti(props.activeField) ? (
            <MultiFieldFilter
              activeField={props.activeField}
              activeFieldState={
                {
                  ...props.activeFieldState,
                  leafSummaries: props.activeFieldState!.leafSummaries!,
                } as {
                  leafSummaries: OntologyTermSummary[];
                  searchTerm?: string;
                  sort?: { columnKey: string; direction: 'asc' | 'desc' };
                  [key: string]: any;
                }
              }
              filters={props.filters ?? []}
              fieldTree={props.fieldTree!}
              displayName={props.displayName ?? 'Items'}
              dataCount={props.dataCount}
              selectByDefault={props.selectByDefault}
              onFiltersChange={props.onFiltersChange ?? (() => {})}
              onMemberSort={(field, sort) => {
                if (props.onMemberSort) {
                  props.onMemberSort(sort.columnKey);
                }
              }}
              onMemberSearch={(field, searchTerm) => {
                if (props.onMemberSearch) {
                  props.onMemberSearch(searchTerm);
                }
              }}
            />
          ) : (
            <SingleFieldFilter
              activeField={props.activeField}
              activeFieldState={
                props.activeFieldState
                  ? ({
                      ...props.activeFieldState,
                      summary: props.activeFieldState.summary!,
                    } as { summary: OntologyTermSummary; [key: string]: any })
                  : null
              }
              filters={props.filters ?? []}
              onFiltersChange={props.onFiltersChange ?? (() => {})}
              selectByDefault={props.selectByDefault}
              displayName={props.displayName}
              dataCount={props.dataCount}
              filteredDataCount={props.filteredDataCount}
              onRangeScaleChange={props.onRangeScaleChange}
            />
          )}
        </React.Fragment>
      )}
    </div>
  );
}

FieldFilter.defaultProps = {
  displayName: 'Items',
};

export default FieldFilter;
