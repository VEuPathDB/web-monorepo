import React from 'react';
import { SessionState } from '../../hooks/session';
import { StudyEntity, StudyMetadata, StudyVariable } from '../../types/study';
import { isHistogramVariable, isTableVariable } from './guards';
import { HistogramFilter } from './HistogramFilter';
import { TableFilter } from './TableFilter';
import UnknownFilter from './UnknownFilter';

interface Props {
  studyMetadata: StudyMetadata;
  variable: StudyVariable;
  entity: StudyEntity;
  sessionState: SessionState;
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

interface NarrowedProps<T extends StudyVariable> extends Props {
  variable: T;
}

function narrowProps<T extends StudyVariable>(
  guard: (variable: StudyVariable) => variable is T,
  props: Props
): props is NarrowedProps<T> {
  return guard(props.variable);
}
