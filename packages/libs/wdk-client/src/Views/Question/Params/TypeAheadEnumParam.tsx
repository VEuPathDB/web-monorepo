import React, { useMemo, useState, useCallback } from 'react';
import Select from 'react-select';
import { TypeAheadEnumParam, Parameter } from 'wdk-client/Utils/WdkModel';
import { Props, createParamModule } from 'wdk-client/Views/Question/Params/Utils';
import { isEnumParam } from 'wdk-client/Views/Question/Params/EnumParamUtils';
import { ValueType, InputActionMeta } from 'react-select/src/types';

function isType(parameter: Parameter): parameter is TypeAheadEnumParam {
  return isEnumParam(parameter) && parameter.displayType === 'typeAhead';
}

function isParamValueValid() {
  return true;
}

type Option = {
  value: string,
  label: string
};

export const TypeAheadEnumParamComponent = (props: Props<TypeAheadEnumParam>) => {
  const vocabularyByValue = useMemo(
    () => props.parameter.vocabulary.reduce(
        (memo, entry) => ({
          ...memo,
          [entry[0]]: entry
        }),
        {} as Record<string, [string, string, null]>
      ),
    [ props.parameter.vocabulary ]
  );

  const options = useMemo(
    () => props.parameter.vocabulary.map(([ value, label ]) => ({ value, label })),
    [ props.parameter.vocabulary ]
  );

  const [ searchTerm, setSearchTerm ] = useState('');

  const selection = useMemo(
    () => {
      const stringValueArray = JSON.parse(props.value) as string[];
      return stringValueArray.map(
        value => ({ value, label: vocabularyByValue[value][1] })
      );
    },
    [ props.value, props.parameter.multiPick ]
  );

  const onInputChange = useCallback((inputValue: string, { action }: InputActionMeta) => {
    if (action === 'input-change') {
      setSearchTerm(inputValue);
    }
  }, []);

  const onChange = useCallback((newSelection: ValueType<Option>) => {
    const newSelectionArray = newSelection == null
      ? []
      : Array.isArray(newSelection)
      ? (newSelection as Option[])
      : [newSelection as Option];

    props.onParamValueChange(JSON.stringify(newSelectionArray.map(({ value }) => value)));
    setSearchTerm('');
  }, [ props.onParamValueChange ]);

  const filterOption = useCallback(
    (option: Option, inputValue: string) =>
      (inputValue.length >= 3 || option.label.length < 3) &&
      option.label.toLowerCase().includes(inputValue.toLowerCase()),
    []
  );

  const noOptionsMessage = useCallback(
    ({ inputValue }: { inputValue: string } ) =>
      inputValue.length === 0
        ? 'Please input at least 3 characters'
        : inputValue.length === 1
        ? 'Please input at least 2 more characters'
        : inputValue.length === 2
        ? 'Please input at least 1 more character'
        : 'No matches found',
    []
  );

  return (
    <Select<Option>
      isMulti={props.parameter.multiPick}
      isSearchable
      options={options}
      filterOption={filterOption}
      noOptionsMessage={noOptionsMessage}
      value={selection}
      onChange={onChange}
      inputValue={searchTerm}
      onInputChange={onInputChange}
    />
  );
};

export default createParamModule({
  isType,
  isParamValueValid,
  Component: TypeAheadEnumParamComponent
});
