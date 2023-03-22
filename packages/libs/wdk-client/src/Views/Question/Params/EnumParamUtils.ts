import { arrayOf, decode, decodeOrElse, string } from 'wdk-client/Utils/Json';
import { EnumParam, Parameter } from 'wdk-client/Utils/WdkModel';

export function countInBounds(count: number, lower: number, upper: number): boolean {
  // Number of selected values should be within range of {min,max}SelectedCount.
  // The value of each is > 0 if configured.
  return lower > 0 && lower > count ? false
       : upper > 0 && upper < count ? false
       : true;
}

export function toMultiValueString(value: string[]): string {
  return JSON.stringify(value);
}

// NB: If "stableValue" is not a valid enum JSON string,
// the associated multi value array defaults to the singleton [ stableValue ]
export function toMultiValueArray(stableValue: string): string[] {
  return decodeOrElse(
    enumJsonDecoder,
    [ stableValue ],
    stableValue
  );
}

export function isEnumParam(parameter: Parameter): parameter is EnumParam {
  return parameter.type === 'single-pick-vocabulary' || parameter.type === 'multi-pick-vocabulary';
}

export function isMultiPick(parameter: Parameter): boolean {
  return isEnumParam(parameter) && parameter.type === 'multi-pick-vocabulary';
}

export function isValidEnumJson(value: string): boolean {
  const validationResult = enumJsonDecoder(value);

  return validationResult.status === 'ok';
}

const enumJsonDecoder = arrayOf(string);
