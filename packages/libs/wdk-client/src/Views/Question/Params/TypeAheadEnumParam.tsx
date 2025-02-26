import React, { useMemo, useCallback } from 'react';
import Select from 'react-select';
import { TypeAheadEnumParam } from '../../../Utils/WdkModel';
import { ValueType } from 'react-select/src/types';
import { isMultiPick } from '../../../Views/Question/Params/EnumParamUtils';
import { safeHtml } from '../../../Utils/ComponentUtils';

type TypeAheadParamProps = {
  parameter: TypeAheadEnumParam;
  selectedValues: string[];
  onChange: (newValue: string[]) => void;
};

type Option = {
  value: string;
  label: string;
};

export const TypeAheadEnumParamComponent = (props: TypeAheadParamProps) => {
  const vocabularyByValue = useMemo(
    () =>
      props.parameter.vocabulary.reduce((memo, entry) => {
        memo[entry[0]] = entry;
        return memo;
      }, {} as Record<string, [string, string, null]>),
    [props.parameter.vocabulary]
  );

  const options = useMemo(
    () =>
      props.parameter.vocabulary.map(([value, label]) => ({ value, label })),
    [props.parameter.vocabulary]
  );

  const selection = useMemo(() => {
    return props.selectedValues.map((value) => ({
      value,
      label: vocabularyByValue[value][1],
    }));
  }, [props.selectedValues, isMultiPick(props.parameter)]);

  const onChange = useCallback(
    (newSelection: ValueType<Option, any>) => {
      const newSelectionArray =
        newSelection == null
          ? []
          : Array.isArray(newSelection)
          ? (newSelection as Option[])
          : [newSelection as Option];

      props.onChange(newSelectionArray.map(({ value }) => value));
    },
    [props.onChange]
  );

  return (
    <Select<Option, any>
      isMulti={isMultiPick(props.parameter)}
      isSearchable
      options={options}
      value={selection}
      onChange={onChange}
      formatOptionLabel={formatOptionLabel}
      form="DO_NOT_SUBMIT_ON_ENTER"
    />
  );
};

export default TypeAheadEnumParamComponent;

function formatOptionLabel(option: Option) {
  return safeHtml(option.label);
}
