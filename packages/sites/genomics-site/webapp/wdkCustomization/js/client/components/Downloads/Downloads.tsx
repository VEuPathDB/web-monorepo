import React, { useMemo } from 'react';
import {
  SearchAndAnswer,
  TableResultTypePartial,
} from '@veupathdb/wdk-client/lib/Components/SearchAndAnswer/SearchAndAnswer';
import {
  downloadReport,
  ResultType,
} from '@veupathdb/wdk-client/lib/Utils/WdkResult';
import './Downloads.scss';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import { Action } from '@veupathdb/wdk-client/lib/Views/ResultTableSummaryView/ResultTableSummaryView';

const VIEW_ID = 'DownloadPage';
const RECORD_NAME = 'dfile';
const TABLE_QUESTION_NAME = 'GetAllFileRecords';
const BULK_QUESTION_NAME = 'GetFileRecordsByID';

export function Downloads() {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  const tableResultTypePartial = {
    type: 'answerSpec',
    displayName: 'Download Files',
    answerSpec: {
      searchName: TABLE_QUESTION_NAME,
    },
  };

  const tableActions = useMemo((): Action[] => {
    return [
      {
        element: (selectedRecords) => {
          const reporterResultType = {
            type: 'answerSpec',
            displayName: 'Zipped Files',
            answerSpec: {
              searchName: BULK_QUESTION_NAME,
              searchConfig: {
                parameters: {
                  fileIds: JSON.stringify(
                    selectedRecords.map((record) => record.id[0].value)
                  ),
                },
              },
            },
          } as ResultType;
          return (
            <button
              className="btn"
              type="button"
              disabled={selectedRecords.length === 0}
              onClick={() => {
                downloadReport(
                  wdkService,
                  reporterResultType,
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
  }, [wdkService]);

  return (
    <div className="Downloads">
      <h1>Download Data Files</h1>
      <p className="Downloads-Instructions">
        <ul>
          <li>
            Use this tool to download genome scale files such as genome.fasta or
            GFF files.
          </li>
          <li>
            All files are available in the results table below. The result can
            be limited by Organism and/or Data File Properties.
          </li>
          <li>
            To filter the result by Data File Properties, choose one or more
            categories (left) and/or values (right) that define the files you
            need.
          </li>
          <li>
            Download a single file from the results table by clicking the link
            in the ‘File’ column, or multiple files using the checkboxes in the
            first column.
          </li>
          <li>
            To access older files please see the{' '}
            <a href="/common/downloads/">Download Archive</a>.
          </li>
        </ul>
      </p>
      <SearchAndAnswer
        recordName={RECORD_NAME}
        tableResultTypePartial={
          tableResultTypePartial as TableResultTypePartial
        }
        resultTableConfig={{
          viewId: VIEW_ID,
          downloadButtonDisplay: 'Download selected files',
          showIdAttributeColumn: false,
          showCount: true,
        }}
        filterClassName="Downloads-Filter-Container"
        tableActions={tableActions}
      />
    </div>
  );
}
