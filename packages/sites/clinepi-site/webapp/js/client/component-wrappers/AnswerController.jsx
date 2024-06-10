import React from 'react';

import StudyAnswerController from '@veupathdb/web-common/lib/component-wrappers/StudyAnswerController';
import {
  useEda,
  useUserDatasetsWorkspace,
} from '@veupathdb/web-common/lib/config';
import {
  useDiyStudySummaryColumns,
  useDiyStudySummaryRows,
} from '@veupathdb/web-common/lib/hooks/diyStudySummaries';

import DataGrid from '@veupathdb/coreui/lib/components/grids/DataGrid';

import { withPermissions } from '@veupathdb/study-data-access/lib/data-restriction/Permissions';

import './AnswerController.scss';

const ClinEpiStudyAnswerController = withPermissions(StudyAnswerController);

export default (AnswerController) => (props) => {
  if (props.ownProps.recordClass === 'dataset') {
    return (
      <ClinEpiStudyAnswerControllerContainer
        {...props}
        DefaultComponent={AnswerController}
      />
    );
  }

  return <AnswerController {...props} />;
};

function ClinEpiStudyAnswerControllerContainer(props) {
  const userColumns = useDiyStudySummaryColumns({ linkToUserDatasets: true });
  const communityColumns = useDiyStudySummaryColumns({
    linkToUserDatasets: false,
  });
  const { userStudySummaryRows, communityStudySummaryRows } =
    useDiyStudySummaryRows();

  return (
    <div className="ClinEpiStudyAnswerController">
      {!props.stateProps.isLoading &&
        userStudySummaryRows != null &&
        communityStudySummaryRows != null &&
        userColumns != null && (
          <>
            <h1>Study summaries</h1>
            {useUserDatasetsWorkspace &&
              useEda &&
              userStudySummaryRows.length > 0 && (
                <>
                  <h2>My studies</h2>
                  <DataGrid
                    columns={userColumns}
                    data={userStudySummaryRows}
                    stylePreset="mesa"
                    styleOverrides={{
                      headerCells: {
                        backgroundColor: '#e2e2e3',
                        color: '#444',
                        textTransform: 'none',
                      },
                      dataCells: {
                        fontSize: '1.1em',
                        color: 'black',
                        verticalAlign: 'top',
                      },
                    }}
                  />
                  <h2>Community studies</h2>
                  <DataGrid
                    columns={communityColumns.slice(0, -1)}
                    data={communityStudySummaryRows}
                    stylePreset="mesa"
                    styleOverrides={{
                      headerCells: {
                        backgroundColor: '#e2e2e3',
                        color: '#444',
                        textTransform: 'none',
                      },
                      dataCells: {
                        fontSize: '1.1em',
                        color: 'black',
                        verticalAlign: 'top',
                      },
                    }}
                  />
                  <h2>Curated studies</h2>
                </>
              )}
          </>
        )}
      <ClinEpiStudyAnswerController {...props} />
    </div>
  );
}
