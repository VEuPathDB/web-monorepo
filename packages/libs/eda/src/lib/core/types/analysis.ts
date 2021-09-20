/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';
import { Filter } from './filter';
import { VariableDescriptor } from './variable';
import { Computation, NewComputation, Visualization } from './visualization';

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
  }),
  t.partial({
    displayName: t.string,
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

export type NewAnalysis = t.TypeOf<typeof NewAnalysis>;
export const NewAnalysis = t.type({
  name: t.string,
  studyId: t.string,
  filters: t.array(Filter),
  derivedVariables: t.array(DerivedVariable),
  starredVariables: t.array(VariableDescriptor),
  variableUISettings: t.record(t.string, VariableUISetting),
  visualizations: t.array(Visualization),
  computations: t.array(Computation),
});

export type Analysis = t.TypeOf<typeof Analysis>;
export const Analysis = t.intersection([
  NewAnalysis,
  t.type({
    id: t.string,
    created: t.string,
    modified: t.string,
  }),
]);

export type AnalysisDescriptor = t.TypeOf<typeof AnalysisDescriptor>;
export const AnalysisDescriptor = t.type({
  subset: t.type({
    descriptor: t.array(Filter),
    uiSettings: t.record(t.string, VariableUISetting),
  }),
  computations: t.array(NewComputation),
  starredVariables: t.array(VariableDescriptor),
  dataTableColumns: t.array(VariableDescriptor),
  derivedVariables: t.array(DerivedVariable),
});

export type NewAnalysisDetails = t.TypeOf<typeof NewAnalysisDetails>;
export const NewAnalysisDetails = t.intersection([
  AnalysisBase,
  t.type({
    descriptor: AnalysisDescriptor,
  }),
]);

export type AnalysisDetails = t.TypeOf<typeof AnalysisDetails>;
export const AnalysisDetails = t.intersection([
  NewAnalysisDetails,
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
    name: 'Unnamed Analysis',
    studyId,
    filters: [],
    starredVariables: [],
    derivedVariables: [],
    visualizations: [],
    computations: [],
    variableUISettings: {},
  };
}
