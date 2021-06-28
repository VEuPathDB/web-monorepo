/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';
import {
  RecordClass,
  RecordInstance,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

// Aliases
// -------

export type StudyRecordClass = RecordClass;
export type StudyRecord = RecordInstance;

// StudyVariable
// -------------

// See https://github.com/gcanti/io-ts/blob/master/index.md#union-of-string-literals

export const StudyVariableType = t.keyof({
  string: null,
  number: null,
  date: null,
  longitude: null,
});

export const StudyVariableDataShape = t.keyof({
  continuous: null,
  categorical: null,
  ordinal: null,
  binary: null,
});

const StudyVariableDisplayType = t.keyof({
  default: null,
  multifilter: null,
  hidden: null,
});

export const StudyVariableBase = t.intersection([
  t.type({
    id: t.string,
    providerLabel: t.string,
    displayName: t.string,
  }),
  t.partial({
    parentId: t.string,
    definition: t.string,
    displayOrder: t.number,
    displayType: StudyVariableDisplayType,
    dataShape: StudyVariableDataShape,
  }),
]);

export type StudyVariableVariable = t.TypeOf<typeof StudyVariableVariable>;
export const StudyVariableVariable = t.intersection([
  StudyVariableBase,
  t.type({
    type: StudyVariableType,
    distinctValuesCount: t.number,
    isTemporal: t.boolean,
    isFeatured: t.boolean,
    isMergeKey: t.boolean,
    isMultiValued: t.boolean,
  }),
  t.partial({
    vocabulary: t.array(t.string),
  }),
]);

export type StudyVariableCategory = t.TypeOf<typeof StudyVariableCategory>;
export const StudyVariableCategory = t.intersection([
  StudyVariableBase,
  t.type({
    type: t.literal('category'),
  }),
]);

export type StudyVariable = t.TypeOf<typeof StudyVariable>;
export const StudyVariable = t.union([
  StudyVariableVariable,
  StudyVariableCategory,
]);

// StudyEntity
// -----------

type _StudyEntityBase = t.TypeOf<typeof _StudyEntityBase>;
const _StudyEntityBase = t.intersection([
  t.type({
    id: t.string,
    idColumnName: t.string,
    displayName: t.string,
    description: t.string,
    variables: t.array(StudyVariable),
  }),
  t.partial({
    displayNamePlural: t.string,
  }),
]);

// export type StudyEntity = t.Unpack<typeof StudyEntity>;
export type StudyEntity = _StudyEntityBase & {
  children?: StudyEntity[];
};
export const StudyEntity: t.Type<StudyEntity> = t.recursion('StudyEntity', () =>
  t.intersection([
    _StudyEntityBase,
    t.partial({
      children: t.array(StudyEntity),
    }),
  ])
);

// StudyMetadata
// -------------

export type StudyOverview = t.TypeOf<typeof StudyOverview>;
export const StudyOverview = t.type({
  id: t.string,
  datasetId: t.string,
});

export type StudyMetadata = t.TypeOf<typeof StudyMetadata>;
export const StudyMetadata = t.intersection([
  StudyOverview,
  t.type({
    rootEntity: StudyEntity,
  }),
]);
