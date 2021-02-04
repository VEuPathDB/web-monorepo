import { Link } from '@veupathdb/wdk-client/lib/Components';
import {
  MesaColumn,
  MesaSortObject,
} from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { groupBy, mapValues, orderBy } from 'lodash';
import { useMemo } from 'react';
import {
  blastDbNameToWdkRecordType,
  CombinedResultRow,
  geneHitTitleToDescription,
  geneHitTitleToWdkPrimaryKey,
} from '../utils/combinedResults';
import { MultiQueryReportJson } from '../utils/ServiceTypes';

export function useCombinedResultColumns(
  wdkRecordType: string | null
): MesaColumn<keyof CombinedResultRow>[] {
  return [
    {
      key: 'accession',
      name: 'Hit',
      renderCell: ({ row }: { row: CombinedResultRow }) =>
        wdkRecordType == null || row.wdkPrimaryKey == null ? (
          row.accession
        ) : (
          <Link to={`/record/${wdkRecordType}/${row.wdkPrimaryKey}`}>
            {row.accession}
          </Link>
        ),
      sortable: true,
    },
    {
      key: 'description',
      name: 'Description',
      renderCell: ({ row }: { row: CombinedResultRow }) =>
        row.description == null ? '' : row.description,
      sortable: true,
    },
    {
      key: 'query',
      name: 'Query',
      sortable: true,
    },
    {
      key: 'rank',
      name: 'Rank',
      sortable: true,
    },
    {
      key: 'alignmentLength',
      name: 'Aln Length',
      sortable: true,
    },
    {
      key: 'eValue',
      name: 'E-Value',
      renderCell: ({ row }: { row: CombinedResultRow }) =>
        row.eValue.toExponential(2),
      sortable: true,
    },
    {
      key: 'score',
      name: 'Score',
      sortable: true,
    },
    {
      key: 'identity',
      name: 'Identity',
      renderCell: ({ row }: { row: CombinedResultRow }) =>
        `${(row.identity * 100).toFixed(2)}%`,
      sortable: true,
    },
  ];
}

export function useRawCombinedResultRows(
  combinedResult: MultiQueryReportJson,
  wdkRecordType: string | null
): CombinedResultRow[] {
  const resultsByQuery = combinedResult.BlastOutput2;

  return useMemo(() => {
    const unrankedHits = resultsByQuery.flatMap((queryResult) =>
      queryResult.report.results.search.hits.map((hit) => {
        const bestHsp = hit.hsps[0];

        const title = hit.description[0].title;

        const accession = title.replace(/\s+[\s\S]*/, '');

        const description =
          wdkRecordType === 'gene' ? geneHitTitleToDescription(title) : null;

        const {
          query_id: queryId,
          query_title: queryTitle,
        } = queryResult.report.results.search;

        const query =
          queryTitle == null ? queryId : `${queryTitle} (${queryId})`;

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
          description,
          eValue,
          identity,
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
  }, [resultsByQuery, wdkRecordType]);
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
