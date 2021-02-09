import React from 'react';

import { IconAlt as Icon, } from '@veupathdb/wdk-client/lib/Components';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { getFilterValueDisplay } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/AttributeFilterUtils';

import { makeQuestionWizardClassName as makeClassName } from '../util/classNames';
import { Parameter, FilterParamNew, ParameterValue} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Filter, FilterField, MultiField, FilterValue, MultiFilterValue, RangeValue } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';

export default wrappable(FilterSummaryParameter);

type Props = {
  parameter: Parameter,
  paramValue: ParameterValue,
  onParamValueChange: (newParamValue: ParameterValue) => any,
  onSelectGroup: () => any,
  onSelectFilterParamField: (field: FilterField) => any,
};
type FilterProps = Props & {
  parameter: FilterParamNew
}
function FilterSummaryParameter(props: Props) {
  return props.parameter.type === 'filter'
    ? <FilterParamSummary {...props as FilterProps} />
    : (
      <div className={makeClassName('ParameterSummary')}>
        <strong>
          <button type="button" className="wdk-Link" onClick={props.onSelectGroup}>
            {props.parameter.displayName}
          </button>
        </strong> {prettyPrint(props.parameter, props.paramValue)}
      </div>
    );
}

function makeRemoveFilter(filters: Filter[], onParamValueChange: (newParamValue: ParameterValue) => any, filterToRemove: Filter ){
  const newFilters: Filter[] = filters.filter(f => f !== filterToRemove);
  return () => {
    onParamValueChange(JSON.stringify({
      filters: newFilters
    }));
  }
}

function makeRemoveItemFromMultiFilter(filters: Filter[], onParamValueChange: (newParamValue: ParameterValue) => any, containerFilter: Filter, filterToRemove: Filter ){
  const newFilters: Filter[] = Seq.from(filters)
    .flatMap(f => {
      if (f !== containerFilter) return [f];
      const multiFilterValue = f.value as MultiFilterValue; // required of the caller: containerFilter is a multifilter field
      const subFilters = multiFilterValue.filters.filter(sf => sf !== filterToRemove);
      // remove multi filter if it does not have any more subfilters
      if (subFilters.length === 0) return [];
      return [{ ...f, value: { ...multiFilterValue, filters: subFilters } }] as Filter[]; // this cast is a bit dubious
    })
    .toArray();

  return () => {
    onParamValueChange(JSON.stringify({
      filters: newFilters
    }));
  }
}

function FilterParamSummary(props: FilterProps) {
  const filters = (JSON.parse(props.paramValue).filters as Filter[]);

  if (filters == null || filters.length === 0) {
    return null;
  }

  return (
    <div className="filter-param">
      <ul className="filter-items" style={{ fontSize: '1em' }}>
        {Seq.from(filters)
          .map(filter => {
            const field = props.parameter.ontology.find(field => field.term === filter.field);
            if (field === undefined){
              return;
            }
            const filterField = field as FilterField;
            const onClickNavigate = () => {
               props.onSelectFilterParamField(filterField);
            };
            if (filter.type === 'multiFilter') {
              const multiField = filterField as MultiField;
              return (
                <li key={filter.field} className="multiFilter">
                  <sup className="multiFilter-operation">{filter.value.operation === 'union' ? 'ANY' : 'ALL'} {field.display} filters</sup>
                  <ul className="filter-items">
                    {filter.value.filters.map(leafFilter => (
                      <li key={leafFilter.field}>
                        <FilterParamFilter
                           parameter={props.parameter}
                           filter={leafFilter}
                           onClickNavigate={onClickNavigate}
                           onClickClear={makeRemoveItemFromMultiFilter(filters, props.onParamValueChange, filter, leafFilter)} />
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }
            return (
              <li key={filter.field}>
                <FilterParamFilter
                   parameter={props.parameter}
                   filter={filter}
                   onClickNavigate={onClickNavigate}
                   onClickClear={makeRemoveFilter(filters, props.onParamValueChange, filter)} />
              </li>
            );
          })}
      </ul>
    </div>
  );
}
type FilterParamFilterProps = {
  parameter: FilterParamNew,
  filter: Filter,
  onClickNavigate: () => any,
  onClickClear: () => any
};

function FilterParamFilter(props: FilterParamFilterProps) {
  const { parameter, filter, onClickNavigate, onClickClear } = props;
  const field = parameter.ontology.find(field => field.term === filter.field)
  return field === undefined ? null : (
    <div key={parameter.name + '::' + field.term} className={makeClassName('Chiclet')} >
      <button
        type="button"
        className={makeClassName('ChicletTitle') + ' wdk-Link'}
        onClick={onClickNavigate}
      >
        {field.display}
      </button>
      &nbsp;
      <button
        type="button"
        title="Clear selection"
        className={makeClassName('RemoveFilterButton')}
        onClick={onClickClear}
      >
        <Icon fa="close"/>
      </button>
      <hr/>
      <div>{getFilterValueDisplay(filter)}</div>
    </div>
  );
}

function prettyPrint(param: Parameter, value: ParameterValue) {
  switch(param.type) {
    case 'date-range':
    case 'number-range':
      return prettyPrintRange(JSON.parse(value));
    default:
      return value;
  }
}

function prettyPrintRange<T>(range: RangeValue<T>) {
  return `from ${range.min} to ${range.max}`;
}
