import { useMemo } from 'react';

import { keyBy } from 'lodash';

import { Link, Loading, Mesa } from '@veupathdb/wdk-client/lib/Components';
import { create as createTableState } from '@veupathdb/wdk-client/lib/Components/Mesa/Utils/MesaState';
import { MesaColumn } from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { OverflowingTextCell } from '@veupathdb/wdk-client/lib/Views/Strategy/OverflowingTextCell';

import {
  PromiseHookState,
  PromiseResult,
  PublicAnalysisSummary,
  StudyRecord,
} from '../core';
import { convertISOToDisplayFormat } from '../core/utils/date-conversion';

interface Props {
  publicAnalysisListState: PromiseHookState<PublicAnalysisSummary[]>;
  studyRecords: StudyRecord[] | undefined;
  makeStudyLink: (studyId: string) => string;
  makeAnalysisLink: (studyId: string, analysisId: string) => string;
}

export function PublicAnalyses({
  publicAnalysisListState,
  studyRecords,
  makeStudyLink,
  makeAnalysisLink,
}: Props) {
  return (
    <div>
      <h1>Public Analyses</h1>
      <PromiseResult state={publicAnalysisListState}>
        {(publicAnalysisList) =>
          studyRecords == null ? (
            <Loading />
          ) : (
            <PublicAnalysesTable
              publicAnalysisList={publicAnalysisList}
              studyRecords={studyRecords}
              makeStudyLink={makeStudyLink}
              makeAnalysisLink={makeAnalysisLink}
            />
          )
        }
      </PromiseResult>
    </div>
  );
}

interface TableProps extends Omit<Props, 'publicAnalysisListState'> {
  publicAnalysisList: PublicAnalysisSummary[];
  studyRecords: StudyRecord[];
}

interface PublicAnalysisRow extends PublicAnalysisSummary {
  studyAvailable: boolean;
  studyDisplayName: string;
}

function PublicAnalysesTable({
  publicAnalysisList,
  studyRecords,
  makeAnalysisLink,
  makeStudyLink,
}: TableProps) {
  const unfilteredRows: PublicAnalysisRow[] = useMemo(() => {
    const studiesById = keyBy(studyRecords, (study) => study.id[0].value);

    return publicAnalysisList.map((publicAnalysis) => ({
      ...publicAnalysis,
      studyAvailable: Boolean(studiesById[publicAnalysis.studyId]),
      studyDisplayName:
        studiesById[publicAnalysis.studyId]?.displayName ?? 'Unknown study',
    }));
  }, [publicAnalysisList, studyRecords]);

  const columns: MesaColumn<keyof PublicAnalysisRow>[] = useMemo(
    () => [
      {
        key: 'studyId',
        name: 'Study',
        renderCell: (data: { row: PublicAnalysisRow }) => {
          return !data.row.studyAvailable ? (
            data.row.studyDisplayName
          ) : (
            <Link to={makeStudyLink(data.row.studyId)}>
              {data.row.studyDisplayName}
            </Link>
          );
        },
      },
      {
        key: 'analysisId',
        name: 'Analysis',
        renderCell: (data: { row: PublicAnalysisRow }) => (
          <Link to={makeAnalysisLink(data.row.studyId, data.row.analysisId)}>
            {data.row.displayName}
          </Link>
        ),
      },
      {
        key: 'description',
        name: 'Description',
        renderCell: (data: { row: PublicAnalysisRow }) => (
          <OverflowingTextCell
            key={data.row.analysisId}
            value={data.row.description}
          />
        ),
        width: '25em',
      },
      {
        key: 'userName',
        name: 'Author',
      },
      {
        key: 'userOrganization',
        name: 'Organization',
      },
      {
        key: 'creationTime',
        name: 'Created',
        renderCell: (data: { row: PublicAnalysisRow }) =>
          convertISOToDisplayFormat(data.row.creationTime),
      },
      {
        key: 'modificationTime',
        name: 'Modified',
        renderCell: (data: { row: PublicAnalysisRow }) =>
          convertISOToDisplayFormat(data.row.modificationTime),
      },
    ],
    [makeAnalysisLink, makeStudyLink]
  );

  const tableState = useMemo(
    () =>
      createTableState({
        rows: unfilteredRows,
        columns,
      }),
    [unfilteredRows, columns]
  );

  return <Mesa.Mesa state={tableState} />;
}
