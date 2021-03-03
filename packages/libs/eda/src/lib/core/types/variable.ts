/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';

const _VariableBase = t.type({
  entityId: t.string,
  variableId: t.string,
});

export type Variable = t.TypeOf<typeof Variable>;
export const Variable = _VariableBase;

export type StringVariableValue = t.TypeOf<typeof StringVariableValue>;
export const StringVariableValue = t.intersection([
  _VariableBase,
  t.type({
    value: t.string,
  }),
]);
