import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@veupathdb/wdk-client/lib/Components';
import { MesaState } from '@veupathdb/wdk-client/lib/Components/Mesa';
import {
  MesaColumn,
  MesaSortObject,
} from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

import { groupBy, orderBy } from 'lodash';

import { Props as CombinedResultProps } from '../components/CombinedResult';
import { Props as ResultContainerProps } from '../components/ResultContainer';
import { MultiQueryReportJson } from '../utils/ServiceTypes';
import {
  TargetMetadataByDataType,
  dbNameToTargetTypeTerm,
} from '../utils/targetTypes';
import {
  ACCESSION_HELP_TEXT,
  ALIGNMENT_LENGTH_HELP_TEXT,
  DESCRIPTION_HELP_TEXT,
  E_VALUE_HELP_TEXT,
  INDIVIDUAL_RESULT_HELP_TEXT,
  ORGANISM_HELP_TEXT,
  PERCENT_IDENTITY_HELP_TEXT,
  QUERY_COVERAGE_HELP_TEXT,
  QUERY_HELP_TEXT,
  RANK_PER_QUERY_HELP_TEXT,
  RANK_PER_SUBJECT_HELP_TEXT,
  SCORE_HELP_TEXT,
  CombinedResultRow,
  dbToOrgDirAndTargetDbName,
  dbToOrganismFactory,
  defaultDeflineToDescription,
  defaultDeflineToSourceId,
  defaultGeneDeflineToWdkPrimaryKey,
  mergeIntervals,
  orderHitsBySignificance,
} from '../utils/combinedResults';

const MAX_ROWS = 5000;

interface CombinedResultRows {
  displayable: boolean;
  rows: CombinedResultRow[];
}

export function useCombinedResultProps({
  jobId,
  combinedResult,
  filesToOrganisms,
  hitTypeDisplayName,
  hitTypeDisplayNamePlural,
  targetTypeTerm,
  wdkRecordType,
}: ResultContainerProps): CombinedResultProps {
  const { hitQueryCount, hitSubjectCount, totalQueryCount } = useHitCounts(
    combinedResult
  );

  const columns = useCombinedResultColumns(
    hitTypeDisplayName,
    targetTypeTerm,
    jobId
  );
  const rawRows = useRawCombinedResultRows(
    combinedResult,
    wdkRecordType,
    filesToOrganisms
  );

  const [sort, setSort] = useState<MesaSortObject>({
    columnKey: 'queryRank',
    direction: 'asc',
  });

  const sortedRows = useSortedCombinedResultRows(rawRows, sort);

  const eventHandlers = useMesaEventHandlers(setSort);

  const uiState = useMesaUiState(sort);

  const options = useMesaOptions(sortedRows.displayable);

  const mesaState = useMemo(
    () =>
      MesaState.create({
        columns,
        eventHandlers,
        options,
        rows: sortedRows.rows,
        uiState,
      }),
    [columns, eventHandlers, options, sortedRows.rows, uiState]
  );

  return {
    jobId,
    hitQueryCount,
    hitSubjectCount,
    hitTypeDisplayName,
    hitTypeDisplayNamePlural,
    mesaState,
    totalQueryCount,
  };
}

function useHitCounts(combinedResult: MultiQueryReportJson) {
  const resultsByQuery = combinedResult.BlastOutput2;

  return useMemo(() => {
    const hitQueries = new Set<string>();
    const hitIds = new Set<string>();

    resultsByQuery.forEach((queryResult) => {
      queryResult.report.results.search.hits.forEach((hit) => {
        hitQueries.add(queryResult.report.results.search.query_id);
        hitIds.add(hit.description[0].id);
      });
    });

    return {
      hitQueryCount: hitQueries.size,
      hitSubjectCount: hitIds.size,
      totalQueryCount: resultsByQuery.length,
    };
  }, [resultsByQuery]);
}

function useCombinedResultColumns(
  hitTypeDisplayName: string,
  targetTypeTerm: string,
  jobId: string
): MesaColumn<keyof CombinedResultRow>[] {
  const targetMetadataByDataType = useContext(TargetMetadataByDataType);

  const recordLinkUrlSegment =
    targetMetadataByDataType[targetTypeTerm] == null
      ? undefined
      : targetMetadataByDataType[targetTypeTerm].recordLinkUrlSegment ??
        targetMetadataByDataType[targetTypeTerm].recordClassUrlSegment;

  return useMemo(
    () => [
      {
        key: 'accession',
        name: hitTypeDisplayName,
        renderCell: ({ row }: { row: CombinedResultRow }) =>
          recordLinkUrlSegment == null || row.wdkPrimaryKey == null ? (
            row.accession
          ) : (
            <Link to={`/record/${recordLinkUrlSegment}/${row.wdkPrimaryKey}`}>
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
        key: 'subjectDescription',
        name: 'Description',
        width: '25em',
        renderCell: ({ row }: { row: CombinedResultRow }) => (
          <DescriptionCell
            key={`${row.queryId}/${row.accession}`}
            value={row.subjectDescription}
          />
        ),
        sortable: false,
        helpText: DESCRIPTION_HELP_TEXT,
      },
      {
        key: 'queryDescription',
        name: 'Query',
        sortable: true,
        helpText: QUERY_HELP_TEXT,
      },
      {
        key: 'queryIndex',
        name: 'Individual Result',
        renderCell: ({ row }: { row: CombinedResultRow }) => (
          <Link
            to={`/workspace/blast/result/${jobId}/individual/${row.queryIndex}`}
          >
            See Result
          </Link>
        ),
        helpText: INDIVIDUAL_RESULT_HELP_TEXT,
      },
      {
        key: 'queryRank',
        name: 'Rank Per Query',
        sortable: true,
        helpText: RANK_PER_QUERY_HELP_TEXT,
      },
      {
        key: 'subjectRank',
        name: 'Rank Per Subject',
        sortable: true,
        helpText: RANK_PER_SUBJECT_HELP_TEXT,
      },
      {
        key: 'alignmentLength',
        name: 'Align Length',
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
        renderCell: ({ row }: { row: CombinedResultRow }) =>
          row.score.toFixed(1),
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
      {
        key: 'queryCoverage',
        name: 'Query Coverage',
        renderCell: ({ row }: { row: CombinedResultRow }) =>
          `${(row.queryCoverage * 100).toFixed(2)}%`,
        sortable: true,
        helpText: QUERY_COVERAGE_HELP_TEXT,
      },
    ],
    [hitTypeDisplayName, jobId, recordLinkUrlSegment]
  );
}

function DescriptionCell(props: { value: string }) {
  const [isExpanded, setExpanded] = useState(false);

  const textContents = props.value;

  const fullHtmlContents = useMemo(
    () =>
      textContents.split(/\s*\|\s*/g).map((line, i, lines) => {
        const [key, value] = line.split('=');

        return (
          <Fragment key={key}>
            <strong>{key}=</strong>
            {value}
            {i < lines.length - 1 && <br />}
          </Fragment>
        );
      }),
    [textContents]
  );

  const truncatedHtmlContents = useMemo(() => fullHtmlContents.slice(0, 2), [
    fullHtmlContents,
  ]);

  const toggleExpansion = useCallback(() => {
    setExpanded((isExpanded) => !isExpanded);
  }, []);

  return (
    <div>
      {truncatedHtmlContents.length === fullHtmlContents.length || !isExpanded
        ? truncatedHtmlContents
        : fullHtmlContents}
      <div>
        {fullHtmlContents.length > truncatedHtmlContents.length && (
          <button type="button" className="link" onClick={toggleExpansion}>
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>
    </div>
  );
}

function useRawCombinedResultRows(
  combinedResult: MultiQueryReportJson,
  wdkRecordType: string,
  filesToOrganisms: Record<string, string>
): CombinedResultRows {
  const resultsByQuery = combinedResult.BlastOutput2;

  const rawRows = useMemo(() => {
    const dbToOrganism = dbToOrganismFactory(filesToOrganisms);

    const unrankedHits = resultsByQuery.flatMap((queryResult, queryZeroIndex) =>
      queryResult.report.results.search.hits.map((hit) => {
        const bestHsp = hit.hsps[0];

        const defline = hit.description[0].title;

        const accession = defaultDeflineToSourceId(defline) ?? defline;

        const subjectDescription =
          defaultDeflineToDescription(defline) ?? defline;

        const organism = dbToOrganism(queryResult.report.search_target.db);

        const {
          query_id: queryId,
          query_title: queryTitle,
          query_len: queryLength,
        } = queryResult.report.results.search;

        const wdkPrimaryKey =
          wdkRecordType === 'transcript'
            ? defaultGeneDeflineToWdkPrimaryKey(defline)
            : accession;

        const alignmentLength = bestHsp.align_len;
        const eValue = bestHsp.evalue;
        const identity = bestHsp.identity / bestHsp.align_len;
        const score = bestHsp.bit_score;

        const queryIntervals = hit.hsps.map(({ query_from, query_to }) => ({
          left: query_from,
          right: query_to,
        }));
        const mergedQueryIntervals = mergeIntervals(queryIntervals);
        const coveredQueryLength = mergedQueryIntervals.reduce(
          (memo, { left, right }) => memo + right - left + 1,
          0
        );
        const queryCoverage = coveredQueryLength / queryLength;

        return {
          accession,
          alignmentLength,
          eValue,
          identity,
          organism,
          queryCoverage,
          queryDescription: queryTitle == null ? queryId : queryTitle,
          queryId,
          queryIndex: queryZeroIndex + 1,
          queryTitle: queryTitle ?? null,
          score,
          subjectDescription,
          wdkPrimaryKey,
        };
      })
    );

    const hitsGroupedByQuery = groupBy(unrankedHits, 'queryId');
    const hitsGroupedBySubject = groupBy(unrankedHits, 'accession');

    const byQueryRanks = Object.entries(hitsGroupedByQuery).reduce(
      (memo, [queryId, queryGroup]) => {
        const queryGroupOrderedBySignificance = orderHitsBySignificance(
          queryGroup
        );

        queryGroupOrderedBySignificance.forEach(
          ({ accession: subjectId }, zeroIndexRank) => {
            memo[`${queryId}/${subjectId}`] = zeroIndexRank + 1;
          }
        );

        return memo;
      },
      {} as Record<string, number>
    );

    const bySubjectRanks = Object.entries(hitsGroupedBySubject).reduce(
      (memo, [subjectId, subjectGroup]) => {
        const subjectGroupOrderedBySignificance = orderHitsBySignificance(
          subjectGroup
        );

        subjectGroupOrderedBySignificance.forEach(
          ({ queryId }, zeroIndexRank) => {
            memo[`${queryId}/${subjectId}`] = zeroIndexRank + 1;
          }
        );

        return memo;
      },
      {} as Record<string, number>
    );

    return unrankedHits.map((unrankedHit) => {
      const querySubjectPairKey = `${unrankedHit.queryId}/${unrankedHit.accession}`;

      return {
        ...unrankedHit,
        queryRank: byQueryRanks[querySubjectPairKey],
        subjectRank: bySubjectRanks[querySubjectPairKey],
      };
    });
  }, [filesToOrganisms, resultsByQuery, wdkRecordType]);

  return useMemo(
    () =>
      rawRows.length > MAX_ROWS
        ? { displayable: false, rows: [] }
        : { displayable: true, rows: rawRows },
    [rawRows]
  );
}

function useSortedCombinedResultRows(
  unsortedRows: CombinedResultRows,
  sort: MesaSortObject
): CombinedResultRows {
  const [sortedRows, setSortedRows] = useState(unsortedRows);

  useEffect(() => {
    setSortedRows(unsortedRows);
  }, [unsortedRows]);

  useEffect(() => {
    setSortedRows((sortedRows) =>
      !sortedRows.displayable
        ? sortedRows
        : {
            displayable: true,
            rows: orderBy(sortedRows.rows, [sort.columnKey], [sort.direction]),
          }
    );
  }, [sort]);

  return sortedRows;
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

function useMesaOptions(rowsDisplayable: boolean) {
  return useMemo(
    () => ({
      useStickyHeader: true,
      tableBodyMaxHeight: '60vh',
      toolbar: true,
      renderEmptyState: rowsDisplayable
        ? undefined
        : () => (
            <div className="EmptyState">
              <div className="EmptyState-BodyWrapper">
                <p>Your combined result is too large for us to display here.</p>
                <p>
                  If you would like to view your combined results, please use
                  the <span className="InlineHeader">Download all results</span>{' '}
                  dropdown to download them in a format of your choice.
                </p>
              </div>
            </div>
          ),
    }),
    [rowsDisplayable]
  );
}

export function useTargetTypeTermAndWdkRecordType(
  combinedResult: MultiQueryReportJson
) {
  const targetMetadataByDataType = useContext(TargetMetadataByDataType);

  return useMemo(() => {
    const sampleDbName = combinedResult.BlastOutput2[0].report.search_target.db;
    const { targetDbName } = dbToOrgDirAndTargetDbName(sampleDbName);

    const targetTypeTerm = targetDbName && dbNameToTargetTypeTerm(targetDbName);

    const wdkRecordType =
      targetTypeTerm == null || targetMetadataByDataType[targetTypeTerm] == null
        ? undefined
        : targetMetadataByDataType[targetTypeTerm].recordClassUrlSegment;

    if (targetTypeTerm == null || wdkRecordType == null) {
      throw new Error(
        `Unable to infer the record type of the DB named ${sampleDbName}`
      );
    }

    return {
      targetTypeTerm,
      wdkRecordType,
    };
  }, [combinedResult, targetMetadataByDataType]);
}

export function useHitTypeDisplayNames(wdkRecordType: string) {
  const recordClasses = useSelector(
    (state: RootState) => state.globalData.recordClasses
  );

  return useMemo(() => {
    const recordClass = recordClasses?.find(
      ({ urlSegment }) => urlSegment === wdkRecordType
    );

    return recordClass == null
      ? {
          hitTypeDisplayName: 'Hit',
          hitTypeDisplayNamePlural: 'Hits',
        }
      : {
          hitTypeDisplayName: recordClass.shortDisplayName,
          hitTypeDisplayNamePlural: recordClass.shortDisplayNamePlural,
        };
  }, [recordClasses, wdkRecordType]);
}
