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

export type StudyVariable = t.TypeOf<typeof StudyVariable>;
export const StudyVariable = t.intersection([
  t.type({
    id: t.string,
    providerLabel: t.string,
    displayName: t.string,
    type: t.string,
    isMultiValued: t.boolean,
    // description: t.string,
  }),
  t.partial({
    parentId: t.string,
    displayType: t.string,
    dataShape: t.string,
  }),
]);

// StudyEntity
// -----------

type _StudyEntityBase = t.TypeOf<typeof _StudyEntityBase>;
const _StudyEntityBase = t.type({
  id: t.string,
  displayName: t.string,
  description: t.string,
  variables: t.array(StudyVariable),
  // displayNamePlural: t.string,
});

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
  // name: t.string,
});

export type StudyMetadata = t.TypeOf<typeof StudyMetadata>;
export const StudyMetadata = t.intersection([
  StudyOverview,
  t.type({
    rootEntity: StudyEntity,
  }),
]);
