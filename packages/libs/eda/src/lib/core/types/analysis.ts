/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';
import { Filter } from './filter';
import { VariableDescriptor } from './variable';
import { Computation } from './visualization';

export type AnalysisPreferences = t.TypeOf<typeof AnalysisPreferences>;
export const AnalysisPreferences = t.partial({
  pinnedAnalyses: t.array(t.string),
});

export type DerivedVariable = t.TypeOf<typeof DerivedVariable>;
export const DerivedVariable = t.unknown;

export type VariableUISetting = t.TypeOf<typeof VariableUISetting>;
export const VariableUISetting = t.UnknownRecord;

export type AnalysisBase = t.TypeOf<typeof AnalysisBase>;
export const AnalysisBase = t.intersection([
  t.type({
    studyId: t.string,
    studyVersion: t.string,
    apiVersion: t.string,
    isPublic: t.boolean,
    displayName: t.string,
  }),
  t.partial({
    description: t.string,
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
  starredVariables: t.array(VariableDescriptor),
  dataTableConfig: t.type({
    variables: t.array(VariableDescriptor),
    sorting: t.array(
      t.type({
        key: t.string,
        direction: t.keyof({ asc: null, desc: null }),
      })
    ),
  }),
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
]);

export function makeNewAnalysis(studyId: string): NewAnalysis {
  return {
    displayName: 'Unnamed Analysis',
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
      dataTableConfig: {
        variables: [],
        sorting: [],
      },
      derivedVariables: [],
      computations: [
        {
          computationId: 'pass-through',
          displayName: 'Passthrough',
          descriptor: {
            type: 'pass',
            configuration: undefined,
          },
          visualizations: [],
        },
      ],
    },
  };
}
