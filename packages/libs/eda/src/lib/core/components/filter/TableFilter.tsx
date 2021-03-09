import { Loading } from '@veupathdb/wdk-client/lib/Components';
import MembershipField from '@veupathdb/wdk-client/lib/Components/AttributeFilter/MembershipField';
import { Filter as WdkFilter } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';
import { zip } from 'lodash';
import { useCallback, useMemo } from 'react';
import { BarplotResponse } from '../../api/data-api';
import { usePromise } from '../../hooks/promise';
import { useDataClient } from '../../hooks/workspace';
import { Filter } from '../../types/filter';
import { StudyEntity, StudyMetadata } from '../../types/study';
import {
  fromEdaFilter,
  toEdaFilter,
} from '../../utils/wdk-filter-param-adapter';
import { TableVariable } from './types';
import { getDistribution } from './util';

type Props = {
  studyMetadata: StudyMetadata;
  variable: TableVariable;
  entity: StudyEntity;
  filters?: Filter[];
};

export function TableFilter({
  studyMetadata,
  variable,
  entity,
  filters,
}: Props) {
  const dataClient = useDataClient();
  const tableSummary = usePromise(
    useCallback(async () => {
      const distribution = await getDistribution<BarplotResponse>(
        {
          entityId: entity.id,
          variableId: variable.id,
          filters,
        },
        (filters) => {
          return dataClient.getBarplot({
            studyId: studyMetadata.id,
            filters,
            config: {
              entityId: entity.id,
              valueSpec: 'count',
              xAxisVariable: {
                entityId: entity.id,
                variableId: variable.id,
              },
            },
          });
        }
      );
      return {
        // first two are used to make sure we're showing the correct distrubution
        entityId: entity.id,
        variableId: variable.id,
        distribution: zip(
          distribution.background[0],
          distribution.foreground[0]
        ).map(([fgEntry, bgEntry]) => ({
          value: fgEntry?.label || bgEntry?.label || '',
          count: bgEntry?.value || 0,
          filteredCount: fgEntry?.value || 0,
        })),
        entitiesCount: distribution.background[1].completeCases.length,
        filteredEntitiesCount: distribution.foreground[1].completeCases.length,
      };
    }, [dataClient, studyMetadata, variable, entity, filters])
  );
  const activeField = useMemo(
    () => ({
      display: variable.displayName,
      isRange: false,
      parent: variable.parentId,
      precision: 1,
      term: variable.id,
      type: variable.type,
      variableName: variable.providerLabel,
    }),
    [variable]
  );
  return (
    <div>
      {tableSummary.pending && <Loading radius={4} />}
      {tableSummary.value && (
        <MembershipField
          displayName={entity.displayName}
          dataCount={tableSummary.value.entitiesCount}
          filteredDataCount={tableSummary.value.filteredEntitiesCount}
          filters={filters?.map((f) => fromEdaFilter(f))}
          activeField={activeField}
          activeFieldState={{
            loading: false,
            summary: {
              valueCounts: tableSummary.value.distribution,
              internalsCount: tableSummary.value.entitiesCount,
              internalsFilteredCount: tableSummary.value.filteredEntitiesCount,
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
      )}
    </div>
  );
}

function logEvent(tag: string) {
  return function noop(...args: unknown[]) {
    console.log('Tagged event :: ', tag, '::', ...args);
  };
}

function onFiltersChange(filters: Filter[]) {
  // noop
}
