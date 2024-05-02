import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import React, { useCallback } from 'react';
import {
  SearchAndAnswer,
  TableResultTypePartial,
} from '@veupathdb/wdk-client/lib/Components/SearchAndAnswer/SearchAndAnswer';
import { ResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';
import './Downloads.scss';

const VIEW_ID = 'DownloadPage';
const RECORD_NAME = 'dfile';
const TABLE_QUESTION_NAME = 'GetAllFileRecords';
const BULK_QUESTION_NAME = 'GetFileRecordsByID';

export function Downloads() {
  const tableResultTypePartial = {
    type: 'answerSpec',
    displayName: 'Download Files',
    answerSpec: {
      searchName: TABLE_QUESTION_NAME,
    },
  };

  const getReporterResultType = useCallback(
    (records: RecordInstance[]): ResultType => ({
      type: 'answerSpec',
      displayName: 'Zipped Files',
      answerSpec: {
        searchName: BULK_QUESTION_NAME,
        searchConfig: {
          parameters: {
            fileIds: JSON.stringify(
              records.map((record) => record.id[0].value)
            ),
          },
        },
      },
    }),
    []
  );

  const reporterFormatting = {
    format: 'zippedFiles',
    formatConfig: {},
  };

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
        getReporterResultType={getReporterResultType}
        reporterFormatting={reporterFormatting}
        resultTableConfig={{
          viewId: VIEW_ID,
          downloadButtonDisplay: 'Download selected files',
          showIdAttributeColumn: false,
          showCount: true,
        }}
        filterClassName="Downloads-Filter-Container"
      />
    </div>
  );
}
