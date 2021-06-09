import { HelpIcon } from '@veupathdb/wdk-client/lib/Components';
import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import {
  StudyEntity,
  StudyVariable,
  AnalysisState,
  useStudyMetadata,
} from '../core';
import { FilterContainer } from '../core/components/filter/FilterContainer';
import { cx } from './Utils';

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
      <div>
        <h3>{variable.displayName}</h3>
        <div className={cx('-ProviderLabel')}>
          <div className={cx('-ProviderLabelPrefix')}>
            Original variable name &nbsp;
            <HelpIcon>
              The name for this variable as provided with the original study's
              data set. The VEuPathDB team curates variable names and places
              variables into an ontology framework.
            </HelpIcon>
          </div>
          {variable.providerLabel}
        </div>
      </div>
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
