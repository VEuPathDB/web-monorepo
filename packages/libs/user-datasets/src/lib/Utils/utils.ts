export function transform<T, R>(value: T, fn: (v: T) => R): R {
  return fn(value);
}
