import React, { useCallback } from 'react';

import Select from 'react-select';
import { ValueType } from 'react-select/src/types';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { CombineOperator } from 'wdk-client/Views/Strategy/StrategyUtils';
import { AddType } from 'wdk-client/Views/Strategy/Types';
import { cxStepBoxes as cxOperator } from 'wdk-client/Views/Strategy/ClassNames';

const cx = makeClassNameHelper('BooleanSelect');

import 'wdk-client/Views/Strategy/BooleanSelect.scss';

interface Props {
  addType: AddType
  value: CombineOperator;
  onChange: (value: CombineOperator) => void;
}

export type BooleanOption = {
  value: CombineOperator,
  label: string
};

const appendOptions: BooleanOption[] = [
  { value: CombineOperator.Intersect, label: 'intersected with' },
  { value: CombineOperator.Union, label: 'unioned with' },
  { value: CombineOperator.LeftMinus, label: 'subtracted from' },
  { value: CombineOperator.RightMinus, label: 'subtracted by' },
];

const insertBeforeOptions: BooleanOption[] = [
  { value: CombineOperator.Intersect, label: 'intersected with' },
  { value: CombineOperator.Union, label: 'unioned with' },
  { value: CombineOperator.LeftMinus, label: 'subtracted by' },
  { value: CombineOperator.RightMinus, label: 'subtracted from' },
];

const formatBooleanOptionLabel = (option: BooleanOption) => 
  <div className={cx('--OptionLabel')}>
      <div className={cxOperator('--CombineOperator', option.value)}></div>
      <div>{option.label}</div>
  </div>;

export const BooleanSelect = ({ addType, value, onChange: onChangeValue }: Props) => {
  const options = addType.type === 'append' ? appendOptions : insertBeforeOptions;
  const valueOption = options.find(option => option.value === value);

  const onChange = useCallback((option: ValueType<BooleanOption, false>) => {
    onChangeValue((option as BooleanOption).value);
  }, [ onChangeValue ]);

  return (
    <Select<BooleanOption>
      value={valueOption}
      options={options}
      onChange={onChange}
      className={cx()}
      classNamePrefix={cx()}
      formatOptionLabel={formatBooleanOptionLabel}
      isSearchable={false}
      isClearable={false}
    />
  );
};
