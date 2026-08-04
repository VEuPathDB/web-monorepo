import lodash from 'lodash';

// export function isNonEmpty<T extends object>(value: Optional<T>): value is T;
export function isNonEmpty<T extends string | Array<any>>(value: any): value is T {
  return !lodash.isEmpty(value);
}

export function isNonEmptyString(
  value: any | null | undefined
): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isNonBlankString(
  value: any | null | undefined
): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
