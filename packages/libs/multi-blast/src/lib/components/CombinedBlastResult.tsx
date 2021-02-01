import { useMemo } from 'react';

import { Link } from '@veupathdb/wdk-client/lib/Components';
import Mesa, { MesaState } from '@veupathdb/wdk-client/lib/Components/Mesa';
import { MesaColumn } from '@veupathdb/wdk-client/lib/Core/CommonTypes';

import { MultiQueryReportJson } from '../utils/ServiceTypes';

const GENE_REGEX = /\|\s*gene=([^|\s]+) /;
const GENE_PRODUCT_REGEX = /\|\s*gene_product=([^|]+) \|/;

interface Props {
  combinedResult: MultiQueryReportJson;
}

interface CombinedResultRow {
  accession: string;
  description: string | null;
  rank: number;
  wdkPrimaryKey: string | null;
}

export function CombinedBlastResult({ combinedResult }: Props) {
  const wdkRecordType = useWdkRecordType(combinedResult);
  const columns = useCombinedResultColumns(wdkRecordType);
  const rows = useCombinedResultRows(combinedResult, wdkRecordType);

  const mesaState = useMemo(() => MesaState.create({ columns, rows }), [
    columns,
    rows,
  ]);

  return <Mesa state={mesaState} />;
}

function useCombinedResultColumns(
  wdkRecordType: string | null
): MesaColumn<keyof CombinedResultRow>[] {
  return [
    {
      key: 'rank',
      name: 'Rank',
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
    },
    {
      key: 'description',
      name: 'Description',
      renderCell: ({ row }: { row: CombinedResultRow }) =>
        row.description == null ? '' : row.description,
    },
  ];
}

function useCombinedResultRows(
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

        const wdkPrimaryKey =
          wdkRecordType === 'gene'
            ? geneHitTitleToWdkPrimaryKey(title)
            : accession;

        return {
          accession,
          description,
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
