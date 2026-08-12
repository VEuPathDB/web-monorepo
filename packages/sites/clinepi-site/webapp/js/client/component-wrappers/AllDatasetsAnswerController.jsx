import React from 'react';
import { Link } from 'react-router-dom';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { makeEdaRoute } from '@veupathdb/web-common/lib/routes';
import { useEda } from '@veupathdb/web-common/lib/config';
import { createMergedDatasetsAnswerController } from '@veupathdb/web-common/lib/component-wrappers/MergedDatasetsAnswerController';

export const MergedDatasetsAnswer = createMergedDatasetsAnswerController({
  datasetRecordClassName: 'dataset',
  datasetQuestionName: 'AllDatasets',
  userDatasetRecordClassName: 'userdataset',
  userDatasetQuestionName: 'AllUserDatasets',
  renderPrimaryKeyCellContent: ({
    value,
    record,
    CellContent,
    ...cellProps
  }) => {
    if (!useEda) {
      return <CellContent {...cellProps} record={record} value={value} />;
    }

    return (
      <Link to={`${makeEdaRoute(record.id[0].value)}/new/details`}>
        {safeHtml(value)}
      </Link>
    );
  },
});
