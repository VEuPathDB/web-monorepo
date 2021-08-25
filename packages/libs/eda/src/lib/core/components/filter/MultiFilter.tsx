import React, { useCallback, useMemo, useState } from 'react';
import MultiFieldFilter from '@veupathdb/wdk-client/lib/Components/AttributeFilter/MultiFieldFilter';
import { Filter as WdkFilter } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';
import { AnalysisState } from '../../hooks/analysis';
import {
  MultiFilterVariable,
  StudyEntity,
  StudyMetadata,
} from '../../types/study';
import {
  edaVariableToWdkField,
  fromEdaFilter,
  makeFieldTree,
  toEdaFilter,
} from '../../utils/wdk-filter-param-adapter';
import { usePromise } from '../../hooks/promise';
import { useSubsettingClient } from '../../hooks/workspace';
import { getDistribution } from './util';
import { orderBy } from 'lodash';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

export interface Props {
  analysisState: AnalysisState;
  studyMetadata: StudyMetadata;
  variable: MultiFilterVariable;
  entity: StudyEntity;
  totalEntityCount: number;
  filteredEntityCount: number;
}

export function MultiFilter(props: Props) {
  const {
    studyMetadata,
    variable,
    entity,
    totalEntityCount,
    filteredEntityCount,
    analysisState,
  } = props;
  // TODO Gather props for MultiFieldFilter:
  // - displayName: string
  // - dataCount: number
  // - filteredDataCount: number
  // - filters: Filter[]
  // - activeField: object
  // - activeFieldState: {
  //     loading: boolean,
  //     summary: FieldSummary,
  //     leafSummaries; MultiFieldSummary[]
  //   }
  // - onFiltersChange
  // - onMemberSort
  // - onMemberSearch
  // - onRangeScaleChange
  // - hideFieldPanel
  // - selectByDefault
  const fields = useMemo(
    () =>
      entity.variables.map((variable) =>
        edaVariableToWdkField(
          {
            ...variable,
            parentId:
              variable.parentId === entity.id ? undefined : variable.parentId,
          },
          { includeMultiFilters: true }
        )
      ),
    [entity]
  );
  const fieldTree = useMemo(() => makeFieldTree(fields), [fields]);
  const activeField = fields.find((field) => field.term === variable.id);
  if (activeField == null) throw new Error('Could not find active field');
  const leaves = useMemo(
    () => fields.filter((field) => field.parent === activeField.term),
    [fields, activeField.term]
  );

  const [sort, setSort] = useState<{
    columnKey: string;
    direction: 'asc' | 'desc';
  }>({
    columnKey: 'display',
    direction: 'asc',
  });

  const [searchTerm, setSearchTerm] = useState('');

  const onMemberSort = useCallback((_, sort) => {
    setSort(sort);
  }, []);

  const onMemberSearch = useCallback((_, searchTerm: string) => {
    setSearchTerm(searchTerm);
  }, []);

  const subsettingClient = useSubsettingClient();

  const otherFilters = useMemo(() => {
    return analysisState.analysis?.filters.filter(
      (f) => f.entityId !== entity.id || f.variableId !== variable.id
    );
  }, [analysisState.analysis?.filters, entity.id, variable.id]);

  const leafSummariesPromise = usePromise(
    useCallback(() => {
      return Promise.all(
        leaves.map((leaf) =>
          getDistribution(
            {
              entityId: entity.id,
              variableId: leaf.term,
              filters: otherFilters,
            },
            (filters) =>
              subsettingClient.getDistribution(
                studyMetadata.id,
                entity.id,
                leaf.term,
                {
                  filters,
                  valueSpec: 'count',
                }
              )
          ).then((distribution) => {
            const fgValueByLabel = Object.fromEntries(
              distribution.foreground.histogram.map(({ binLabel, value }) => [
                binLabel,
                value ?? 0,
              ])
            );
            const bgValueByLabel = Object.fromEntries(
              distribution.background.histogram.map(({ binLabel, value }) => [
                binLabel,
                value ?? 0,
              ])
            );
            return {
              term: leaf.term,
              display: leaf.display,
              valueCounts: Object.keys(bgValueByLabel).map((label) => ({
                value: label,
                count: bgValueByLabel[label],
                filteredCount: fgValueByLabel[label] ?? 0,
              })),
              internalsCount:
                distribution.background.statistics.numDistinctEntityRecords,
              internalsFilteredCount:
                distribution.foreground.statistics.numDistinctEntityRecords,
            };
          })
        )
      );
    }, [leaves, entity.id, otherFilters, subsettingClient, studyMetadata.id])
  );

  const orderedLeafSummaries = useMemo(
    () =>
      orderBy(
        leafSummariesPromise.value,
        [
          (summary) => {
            switch (sort.columnKey) {
              case 'filteredCount':
                return summary.internalsFilteredCount;
              case 'count':
                return summary.internalsCount;
              default:
                return summary.display;
            }
          },
        ],
        [sort.direction]
      ),
    [leafSummariesPromise.value, sort.columnKey, sort.direction]
  );

  const handleFiltereChange = useCallback(
    (nextFilters: WdkFilter[]) => {
      const edaFilters = nextFilters.map((filter) =>
        toEdaFilter(filter, entity.id)
      );
      analysisState.setFilters(edaFilters);
    },
    [analysisState, entity.id]
  );

  const activeFieldState = useMemo(
    () => ({
      invalid: leafSummariesPromise.error != null,
      loading: leafSummariesPromise.pending,
      leafSummaries: orderedLeafSummaries,
      searchTerm,
      sort,
    }),
    [
      leafSummariesPromise.error,
      leafSummariesPromise.pending,
      orderedLeafSummaries,
      searchTerm,
      sort,
    ]
  );

  const filters = useMemo(
    () => analysisState.analysis?.filters.map(fromEdaFilter),
    [analysisState.analysis?.filters]
  );

  // if (leafSummariesPromise.pending) return <Loading />;

  if (leafSummariesPromise.error)
    return <div>{String(leafSummariesPromise.error)}</div>;

  return (
    <div className="filter-param" style={{ position: 'relative' }}>
      {leafSummariesPromise.pending && (
        <Loading style={{ position: 'absolute', right: 0, left: 0, top: 0 }} />
      )}
      <MultiFieldFilter
        displayName={entity.displayNamePlural}
        dataCount={totalEntityCount}
        filteredDataCount={filteredEntityCount}
        filters={filters}
        activeField={activeField}
        activeFieldState={activeFieldState}
        fieldTree={fieldTree}
        onFiltersChange={handleFiltereChange}
        onMemberSort={onMemberSort}
        onMemberSearch={onMemberSearch}
      />
    </div>
  );
}
