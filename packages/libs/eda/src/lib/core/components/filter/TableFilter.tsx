import { Loading } from '@veupathdb/wdk-client/lib/Components';
import MembershipField from '@veupathdb/wdk-client/lib/Components/AttributeFilter/MembershipField';
import { MultiFieldSortSpec } from '@veupathdb/wdk-client/lib/Views/Question/Params/FilterParamNew/State';
import { getOrElse, map } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { boolean, keyof, number, partial, string, type, TypeOf } from 'io-ts';
import { useCallback, useMemo } from 'react';
import { usePromise } from '../../hooks/promise';
import { AnalysisState } from '../../hooks/analysis';
import { useSubsettingClient } from '../../hooks/workspace';
import { Filter } from '../../types/filter';
import { NumberVariable, StudyEntity, StudyMetadata } from '../../types/study';
import { fromEdaFilter } from '../../utils/wdk-filter-param-adapter';
import { TableVariable } from './types';
import { getDistribution } from './util';
import { DistributionResponse } from '../../api/SubsettingClient';
import { gray, red } from './colors';
// import axis label unit util
import { variableDisplayWithUnit } from '../../utils/variable-display';
import { useDeepValue } from '../../hooks/immutability';

type Props = {
  studyMetadata: StudyMetadata;
  variable: TableVariable;
  entity: StudyEntity;
  analysisState: AnalysisState;
  totalEntityCount: number;
  filteredEntityCount: number;
};

type UIState = TypeOf<typeof UIState>;
// `io-ts` decoder to validate the stored ui state for this variable.
// If this validation fails, we will fallback to a default value.
// This means that if this type changes, users will lose their settings,
// which is better than complete failure. Using a `partial` type helps with
// this.
//
// eslint-disable-next-line @typescript-eslint/no-redeclare
const UIState = partial({
  sort: type({
    columnKey: keyof({
      value: null,
      count: null,
      filteredCount: null,
    }),
    direction: keyof({
      asc: null,
      desc: null,
    }),
    groupBySelected: boolean,
  }),
  searchTerm: string,
  currentPage: number,
  rowsPerPage: number,
});

const defaultUIState: Required<UIState> = {
  sort: {
    columnKey: 'value',
    direction: 'asc',
    groupBySelected: false,
  },
  searchTerm: '',
  currentPage: 1, // 1-based index,
  rowsPerPage: 50,
};

export function TableFilter({
  studyMetadata,
  variable,
  entity,
  analysisState,
  totalEntityCount,
  filteredEntityCount,
}: Props) {
  const subsettingClient = useSubsettingClient();
  const filters = analysisState.analysis?.descriptor.subset.descriptor;
  const otherFilters = useDeepValue(
    filters?.filter(
      (f) => f.entityId !== entity.id || f.variableId !== variable.id
    )
  );
  const tableSummary = usePromise(
    useCallback(async () => {
      const distribution = await getDistribution<DistributionResponse>(
        {
          entityId: entity.id,
          variableId: variable.id,
          filters: otherFilters,
        },
        (filters) => {
          return subsettingClient.getDistribution(
            studyMetadata.id,
            entity.id,
            variable.id,
            {
              valueSpec: 'count',
              filters,
            }
          );
        }
      );
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
        // first two are used to make sure we're showing the correct distrubution
        entityId: entity.id,
        variableId: variable.id,
        distribution: Object.keys(bgValueByLabel).map((label) => ({
          // Parse label into the appropriate data type
          value: NumberVariable.is(variable) ? Number(label) : label,
          count: bgValueByLabel[label],
          filteredCount: fgValueByLabel[label] ?? 0,
        })),
        entitiesCount:
          distribution.background.statistics.numDistinctEntityRecords,
        filteredEntitiesCount:
          distribution.foreground.statistics.numDistinctEntityRecords,
      };
    }, [entity.id, variable, otherFilters, subsettingClient, studyMetadata.id])
  );
  const activeField = useMemo(
    () => ({
      // add units
      display: variableDisplayWithUnit(variable),
      isRange: false,
      parent: variable.parentId,
      precision: 1,
      term: variable.id,
      type: variable.type,
      variableName: variable.providerLabel,
    }),
    [variable]
  );

  const filter = filters?.find(
    (f) => f.entityId === entity.id && f.variableId === variable.id
  );

  const uiStateKey = `${entity.id}/${variable.id}`;

  const variableUISettings =
    analysisState.analysis?.descriptor.subset.uiSettings;

  const uiState: Required<UIState> = useMemo(() => {
    return pipe(
      variableUISettings?.[uiStateKey],
      UIState.decode,
      // This will overwrite default props with store props.
      // The result is a `Required<UIState>` object.
      map((stored) => ({ ...defaultUIState, ...stored })),
      getOrElse(() => defaultUIState)
    );
  }, [variableUISettings, uiStateKey]);

  const sortedDistribution = useMemo(() => {
    const values: any[] =
      filter == null
        ? []
        : filter.type === 'stringSet'
        ? filter.stringSet
        : filter.type === 'numberSet'
        ? filter.numberSet
        : filter.type === 'dateSet'
        ? filter.dateSet
        : [];
    const newDist = tableSummary.value?.distribution
      .slice()
      // first sort by value
      // note that we are parsing values into strings for sort comparison
      .sort((a, b) =>
        uiState.sort.columnKey === 'value'
          ? variable.vocabulary != null && variable.vocabulary.length
            ? // if available, sort by the variable's 'vocabulary' metadata
              variable.vocabulary.indexOf(String(a.value)) -
              variable.vocabulary.indexOf(String(b.value))
            : // Handle strings w/ numbers, case insensitive
              String(a.value).localeCompare(String(b.value), 'en', {
                numeric: true,
                sensitivity: 'base',
              })
          : // Otherwise, numeric comparison
            a[uiState.sort.columnKey] - b[uiState.sort.columnKey]
      );
    // Reverse sort, if direction is 'desc'
    if (uiState.sort.direction === 'desc') newDist?.reverse();
    // Finally, stable sort selected values before unselected values
    if (uiState.sort.groupBySelected)
      newDist?.sort((a, b) => {
        const aSelected = values.includes(a.value);
        const bSelected = values.includes(b.value);
        return aSelected && bSelected ? 0 : aSelected ? -1 : bSelected ? 1 : 0;
      });
    return newDist;
  }, [tableSummary.value, uiState.sort, filter, variable.vocabulary]);

  const activeFieldState = useMemo(
    () => ({
      loading: false,
      summary: {
        valueCounts: sortedDistribution,
        internalsCount: tableSummary.value?.entitiesCount,
        internalsFilteredCount: tableSummary.value?.filteredEntitiesCount,
      },
      ...uiState,
    }),
    [
      sortedDistribution,
      tableSummary.value?.entitiesCount,
      tableSummary.value?.filteredEntitiesCount,
      uiState,
    ]
  );

  const tableFilter = useMemo(() => {
    return filter && fromEdaFilter(filter);
  }, [filter]);

  const handleSort = useCallback(
    (_: unknown, sort: MultiFieldSortSpec) => {
      analysisState.setVariableUISettings((currentState) => ({
        ...currentState,
        [uiStateKey]: {
          ...uiState,
          sort,
          currentPage: 1,
        },
      }));
    },
    [analysisState, uiStateKey, uiState]
  );

  const handleSearch = useCallback(
    /**
     * shouldResetPaging is true when the number of filtered rows is no longer enough to render
     * rows on the currentPage
     *
     * Example:
     *  We are on page 3 and each page has 50 rows. If our search returns 100 or less rows, page 3
     *  would no longer have any rows to display. Thus, we reset the currentPage to 1.
     */
    (_: unknown, searchTerm: string, shouldResetPaging: boolean = false) => {
      analysisState.setVariableUISettings((currentState) => ({
        ...currentState,
        [uiStateKey]: {
          ...uiState,
          searchTerm,
          ...(shouldResetPaging ? { currentPage: 1 } : {}),
        },
      }));
    },
    [analysisState, uiStateKey, uiState]
  );

  const handlePagination = useCallback(
    (_: unknown, currentPage: number) => {
      analysisState.setVariableUISettings((currentState) => ({
        ...currentState,
        [uiStateKey]: {
          ...uiState,
          currentPage,
        },
      }));
    },
    [analysisState, uiStateKey, uiState]
  );

  const handleRowsPerPage = useCallback(
    (_: unknown, rowsPerPage: number) => {
      analysisState.setVariableUISettings((currentState) => ({
        ...currentState,
        [uiStateKey]: {
          ...uiState,
          rowsPerPage,
        },
      }));
    },
    [analysisState, uiStateKey, uiState]
  );

  const allValues = useMemo(() => {
    return (
      tableSummary.value?.distribution.map((entry) => entry.value) ??
      ([] as TableVariable['type'][])
    );
  }, [tableSummary.value]);

  const handleChange = useCallback(
    (_: unknown, values: (string | number)[] = allValues) => {
      const filters = analysisState.analysis?.descriptor.subset.descriptor;
      const otherFilters = (filters ?? []).filter(
        (f) => f.entityId !== entity.id || f.variableId !== variable.id
      );

      if (values.length === 0) {
        analysisState.setFilters(otherFilters);
      } else {
        const valueProp =
          variable.type === 'string'
            ? 'stringSet'
            : variable.type === 'date'
            ? 'dateSet'
            : 'numberSet';
        analysisState.setFilters(
          otherFilters.concat({
            entityId: entity.id,
            variableId: variable.id,
            [valueProp]: values,
            type: valueProp,
          } as Filter)
        );
      }
    },
    [entity.id, analysisState, variable.id, variable.type, allValues]
  );

  return (
    <div style={{ position: 'relative' }} className="filter-param">
      {tableSummary.pending && (
        <Loading style={{ position: 'absolute', top: '-1.5em' }} radius={2} />
      )}
      {tableSummary.error != null && <pre>{String(tableSummary.error)}</pre>}
      {tableSummary.value &&
        tableSummary.value.entityId === entity.id &&
        tableSummary.value.variableId === variable.id && (
          <MembershipField
            displayName={entity.displayNamePlural ?? entity.displayName}
            dataCount={totalEntityCount}
            filteredDataCount={filteredEntityCount}
            filter={tableFilter}
            activeField={activeField}
            activeFieldState={activeFieldState}
            onChange={handleChange}
            onMemberSort={handleSort}
            onMemberSearch={handleSearch}
            onMemberChangeCurrentPage={handlePagination}
            onMemberChangeRowsPerPage={handleRowsPerPage}
            selectByDefault={false}
            fillBarColor={gray}
            fillFilteredBarColor={red}
            // set Heading1 prefix
            filteredCountHeadingPrefix={'Subset of'}
            unfilteredCountHeadingPrefix={'All'}
            showInternalMesaCounts={true}
          />
        )}
    </div>
  );
}
