import { useState, ReactNode } from 'react';
import { Column } from 'react-table';

// Components
import { colors, DataGrid, Download, Paragraph } from '@veupathdb/coreui';

// Definitions
import { DownloadClient } from '../../core/api/DownloadClient';
import { DownloadTabStudyRelease } from './types';

// Hooks
import { ReleaseFile, useGetReleaseFiles } from './hooks/useGetReleaseFiles';
import { ExpandablePanel } from '@veupathdb/coreui/dist/components/containers';
import { useAttemptActionCallback } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { Action } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUiActions';

export type PastReleaseProps = {
  studyId: string;
  datasetId: string;
  release: DownloadTabStudyRelease;
  downloadClient: DownloadClient;
  citation: ReactNode;
};

export default function PastRelease({
  studyId,
  datasetId,
  release,
  downloadClient,
  citation,
}: PastReleaseProps) {
  const [releaseFiles, setReleaseFiles] = useState<Array<ReleaseFile>>([]);

  useGetReleaseFiles(studyId, release, downloadClient, setReleaseFiles);

  const attemptAction = useAttemptActionCallback();

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
          event.stopPropagation();
          event.preventDefault();
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
    <div
      id={`Past Release Dataset - ${release.releaseNumber}`}
      style={{ marginBottom: 35 }}
    >
      {/**
       * debt: change string types to ReactNode types as appropriate
       */}
      <ExpandablePanel
        stylePreset="floating"
        themeRole="primary"
        title={`Full Dataset (Release ${release.releaseNumber})`}
        subTitle={{
          Date: release.date ?? '',
          'Change Log': release.description ?? '',
        }}
      >
        <div style={{ padding: 15, paddingLeft: 35 }}>
          <Paragraph
            color={colors.gray[600]}
            styleOverrides={{ margin: '0 0 10px 0' }}
            textSize="medium"
          >
            <span style={{ fontWeight: 500 }}>Citation: </span>
            {citation}
          </Paragraph>
          {releaseFiles.length ? (
            <DataGrid
              columns={exampleGridColumns}
              data={releaseFiles}
              styleOverrides={{
                table: {
                  borderColor: colors.mutedCyan[200],
                  borderStyle: 'solid',
                  primaryRowColor: 'transparent',
                  secondaryRowColor: 'transparent',
                  borderWidth: 2,
                },
                headerCells: {
                  color: colors.gray[600],
                  backgroundColor: colors.mutedCyan[200],
                  fontWeight: 700,
                  borderColor: colors.mutedCyan[200],
                  borderWidth: 2,
                  borderStyle: 'solid',
                  fontSize: 12,
                  fontFamily: 'Inter',
                },
                dataCells: {
                  color: colors.gray[600],
                  fontWeight: 400,
                  fontSize: 11,
                  fontFamily: 'Inter',
                  borderColor: colors.mutedCyan[200],
                  borderWidth: 2,
                  borderStyle: 'solid',
                  padding: 5,
                  verticalAlign: 'middle',
                },
              }}
            />
          ) : null}
        </div>
      </ExpandablePanel>
    </div>
  );
}
