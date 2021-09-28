import { useMemo } from 'react';

import { Link, Mesa } from '@veupathdb/wdk-client/lib/Components';
import { create as createTableState } from '@veupathdb/wdk-client/lib/Components/Mesa/Utils/MesaState';
import { MesaColumn } from '@veupathdb/wdk-client/lib/Core/CommonTypes';

import {
  PromiseHookState,
  PromiseResult,
  PublicAnalysisSummary,
} from '../core';
import { convertISOToDisplayFormat } from '../core/utils/date-conversion';

interface Props {
  state: PromiseHookState<PublicAnalysisSummary[]>;
  makeStudyLink: (studyId: string) => string;
  makeAnalysisLink: (studyId: string, analysisId: string) => string;
}

export function PublicAnalyses({
  state,
  makeStudyLink,
  makeAnalysisLink,
}: Props) {
  return (
    <div>
      <h1>Public Analyses</h1>
      <PromiseResult state={state}>
        {(publicAnalysisList) => (
          <PublicAnalysesTable
            rows={publicAnalysisList}
            makeStudyLink={makeStudyLink}
            makeAnalysisLink={makeAnalysisLink}
          />
        )}
      </PromiseResult>
    </div>
  );
}

interface TableProps extends Omit<Props, 'state'> {
  rows: PublicAnalysisSummary[];
}

function PublicAnalysesTable({
  rows,
  makeAnalysisLink,
  makeStudyLink,
}: TableProps) {
  const tableState = useMemo(
    () =>
      createTableState({
        rows,
        columns: [
          {
            key: 'studyId',
            name: 'Study',
            renderCell: (data: { row: PublicAnalysisSummary }) => (
              <Link to={makeStudyLink(data.row.studyId)}>
                {data.row.displayName}
              </Link>
            ),
          },
          {
            key: 'analysisId',
            name: 'Analysis',
            renderCell: (data: { row: PublicAnalysisSummary }) => (
              <Link
                to={makeAnalysisLink(data.row.studyId, data.row.analysisId)}
              >
                {data.row.displayName}
              </Link>
            ),
          },
          {
            key: 'description',
            name: 'Description',
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
            renderCell: (data: { row: PublicAnalysisSummary }) =>
              convertISOToDisplayFormat(data.row.creationTime),
          },
          {
            key: 'modificationTime',
            name: 'Modified',
            renderCell: (data: { row: PublicAnalysisSummary }) =>
              convertISOToDisplayFormat(data.row.modificationTime),
          },
        ] as MesaColumn<keyof PublicAnalysisSummary>[],
      }),
    [rows, makeStudyLink, makeAnalysisLink]
  );

  return <Mesa.Mesa state={tableState} />;
}
