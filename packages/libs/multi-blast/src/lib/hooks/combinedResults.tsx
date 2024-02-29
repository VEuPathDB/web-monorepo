import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

import { saveAs } from 'file-saver';
import { Either, left, isLeft, isRight, map, right } from 'fp-ts/Either';
import { groupBy, orderBy } from 'lodash';

import { Link } from '@veupathdb/wdk-client/lib/Components';
import { MesaState } from '@veupathdb/coreui/lib/components/Mesa';
import {
  MesaColumn,
  MesaSortObject,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

import {
  Props as CombinedResultProps,
  TableState,
} from '../components/CombinedResult';
import { Props as ResultContainerProps } from '../components/ResultContainer';
import {
  ApiResult,
  ErrorDetails,
  MultiQueryReportJson,
} from '../utils/ServiceTypes';
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
  defaultDeflineToDescription,
  defaultDeflineToOrganism,
  defaultDeflineToSourceId,
  defaultGeneDeflineToWdkPrimaryKey,
  mergeIntervals,
  orderHitsBySignificance,
} from '../utils/combinedResults';
import { IOJobTarget } from '../utils/api/query/types/common';

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
  organismToProject,
  projectUrls,
  targetTypeTerm,
  wdkRecordType,
}: ResultContainerProps & {
  combinedResult: ApiResult<MultiQueryReportJson, ErrorDetails>;
  organismToProject: Record<string, string>;
  projectUrls: Record<string, string>;
}): CombinedResultProps {
  const { hitQueryCount, hitSubjectCount, totalQueryCount } =
    useHitCounts(combinedResult);

  const columns = useCombinedResultColumns(
    hitTypeDisplayName,
    targetTypeTerm,
    jobId,
    organismToProject,
    projectUrls
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

  const options = useMesaOptions(sortedRows);

  const tableState = useMemo((): CombinedResultProps['tableState'] => {
    const baseTableConfig = {
      columns,
      eventHandlers,
      options,
      uiState,
    };

    return isLeft(sortedRows) && sortedRows.left.status === 'too-large'
      ? right(
          MesaState.create({
            ...baseTableConfig,
            rows: [],
          })
        )
      : map<CombinedResultRows, TableState>((sortedRows) =>
          MesaState.create({
            ...baseTableConfig,
            rows: sortedRows.displayable ? sortedRows.rows : [],
          })
        )(sortedRows);
  }, [columns, eventHandlers, options, sortedRows, uiState]);

  const downloadTableOptions: CombinedResultProps['downloadTableOptions'] =
    useMemo(() => {
      if (isLeft(sortedRows)) {
        return {
          offer: false,
        };
      }

      return {
        offer: true,
        onClickDownloadTable: () => {
          const combinedReportBlob = new Blob(
            [
              [
                'Accession',
                'Organism',
                'Query',
                'Rank Per Query',
                'Rank Per Subject',
                'Align Length',
                'E-Value',
                'Score',
                'Identity',
                'Query Coverage',
              ].join(','),
              '\n',
              sortedRows.right.rows
                .map((row) =>
                  [
                    row.accession,
                    row.organism,
                    row.queryTitle,
                    row.queryRank,
                    row.subjectRank,
                    row.alignmentLength,
                    row.eValue,
                    row.score,
                    row.identity,
                    row.queryCoverage,
                  ].join(',')
                )
                .join('\n'),
              '\n',
            ],
            { type: 'text/csv' }
          );

          saveAs(combinedReportBlob, `${jobId}-combined-report`);
        },
      };
    }, [jobId, sortedRows]);

  return {
    jobId,
    hitQueryCount,
    hitSubjectCount,
    hitTypeDisplayName,
    hitTypeDisplayNamePlural,
    tableState,
    totalQueryCount,
    downloadTableOptions,
  };
}

function useHitCounts(
  combinedResult: ApiResult<MultiQueryReportJson, ErrorDetails>
) {
  const resultsByQuery =
    combinedResult.status === 'ok'
      ? combinedResult.value.BlastOutput2
      : undefined;

  return useMemo(() => {
    if (resultsByQuery == null) {
      return {
        hitQueryCount: undefined,
        hitSubjectCount: undefined,
        totalQueryCount: undefined,
      };
    }

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
  jobId: string,
  organismToProject: Record<string, string>,
  projectUrls: Record<string, string>
): MesaColumn<CombinedResultRow>[] {
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
        renderCell: makeRenderAccessionCell({
          recordLinkUrlSegment,
          organismToProject,
          projectUrls,
        }),
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
    [
      hitTypeDisplayName,
      jobId,
      organismToProject,
      projectUrls,
      recordLinkUrlSegment,
    ]
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

  const truncatedHtmlContents = useMemo(
    () => fullHtmlContents.slice(0, 2),
    [fullHtmlContents]
  );

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
  combinedResult: ApiResult<MultiQueryReportJson, ErrorDetails>,
  wdkRecordType: string,
  filesToOrganisms: Record<string, string>
): Either<ErrorDetails, CombinedResultRows> {
  const rawRows = useMemo((): Either<ErrorDetails, CombinedResultRow[]> => {
    if (combinedResult.status === 'error') {
      return left(combinedResult.details);
    }

    const resultsByQuery = combinedResult.value.BlastOutput2;

    const organismDeflineToDisplayFormatEntries = Object.values(
      filesToOrganisms
    ).map((organismDisplayFormat) => {
      const organismDeflineFormat = organismDisplayFormat.split(' ').join('_');

      return [organismDeflineFormat, organismDisplayFormat] as const;
    });

    const organismDeflineToDisplayFormat = Object.fromEntries(
      organismDeflineToDisplayFormatEntries
    );

    const unrankedHits = resultsByQuery.flatMap((queryResult, queryZeroIndex) =>
      queryResult.report.results.search.hits.map((hit) => {
        const bestHsp = hit.hsps[0];

        const defline = hit.description[0].title;

        const accession = defaultDeflineToSourceId(defline) ?? defline;

        const subjectDescription =
          defaultDeflineToDescription(defline) ?? defline;

        const organismDeflineFormat = defaultDeflineToOrganism(defline);

        const organism =
          organismDeflineFormat &&
          organismDeflineToDisplayFormat[organismDeflineFormat];

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
        const queryGroupOrderedBySignificance =
          orderHitsBySignificance(queryGroup);

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
        const subjectGroupOrderedBySignificance =
          orderHitsBySignificance(subjectGroup);

        subjectGroupOrderedBySignificance.forEach(
          ({ queryId }, zeroIndexRank) => {
            memo[`${queryId}/${subjectId}`] = zeroIndexRank + 1;
          }
        );

        return memo;
      },
      {} as Record<string, number>
    );

    return right(
      unrankedHits.map((unrankedHit) => {
        const querySubjectPairKey = `${unrankedHit.queryId}/${unrankedHit.accession}`;

        return {
          ...unrankedHit,
          queryRank: byQueryRanks[querySubjectPairKey],
          subjectRank: bySubjectRanks[querySubjectPairKey],
        };
      })
    );
  }, [combinedResult, filesToOrganisms, wdkRecordType]);

  return useMemo(
    () =>
      map<CombinedResultRow[], CombinedResultRows>((rawRows) => ({
        displayable: rawRows.length <= MAX_ROWS,
        rows: rawRows,
      }))(rawRows),
    [rawRows]
  );
}

function useSortedCombinedResultRows(
  unsortedRows: Either<ErrorDetails, CombinedResultRows>,
  sort: MesaSortObject
): Either<ErrorDetails, CombinedResultRows> {
  const [sortedRows, setSortedRows] = useState(unsortedRows);

  useEffect(() => {
    setSortedRows(unsortedRows);
  }, [unsortedRows]);

  useEffect(() => {
    setSortedRows((sortedRows) =>
      map<CombinedResultRows, CombinedResultRows>((sortedRows) =>
        !sortedRows.displayable
          ? sortedRows
          : {
              displayable: true,
              rows: orderBy(
                sortedRows.rows,
                [sort.columnKey],
                [sort.direction]
              ),
            }
      )(sortedRows)
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

function useMesaOptions(sortedRows: Either<ErrorDetails, CombinedResultRows>) {
  const rowsDisplayable = useMemo(
    () => isRight(sortedRows) && sortedRows.right.displayable,
    [sortedRows]
  );

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
                  If you would like to view your combined result, please use the
                  download options above.
                </p>
              </div>
            </div>
          ),
    }),
    [rowsDisplayable]
  );
}

export function useTargetTypeTermAndWdkRecordType(targets: IOJobTarget[]) {
  const targetMetadataByDataType = useContext(TargetMetadataByDataType);

  return useMemo(() => {
    const { targetDisplayName: sampleOrganism, targetFile: sampleDbName } =
      targets[0];
    const targetDbName = sampleDbName.replace(sampleOrganism, '');
    const targetTypeTerm = dbNameToTargetTypeTerm(targetDbName);

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
  }, [targets, targetMetadataByDataType]);
}

export function useHitTypeDisplayNames(
  wdkRecordType: string,
  targetType: string
) {
  const recordClasses = useSelector(
    (state: RootState) => state.globalData.recordClasses
  );

  const targetMetadataByDataType = useContext(TargetMetadataByDataType);
  const targetMetadata = targetMetadataByDataType[targetType];

  return useMemo(() => {
    const recordClass = recordClasses?.find(
      ({ urlSegment }) => urlSegment === wdkRecordType
    );

    const hitTypeDisplayName =
      targetMetadata?.hitDisplayName ?? recordClass?.shortDisplayName ?? 'Hit';
    const hitTypeDisplayNamePlural =
      targetMetadata?.hitDisplayNamePlural ??
      recordClass?.shortDisplayNamePlural ??
      'Hit';

    return {
      hitTypeDisplayName,
      hitTypeDisplayNamePlural,
    };
  }, [recordClasses, targetMetadata, wdkRecordType]);
}

function makeRenderAccessionCell({
  recordLinkUrlSegment,
  organismToProject,
  projectUrls,
}: {
  recordLinkUrlSegment: string | undefined;
  organismToProject: Record<string, string>;
  projectUrls: Record<string, string>;
}) {
  const shouldLinkToExternalRecordPage =
    Object.keys(organismToProject).length > 0 &&
    Object.keys(projectUrls).length > 0;

  return function renderAccessionCell({ row }: { row: CombinedResultRow }) {
    if (recordLinkUrlSegment == null || row.wdkPrimaryKey == null) {
      return row.accession;
    } else {
      const recordPath = `/record/${recordLinkUrlSegment}/${row.wdkPrimaryKey}`;

      if (!shouldLinkToExternalRecordPage) {
        return <Link to={recordPath}>{row.accession}</Link>;
      }

      const projectId = row.organism && organismToProject[row.organism];
      const projectUrl = projectId && projectUrls[projectId];

      if (projectUrl == null) {
        return row.accession;
      }

      const externalRecordUrl = new URL(`app${recordPath}`, projectUrl);

      return <a href={externalRecordUrl.href}>{row.accession}</a>;
    }
  };
}
