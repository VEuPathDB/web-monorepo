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

export function toMultiValueArray(stableValue: string): string[] {
  let parseFailureMessage = "Multi-value enum stable value '" + stableValue + "' could not be parsed into terms.";
  try {
    // FIXME: streamline; parsing twice here
    if (!isValidEnumJson(stableValue)) {
      throw new Error(parseFailureMessage);
    }
    return JSON.parse(stableValue);
  }
  catch (error) {
    throw new Error(parseFailureMessage);
  }
}

export function isEnumParam(parameter: Parameter): parameter is EnumParam {
  return parameter.type === 'single-pick-vocabulary' || parameter.type === 'multi-pick-vocabulary';
}

export function isMultiPick(parameter: Parameter): boolean {
  return isEnumParam(parameter) && parameter.type === 'multi-pick-vocabulary';
}

export function isValidEnumJson(value: string): boolean {
  try {
    let parsedValue : Array<string> = JSON.parse(value);
    if (Object.prototype.toString.call(parsedValue) !== '[object Array]') return false;
    return parsedValue.reduce((valid: boolean, val: string) => valid && typeof val === 'string', true);
  }
  catch (error) {
    return false;
  }
}
