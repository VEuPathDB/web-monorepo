import { EnumParam, Parameter } from 'wdk-client/Utils/WdkModel';

export function countInBounds(count: number, lower: number, upper: number) {
  // Number of selected values should be within range of {min,max}SelectedCount.
  // The value of each is > 0 if configured.
  return lower > 0 && lower > count ? false
       : upper > 0 && upper < count ? false
       : true;
}

export function valueToArray(value = '') {
  if (value.trim().length === 0) return [];
  return value.split(/\s*,\s*/g);
}

// Use this for both EnumParam and FlatVocabParam.
export function isEnumParam(parameter: Parameter): parameter is EnumParam {
  return (
    parameter.type === 'EnumParam' ||
    parameter.type === 'FlatVocabParam'
  );
}
