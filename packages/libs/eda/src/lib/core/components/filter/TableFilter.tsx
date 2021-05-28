import { Loading } from '@veupathdb/wdk-client/lib/Components';
import MembershipField from '@veupathdb/wdk-client/lib/Components/AttributeFilter/MembershipField';
import { MultiFieldSortSpec } from '@veupathdb/wdk-client/lib/Views/Question/Params/FilterParamNew/State';
import { getOrElse, map } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { boolean, keyof, number, partial, string, type, TypeOf } from 'io-ts';
import { useCallback, useMemo } from 'react';
import { BarplotResponse } from '../../api/data-api';
import { usePromise } from '../../hooks/promise';
import { SessionState } from '../../hooks/session';
import { useDataClient } from '../../hooks/workspace';
import { Filter } from '../../types/filter';
import { StudyEntity, StudyMetadata } from '../../types/study';
import { fromEdaFilter } from '../../utils/wdk-filter-param-adapter';
import { TableVariable } from './types';
import { getDistribution } from './util';

type Props = {
  studyMetadata: StudyMetadata;
  variable: TableVariable;
  entity: StudyEntity;
  sessionState: SessionState;
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
  sessionState,
  totalEntityCount,
  filteredEntityCount,
}: Props) {
  const dataClient = useDataClient();
  const tableSummary = usePromise(
    useCallback(async () => {
      const distribution = await getDistribution<BarplotResponse>(
        {
          entityId: entity.id,
          variableId: variable.id,
          filters: sessionState.session?.filters,
        },
        (filters) => {
          return dataClient.getBarplot('pass', {
            studyId: studyMetadata.id,
            filters,
            config: {
              outputEntityId: entity.id,
              valueSpec: 'count',
              xAxisVariable: {
                entityId: entity.id,
                variableId: variable.id,
              },
            },
          });
        }
      );
      //DKDK by setting union for label (array number or string), ts error occurs
      const fgValueByLabel = Object.fromEntries(
        distribution.foreground.barplot.data[0].label.map(
          (label: string | number, index: number) => [
            label,
            distribution.foreground.barplot.data[0].value[index] ?? 0,
          ]
        )
      );
      const bgValueByLabel = Object.fromEntries(
        distribution.background.barplot.data[0].label.map(
          (label: string | number, index: number) => [
            label,
            distribution.background.barplot.data[0].value[index] ?? 0,
          ]
        )
      );
      return {
        // first two are used to make sure we're showing the correct distrubution
        entityId: entity.id,
        variableId: variable.id,
        distribution: Object.keys(bgValueByLabel).map((label) => ({
          value: label,
          count: bgValueByLabel[label],
          filteredCount: fgValueByLabel[label] ?? 0,
        })),
        entitiesCount: Array.isArray(
          distribution.background.completeCasesTable[0].completeCases
        )
          ? distribution.background.completeCasesTable[0].completeCases[0]
          : distribution.background.completeCasesTable[0].completeCases,
        filteredEntitiesCount: Array.isArray(
          distribution.foreground.completeCasesTable[0].completeCases
        )
          ? distribution.foreground.completeCasesTable[0].completeCases[0]
          : distribution.foreground.completeCasesTable[0].completeCases,
      };
    }, [
      entity.id,
      variable.id,
      sessionState.session?.filters,
      totalEntityCount,
      filteredEntityCount,
      dataClient,
      studyMetadata.id,
    ])
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

  const filter = sessionState.session?.filters.find(
    (f) => f.entityId === entity.id && f.variableId === variable.id
  );

  const uiStateKey = `${entity.id}/${variable.id}`;

  const uiState: Required<UIState> = useMemo(() => {
    return pipe(
      sessionState.session?.variableUISettings[uiStateKey],
      UIState.decode,
      // This will overwrite default props with store props.
      // The result is a `Required<UIState>` object.
      map((stored) => ({ ...defaultUIState, ...stored })),
      getOrElse(() => defaultUIState)
    );
  }, [sessionState.session?.variableUISettings, uiStateKey]);

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
      .sort((a, b) =>
        uiState.sort.columnKey === 'value'
          ? // Handle strings w/ numbers, case insensitive
            a.value.localeCompare(b.value, 'en', {
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
  }, [tableSummary.value, uiState.sort, filter]);

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
      sessionState.setVariableUISettings({
        [uiStateKey]: {
          ...uiState,
          sort,
        },
      });
    },
    [sessionState, uiStateKey, uiState]
  );

  const handleSearch = useCallback(
    (_: unknown, searchTerm: string) => {
      sessionState.setVariableUISettings({
        [uiStateKey]: {
          ...uiState,
          searchTerm,
        },
      });
    },
    [sessionState, uiStateKey, uiState]
  );

  const handlePagination = useCallback(
    (_: unknown, currentPage: number) => {
      sessionState.setVariableUISettings({
        [uiStateKey]: {
          ...uiState,
          currentPage,
        },
      });
    },
    [sessionState, uiStateKey, uiState]
  );

  const handleRowsPerPage = useCallback(
    (_: unknown, rowsPerPage: number) => {
      sessionState.setVariableUISettings({
        [uiStateKey]: {
          ...uiState,
          rowsPerPage,
        },
      });
    },
    [sessionState, uiStateKey, uiState]
  );

  const allValues = useMemo(() => {
    return (
      tableSummary.value?.distribution.map((entry) => entry.value) ??
      ([] as TableVariable['type'][])
    );
  }, [tableSummary.value]);

  const handleChange = useCallback(
    (_: unknown, values: string[] = allValues) => {
      const otherFilters = (sessionState.session?.filters ?? []).filter(
        (f) => f.entityId !== entity.id || f.variableId !== variable.id
      );

      if (values.length === 0) {
        sessionState.setFilters(otherFilters);
      } else {
        const valueProp =
          variable.type === 'string'
            ? 'stringSet'
            : variable.type === 'date'
            ? 'dateSet'
            : 'numberSet';
        sessionState.setFilters(
          otherFilters.concat({
            entityId: entity.id,
            variableId: variable.id,
            [valueProp]: values,
            type: valueProp,
          } as Filter)
        );
      }
    },
    [entity.id, sessionState, variable.id, variable.type, allValues]
  );

  return (
    <div style={{ position: 'relative' }} className="filter-param">
      {tableSummary.pending && (
        <Loading style={{ position: 'absolute', top: '-1.5em' }} radius={2} />
      )}
      {tableSummary.error && <pre>{String(tableSummary.error)}</pre>}
      {tableSummary.value &&
        tableSummary.value.entityId === entity.id &&
        tableSummary.value.variableId === variable.id && (
          <MembershipField
            displayName={entity.displayName}
            dataCount={totalEntityCount}
            filteredDataCount={tableSummary.value.filteredEntitiesCount}
            filter={tableFilter}
            activeField={activeField}
            activeFieldState={activeFieldState}
            onChange={handleChange}
            onMemberSort={handleSort}
            onMemberSearch={handleSearch}
            onMemberChangeCurrentPage={handlePagination}
            onMemberChangeRowsPerPage={handleRowsPerPage}
            selectByDefault={false}
            // set Heading1 prefix
            filteredCountHeadingPrefix={'Subset of'}
          />
        )}
    </div>
  );
}
