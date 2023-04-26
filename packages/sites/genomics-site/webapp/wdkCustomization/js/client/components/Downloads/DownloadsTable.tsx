import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import { ResultTableSummaryViewController } from '@veupathdb/wdk-client/lib/Controllers';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { SearchConfig } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import {
  downloadReport,
  ResultType,
} from '@veupathdb/wdk-client/lib/Utils/WdkResult';
import { Action } from '@veupathdb/wdk-client/lib/Views/ResultTableSummaryView/ResultTableSummaryView';
import React, { useMemo } from 'react';

interface Props {
  searchConfig: SearchConfig;
  /** Search name used for table */
  tableSearchName: string;
  /** Search name used for bulk download */
  bulkSearchName: string;
}

export function DownloadsTable(props: Props) {
  const { searchConfig, tableSearchName, bulkSearchName } = props;
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  const tableResultType: ResultType = useMemo(
    () => ({
      type: 'answerSpec',
      displayName: 'Download Files',
      answerSpec: {
        searchName: tableSearchName,
        searchConfig,
      },
    }),
    [searchConfig, tableSearchName]
  );

  const tableActions = useMemo((): Action[] => {
    return [
      {
        element: (selectedRecords) => {
          const resultType: ResultType = {
            type: 'answerSpec',
            displayName: 'Zipped Files',
            answerSpec: {
              searchName: bulkSearchName,
              searchConfig: {
                parameters: {
                  fileIds: JSON.stringify(
                    selectedRecords.map((record) => record.id[0].value)
                  ),
                },
              },
            },
          };

          return (
            <button
              className="btn"
              type="button"
              disabled={selectedRecords.length === 0}
              onClick={() => {
                downloadReport(
                  wdkService,
                  resultType,
                  {
                    format: 'zippedFiles',
                    formatConfig: {},
                  },
                  '_blank'
                );
              }}
            >
              <Icon fa="download" /> Download selected files
            </button>
          );
        },
      },
    ];
  }, [bulkSearchName, wdkService]);

  return (
    <ResultTableSummaryViewController
      tableActions={tableActions}
      viewId="DownloadPage"
      resultType={tableResultType}
      showIdAttributeColumn={false}
    />
  );
}
