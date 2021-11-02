/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';
import {
  RecordClass,
  RecordInstance,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { TimeUnit } from './general';

// Aliases
// -------

export type StudyRecordClass = RecordClass;
export type StudyRecord = RecordInstance;

// StudyVariable
// -------------

// See https://github.com/gcanti/io-ts/blob/master/index.md#union-of-string-literals

export const VariableType = t.keyof({
  string: null,
  number: null,
  integer: null,
  date: null,
  longitude: null,
});

export const CategoryVariableDataShape = t.keyof({
  categorical: null,
  ordinal: null,
  binary: null,
});

export const ContinuousVariableDataShape = t.keyof({
  continuous: null,
});

export const VariableDataShape = t.union([
  CategoryVariableDataShape,
  ContinuousVariableDataShape,
]);

const VariableDisplayType = t.keyof({
  default: null,
  multifilter: null,
  hidden: null,
});

export const VariableTreeNode_Base = t.intersection([
  t.type({
    id: t.string,
    providerLabel: t.string,
    displayName: t.string,
  }),
  t.partial({
    parentId: t.string,
    definition: t.string,
    displayOrder: t.number,
    displayType: VariableDisplayType,
  }),
]);

const Variable_Base = t.intersection([
  VariableTreeNode_Base,
  t.type({
    dataShape: VariableDataShape,
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

export type StringVariable = t.TypeOf<typeof StringVariable>;
export const StringVariable = t.intersection([
  Variable_Base,
  t.type({
    type: t.literal('string'),
  }),
]);

export type NumberVariable = t.TypeOf<typeof NumberVariable>;
export const NumberVariable = t.intersection([
  Variable_Base,
  t.union([
    t.type({
      type: t.literal('number'),
      units: t.string,
      precision: t.number,
    }),
    t.type({
      type: t.literal('integer'),
      units: t.string,
    }),
  ]),
  t.type({
    dataShape: VariableDataShape,
    rangeMin: t.number,
    rangeMax: t.number,
  }),
  t.partial({
    // TODO This is supposed to be required, but the backend isn't populating it.
    displayRangeMin: t.number,
    displayRangeMax: t.number,
    binWidth: t.number,
    binWidthOverride: t.number,
  }),
]);

export type DateVariable = t.TypeOf<typeof DateVariable>;
export const DateVariable = t.intersection([
  Variable_Base,
  t.type({
    type: t.literal('date'),
  }),
  t.type({
    dataShape: VariableDataShape,
    rangeMin: t.string,
    rangeMax: t.string,
  }),
  t.partial({
    displayRangeMin: t.string,
    displayRangeMax: t.string,
    binWidth: t.number,
    binUnits: TimeUnit,
    binWidthOverride: t.number,
  }),
]);

export type LongitudeVariable = t.TypeOf<typeof LongitudeVariable>;
export const LongitudeVariable = t.intersection([
  Variable_Base,
  t.type({
    type: t.literal('longitude'),
    precision: t.number,
  }),
]);

export type MultiFilterVariable = t.TypeOf<typeof MultiFilterVariable>;
export const MultiFilterVariable = t.intersection([
  VariableTreeNode_Base,
  t.type({
    type: t.literal('category'),
    displayType: t.literal('multifilter'),
  }),
]);

export type VariableCategory = t.TypeOf<typeof VariableCategory>;
export const VariableCategory = t.intersection([
  VariableTreeNode_Base,
  t.type({
    type: t.literal('category'),
  }),
]);

export type Variable = t.TypeOf<typeof Variable>;
export const Variable = t.union([
  StringVariable,
  NumberVariable,
  DateVariable,
  LongitudeVariable,
  // MultiFilterVariable,
]);

export type VariableTreeNode = t.TypeOf<typeof VariableTreeNode>;
export const VariableTreeNode = t.union([Variable, VariableCategory]);

// StudyEntity
// -----------

type _StudyEntityBase = t.TypeOf<typeof _StudyEntityBase>;

// TODO: Add documentation on WHAT an entity is conceptually.
// And for each property... except which is obviously self-evident.
const _StudyEntityBase = t.intersection([
  t.type({
    id: t.string,
    idColumnName: t.string,
    displayName: t.string,
    description: t.string,
    /**
     * The variables associated with an entity. Note that this is
     * separate from "children" (see `StudyEntitly`) which refers
     * to actual sub-entities.
     * */
    variables: t.array(VariableTreeNode),
  }),
  t.partial({
    displayNamePlural: t.string,
  }),
]);

export type StudyEntity = _StudyEntityBase & {
  // Other entities which exist with a foreign key type parent-child relationship.
  // TODO: @dmfalke Perhaps childEntities or subEntities would be more clear.
  // As someone new to the code it was easy to think of variables as "children" as confuse the two.
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
});

export type StudyMetadata = t.TypeOf<typeof StudyMetadata>;
export const StudyMetadata = t.intersection([
  StudyOverview,
  t.type({
    rootEntity: StudyEntity,
  }),
]);
