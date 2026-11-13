export { ifDefined, ifNotEmpty, requireValue, takeIf, using } from './ergonomics';

export { datasetUserFullName, formatFileSize } from './formatting';

export {
  changeHandler,
  arrayChangeHandler,
  textChange,
  replaceElement,
  useArrayChangeHandler,
  useChangeHandler,
} from './input-utils';

export {
  testFileRequired,
  testNonBlank,
  newTextLengthTest,
} from './input-tests';

export type {
  DataNoun,

  BiConsumer,
  Consumer,
  Function,
  Nullable,
  Optional,
  Possible,
  Predicate,
  Producer,
  Runnable,
  UnaryFunction,
} from './types';

export {
  filterNullish,
  isNonBlankString,
  isNonEmpty,
  isNonEmptyString,
} from './value-tests';

export {} from './miscellaneous-junk';

export { JsonPathBuilder } from './JsonPathBuilder';
export { SimpleState, useSimpleState } from './SimpleState';
