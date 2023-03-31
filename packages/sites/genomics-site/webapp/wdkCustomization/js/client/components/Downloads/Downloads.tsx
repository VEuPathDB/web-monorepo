import { ExpandablePanel } from '@veupathdb/coreui';
import { CollapsibleSection } from '@veupathdb/wdk-client/lib/Components';
import { SearchConfig } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import React, { useState } from 'react';
import { DownloadsFilter } from './DownloadsFilter';
import { DownloadsTable } from './DownloadsTable';

const RECORD_NAME = 'dfile';
const QUESTION_NAME = 'GetAllFileRecords';

export function Downloads() {
  const [searchConfig, setSearchConfig] = useState<SearchConfig>();
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);

  console.log({ searchConfig });

  return (
    <div>
      <h1>Data files</h1>
      <ExpandablePanel
        state={filtersCollapsed ? 'closed' : 'open'}
        onStateChange={(state) => setFiltersCollapsed(state === 'closed')}
        title="Filter files"
        subTitle="Filter the files displayed in the table below"
        // headerComponent="h2"
        // forceRender
      >
        <DownloadsFilter
          recordName={RECORD_NAME}
          questionName={QUESTION_NAME}
          onChange={setSearchConfig}
        />
      </ExpandablePanel>
      {searchConfig && (
        <DownloadsTable
          searchName={QUESTION_NAME}
          searchConfig={searchConfig}
        />
      )}
    </div>
  );
}
