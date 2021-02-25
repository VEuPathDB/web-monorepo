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
import { useDataClient } from '../hooks/workspace';
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
  const dataClient = useDataClient();
  const variableSummary = usePromise(async () => {
    // remove filter for active variable so it is not reflected in the foreground
    const otherFilters = filters?.filter(
      (f) => f.entityId !== entity.id || f.variableId !== variable.id
    );
    const bg$ = dataClient.getNumericHistogramNumBins({
      studyId: studyMetadata.id,
      filters: [],
      config: {
        numBins: 10,
        entityId: entity.id, // for subsetting filters, this is the same entity as...
        valueSpec: 'count',
        xAxisVariable: {
          entityId: entity.id, // ...the variable's entity
          variableId: variable.id,
        },
      },
    });
    // If there are no filters, reuse background for foreground.
    // This is an optimization that saves a call to the backend.
    const fg$ = otherFilters?.length
      ? dataClient.getNumericHistogramNumBins({
          studyId: studyMetadata.id,
          filters: otherFilters,
          config: {
            numBins: 10,
            entityId: entity.id,
            valueSpec: 'count',
            xAxisVariable: {
              entityId: entity.id,
              variableId: variable.id,
            },
          },
        })
      : bg$;
    const [bg, fg] = await Promise.all([bg$, fg$]);
    return { bg, fg };
  }, [dataClient, studyMetadata, variable, entity, filters]);
  return variableSummary.pending ? (
    <Loading />
  ) : variableSummary.error ? (
    <div>{String(variableSummary.error)}</div>
  ) : variableSummary.value ? (
    variableSummary.value.bg[0][0].value.length == 0 ? ( // TO DO: check these zero indices will always be valid
      <div className="MesaComponent">
        <EmptyState culprit="nodata" />
      </div>
    ) : (
      <ErrorBoundary>
        <pre>{JSON.stringify(variableSummary.value, null, 2)}</pre>
      </ErrorBoundary>
    )
  ) : null;
}

function logEvent(tag: string) {
  return function noop(...args: unknown[]) {
    console.log('Tagged event ::', tag + ' ::', ...args);
  };
}
