import React from 'react';
import { AnalysisState } from '../../hooks/analysis';
import {
  StudyEntity,
  StudyMetadata,
  StudyVariable,
  StudyVariableVariable,
} from '../../types/study';
import { isHistogramVariable, isTableVariable } from './guards';
import { HistogramFilter } from './HistogramFilter';
import { TableFilter } from './TableFilter';
import UnknownFilter from './UnknownFilter';

interface Props {
  studyMetadata: StudyMetadata;
  variable: StudyVariableVariable;
  entity: StudyEntity;
  analysisState: AnalysisState;
  totalEntityCount: number;
  filteredEntityCount: number;
}

export function FilterContainer(props: Props) {
  return narrowProps(isHistogramVariable, props) ? (
    <HistogramFilter {...props} />
  ) : narrowProps(isTableVariable, props) ? (
    <TableFilter {...props} />
  ) : (
    <UnknownFilter />
  );
}

interface NarrowedProps<T extends StudyVariableVariable> extends Props {
  variable: T;
}

function narrowProps<T extends StudyVariableVariable>(
  guard: (variable: StudyVariable) => variable is T,
  props: Props
): props is NarrowedProps<T> {
  return guard(props.variable);
}
