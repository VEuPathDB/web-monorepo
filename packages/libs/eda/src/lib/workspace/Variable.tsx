import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import {
  StudyEntity,
  StudyVariable,
  SessionState,
  useStudyMetadata,
} from '../core';
import { FilterContainer } from '../core/components/filter/FilterContainer';

interface Props {
  entity: StudyEntity;
  totalEntityCount?: number;
  filteredEntityCount?: number;
  variable: StudyVariable;
  sessionState: SessionState;
}

export function Variable(props: Props) {
  const {
    entity,
    variable,
    filteredEntityCount,
    totalEntityCount,
    sessionState,
  } = props;
  const studyMetadata = useStudyMetadata();
  return (
    <ErrorBoundary>
      {totalEntityCount != null && filteredEntityCount != null ? (
        <FilterContainer
          studyMetadata={studyMetadata}
          variable={variable}
          entity={entity}
          sessionState={sessionState}
          totalEntityCount={totalEntityCount}
          filteredEntityCount={filteredEntityCount}
        />
      ) : null}
    </ErrorBoundary>
  );
}
