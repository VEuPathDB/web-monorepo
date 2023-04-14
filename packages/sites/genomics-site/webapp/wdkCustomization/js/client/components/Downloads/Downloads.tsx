import React, { useState } from 'react';
import { SearchConfig } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
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
      <p className="Downloads-Instructions">
        Use the filters to reduce the table below. Use the table to select the
        files to download.
      </p>
      <div className="Downloads-Filter-Container">
        <DownloadsFilter
          recordName={RECORD_NAME}
          questionName={TABLE_QUESTION_NAME}
          onChange={setSearchConfig}
        />
      </div>
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
