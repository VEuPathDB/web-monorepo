import React from 'react';
import { safeHtml } from 'wdk-client/Utils/ComponentUtils';
import MultiSelect from 'wdk-client/Components/InputControls/MultiSelect';
import SingleSelect from 'wdk-client/Components/InputControls/SingleSelect';
import CheckboxList from 'wdk-client/Components/InputControls/CheckboxList';
import RadioList from 'wdk-client/Components/InputControls/RadioList';
import TreeBoxEnumParamComponent, { State, reduce } from 'wdk-client/Views/Question/Params/TreeBoxEnumParam';
import TypeAheadEnumParamComponent from 'wdk-client/Views/Question/Params/TypeAheadEnumParam';
import { EnumParam, Parameter, TreeBoxEnumParam } from 'wdk-client/Utils/WdkModel';
import { Context, Props, createParamModule } from 'wdk-client/Views/Question/Params/Utils';
import { isEnumParam, isValidEnumJson, isMultiPick, toMultiValueString, toMultiValueArray } from 'wdk-client/Views/Question/Params/EnumParamUtils';

// TODO: Move TreeBox state into TreeBoxEnumParam component
type EnumParamProps = Props<EnumParam, State>;

export default createParamModule({
  isType,
  isParamValueValid,
  Component: EnumParamComponent,
  reduce: reduce
});

function isParamValueValid(context: Context<EnumParam>) {
  let value = context.paramValues[context.parameter.name];
  return typeof value === 'string'  &&
    (context.parameter.type !== 'multi-pick-vocabulary' || isValidEnumJson(value));
}

function isType(parameter: Parameter): parameter is EnumParam {
  return isEnumParam(parameter);
}

function EnumParamComponent(props: EnumParamProps) {
  const { onParamValueChange, parameter, value, ctx: { searchName } } = props;
  switch(parameter.displayType) {
    case 'typeAhead':
    case 'treeBox':
      // handle typeAhead and treeBox displays
      let selectedValues = isMultiPick(parameter) ? toMultiValueArray(value) :
          value == null || value === "" ? [] : [ value ];
      let transformValue = isMultiPick(parameter) ?
        (newValue: string[]) => toMultiValueString(newValue) :
        (newValue: string[]) => newValue.length == 0 ? "" : newValue[0];
      let onChange = (newValue: string[]) => { onParamValueChange(transformValue(newValue)); };
      switch(parameter.displayType) {
        case 'typeAhead':
          return (
            <TypeAheadEnumParamComponent
              parameter={parameter}
              selectedValues={selectedValues}
              onChange={onChange}
            />
          );
        case 'treeBox':
          return (
            <TreeBoxEnumParamComponent
              parameter={parameter}
              selectedValues={selectedValues}
              onChange={onChange}
              uiState={props.uiState}
              context={props.ctx as Context<TreeBoxEnumParam>}
              dispatch={props.dispatch}
            />
          );
      }
    case 'select':
    case 'checkBox':
      let parameterKey = `${searchName}/${parameter.name}`;

      // handle select and checkBox displays
      let multiValueChange = (value: string[]) => onParamValueChange(toMultiValueString(value));
      let valueRequired = !parameter.allowEmptyValue;
      switch(parameter.displayType) {
        case 'select':
          let selectOptions = parameter.vocabulary.map(([value, display]) => ({ value, display }));
          return isMultiPick(parameter)
            ? <MultiSelect
                items={selectOptions}
                value={toMultiValueArray(value)}
                onChange={multiValueChange}
                required={valueRequired}
                name={parameterKey}
              />
            : <SingleSelect
                items={selectOptions}
                value={value}
                onChange={onParamValueChange}
                required={valueRequired}
                name={parameterKey}
              />
        case 'checkBox':
          let checkboxOptions = parameter.vocabulary.map(([value, display]) => ({ value, display: safeHtml(display) }));
          return isMultiPick(parameter)
            ? <CheckboxList
                items={checkboxOptions}
                value={toMultiValueArray(value)}
                onChange={multiValueChange}
                name={parameterKey}
              />
            : <RadioList
                items={checkboxOptions}
                value={value}
                onChange={onParamValueChange}
                required={valueRequired}
                name={parameterKey}
              />
      }
    default:
      throw new Error("Unsupported enum parameter passed.");
  }
}
