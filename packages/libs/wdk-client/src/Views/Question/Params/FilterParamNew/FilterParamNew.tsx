import _ServerSideAttributeFilter from '../../../../Components/AttributeFilter/ServerSideAttributeFilter';
import {
  Field,
  Filter,
  MemberFilter,
} from '../../../../Components/AttributeFilter/Types';
import {
  isRange,
  isMulti,
} from '../../../../Components/AttributeFilter/AttributeFilterUtils';
import Loading from '../../../../Components/Loading/Loading';
import { memoize } from 'lodash';
import React from 'react';
import { FilterParamNew as TFilterParamNew } from '../../../../Utils/WdkModel';
import { Props as ParamProps } from '../../../../Views/Question/Params/Utils';
import {
  setActiveField,
  updateFieldState,
  updateFilters,
} from '../../../../Actions/FilterParamActions';
import '../../../../Views/Question/Params/FilterParamNew/FilterParam.css';
import {
  MemberFieldState,
  RangeFieldState,
  MultiFieldState,
  State,
} from '../../../../Views/Question/Params/FilterParamNew/State';
import {
  getFilterFields,
  sortDistribution,
  sortMultiFieldSummary,
  getOntologyTree,
} from '../../../../Views/Question/Params/FilterParamNew/FilterParamUtils';

const ServerSideAttributeFilter: any = _ServerSideAttributeFilter;
type FieldState = State['fieldStates'][string];

type Props = ParamProps<TFilterParamNew, State>;

export function render(props: Props) {
  return <FilterParamNew {...props} />;
}

/**
 * FilterParamNew component
 */
export default class FilterParamNew extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this._getFiltersFromValue = memoize(this._getFiltersFromValue);
    this._handleActiveFieldChange = this._handleActiveFieldChange.bind(this);
    this._handleFilterChange = this._handleFilterChange.bind(this);
    this._handleMemberSort = this._handleMemberSort.bind(this);
    this._handleMemberChangeRowsPerPage =
      this._handleMemberChangeRowsPerPage.bind(this);
    this._handleMemberChangeCurrentPage =
      this._handleMemberChangeCurrentPage.bind(this);
    this._handleMemberSearch = this._handleMemberSearch.bind(this);
    this._handleRangeScaleChange = this._handleRangeScaleChange.bind(this);
  }

  _getFieldTree = memoize(getOntologyTree);

  _getFieldMap = memoize(
    (parameter: Props['parameter']) =>
      new Map(parameter.ontology.map((o) => [o.term, o] as [string, Field]))
  );

  _countLeaves = memoize(
    (parameter: Props['parameter']) =>
      getFilterFields(parameter).toArray().length
  );

  _getFiltersFromValue(value: Props['value']) {
    let { filters = [] } = JSON.parse(value);
    return filters as Filter[];
  }

  _handleActiveFieldChange(term: string) {
    this.props.dispatch(
      setActiveField({ ...this.props.ctx, activeField: term })
    );
  }

  _handleFilterChange(filters: Filter[]) {
    const {
      ctx,
      dispatch,
      onParamValueChange,
      value,
      uiState: { activeOntologyTerm: activeField, fieldStates },
    } = this.props;
    const prevFilters = this._getFiltersFromValue(this.props.value);

    const fieldMap = this._getFieldMap(this.props.parameter);

    const filtersWithDisplay = filters.map((filter) => {
      const field = fieldMap.get(filter.field);
      const fieldDisplayName = field ? field.display : undefined;
      return { ...filter, fieldDisplayName };
    });

    onParamValueChange(JSON.stringify({ filters: filtersWithDisplay }));
    dispatch(updateFilters({ ...ctx, prevFilters, filters }));
  }

  _handleMemberSort(
    field: Field,
    sort2: MemberFieldState['sort'] | MultiFieldState['sort']
  ) {
    if (isRange(field)) {
      throw new Error(`Cannot sort a range field.`);
    }
    if (isMulti(field)) {
      const sort = sort2 as MultiFieldState['sort'];
      const filters = this._getFiltersFromValue(this.props.value);
      const filter = filters.find(
        (filter) => filter.field === field.term
      ) as MemberFilter;
      const fieldState = this.props.uiState.fieldStates[
        field.term
      ] as MultiFieldState;

      this.props.dispatch(
        updateFieldState({
          ...this.props.ctx,
          field: field.term,
          fieldState: {
            ...fieldState,
            sort,
            leafSummaries: sortMultiFieldSummary(
              fieldState.leafSummaries,
              this.props.parameter.ontology,
              sort
            ),
            currentPage: 1,
          },
        })
      );
    } else {
      const sort = sort2 as MemberFieldState['sort'];
      const filters = this._getFiltersFromValue(this.props.value);
      const filter = filters.find(
        (filter) => filter.field === field.term
      ) as MemberFilter;
      const fieldState = this.props.uiState.fieldStates[
        field.term
      ] as MemberFieldState;

      this.props.dispatch(
        updateFieldState({
          ...this.props.ctx,
          field: field.term,
          fieldState: {
            ...fieldState,
            sort,
            summary: fieldState.summary && {
              ...fieldState.summary,
              valueCounts: sortDistribution(
                fieldState.summary.valueCounts,
                sort,
                filter
              ),
            },
            currentPage: 1,
          },
        })
      );
    }
  }

  _handleMemberChangeRowsPerPage(field: Field, newRowsPerPage: number) {
    if (isRange(field)) {
      throw new Error(`Cannot paginate a range field.`);
    }

    const fieldState = this.props.uiState.fieldStates[
      field.term
    ] as MemberFieldState;

    const { currentPage, rowsPerPage } = fieldState;

    // try preserve what the user is looking at
    // example: if we're on page 11 and make the page size twice as large, we should now be on page 6
    const rowsBeforeFirstRowOnCurrentPage = (currentPage - 1) * rowsPerPage;
    const numFullPagesContainingRowsBeforeFirstRowOnCurrentPage = Math.floor(
      rowsBeforeFirstRowOnCurrentPage / newRowsPerPage
    );
    const newCurrentPage =
      1 + numFullPagesContainingRowsBeforeFirstRowOnCurrentPage;

    this.props.dispatch(
      updateFieldState({
        ...this.props.ctx,
        field: field.term,
        fieldState: {
          ...fieldState,
          rowsPerPage: newRowsPerPage,
          currentPage: newCurrentPage,
        },
      })
    );
  }

  _handleMemberChangeCurrentPage(field: Field, currentPage: number) {
    if (isRange(field)) {
      throw new Error(`Cannot paginate a range field.`);
    }

    const fieldState = this.props.uiState.fieldStates[
      field.term
    ] as MemberFieldState;

    this.props.dispatch(
      updateFieldState({
        ...this.props.ctx,
        field: field.term,
        fieldState: {
          ...fieldState,
          currentPage,
        },
      })
    );
  }

  _handleMemberSearch(field: Field, searchTerm: string) {
    const fieldState = this.props.uiState.fieldStates[
      field.term
    ] as MemberFieldState;
    this.props.dispatch(
      updateFieldState({
        ...this.props.ctx,
        field: field.term,
        fieldState: { ...fieldState, searchTerm, currentPage: 1 },
      })
    );
  }

  _handleRangeScaleChange(field: Field, fieldState: RangeFieldState) {
    this.props.dispatch(
      updateFieldState({
        ...this.props.ctx,
        field: field.term,
        fieldState: fieldState,
      })
    );
  }

  render() {
    let { parameter, uiConfig, uiState } = this.props;
    let filters = this._getFiltersFromValue(this.props.value);
    let fields = this._getFieldMap(parameter);
    let activeFieldState =
      uiState.activeOntologyTerm == null
        ? undefined
        : (uiState.fieldStates[uiState.activeOntologyTerm] as FieldState);
    let numLeaves = this._countLeaves(parameter);

    return (
      <div className="filter-param" onKeyPress={preventDefaultOnEnter}>
        {uiState.errorMessage && (
          <pre style={{ color: 'red' }}>{uiState.errorMessage}</pre>
        )}
        {uiState.loading && <Loading />}
        <ServerSideAttributeFilter
          displayName={
            parameter.filterDataTypeDisplayName || parameter.displayName
          }
          activeField={
            uiState.activeOntologyTerm && fields.get(uiState.activeOntologyTerm)
          }
          activeFieldState={activeFieldState}
          fieldTree={getOntologyTree(parameter)}
          filters={filters}
          valuesMap={parameter.values}
          dataCount={uiState.unfilteredCount}
          filteredDataCount={uiState.filteredCount}
          loadingFilteredCount={uiState.loadingFilteredCount}
          hideGlobalCounts={uiConfig?.hideGlobalCounts}
          hideFilterPanel={numLeaves === 1}
          hideFieldPanel={numLeaves === 1}
          minSelectedCount={parameter.minSelectedCount}
          onFiltersChange={this._handleFilterChange}
          onActiveFieldChange={this._handleActiveFieldChange}
          onMemberSort={this._handleMemberSort}
          onMemberChangeCurrentPage={this._handleMemberChangeCurrentPage}
          onMemberChangeRowsPerPage={this._handleMemberChangeRowsPerPage}
          onMemberSearch={this._handleMemberSearch}
          onRangeScaleChange={this._handleRangeScaleChange}
        />
      </div>
    );
  }
}

function preventDefaultOnEnter(event: React.KeyboardEvent) {
  if (event.target instanceof HTMLInputElement && event.key === 'Enter') {
    event.preventDefault();
  }
}
