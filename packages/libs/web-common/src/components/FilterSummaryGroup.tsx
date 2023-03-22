import React from 'react';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { IconAlt as Icon } from '@veupathdb/wdk-client/lib/Components';

import { makeQuestionWizardClassName as makeClassName } from '../util/classNames';

import FilterSummaryParameter from './FilterSummaryParameter';

import {
  Parameter,
  ParameterGroup,
  ParameterValue,
  ParameterValues,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { FilterField } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';
import { WizardState } from 'ebrc-client/util/WizardTypes';

type Props = {
  groupDisplayName: string,
  groupParameters: Parameter[],
  paramValues: ParameterValues,
  wizardState: WizardState,
  defaultParamValues: ParameterValues,
  onParamValueChange: (parameter: Parameter, newParamValue: ParameterValue) => any,
  onSelectGroup: () => any,
  onSelectFilterParamField: (parameter: Parameter, field: FilterField) => any,
}

function drawFsp(props: Props, a: [Parameter, ParameterValue]){
  const [parameter, paramValue] = a;
  return (
    <FilterSummaryParameter
        key={parameter.name}
        paramValue={paramValue}
        parameter={parameter}
        onParamValueChange={(v:ParameterValue) => props.onParamValueChange(parameter,v)}
        onSelectGroup={props.onSelectGroup}
        onSelectFilterParamField={(f: FilterField) => props.onSelectFilterParamField(parameter,f)}
      />
  );
}

function FilterSummaryGroup(props: Props) {
  const fpns: [Parameter, ParameterValue][] =
    props.groupParameters
    .filter(parameter => parameter.isVisible)
    .filter(parameter => parameter.type === 'filter')
    .map(parameter => [parameter, props.paramValues[parameter.name] as ParameterValue])

  const others: [Parameter, ParameterValue][] =
    props.groupParameters
    .filter(parameter => parameter.isVisible)
    .filter(parameter => parameter.type !== 'filter')
    .map(parameter => [parameter, props.paramValues[parameter.name] as ParameterValue])

  const noFpnsToShow =
    fpns.length === 0 ||
    fpns.every(([parameter,paramValue]) =>
      props.defaultParamValues[parameter.name] == paramValue);

  const noOthersToShow =
    others.length === 0 ||
    others.every(([parameter,paramValue]) =>
      props.defaultParamValues[parameter.name] == paramValue);


  return noFpnsToShow && noOthersToShow ? null : (
    <>
    <div className={makeClassName('FilterSummaryGroup')}>
      <h4>
        <Icon fa="filter" className={makeClassName('GroupFilterIcon')} />
        {props.groupDisplayName}
      </h4>
    </div>
    { others.length === 0 ? null :
      <div key="others">
        {
          others.map( a => drawFsp(props, a))
        }
      </div>
    }
    <br/>
    <React.Fragment key="fpns">
      {
        fpns.map( a => drawFsp(props, a))
      }
    </React.Fragment>
    </>
  );
}
export default wrappable(FilterSummaryGroup);
