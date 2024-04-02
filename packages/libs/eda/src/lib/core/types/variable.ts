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

const _VariableCollectionBase = t.type({
  entityId: t.string,
  collectionId: t.string,
});

export type VariableCollectionDescriptor = t.TypeOf<
  typeof VariableCollectionDescriptor
>;
export const VariableCollectionDescriptor = _VariableCollectionBase;

export type CorrelationInputData = t.TypeOf<typeof CorrelationInputData>;
export const CorrelationInputData = t.intersection([
  t.type({
    dataType: t.string,
  }),
  t.partial({
    collectionSpec: VariableCollectionDescriptor,
  }),
]);
