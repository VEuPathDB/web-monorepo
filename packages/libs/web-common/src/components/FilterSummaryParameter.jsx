import React from 'react';

import { IconAlt as Icon, } from '@veupathdb/wdk-client/lib/Components';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { getFilterValueDisplay } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/AttributeFilterUtils';

import { makeQuestionWizardClassName as makeClassName } from '../util/classNames';

export default wrappable(FilterSummaryParameter);

function FilterSummaryParameter(props) {
  return props.parameter.type === 'filter'
    ? <FilterParamSummary {...props} />
    : (
      <div className={makeClassName('ParameterSummary')}>
        <strong>
          <button type="button" className="wdk-Link" onClick={() => {
            navigateToGroup(props);
          }}>
            {props.parameter.displayName}
          </button>
        </strong> {prettyPrint(props.parameter, props.paramValue)}
      </div>
    );
}

function FilterParamSummary(props) {
  const { filters } = JSON.parse(props.paramValue);
  if (filters == null || filters.length === 0) {
    return null;
  }

  return (
    <div className="filter-param">
      <ul className="filter-items" style={{ fontSize: '1em' }}>
        {Seq.from(filters)
          .map(filter => {
            if (filter.type === 'multiFilter') {
              const field = props.parameter.ontology.find(field => field.term === filter.field);
              return (
                <li key={filter.field} className="multiFilter">
                  <sup className="multiFilter-operation">{filter.value.operation === 'union' ? 'ANY' : 'ALL'} {field.display} filters</sup>
                  <ul className="filter-items">
                    {filter.value.filters.map(leafFilter => (
                      <li key={leafFilter.field}>
                        <FilterParamFilter filter={leafFilter} containerFilter={filter} filters={filters} {...props} />
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }
            return (
              <li key={filter.field}>
                <FilterParamFilter filter={filter} filters={filters} {...props} />
              </li>
            );
          })}
      </ul>
    </div>
  );
}

function FilterParamFilter(props) {
  const { containerFilter, parameterEventHandlers, filter, filters, parameter } = props;
  const field = parameter.ontology.find(field => field.term === filter.field)
  return (
    <div key={parameter.name + '::' + field.term} className={makeClassName('Chiclet')} >
      <button
        type="button"
        title="Clear selection"
        className={makeClassName('ChicletTitle') + ' wdk-Link'}
        onClick={() => {
          navigateToGroup(props);
          parameterEventHandlers.onOntologyTermSelect(
            parameter,
            filters,
            containerFilter ? containerFilter.field : filter.field
          );
        }}
      >
        {field.display}
      </button>
      &nbsp;
      <button
        type="button"
        className={makeClassName('RemoveFilterButton')}
        onClick={() => parameterEventHandlers.onParamValueChange(props.parameter, JSON.stringify({
          filters: removeFilter(filters, filter, containerFilter)
        }))}
      >
        <Icon fa="close"/>
      </button>
      <hr/>
      <div>{getFilterValueDisplay(filter)}</div>
    </div>
  );
}

function removeFilter(filters, filter, containerFilter) {
  if (containerFilter == null) return filters.filter(f => f !== filter);

  return Seq.from(filters)
    .flatMap(f => {
      if (f !== containerFilter) return [f];
      const subFilters = f.value.filters.filter(sf => sf !== filter);
      // remove multi filter if it does not have any more subfilters
      if (subFilters.length === 0) return [];
      return [{ ...f, value: { ...f.value, filters: subFilters } }];
    })
    .toArray()
}

function prettyPrint(param, value) {
  switch(param.type) {
    case 'DateRangeParam':
    case 'NumberRangeParam':
      return prettyPrintRange(JSON.parse(value));
    default:
      return value;
  }
}

function prettyPrintRange(range) {
  return `from ${range.min} to ${range.max}`;
}

function navigateToGroup(props) {
  props.wizardEventHandlers.onGroupSelect(props.group);
  if (!props.wizardState.filterPopupState.pinned) {
    props.wizardEventHandlers.onFilterPopupVisibilityChange(false);
  }
}
