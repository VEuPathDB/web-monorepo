import * as t from "io-ts";
import { Filter } from "./filter";

export type DerviedVariable = t.TypeOf<typeof DerviedVariable>;
export const DerviedVariable = t.unknown;

export type VariableUISetting = t.TypeOf<typeof VariableUISetting>;
export const VariableUISetting = t.UnknownRecord;

export type Visualization = t.TypeOf<typeof Visualization>;
export const Visualization = t.unknown;

export type NewAnalysis = t.TypeOf<typeof NewAnalysis>;
export const NewAnalysis = t.type({
  name: t.string,
  studyId: t.string,
  filters: t.array(Filter),
  derivedVariables: t.array(DerviedVariable),
  starredVariables: t.array(t.string),
  variableUISettings: t.record(t.string, VariableUISetting),
  visualizations: t.array(Visualization),
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
