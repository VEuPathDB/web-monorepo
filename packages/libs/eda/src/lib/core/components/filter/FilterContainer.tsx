import React from 'react';
import { AnalysisState } from '../../hooks/analysis';
import {
  StudyEntity,
  StudyMetadata,
  Variable,
  MultiFilterVariable,
} from '../../types/study';
import { isHistogramVariable, isTableVariable } from './guards';
import { HistogramFilter } from './HistogramFilter';
import { MultiFilter } from './MultiFilter';
import { TableFilter } from './TableFilter';
import UnknownFilter from './UnknownFilter';

interface Props {
  studyMetadata: StudyMetadata;
  variable: Variable | MultiFilterVariable;
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
  ) : narrowProps(MultiFilterVariable.is, props) ? (
    <MultiFilter {...props} />
  ) : (
    <UnknownFilter />
  );
}

interface NarrowedProps<T extends Variable | MultiFilterVariable>
  extends Props {
  variable: T;
}

function narrowProps<T extends Variable | MultiFilterVariable>(
  guard: (variable: Variable | MultiFilterVariable) => variable is T,
  props: Props
): props is NarrowedProps<T> {
  return guard(props.variable);
}
