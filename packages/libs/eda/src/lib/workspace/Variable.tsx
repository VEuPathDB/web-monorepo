import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import {
  StudyEntity,
  StudyVariable,
  SessionState,
  useStudyMetadata,
} from '../core';
import { FilterContainer } from '../core/components/filter/FilterContainer';
import { cx } from './Utils';

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
  const percent =
    filteredEntityCount &&
    totalEntityCount &&
    (filteredEntityCount / totalEntityCount).toLocaleString(undefined, {
      style: 'percent',
    });

  return (
    <div>
      <div className={cx('-VariableEntityHeader')}>
        <h2>{entity.displayName}</h2>
        <div>
          Your subset includes {filteredEntityCount?.toLocaleString()}{' '}
          {entity.displayName} ({percent}).
        </div>
      </div>
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
    </div>
  );
}
