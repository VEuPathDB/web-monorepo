import { orderBy } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import MultiFieldFilter from '@veupathdb/wdk-client/lib/Components/AttributeFilter/MultiFieldFilter';
import {
  FieldTreeNode,
  Filter as WdkFilter,
} from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';

import { AnalysisState } from '../../hooks/analysis';
import { usePromise } from '../../hooks/promise';
import { useSubsettingClient } from '../../hooks/workspace';
import { MultiFilter as MultiFilterType } from '../../types/filter';
import {
  MultiFilterVariable,
  StudyEntity,
  StudyMetadata,
} from '../../types/study';
import {
  entitiesToFields,
  fromEdaFilter,
  makeFieldTree,
  toEdaFilter,
} from '../../utils/wdk-filter-param-adapter';
import { getDistribution } from './util';
import { preorderSeq } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  isFilterField,
  isMulti,
} from '@veupathdb/wdk-client/lib/Components/AttributeFilter/AttributeFilterUtils';
import { gray, red } from './colors';
import { debounce } from 'lodash';
import { isTableVariable } from './guards';
import { useDeepValue } from '../../hooks/immutability';

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
  // Gather props for MultiFieldFilter:
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

  // Create WDK Fields
  const fields = useMemo(
    () =>
      // This function uses {entity.id}/{variable.id} to generate a field's term
      // and parent property value. That is not desired here, so we have to do
      // some post-processing to use {variable.id} for those properties.
      entitiesToFields([entity], 'variableTree')
        .filter((field) => !field.term.startsWith('entity:'))
        .map((field) => ({
          ...field,
          term: field.term.split('/')[1],
          parent: field.parent?.startsWith('entity:')
            ? undefined
            : field.parent?.split('/')[1],
        })),
    [entity]
  );

  // Used to look up a variable and grab its vocabulary property in leafSummariesPromise
  const variablesById = useMemo(
    () => Object.fromEntries(entity.variables.map((v) => [v.id, v])),
    [entity.variables]
  );

  // Create a WDK FieldTree
  const fieldTree = useMemo(() => makeFieldTree(fields), [fields]);

  // Find active field
  const activeFieldNode: FieldTreeNode | undefined = preorderSeq(
    fieldTree
  ).find((node) => node.field.term === variable.id);
  if (activeFieldNode == null) throw new Error('Could not find active field');
  const activeField = activeFieldNode?.field;

  // Find leaves
  const leaves = useMemo(
    () =>
      preorderSeq(activeFieldNode)
        .filter((node) => isFilterField(node.field) && !isMulti(node.field))
        .map((node) => node.field)
        .toArray(),
    [activeFieldNode]
  );

  const [sort, setSort] = useState<{
    columnKey: string;
    direction: 'asc' | 'desc';
  }>({
    columnKey: 'display',
    direction: 'asc',
  });

  const [searchTerm, setSearchTerm] = useState('');

  const onMemberSort = useCallback(
    (
      _: unknown,
      sort: {
        columnKey: string;
        direction: 'asc' | 'desc';
      }
    ) => {
      setSort(sort);
    },
    []
  );

  const onMemberSearch = useCallback((_: unknown, searchTerm: string) => {
    setSearchTerm(searchTerm);
  }, []);

  const subsettingClient = useSubsettingClient();

  // Counts are only updated for this variable under two conditions:
  // 1. Filters for other variables are changed
  // 2. Subfilters for this variable are changed AND operation is intersect
  //
  // This is managed by holding the filter for this variable in a state variable.
  // Users can demand counts be updated by clicking on an "Update counts" button.

  // This value is used to update `countsAreCurrent`, and to update
  // the state variable `thisFilter` when "Update counts" is clicked.
  const _thisFilter = findThisFilter(analysisState, entity, variable);

  // Filter assocated with this variable. This is used to retreive counts.
  // We're using state so that we can defer updating counts until the user
  // clicks on an "update counts" button.
  const [thisFilter, setThisFilter] =
    useState<MultiFilterType | undefined>(_thisFilter);

  // debounce time needs to be linear with the number of sub-filters, see notes at the end of this file
  // but a minimum of 2 seconds seems reasonable too
  const debounceTime = Math.max(2000, (1000 * leaves.length) / 10);
  const debouncedSetThisFilter = useMemo(
    () => debounce(setThisFilter, debounceTime),
    [debounceTime]
  );
  // Cancel any pending requests when this component is unmounted.
  useEffect(
    () => debouncedSetThisFilter.cancel,
    [debouncedSetThisFilter.cancel]
  );
  // watch for changes in _thisFilter, then setThisFilter in a regulated manner
  useEffect(
    () => debouncedSetThisFilter(_thisFilter),
    [debouncedSetThisFilter, _thisFilter]
  );

  const filters = analysisState.analysis?.descriptor.subset.descriptor;
  const otherFilters = useDeepValue(
    filters?.filter(
      (f) => f.entityId !== entity.id || f.variableId !== variable.id
    )
  );

  // State used to control if the "Update counts" button is disabled.
  const [countsAreCurrent, setCountsAreCurrent] = useState(true);

  useEffect(() => {
    setCountsAreCurrent(_thisFilter === thisFilter);
  }, [_thisFilter, thisFilter]);

  // Counts retrieved from the backend, used for the table display.
  const leafSummariesPromise = usePromise(
    useCallback(() => {
      return Promise.all(
        leaves.map((leaf) => {
          const thisFilterWithoutLeaf = thisFilter && {
            ...thisFilter,
            subFilters: thisFilter.subFilters.filter(
              (f) => f.variableId !== leaf.term
            ),
          };
          return getDistribution(
            {
              entityId: entity.id,
              variableId: leaf.term,
              filters:
                thisFilterWithoutLeaf == null ||
                thisFilterWithoutLeaf.subFilters.length === 0 ||
                thisFilterWithoutLeaf.operation === 'union'
                  ? otherFilters
                  : [...(otherFilters || []), thisFilterWithoutLeaf],
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
            const variable = variablesById[leaf.term];
            if (variable == null || !isTableVariable(variable))
              throw new Error(
                `Could not find a categorical EDA variable associated with the leaf field "${leaf.term}".`
              );
            return {
              term: leaf.term,
              display: leaf.display,
              valueCounts: variable.vocabulary?.map((label) => ({
                value: label,
                count: bgValueByLabel[label],
                filteredCount: fgValueByLabel[label] ?? 0,
              })),
              internalsCount:
                distribution.background.statistics.numDistinctEntityRecords,
              internalsFilteredCount:
                distribution.foreground.statistics.numDistinctEntityRecords,
            };
          });
        })
      );
    }, [
      thisFilter,
      otherFilters,
      leaves,
      entity.id,
      subsettingClient,
      studyMetadata.id,
      variablesById,
    ])
  );

  // Sorted counts. This is done separately from retrieving the data so that
  // updates to sorting don't incur backend requests.
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
                return leafSummariesPromise.value?.indexOf(summary);
            }
          },
        ],
        [sort.direction]
      ),
    [leafSummariesPromise.value, sort.columnKey, sort.direction]
  );

  // Update analysis filter - need to convert from WDK to EDA filter.
  const handleFilterChange = useCallback(
    (nextFilters: WdkFilter[]) => {
      const edaFilters = nextFilters
        // the next two operations are needed because MultiFieldFilter will create subFilters with an
        // empty set of values, which does not work w/ eda
        // first exclude all-empty filters
        .filter(
          (filter) =>
            filter.type !== 'multiFilter' ||
            filter.value.filters.some((subFilter) => subFilter.value.length > 0)
        )
        // then remove individual subFilters that are empty
        .map((filter) =>
          filter.type !== 'multiFilter'
            ? filter
            : {
                ...filter,
                value: {
                  ...filter.value,
                  filters: filter.value.filters.filter(
                    (subFilter) => subFilter.value.length > 0
                  ),
                },
              }
        )
        .map((filter) => toEdaFilter(filter, entity.id));
      analysisState.setFilters(edaFilters);
    },
    [analysisState, entity.id]
  );

  // Compose activeFieldState, used by MultiFieldFilter
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

  // Convert EDA filters to WDK filters.
  const wdkFilters = useMemo(() => filters?.map(fromEdaFilter), [filters]);

  // Prevent table from displaying "no data" message
  if (leafSummariesPromise.pending && leafSummariesPromise.value == null)
    return <Loading>Loading data...</Loading>;

  // Show error to user
  if (leafSummariesPromise.error)
    return <div>{String(leafSummariesPromise.error)}</div>;

  return (
    <div className="filter-param" style={{ position: 'relative' }}>
      {(leafSummariesPromise.pending || !countsAreCurrent) && (
        <Loading
          style={{ position: 'absolute', right: 0, left: 0, top: -20 }}
        />
      )}
      <button
        className="btn"
        type="button"
        disabled={countsAreCurrent}
        onClick={() => {
          setThisFilter(_thisFilter);
        }}
      >
        Update distributions now
      </button>
      <MultiFieldFilter
        displayName={entity.displayNamePlural}
        dataCount={totalEntityCount}
        filteredDataCount={filteredEntityCount}
        filters={wdkFilters}
        activeField={activeField}
        activeFieldState={activeFieldState}
        fieldTree={fieldTree}
        onFiltersChange={handleFilterChange}
        onMemberSort={onMemberSort}
        onMemberSearch={onMemberSearch}
        fillBarColor={gray}
        fillFilteredBarColor={red}
      />
    </div>
  );
}

/**
 * Helper function to find the filter associated with an entity/variable
 * @param analysisState
 * @param entity
 * @param variable
 */
function findThisFilter(
  analysisState: AnalysisState,
  entity: StudyEntity,
  variable: MultiFilterVariable
): MultiFilterType | undefined {
  return analysisState.analysis?.descriptor.subset.descriptor.find(
    (filter): filter is MultiFilterType =>
      filter.entityId === entity.id &&
      filter.variableId === variable.id &&
      filter.type === 'multiFilter'
  );
}

/**
 * timings for various multi-filter updates
 *
 * multi-variable		#vars	qa	bob's dev using qa
 * animals on property		9	0.9	3.2
 * cooking fuel			12	1.2	3.8
 * drinking water source	18	1.9	5.7
 * bacteria in stool		59	6.1	15.0
 */
