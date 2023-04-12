import { ExpandablePanel } from '@veupathdb/coreui';
import { SearchConfig } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import React, { useState } from 'react';
import { DownloadsFilter } from './DownloadsFilter';
import { DownloadsTable } from './DownloadsTable';

import './Downloads.scss';

const RECORD_NAME = 'dfile';
const TABLE_QUESTION_NAME = 'GetAllFileRecords';
const BULK_QUESTION_NAME = 'GetFileRecordsByID';

export function Downloads() {
  const [searchConfig, setSearchConfig] = useState<SearchConfig>();

  return (
    <div className="Downloads">
      <h1>Download Data Files</h1>
      <ExpandablePanel
        state={'open'}
        title="Filter files"
        subTitle="Filter the files displayed in the table below"
      >
        <DownloadsFilter
          recordName={RECORD_NAME}
          questionName={TABLE_QUESTION_NAME}
          onChange={setSearchConfig}
        />
      </ExpandablePanel>
      {searchConfig && (
        <DownloadsTable
          tableSearchName={TABLE_QUESTION_NAME}
          bulkSearchName={BULK_QUESTION_NAME}
          searchConfig={searchConfig}
        />
      )}
    </div>
  );
}
