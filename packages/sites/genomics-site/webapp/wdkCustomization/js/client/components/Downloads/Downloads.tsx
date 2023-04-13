import React, { useState } from 'react';
import { colors, ExpandablePanel } from '@veupathdb/coreui';
import {
  ExpandablePanelStyleSpec,
  EXPANDABLE_PANEL_PRESET_STYLES,
} from '@veupathdb/coreui/dist/components/containers/ExpandablePanel/stylePresets';
import { SearchConfig } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { DownloadsFilter } from './DownloadsFilter';
import { DownloadsTable } from './DownloadsTable';
import './Downloads.scss';

const RECORD_NAME = 'dfile';
const TABLE_QUESTION_NAME = 'GetAllFileRecords';
const BULK_QUESTION_NAME = 'GetFileRecordsByID';

const expandablePanelStyleOverride: Partial<ExpandablePanelStyleSpec> = {
  open: {
    ...EXPANDABLE_PANEL_PRESET_STYLES.default.open,
    content: {
      divider: {
        color: colors.gray[400],
        thickness: 2,
      },
      backgroundColor: colors.white,
    },
  },
};

export function Downloads() {
  const [searchConfig, setSearchConfig] = useState<SearchConfig>();

  return (
    <div className="Downloads">
      <h1>Download Data Files</h1>
      <ExpandablePanel
        state={'open'}
        title="Filter files"
        subTitle="Filter the files displayed in the table below"
        styleOverrides={expandablePanelStyleOverride}
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
