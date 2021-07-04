import { HelpIcon } from '@veupathdb/wdk-client/lib/Components';
import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import {
  StudyEntity,
  AnalysisState,
  useStudyMetadata,
  Variable,
} from '../core';
import { FilterContainer } from '../core/components/filter/FilterContainer';
import { cx } from './Utils';

interface Props {
  entity: StudyEntity;
  totalEntityCount?: number;
  filteredEntityCount?: number;
  variable: Variable;
  analysisState: AnalysisState;
}

export function VariableDetails(props: Props) {
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
            Original variable name:
          </div>
          &nbsp;{variable.providerLabel}&nbsp;
          <HelpIcon>
            The name for this variable as provided with the original study's
            data set. The VEuPathDB team curates variable names and places
            variables into an ontology framework.
          </HelpIcon>
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
