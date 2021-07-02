/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';

const _VariableBase = t.type({
  entityId: t.string,
  variableId: t.string,
});

export type VariableDescriptor = t.TypeOf<typeof VariableDescriptor>;
export const VariableDescriptor = _VariableBase;

export type StringVariableValue = t.TypeOf<typeof StringVariableValue>;
export const StringVariableValue = t.intersection([
  _VariableBase,
  t.type({
    value: t.string,
  }),
]);
