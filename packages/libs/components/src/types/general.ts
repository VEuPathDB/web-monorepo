/**
 * General type definitions that don't fit into a more specialized category.
 * Or, at least, haven't found a more specific home yet.
 */
export type NumberOrDate = number | Date;

export type ErrorManagement = {
  errors: Array<Error>;
  addError: (error: Error) => void;
  removeError: (error: Error) => void;
  clearAllErrors: () => void;
};
