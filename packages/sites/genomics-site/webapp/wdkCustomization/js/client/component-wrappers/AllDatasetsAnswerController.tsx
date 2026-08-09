import React from 'react';
import RecordLink from '@veupathdb/wdk-client/lib/Views/Records/RecordLink';
import { renderAttributeValue } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { AttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { createMergedDatasetsAnswerController } from '@veupathdb/web-common/lib/component-wrappers/MergedDatasetsAnswerController';

export const MergedDatasetsAnswer = createMergedDatasetsAnswerController({
  datasetRecordClassName: 'dataset',
  datasetQuestionName: 'AllDatasets',
  userDatasetRecordClassName: 'userdataset',
  userDatasetQuestionName: 'AllUserDatasets',
  renderPrimaryKeyCellContent: ({ value, recordClass, record }) => {
    if (value == null) {
      return null;
    }

    return (
      <RecordLink
        recordId={record.id}
        recordClass={recordClass}
        className="wdk-AnswerTable-recordLink"
      >
        {renderAttributeValue(value as AttributeValue)}
      </RecordLink>
    );
  },
});
