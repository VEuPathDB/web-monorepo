/*    Error Handlers   */
export const fail = (
  fn: string,
  message: string,
  Err: ErrorConstructor = Error
): never => {
  throw new Err(`<${fn}>: ${message}`);
};

export const warn = (fn: string, message: string): undefined => {
  console.warn(`<${fn}>: ${message}`);
  return undefined;
};

export const badType = (
  fn: string,
  parameter: string,
  expected: string,
  actual: string,
  fatal = false
): undefined | never => {
  const message =
    `parameter "${parameter}"  is not of type ${expected} (got ${actual})` +
    (fatal ? '' : `; using empty ${expected}`);
  return fatal ? fail(fn, message, TypeError) : warn(fn, message);
};

export const missingFromState = (
  fn: string,
  missing: string,
  obj: Record<string, unknown> = {},
  fatal = false
): undefined | never => {
  const present = Object.keys(obj).join(', ');
  const message = `state branch "${missing}" not found in state. Found sibling keys: [${present}]`;
  return fatal ? fail(fn, message, ReferenceError) : warn(fn, message);
};
