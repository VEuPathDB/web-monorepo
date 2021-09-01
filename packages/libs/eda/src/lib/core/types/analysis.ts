/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';
import { Filter } from './filter';
import { Computation, Visualization } from './visualization';

export type AnalysisPreferences = t.TypeOf<typeof AnalysisPreferences>;
export const AnalysisPreferences = t.partial({
  pinnedAnalyses: t.array(t.string),
});

export type DerviedVariable = t.TypeOf<typeof DerviedVariable>;
export const DerviedVariable = t.unknown;

export type VariableUISetting = t.TypeOf<typeof VariableUISetting>;
export const VariableUISetting = t.UnknownRecord;

/** Define types for Subsetting Data Table */
export type DataTableSettings = t.TypeOf<typeof NewAnalysis>;
export const DataTableSettings = t.type({
  /** Information on the selected entity and child variables. */
  selectedVariables: t.record(t.string, t.array(t.string)),
  /**
   * An array of sorting definitions. Used to specify variables to
   * sort the table display with. For example, sort by column a, then column b.
   */
  sorting: t.array(
    t.type({
      variable: t.string,
      direction: t.union([t.literal('asc'), t.literal('desc')]),
    })
  ),
});

export type NewAnalysis = t.TypeOf<typeof NewAnalysis>;
export const NewAnalysis = t.intersection([
  t.type({
    /** User supplied same for the analysis. */
    name: t.string,
    /**
     * Not sure yet, but this probably refers to the study for
     * which the analysis is taking place. COULD also be a unique ID
     * for the analysis.
     */
    studyId: t.string,
    /** Array of filters applied to the underlying data. */
    filters: t.array(Filter),
    derivedVariables: t.array(DerviedVariable),
    /** IDs of variables 'starred' by the user. */
    starredVariables: t.array(t.string),
    variableUISettings: t.record(t.string, VariableUISetting),
    /** Array of visualizations created with the analysis. */
    visualizations: t.array(Visualization),
    computations: t.array(Computation),
  }),
  /** Data Table Settings */
  t.partial({ dataTableSettings: DataTableSettings }),
]);

export type Analysis = t.TypeOf<typeof Analysis>;
export const Analysis = t.intersection([
  NewAnalysis,
  t.type({
    id: t.string,
    created: t.string,
    modified: t.string,
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
