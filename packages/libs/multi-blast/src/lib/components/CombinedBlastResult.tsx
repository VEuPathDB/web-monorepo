import { useMemo, useState } from 'react';

import { orderBy } from 'lodash';

import { Link } from '@veupathdb/wdk-client/lib/Components';
import Mesa, { MesaState } from '@veupathdb/wdk-client/lib/Components/Mesa';
import {
  MesaColumn,
  MesaSortObject,
} from '@veupathdb/wdk-client/lib/Core/CommonTypes';

import { MultiQueryReportJson } from '../utils/ServiceTypes';

const GENE_REGEX = /\|\s*gene=([^|\s]+) /;
const GENE_PRODUCT_REGEX = /\|\s*gene_product=([^|]+) \|/;

interface Props {
  combinedResult: MultiQueryReportJson;
}

interface CombinedResultRow {
  accession: string;
  alignmentLength: number;
  description: string | null;
  eValue: number;
  identity: number;
  query: string;
  rank: number;
  score: number;
  wdkPrimaryKey: string | null;
}

export function CombinedBlastResult({ combinedResult }: Props) {
  const wdkRecordType = useWdkRecordType(combinedResult);
  const columns = useCombinedResultColumns(wdkRecordType);
  const rawRows = useRawCombinedResultRows(combinedResult, wdkRecordType);

  const [sort, setSort] = useState<MesaSortObject>({
    columnKey: 'rank',
    direction: 'asc',
  });

  const rows = useSortedCombinedResultRows(rawRows, sort);

  const eventHandlers = useMesaEventHandlers(setSort);

  const uiState = useMesaUiState(sort);

  const mesaState = useMemo(
    () => MesaState.create({ columns, eventHandlers, rows, uiState }),
    [columns, eventHandlers, uiState, rows, sort]
  );

  return <Mesa state={mesaState} />;
}

function useCombinedResultColumns(
  wdkRecordType: string | null
): MesaColumn<keyof CombinedResultRow>[] {
  return [
    {
      key: 'rank',
      name: 'Rank',
      sortable: true,
    },
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

function useRawCombinedResultRows(
  combinedResult: MultiQueryReportJson,
  wdkRecordType: string | null
): CombinedResultRow[] {
  const resultsByQuery = combinedResult.BlastOutput2;

  const unrankedHsps = resultsByQuery.flatMap((queryResult) =>
    queryResult.report.results.search.hits.flatMap((hit) =>
      hit.hsps.map((hsp) => {
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

        const alignmentLength = hsp.align_len;
        const eValue = hsp.evalue;
        const identity = hsp.identity / hsp.align_len;
        const score = hsp.score;

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
    )
  );

  return unrankedHsps.map((unrankedHsp, zeroIndexRank) => ({
    ...unrankedHsp,
    rank: zeroIndexRank + 1,
  }));
}

function useSortedCombinedResultRows(
  unsortedRows: CombinedResultRow[],
  sort: MesaSortObject
) {
  return useMemo(
    () => orderBy(unsortedRows, [sort.columnKey], [sort.direction]),
    [unsortedRows, sort]
  );
}

function useMesaEventHandlers(setSort: (newSort: MesaSortObject) => void) {
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

function useMesaUiState(sort: MesaSortObject) {
  return useMemo(() => ({ sort }), [sort]);
}

function useWdkRecordType(combinedResult: MultiQueryReportJson) {
  return useMemo(() => {
    const sampleDbName = combinedResult.BlastOutput2[0].report.search_target.db;

    return blastDbNameToWdkRecordType(sampleDbName);
  }, [combinedResult]);
}

function blastDbNameToWdkRecordType(blastDbName: string) {
  if (
    blastDbName.endsWith('AnnotatedTranscripts') ||
    blastDbName.endsWith('AnnotatedProteins')
  ) {
    return 'gene';
  } else if (blastDbName.endsWith('Genome')) {
    return 'genomic-sequence';
  } else if (blastDbName.endsWith('ESTs')) {
    return 'est';
  } else if (blastDbName.endsWith('PopSet')) {
    return 'popsetSequence';
  } else {
    return null;
  }
}

function retrieveDataFromHitTitleFactory(regex: RegExp) {
  return function retrieveDataFromHitTitle(hitTitle: string) {
    const match = hitTitle.match(regex);

    return match == null || match[1] == null ? null : match[1];
  };
}

const geneHitTitleToWdkPrimaryKey = retrieveDataFromHitTitleFactory(GENE_REGEX);
const geneHitTitleToDescription = retrieveDataFromHitTitleFactory(
  GENE_PRODUCT_REGEX
);
