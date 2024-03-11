/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';
import { Filter } from './filter';
import { VariableDescriptor } from './variable';
import { Computation } from './visualization';
import { merge } from 'lodash';

export type AnalysisPreferences = t.TypeOf<typeof AnalysisPreferences>;
export const AnalysisPreferences = t.intersection([
  t.partial({
    pinnedAnalyses: t.array(t.string),
  }),
  t.record(t.string, t.unknown),
]);

export type AnalysisProvenance = t.TypeOf<typeof AnalysisProvenance>;
export const AnalysisProvenance = t.type({
  onImport: t.type({
    ownerId: t.number,
    ownerName: t.string,
    ownerOrganization: t.string,
    analysisId: t.string,
    analysisName: t.string,
    creationTime: t.string,
    modificationTime: t.string,
    isPublic: t.boolean,
  }),
  current: t.union([
    t.type({
      isDeleted: t.literal(true),
    }),
    t.type({
      isDeleted: t.literal(false),
      modificationTime: t.string,
    }),
  ]),
});

export type DerivedVariable = t.TypeOf<typeof DerivedVariable>;
export const DerivedVariable = t.unknown;

export type VariableUISetting = t.TypeOf<typeof VariableUISetting>;
export const VariableUISetting = t.UnknownRecord;

/** Define types for Subsetting Data Table */
export type DataTableConfig = t.TypeOf<typeof DataTableConfig>;
export const DataTableConfig = t.record(
  t.string,
  t.type({ variables: t.array(VariableDescriptor), sorting: t.unknown })
);

export type AnalysisBase = t.TypeOf<typeof AnalysisBase>;
export const AnalysisBase = t.intersection([
  t.type({
    /**
     * Unique identifier of the study for which the analysis is taking place.
     */
    studyId: t.string,
    studyVersion: t.string,
    apiVersion: t.string,
    /** Indicates if the analysis should be publicly available. */
    isPublic: t.boolean,
    /** User supplied name for the analysis. */
    displayName: t.string,
  }),
  t.partial({
    description: t.string,
    notes: t.string,
  }),
]);

export type AnalysisSummary = t.TypeOf<typeof AnalysisSummary>;
export const AnalysisSummary = t.intersection([
  AnalysisBase,
  t.type({
    analysisId: t.string,
    creationTime: t.string,
    modificationTime: t.string,
    numFilters: t.number,
    numComputations: t.number,
    numVisualizations: t.number,
  }),
  t.partial({
    provenance: AnalysisProvenance,
  }),
]);

export type PublicAnalysisSummary = t.TypeOf<typeof PublicAnalysisSummary>;
export const PublicAnalysisSummary = t.intersection([
  AnalysisSummary,
  t.type({
    userId: t.number,
    userName: t.string,
    userOrganization: t.string,
  }),
]);

export type AnalysisDescriptor = t.TypeOf<typeof AnalysisDescriptor>;
export const AnalysisDescriptor = t.type({
  subset: t.type({
    descriptor: t.array(Filter),
    uiSettings: t.record(t.string, VariableUISetting),
  }),
  computations: t.array(Computation),
  /** IDs of variables 'starred' by the user. */
  starredVariables: t.array(VariableDescriptor),
  dataTableConfig: DataTableConfig,
  derivedVariables: t.array(DerivedVariable),
});

export type NewAnalysis = t.TypeOf<typeof NewAnalysis>;
export const NewAnalysis = t.intersection([
  AnalysisBase,
  t.type({
    descriptor: AnalysisDescriptor,
  }),
]);

export type Analysis = t.TypeOf<typeof Analysis>;
export const Analysis = t.intersection([
  NewAnalysis,
  t.type({
    analysisId: t.string,
    creationTime: t.string,
    modificationTime: t.string,
    numFilters: t.number,
    numComputations: t.number,
    numVisualizations: t.number,
  }),
  t.partial({
    provenance: AnalysisProvenance,
  }),
]);

export const DEFAULT_ANALYSIS_NAME = 'Unnamed Analysis';

export function makeNewAnalysis(
  studyId: string,
  computation?: Computation,
  additionalConfig?: unknown
): NewAnalysis {
  const defaultAnalysis = {
    displayName: DEFAULT_ANALYSIS_NAME,
    studyId,
    isPublic: false,
    studyVersion: '',
    apiVersion: '',
    descriptor: {
      subset: {
        descriptor: [],
        uiSettings: {},
      },
      starredVariables: [],
      dataTableConfig: {},
      derivedVariables: [],
      computations: computation ? [computation] : [],
    },
  };

  return merge(defaultAnalysis, additionalConfig);
}
