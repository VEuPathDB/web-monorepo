/*    Error Handlers   */
export const fail = (fn, message, Err = Error) => {
  throw new Err(`<${fn}>: ${message}`);
  return undefined;
}

export const warn = (fn, message) => {
  console.warn(`<${fn}>: ${message}`);
  return undefined;
}

export const badType = (fn, parameter, expected, actual, fatal = false) => {
  const message = `parameter "${parameter}"  is not of type ${expected} (got ${actual})` + (fatal ? '' : `; using empty ${expected}`);
  return fatal ? fail(fn, message, TypeError) : warn(fn, message);
};

export const missingFromState = (fn, missing, obj = {}, fatal = false) => {
  const present = Object.keys(obj).join(', ');
  const message = `state branch "${missing}" not found in state. Found sibling keys: [${present}]`;
  return fatal ? fail(fn, message, ReferenceError) : warn(fn, message);
};
