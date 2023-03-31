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
  searchName: string;
}

export function DownloadsTable(props: Props) {
  const { searchConfig, searchName } = props;
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  const resultType: ResultType = useMemo(
    () => ({
      type: 'answerSpec',
      displayName: 'Download Files',
      answerSpec: {
        searchName,
        searchConfig,
      },
    }),
    [searchConfig, searchName]
  );

  const tableActions = useMemo((): Action[] => {
    return [
      {
        element: (selectedRecords) => {
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
  }, [resultType, wdkService]);

  return (
    <ResultTableSummaryViewController
      tableActions={tableActions}
      viewId="DownloadPage"
      resultType={resultType}
    />
  );
}
