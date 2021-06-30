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

export const _StudyVariableBase = t.intersection([
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

const _StudyVariableNonCategoryBase = t.intersection([
  _StudyVariableBase,
  t.type({
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

export type StudyVariableString = t.TypeOf<typeof StudyVariableString>;
export const StudyVariableString = t.intersection([
  _StudyVariableNonCategoryBase,
  t.type({
    type: t.literal('string'),
  }),
]);

export type StudyVariableNumber = t.TypeOf<typeof StudyVariableNumber>;
export const StudyVariableNumber = t.intersection([
  _StudyVariableNonCategoryBase,
  t.type({
    type: t.literal('number'),
    units: t.string,
  }),
  t.partial({
    // TODO This is supposed to be required, but the backend isn't populating it.
    precision: t.number,
    displayRangeMin: t.number,
    displayRangeMax: t.number,
    rangeMin: t.number,
    rangeMax: t.number,
    binWidthOverride: t.number,
    binWidth: t.number,
  }),
]);

export type StudyVariableDate = t.TypeOf<typeof StudyVariableDate>;
export const StudyVariableDate = t.intersection([
  _StudyVariableNonCategoryBase,
  t.type({
    type: t.literal('date'),
  }),
  t.partial({
    displayRangeMin: t.string,
    displayRangeMax: t.string,
    rangeMin: t.string,
    rangeMax: t.string,
    binWidthOverride: t.string,
    binWidth: t.string,
  }),
]);

export type StudyVariableLongitude = t.TypeOf<typeof StudyVariableLongitude>;
export const StudyVariableLongitude = t.intersection([
  _StudyVariableNonCategoryBase,
  t.type({
    type: t.literal('longitude'),
  }),
]);

export type StudyVariableCategory = t.TypeOf<typeof StudyVariableCategory>;
export const StudyVariableCategory = t.intersection([
  _StudyVariableBase,
  t.type({
    type: t.literal('category'),
  }),
]);

export type StudyVariableVariable =
  | StudyVariableString
  | StudyVariableNumber
  | StudyVariableDate
  | StudyVariableLongitude;

export type StudyVariable = t.TypeOf<typeof StudyVariable>;
export const StudyVariable = t.union([
  StudyVariableString,
  StudyVariableNumber,
  StudyVariableDate,
  StudyVariableLongitude,
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
