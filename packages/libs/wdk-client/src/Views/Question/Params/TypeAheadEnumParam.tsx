import React, { useMemo, useState, useCallback } from 'react';
import Select from 'react-select';
import { TypeAheadEnumParam } from 'wdk-client/Utils/WdkModel';
import { Props } from 'wdk-client/Views/Question/Params/Utils';
import { ValueType, InputActionMeta } from 'react-select/src/types';
import { isMultiPick } from 'wdk-client/Views/Question/Params/EnumParamUtils';
import { safeHtml } from 'wdk-client/Utils/ComponentUtils';

type TypeAheadParamProps = {
  parameter: TypeAheadEnumParam;
  selectedValues: string[];
  onChange: (newValue: string[]) => void;
}

type Option = {
  value: string,
  label: string
};

export const TypeAheadEnumParamComponent = (props: TypeAheadParamProps) => {
  const vocabularyByValue = useMemo(
    () => props.parameter.vocabulary.reduce(
        (memo, entry) => {
          memo[entry[0]] = entry;
          return memo;
        },
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
      return props.selectedValues.map(
        value => ({ value, label: vocabularyByValue[value][1] })
      );
    },
    [ props.selectedValues, isMultiPick(props.parameter) ]
  );

  const onInputChange = useCallback((inputValue: string, { action }: InputActionMeta) => {
    if (action === 'input-change') {
      setSearchTerm(inputValue);
    }
  }, []);

  const onChange = useCallback((newSelection: ValueType<Option, any>) => {
    const newSelectionArray = newSelection == null
      ? []
      : Array.isArray(newSelection)
      ? (newSelection as Option[])
      : [newSelection as Option];

    props.onChange(newSelectionArray.map(({ value }) => value));
    setSearchTerm('');
  }, [ props.onChange ]);

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
    <Select<Option, any>
      isMulti={isMultiPick(props.parameter)}
      isSearchable
      options={options}
      filterOption={filterOption}
      noOptionsMessage={noOptionsMessage}
      value={selection}
      onChange={onChange}
      inputValue={searchTerm}
      onInputChange={onInputChange}
      formatOptionLabel={option => safeHtml(option.label)}
    />
  );
};

export default TypeAheadEnumParamComponent;
