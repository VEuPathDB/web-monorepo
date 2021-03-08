import { Loading } from '@veupathdb/wdk-client/lib/Components';
import FieldFilter from '@veupathdb/wdk-client/lib/Components/AttributeFilter/FieldFilter';
import EmptyState from '@veupathdb/wdk-client/lib/Components/Mesa/Ui/EmptyState';
import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import React from 'react';
import { usePromise } from '../hooks/promise';
import { StudyEntity, StudyMetadata, StudyVariable } from '../types/study';
import {
  fromEdaFilter,
  toEdaFilter,
  toWdkVariableSummary,
} from '../utils/wdk-filter-param-adapter';
import { useSubsettingClient } from '../hooks/workspace';
import { Filter as EdaFilter } from '../types/filter';
import { Filter as WdkFilter } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';

interface Props {
  studyMetadata: StudyMetadata;
  entity: StudyEntity;
  variable: StudyVariable;
  filters?: EdaFilter[];
  onFiltersChange: (filters: EdaFilter[]) => void;
}

export function Distribution(props: Props) {
  const { studyMetadata, entity, variable, filters, onFiltersChange } = props;
  const subsettingClient = useSubsettingClient();
  const variableSummary = usePromise(async () => {
    // remove filter for active variable so it is not reflected in the foreground
    const otherFilters = filters?.filter(
      (f) => f.entityId !== entity.id || f.variableId !== variable.id
    );
    const bg$ = subsettingClient.getDistribution(
      studyMetadata.id,
      entity.id,
      variable.id,
      {
        filters: [],
      }
    );
    // If there are no filters, reuse background for foreground.
    // This is an optimization that saves a call to the backend.
    const fg$ = otherFilters?.length
      ? subsettingClient.getDistribution(
          studyMetadata.id,
          entity.id,
          variable.id,
          {
            filters: otherFilters,
          }
        )
      : bg$;
    const [bg, fg] = await Promise.all([bg$, fg$]);
    return toWdkVariableSummary(fg, bg, variable);
  }, [subsettingClient, studyMetadata, variable, entity, filters]);
  return variableSummary.pending ? (
    <Loading />
  ) : variableSummary.error ? (
    <div>{String(variableSummary.error)}</div>
  ) : variableSummary.value ? (
    variableSummary.value.distribution.length === 0 ? (
      <div className="MesaComponent">
        <EmptyState culprit="nodata" />
      </div>
    ) : (
      <ErrorBoundary>
        <FieldFilter
          displayName={entity.displayName}
          dataCount={variableSummary.value.entitiesCount}
          filteredDataCount={variableSummary.value.filteredEntitiesCount}
          filters={filters?.map((f) => fromEdaFilter(f))}
          activeField={variableSummary.value?.activeField}
          activeFieldState={{
            loading: false,
            summary: {
              valueCounts: variableSummary.value.distribution,
              internalsCount: variableSummary.value.entitiesCount,
              internalsFilteredCount:
                variableSummary.value.filteredEntitiesCount,
            },
          }}
          onFiltersChange={(filters: WdkFilter[]) =>
            onFiltersChange(filters.map((f) => toEdaFilter(f, entity.id)))
          }
          onMemberSort={logEvent('onMemberSort')}
          onMemberSearch={logEvent('onMemberSearch')}
          onRangeScaleChange={logEvent('onRangeScaleChange')}
          selectByDefault={false}
        />
      </ErrorBoundary>
    )
  ) : null;
}

function logEvent(tag: string) {
  return function noop(...args: unknown[]) {
    console.log('Tagged event ::', tag + ' ::', ...args);
  };
}
