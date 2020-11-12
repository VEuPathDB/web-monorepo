import React from 'react';
import { memoize } from 'lodash';
import { IconAlt, Loading, ServerSideAttributeFilter } from '@veupathdb/wdk-client/lib/Components';
import { getOntologyTree } from '@veupathdb/wdk-client/lib/Views/Question/Params/FilterParamNew/FilterParamUtils';
import { paramPropTypes } from '../util/paramUtil';

/**
 * FilterParamNew component, with some implementation details specific to a
 * wizard interface.
 */
export default class FilterParamNew extends React.PureComponent {
  constructor(props) {
    super(props);
    this._getFiltersFromValue = memoize(this._getFiltersFromValue);
    this._getFieldMap = memoize(this._getFieldMap);
    this._getFieldTree = memoize(this._getFieldTree);
    this._handleActiveFieldChange = this._handleActiveFieldChange.bind(this);
    this._handleFieldCountUpdateRequest = this._handleFieldCountUpdateRequest.bind(this);
    this._handleFilterChange = this._handleFilterChange.bind(this);
    this._handleMemberSort = this._handleMemberSort.bind(this);
    this._handleMemberSearch = this._handleMemberSearch.bind(this);
    this._handleRangeScaleChange = this._handleRangeScaleChange.bind(this);
  }

  _getFiltersFromValue(value) {
    let { filters = [] } = JSON.parse(value);
    return filters;
  }

  _getFieldMap(ontology) {
    return new Map(ontology.map(o => [ o.term, o ]));
  }

  _getFieldTree(param) {
    return getOntologyTree(param);
  }

  _handleActiveFieldChange(term) {
    let filters = this._getFiltersFromValue(this.props.value);
    this.props.onOntologyTermSelect(this.props.param, filters, term);
  }

  _handleFieldCountUpdateRequest(term) {
    this.props.onOntologyTermSummaryUpdate(this.props.param.name, term);
  }

  _handleFilterChange(filters) {
    const fieldMap = this._getFieldMap(this.props.param.ontology);
    const filtersWithDisplay = filters.map(filter => {
      const field = fieldMap.get(filter.field);
      const fieldDisplayName = field ? field.display : undefined;
      return { ...filter, fieldDisplayName };
    });
    this.props.onParamValueChange(this.props.param, JSON.stringify({ filters: filtersWithDisplay }));
  }

  _handleMemberSort(field, sort) {
    this.props.onOntologyTermSort(this.props.param, field.term, sort);
  }

  _handleMemberSearch(field, searchTerm) {
    this.props.onOntologyTermSearch(this.props.param, field.term, searchTerm);
  }

  _handleRangeScaleChange(field, state) {
    let newState = Object.assign({}, this.props.uiState, {
      fieldStates: Object.assign({}, this.props.uiState.fieldStates, {
        [field.term]: { ...this.props.uiState.fieldStates[field.term], ...state }
      })
    });
    this.props.onParamStateChange(this.props.param, newState);
  }

  render() {
    let { param, uiState } = this.props;
    let displayName = param.filterDataTypeDisplayName || param.displayName;

    if (this.props.uiState.ontology.length === 0) {
      return (
        <div style={{ fontSize: '1.4em', textAlign: 'center', margin: '1em' }}>
          <IconAlt fa="warning"/> Data is not available for <strong>{displayName}</strong>. Previous selections may need to be adjusted to see data.
        </div>
      )
    }

    let fields = this._getFieldMap(uiState.ontology);
    let filters = this._getFiltersFromValue(this.props.value);
    let activeField = fields.get(uiState.activeOntologyTerm);
    let activeFieldState = uiState.fieldStates[uiState.activeOntologyTerm];

    return (
      <div className="filter-param">
        {uiState.errorMessage && <pre style={{color: 'red'}}>{uiState.errorMessage}</pre>}
        {uiState.loading && <Loading/>}
        <ServerSideAttributeFilter
          autoFocus={this.props.autoFocus}
          displayName={displayName}

          fieldTree={this._getFieldTree(param)}
          filters={filters}
          dataCount={uiState.unfilteredCount}
          filteredDataCount={uiState.filteredCount}
          valuesMap={param.values}

          activeField={activeField}
          activeFieldState={activeFieldState}

          hideFilterPanel={uiState.hideFilterPanel}
          hideFieldPanel={uiState.hideFieldPanel}

          onFiltersChange={this._handleFilterChange}
          onActiveFieldChange={this._handleActiveFieldChange}
          onFieldCountUpdateRequest={this._handleFieldCountUpdateRequest}
          onMemberSort={this._handleMemberSort}
          onMemberSearch={this._handleMemberSearch}
          onRangeScaleChange={this._handleRangeScaleChange}
          hideGlobalCounts={true}
        />
      </div>
    )
  }
}

FilterParamNew.propTypes = paramPropTypes;
