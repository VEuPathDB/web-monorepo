import { useState } from 'react';
import { Column } from 'react-table';

// Components
import { colors, DataGrid, Download, H5, Paragraph } from '@veupathdb/coreui';

// Definitions
import { DownloadClient } from '../../core/api/DownloadClient';
import { DownloadTabStudyRelease } from './types';

// Hooks
import { ReleaseFile, useGetReleaseFiles } from './hooks/useGetReleaseFiles';
import { useAttemptActionCallback } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { Action } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUiActions';

export type CurrentReleaseProps = {
  datasetId: string;
  studyId: string;
  release: DownloadTabStudyRelease;
  downloadClient: DownloadClient;
};

export default function CurrentRelease({
  datasetId,
  studyId,
  release,
  downloadClient,
}: CurrentReleaseProps) {
  const [releaseFiles, setReleaseFiles] = useState<Array<ReleaseFile>>([]);

  const attemptAction = useAttemptActionCallback();

  useGetReleaseFiles(studyId, release, downloadClient, setReleaseFiles);

  const exampleGridColumns: Array<Column> = [
    {
      Header: 'File Description',
      accessor: (row: any) => ({
        description: row.fileDescription,
        url: row.fileUrl,
        name: row.fileName,
      }),
      Cell: ({ value }) => {
        return (
          <a
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: colors.mutedCyan[500],
            }}
            href={value.url}
            onClick={handleClick}
          >
            <Download fill={colors.mutedCyan[500]} fontSize={20} />
            <span
              style={{
                fontFamily: 'Inter',
                fontWeight: 600,
                letterSpacing: 0.1,
                marginLeft: 8,
                marginRight: 25,
              }}
            >
              {value.description}
            </span>
          </a>
        );
        function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
          event.preventDefault();
          event.stopPropagation();
          attemptAction(Action.download, {
            studyId: datasetId,
            onAllow: () => {
              window.location.assign(value.url);
            },
          });
        }
      },
    },
    {
      Header: 'Type',
      accessor: 'fileType',
    },
    {
      Header: 'Size',
      accessor: 'fileSize',
      Cell: ({ value }) => <span>{value} MB</span>,
    },
  ];

  return (
    <div id="Current Release Dataset" style={{ marginBottom: 35 }}>
      <div style={{ marginBottom: 15 }}>
        <H5
          text={`Full Dataset (Release ${release.releaseNumber})`}
          additionalStyles={{ margin: 0 }}
        />
        <Paragraph
          color={colors.gray[600]}
          styleOverrides={{ margin: 0 }}
          textSize="medium"
        >
          <span style={{ fontWeight: 500 }}>Date: </span>
          {release.date}
        </Paragraph>
        <Paragraph
          color={colors.gray[600]}
          styleOverrides={{ margin: 0 }}
          textSize="medium"
        >
          <span style={{ fontWeight: 500 }}>Change Log: </span>
          {release.description}
        </Paragraph>
      </div>
      {releaseFiles.length ? (
        <DataGrid
          columns={exampleGridColumns}
          data={releaseFiles}
          styleOverrides={{
            table: {
              borderColor: colors.gray[200],
              borderStyle: 'solid',
              primaryRowColor: 'white',
              secondaryRowColor: 'white',
              borderWidth: 1,
            },
            headerCells: {
              color: colors.gray[600],
              fontWeight: 700,
              borderColor: colors.gray[200],
              borderWidth: 1,
              borderStyle: 'solid',
              fontSize: 12,
              fontFamily: 'Inter',
            },
            dataCells: {
              color: colors.gray[600],
              fontWeight: 400,
              fontSize: 11,
              fontFamily: 'Inter',
              borderColor: colors.gray[200],
              borderWidth: 1,
              borderStyle: 'solid',
              padding: 5,
              verticalAlign: 'middle',
            },
          }}
        />
      ) : null}
    </div>
  );
}
