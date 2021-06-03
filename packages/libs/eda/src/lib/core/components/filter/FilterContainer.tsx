import React from 'react';
import { AnalysisState } from '../../hooks/analysis';
import { StudyEntity, StudyMetadata, StudyVariable } from '../../types/study';
import { isHistogramVariable, isTableVariable } from './guards';
import { HistogramFilter } from './HistogramFilter';
import { TableFilter } from './TableFilter';
import UnknownFilter from './UnknownFilter';

interface Props {
  studyMetadata: StudyMetadata;
  variable: StudyVariable;
  entity: StudyEntity;
  analysisState: AnalysisState;
  totalEntityCount: number;
  filteredEntityCount: number;
}

export function FilterContainer(props: Props) {
  const AdditionalDescription = () => {
    return (
      <div>
        <h3 style={{ padding: '0', margin: '.5em 0' }}>
          {props.variable.displayName}
        </h3>
        <h4 style={{ padding: '0', margin: '.5em 0' }}>
          Provider label: {props.variable.providerLabel}
        </h4>
      </div>
    );
  };
  return narrowProps(isHistogramVariable, props) ? (
    <>
      <AdditionalDescription />
      <HistogramFilter {...props} />
    </>
  ) : narrowProps(isTableVariable, props) ? (
    <>
      <AdditionalDescription />
      <TableFilter {...props} />
    </>
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
