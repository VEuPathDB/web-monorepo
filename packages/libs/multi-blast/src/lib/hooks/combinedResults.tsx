import { Link } from '@veupathdb/wdk-client/lib/Components';
import {
  MesaColumn,
  MesaSortObject,
} from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

import { groupBy, mapValues, orderBy } from 'lodash';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  ACCESSION_HELP_TEXT,
  ALIGNMENT_LENGTH_HELP_TEXT,
  E_VALUE_HELP_TEXT,
  ORGANISM_HELP_TEXT,
  PERCENT_IDENTITY_HELP_TEXT,
  QUERY_HELP_TEXT,
  RANK_BY_SUBJECT_HELP_TEXT,
  SCORE_HELP_TEXT,
  CombinedResultRow,
  blastDbNameToWdkRecordType,
  dbToOrganismFactory,
  geneHitTitleToWdkPrimaryKey,
} from '../utils/combinedResults';
import { MultiQueryReportJson } from '../utils/ServiceTypes';

export function useCombinedResultColumns(
  hitTypeDisplayName: string,
  wdkRecordType: string | null
): MesaColumn<keyof CombinedResultRow>[] {
  return useMemo(
    () => [
      {
        key: 'accession',
        name: hitTypeDisplayName,
        renderCell: ({ row }: { row: CombinedResultRow }) =>
          wdkRecordType == null || row.wdkPrimaryKey == null ? (
            row.accession
          ) : (
            <Link to={`/record/${wdkRecordType}/${row.wdkPrimaryKey}`}>
              {row.accession}
            </Link>
          ),
        sortable: true,
        helpText: ACCESSION_HELP_TEXT,
      },
      {
        key: 'organism',
        name: 'Organism',
        renderCell: ({ row }: { row: CombinedResultRow }) =>
          row.organism == null ? '' : row.organism,
        sortable: true,
        helpText: ORGANISM_HELP_TEXT,
      },
      {
        key: 'query',
        name: 'Query',
        sortable: true,
        helpText: QUERY_HELP_TEXT,
      },
      {
        key: 'rank',
        name: 'Rank',
        sortable: true,
        helpText: RANK_BY_SUBJECT_HELP_TEXT,
      },
      {
        key: 'alignmentLength',
        name: 'Aln Length',
        sortable: true,
        helpText: ALIGNMENT_LENGTH_HELP_TEXT,
      },
      {
        key: 'eValue',
        name: 'E-Value',
        renderCell: ({ row }: { row: CombinedResultRow }) =>
          row.eValue.toExponential(2),
        sortable: true,
        helpText: E_VALUE_HELP_TEXT,
      },
      {
        key: 'score',
        name: 'Score',
        sortable: true,
        helpText: SCORE_HELP_TEXT,
      },
      {
        key: 'identity',
        name: 'Identity',
        renderCell: ({ row }: { row: CombinedResultRow }) =>
          `${(row.identity * 100).toFixed(2)}%`,
        sortable: true,
        helpText: PERCENT_IDENTITY_HELP_TEXT,
      },
    ],
    [hitTypeDisplayName, wdkRecordType]
  );
}

export function useRawCombinedResultRows(
  combinedResult: MultiQueryReportJson,
  wdkRecordType: string | null,
  filesToOrganisms: Record<string, string>
): CombinedResultRow[] {
  const resultsByQuery = combinedResult.BlastOutput2;

  return useMemo(() => {
    const dbToOrganism = dbToOrganismFactory(filesToOrganisms);

    const unrankedHits = resultsByQuery.flatMap((queryResult) =>
      queryResult.report.results.search.hits.map((hit) => {
        const bestHsp = hit.hsps[0];

        const title = hit.description[0].title;

        const accession = title.replace(/\s+[\s\S]*/, '');

        const organism = dbToOrganism(queryResult.report.search_target.db);

        const {
          query_id: queryId,
          query_title: queryTitle,
        } = queryResult.report.results.search;

        const query = queryTitle == null ? queryId : queryTitle;

        const wdkPrimaryKey =
          wdkRecordType === 'gene'
            ? geneHitTitleToWdkPrimaryKey(title)
            : accession;

        const alignmentLength = bestHsp.align_len;
        const eValue = bestHsp.evalue;
        const identity = bestHsp.identity / bestHsp.align_len;
        const score = bestHsp.score;

        return {
          accession,
          alignmentLength,
          eValue,
          identity,
          organism,
          query,
          score,
          wdkPrimaryKey,
        };
      })
    );

    const hitsGroupedByTarget = groupBy(unrankedHits, 'accession');

    const groupedHitsWithRank = mapValues(
      hitsGroupedByTarget,
      (hitsByTarget) => {
        const hitsOrderedBySignificance = orderBy(
          hitsByTarget,
          ['eValue', 'score', 'identity'],
          ['asc', 'desc', 'asc']
        );

        return hitsOrderedBySignificance.map((unrankedHit, zeroIndexRank) => ({
          ...unrankedHit,
          rank: zeroIndexRank + 1,
        }));
      }
    );

    return Object.values(groupedHitsWithRank).reduce((memo, hitGroup) => {
      memo.push(...hitGroup);

      return memo;
    }, [] as CombinedResultRow[]);
  }, [filesToOrganisms, resultsByQuery, wdkRecordType]);
}

export function useSortedCombinedResultRows(
  unsortedRows: CombinedResultRow[],
  sort: MesaSortObject
) {
  return useMemo(
    () => orderBy(unsortedRows, [sort.columnKey], [sort.direction]),
    [unsortedRows, sort]
  );
}

export function useMesaEventHandlers(
  setSort: (newSort: MesaSortObject) => void
) {
  return useMemo(
    () => ({
      onSort: (
        { key: columnKey }: { key: keyof CombinedResultRow },
        direction: MesaSortObject['direction']
      ) => {
        setSort({ columnKey, direction });
      },
    }),
    [setSort]
  );
}

export function useMesaUiState(sort: MesaSortObject) {
  return useMemo(() => ({ sort }), [sort]);
}

export function useWdkRecordType(combinedResult: MultiQueryReportJson) {
  return useMemo(() => {
    const sampleDbName = combinedResult.BlastOutput2[0].report.search_target.db;

    return blastDbNameToWdkRecordType(sampleDbName);
  }, [combinedResult]);
}

export function useHitTypeDisplayName(wdkRecordType: string | null) {
  const recordClasses = useSelector(
    (state: RootState) => state.globalData.recordClasses
  );

  return useMemo(() => {
    const recordClass = recordClasses?.find(
      ({ urlSegment }) => urlSegment === wdkRecordType
    );

    return recordClass == null ? 'Hit' : recordClass.shortDisplayName;
  }, [recordClasses, wdkRecordType]);
}
