import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import {
  StudyEntity,
  StudyVariable,
  AnalysisState,
  useStudyMetadata,
} from '../core';
import { FilterContainer } from '../core/components/filter/FilterContainer';

interface Props {
  entity: StudyEntity;
  totalEntityCount?: number;
  filteredEntityCount?: number;
  variable: StudyVariable;
  analysisState: AnalysisState;
}

export function Variable(props: Props) {
  const {
    entity,
    variable,
    filteredEntityCount,
    totalEntityCount,
    analysisState,
  } = props;
  const studyMetadata = useStudyMetadata();
  return (
    <ErrorBoundary>
      {totalEntityCount != null && filteredEntityCount != null ? (
        <FilterContainer
          studyMetadata={studyMetadata}
          variable={variable}
          entity={entity}
          analysisState={analysisState}
          totalEntityCount={totalEntityCount}
          filteredEntityCount={filteredEntityCount}
        />
      ) : null}
    </ErrorBoundary>
  );
}
